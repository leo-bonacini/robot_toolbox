Router.register({
  id: 'dh-calculator',
  name: 'DH Calculator',
  icon: '🦾',
  category: 'kinematics',
  description: 'Denavit-Hartenberg parameter table and forward kinematics for serial robots',
  tags: ['dh', 'denavit-hartenberg', 'forward kinematics', 'manipulator', 'serial', 'robot arm'],

  init(container) {
    const prec = Storage.getSettings().precision || 4;
    const fmt = v => parseFloat(v.toFixed(prec));
    const d2r = Math.PI/180;
    const r2d = 180/Math.PI;

    let joints = [
      { alpha:0, a:0, d:0.5, theta:0, type:'R' },
      { alpha:0, a:0.5, d:0, theta:0, type:'R' },
      { alpha:0, a:0.3, d:0, theta:0, type:'R' }
    ];

    function dhTransform(alpha, a, d, theta) {
      const ca=Math.cos(alpha), sa=Math.sin(alpha), ct=Math.cos(theta), st=Math.sin(theta);
      return [
        [ct, -st*ca,  st*sa, a*ct],
        [st,  ct*ca, -ct*sa, a*st],
        [ 0,     sa,     ca,    d],
        [ 0,      0,      0,    1]
      ];
    }

    function mul44(A,B) {
      const C=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
      for(let i=0;i<4;i++) for(let j=0;j<4;j++) for(let k=0;k<4;k++) C[i][j]+=A[i][k]*B[k][j];
      return C;
    }

    function identity44() { return [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,0,1]]; }

    function computeFK() {
      const rows = container.querySelectorAll('.dh-row');
      joints = Array.from(rows).map(row => ({
        alpha: parseFloat(row.querySelector('.dh-alpha')?.value)||0,
        a:     parseFloat(row.querySelector('.dh-a')?.value)||0,
        d:     parseFloat(row.querySelector('.dh-d')?.value)||0,
        theta: parseFloat(row.querySelector('.dh-theta')?.value)||0,
        type:  row.querySelector('.dh-type')?.value||'R'
      }));

      let T=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
      const transforms=[T];
      const matrices=[];

      joints.forEach(j => {
        const Ti=dhTransform(j.alpha*d2r, j.a, j.d, j.theta*d2r);
        T=mul44(T,Ti);
        transforms.push(T.map(r=>[...r]));
        matrices.push(Ti);
      });

      renderResults(transforms, matrices);
    }

    function matrixHTML4(M) {
      return `<div class="transform-matrix">
        ${M.map(row=>row.map(v=>`<div class="transform-cell">${fmt(v)}</div>`).join('')).join('')}
      </div>`;
    }

    function renderResults(transforms, matrices) {
      const res=document.getElementById('dh-results');
      if (!res) return;

      const T=transforms[transforms.length-1];
      const pos=[T[0][3],T[1][3],T[2][3]];
      const q=RotMath.RtoQ([[T[0][0],T[0][1],T[0][2]],[T[1][0],T[1][1],T[1][2]],[T[2][0],T[2][1],T[2][2]]]);
      const euler=RotMath.Rtoeuler([[T[0][0],T[0][1],T[0][2]],[T[1][0],T[1][1],T[1][2]],[T[2][0],T[2][1],T[2][2]]]);

      res.innerHTML=`
        <div class="card" style="margin-bottom:16px">
          <div class="card-header"><div class="card-title">End-Effector Pose</div></div>
          <div class="card-body">
            <div class="grid-3" style="margin-bottom:12px">
              ${['X','Y','Z'].map((ax,i)=>`<div class="stat-card">
                <div class="stat-label">Position ${ax}</div>
                <div class="stat-value">${fmt(pos[i])}</div>
                <div class="stat-unit">m</div>
              </div>`).join('')}
            </div>
            <div class="grid-2">
              <div>
                <div class="section-title">Quaternion [w,x,y,z]</div>
                <div class="mono-value" style="margin-top:4px">[${fmt(q.w)}, ${fmt(q.x)}, ${fmt(q.y)}, ${fmt(q.z)}]</div>
              </div>
              <div>
                <div class="section-title">Euler ZYX (deg)</div>
                <div class="mono-value" style="margin-top:4px">r=${fmt(euler.roll*r2d)}° p=${fmt(euler.pitch*r2d)}° y=${fmt(euler.yaw*r2d)}°</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Homogeneous Transform T</div></div>
          <div class="card-body">
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:8px">T = T₁·T₂·...·Tₙ (4×4)</div>
            ${matrixHTML4(T)}
          </div>
        </div>
        <div style="margin-top:16px">
          <div class="section-title" style="margin-bottom:10px">Individual Joint Transforms</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${matrices.map((M,i)=>`
            <div class="card">
              <div class="card-header"><div class="card-title">T${i+1} (Joint ${i+1}: α=${fmt(joints[i].alpha)}°, a=${fmt(joints[i].a)}, d=${fmt(joints[i].d)}, θ=${fmt(joints[i].theta)}°)</div></div>
              <div class="card-body">${matrixHTML4(M)}</div>
            </div>`).join('')}
          </div>
        </div>`;
    }

    function renderTable() {
      const tbody=document.getElementById('dh-tbody');
      if (!tbody) return;
      tbody.innerHTML=joints.map((j,i)=>`
        <tr class="dh-row" data-idx="${i}">
          <td style="font-family:var(--font-mono);font-weight:600">${i+1}</td>
          <td><input class="dh-alpha" type="number" value="${j.alpha}" step="any" placeholder="α" onchange="dhCompute()"></td>
          <td><input class="dh-a" type="number" value="${j.a}" step="any" placeholder="a" onchange="dhCompute()"></td>
          <td><input class="dh-d" type="number" value="${j.d}" step="any" placeholder="d" onchange="dhCompute()"></td>
          <td><input class="dh-theta" type="number" value="${j.theta}" step="any" placeholder="θ" onchange="dhCompute()"></td>
          <td>
            <select class="dh-type" onchange="dhCompute()">
              <option value="R" ${j.type==='R'?'selected':''}>Revolute</option>
              <option value="P" ${j.type==='P'?'selected':''}>Prismatic</option>
            </select>
          </td>
          <td>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="dhRemove(${i})" title="Remove joint">✕</button>
          </td>
        </tr>`).join('');
    }

    container.innerHTML=`
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🦾</span> DH Parameter Calculator</div>
        <div class="tool-description">Enter Denavit-Hartenberg parameters to compute forward kinematics for your robot arm.</div>
        <div class="tool-actions">
          <button class="btn btn-primary btn-sm" onclick="dhAddJoint()">+ Add Joint</button>
          <button class="btn btn-secondary btn-sm" onclick="dhLoadPreset('puma')">PUMA 560</button>
          <button class="btn btn-secondary btn-sm" onclick="dhLoadPreset('rrr')">3-DOF RRR</button>
          <button class="btn btn-secondary btn-sm" onclick="dhExport()">Export JSON</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px">
        <div class="card-header">
          <div class="card-title">DH Parameter Table</div>
          <div style="font-size:12px;color:var(--text-tertiary)">Angles in degrees · Distances in meters</div>
        </div>
        <div class="card-body">
          <div class="dh-table-wrapper">
            <table class="dh-table" style="width:100%">
              <thead><tr>
                <th>Joint</th>
                <th>α (deg)</th>
                <th>a (m)</th>
                <th>d (m)</th>
                <th>θ (deg)</th>
                <th>Type</th>
                <th></th>
              </tr></thead>
              <tbody id="dh-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="info-panel" style="margin-bottom:16px">
        <strong>Standard DH:</strong> Tᵢ = Rot_z(θᵢ) · Trans_z(dᵢ) · Trans_x(aᵢ) · Rot_x(αᵢ) —
        <strong>α</strong> = twist, <strong>a</strong> = link length, <strong>d</strong> = joint offset, <strong>θ</strong> = joint angle
      </div>

      <div id="dh-results"></div>`;

    window.dhAddJoint = () => {
      joints.push({alpha:0,a:0.3,d:0,theta:0,type:'R'});
      renderTable(); computeFK();
    };
    window.dhRemove = (i) => {
      if(joints.length<=1){Toast.show('At least one joint required','warning');return;}
      joints.splice(i,1); renderTable(); computeFK();
    };
    window.dhCompute = computeFK;
    window.dhLoadPreset = (name) => {
      if(name==='puma') joints=[
        {alpha:0,a:0,d:0,theta:0,type:'R'},
        {alpha:-90,a:0.4318,d:0,theta:0,type:'R'},
        {alpha:0,a:-0.0203,d:0.15,theta:0,type:'R'},
        {alpha:-90,a:0.4318,d:0.4318,theta:0,type:'R'},
        {alpha:90,a:0,d:0,theta:0,type:'R'},
        {alpha:-90,a:0,d:0,theta:0,type:'R'}
      ];
      else if(name==='rrr') joints=[
        {alpha:0,a:1,d:0,theta:0,type:'R'},
        {alpha:0,a:0.8,d:0,theta:0,type:'R'},
        {alpha:0,a:0.5,d:0,theta:0,type:'R'}
      ];
      renderTable(); computeFK();
    };
    window.dhExport = () => {
      const rows=Array.from(container.querySelectorAll('.dh-row')).map(r=>({
        alpha:parseFloat(r.querySelector('.dh-alpha')?.value)||0,
        a:parseFloat(r.querySelector('.dh-a')?.value)||0,
        d:parseFloat(r.querySelector('.dh-d')?.value)||0,
        theta:parseFloat(r.querySelector('.dh-theta')?.value)||0,
        type:r.querySelector('.dh-type')?.value
      }));
      Exporter.toJson({convention:'standard-DH',units:{angles:'degrees',distances:'meters'},joints:rows},'dh-params.json');
    };

    renderTable();
    computeFK();
  }
});
