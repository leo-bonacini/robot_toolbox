Router.register({
  id: 'quaternion-toolbox',
  name: 'Quaternion Toolbox',
  icon: '⟳',
  category: 'kinematics',
  description: 'Quaternion operations: normalize, multiply, inverse, interpolation and visualization',
  tags: ['quaternion', 'slerp', 'interpolation', 'rotation', 'normalize'],

  init(container) {
    const p = Storage.getSettings().precision || 4;
    const fmt = v => parseFloat(v.toFixed(p));
    const fmtQ = q => `[${fmt(q.w)}, ${fmt(q.x)}, ${fmt(q.y)}, ${fmt(q.z)}]`;
    const norm = q => { const n=Math.sqrt(q.w**2+q.x**2+q.y**2+q.z**2); return {w:q.w/n,x:q.x/n,y:q.y/n,z:q.z/n}; };
    const mul = (a,b) => ({
      w: a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z,
      x: a.w*b.x+a.x*b.w+a.y*b.z-a.z*b.y,
      y: a.w*b.y-a.x*b.z+a.y*b.w+a.z*b.x,
      z: a.w*b.z+a.x*b.y-a.y*b.x+a.z*b.w
    });
    const inv = q => { const n2=q.w**2+q.x**2+q.y**2+q.z**2; return {w:q.w/n2,x:-q.x/n2,y:-q.y/n2,z:-q.z/n2}; };
    const conj = q => ({w:q.w, x:-q.x, y:-q.y, z:-q.z});
    const nrm = q => Math.sqrt(q.w**2+q.x**2+q.y**2+q.z**2);
    const slerp = (a,b,t) => {
      let dot = a.w*b.w+a.x*b.x+a.y*b.y+a.z*b.z;
      if (dot<0) { b={w:-b.w,x:-b.x,y:-b.y,z:-b.z}; dot=-dot; }
      if (dot>0.9999) {
        const r={w:a.w+(b.w-a.w)*t,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};
        return norm(r);
      }
      const theta0=Math.acos(dot);
      const theta=theta0*t;
      const s0=Math.cos(theta)-dot*Math.sin(theta)/Math.sin(theta0);
      const s1=Math.sin(theta)/Math.sin(theta0);
      return {w:s0*a.w+s1*b.w,x:s0*a.x+s1*b.x,y:s0*a.y+s1*b.y,z:s0*a.z+s1*b.z};
    };
    const dist = (a,b) => { const d=Math.abs(a.w*b.w+a.x*b.x+a.y*b.y+a.z*b.z); return 2*Math.acos(Math.min(1,d)); };

    function qInputGroup(id, label, vals=[1,0,0,0]) {
      return `<div class="card">
        <div class="card-header"><div class="card-title">${label}</div></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
            ${['w','x','y','z'].map((c,i)=>`
            <div class="form-group">
              <label class="form-label">${c}</label>
              <input class="input qin-${id}" id="q${id}-${c}" type="number" step="any" value="${vals[i]}">
            </div>`).join('')}
          </div>
          <div style="margin-top:8px;font-size:12px;color:var(--text-tertiary)" id="q${id}-norm">|q| = ${nrm({w:vals[0],x:vals[1],y:vals[2],z:vals[3]}).toFixed(6)}</div>
        </div>
      </div>`;
    }

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">⟳</span> Quaternion Toolbox</div>
        <div class="tool-description">Perform quaternion operations used in 3D rotations and robotics.</div>
      </div>

      <div class="tabs">
        <button class="tab active" onclick="qtSwitchTab('ops',this)">Operations</button>
        <button class="tab" onclick="qtSwitchTab('slerp',this)">SLERP Interpolation</button>
        <button class="tab" onclick="qtSwitchTab('ref',this)">Reference</button>
      </div>

      <div id="qt-tab-ops" class="tab-content active">
        <div class="grid-2">
          ${qInputGroup('a','Quaternion A',[1,0,0,0])}
          ${qInputGroup('b','Quaternion B',[0.7071,0.7071,0,0])}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0">
          ${['Normalize A','Multiply A×B','Inverse A','Conjugate A','Distance A↔B','A from Euler'].map(op=>`
          <button class="btn btn-secondary" onclick="qtOp('${op}')">${op}</button>`).join('')}
        </div>
        <div id="qt-result" class="card" style="display:none">
          <div class="card-header">
            <div class="card-title" id="qt-result-title">Result</div>
          </div>
          <div class="card-body" id="qt-result-body"></div>
        </div>
      </div>

      <div id="qt-tab-slerp" class="tab-content">
        <div class="grid-2">
          ${qInputGroup('s1','Start Quaternion q₀',[1,0,0,0])}
          ${qInputGroup('s2','End Quaternion q₁',[0,0,0,1])}
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Interpolation Parameter t</label>
              <div class="slider-wrapper">
                <div class="slider-header">
                  <span class="form-label">t</span>
                  <span class="slider-value" id="slerp-t-val">0.5</span>
                </div>
                <input type="range" id="slerp-t" min="0" max="1" step="0.01" value="0.5">
              </div>
            </div>
            <div id="slerp-result" style="margin-top:16px"></div>
          </div>
        </div>
        <div class="card" style="margin-top:12px">
          <div class="card-header"><div class="card-title">SLERP Path (w component)</div></div>
          <div class="card-body"><div style="height:200px"><canvas id="slerp-chart"></canvas></div></div>
        </div>
      </div>

      <div id="qt-tab-ref" class="tab-content">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">Operations</div></div>
            <div class="card-body" style="font-size:13px;line-height:1.8">
              <b>Norm:</b> |q| = √(w²+x²+y²+z²)<br>
              <b>Normalize:</b> q̂ = q/|q|<br>
              <b>Conjugate:</b> q* = [w, -x, -y, -z]<br>
              <b>Inverse:</b> q⁻¹ = q*/|q|²<br>
              <b>Multiply:</b> (a·b)w = aw·bw - a⃗·b⃗<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              (a·b)⃗ = aw·b⃗ + bw·a⃗ + a⃗×b⃗<br>
              <b>Distance:</b> d(q₁,q₂) = 2·acos(|q₁·q₂|)<br>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">From Axis-Angle</div></div>
            <div class="card-body" style="font-size:13px;line-height:1.8">
              Given axis k̂ and angle θ:<br>
              w = cos(θ/2)<br>
              x = kx·sin(θ/2)<br>
              y = ky·sin(θ/2)<br>
              z = kz·sin(θ/2)<br><br>
              Unit quaternions (|q|=1) represent pure rotations.
            </div>
          </div>
        </div>
      </div>`;

    let slerpChart = null;

    function updateNorm(id) {
      const w=parseFloat(document.getElementById(`q${id}-w`)?.value)||0;
      const x=parseFloat(document.getElementById(`q${id}-x`)?.value)||0;
      const y=parseFloat(document.getElementById(`q${id}-y`)?.value)||0;
      const z=parseFloat(document.getElementById(`q${id}-z`)?.value)||0;
      const el=document.getElementById(`q${id}-norm`);
      if (el) el.textContent=`|q| = ${nrm({w,x,y,z}).toFixed(6)}`;
    }

    function readQ(id) {
      return {
        w:parseFloat(document.getElementById(`q${id}-w`)?.value)||0,
        x:parseFloat(document.getElementById(`q${id}-x`)?.value)||0,
        y:parseFloat(document.getElementById(`q${id}-y`)?.value)||0,
        z:parseFloat(document.getElementById(`q${id}-z`)?.value)||0
      };
    }

    function showResult(title, content) {
      const r=document.getElementById('qt-result');
      if (!r) return;
      r.style.display='';
      document.getElementById('qt-result-title').textContent=title;
      document.getElementById('qt-result-body').innerHTML=content;
    }

    window.qtOp = (op) => {
      const a=readQ('a'), b=readQ('b');
      if (op==='Normalize A') {
        const r=norm(a);
        showResult('Normalize A', `<div class="result-value">${fmtQ(r)}</div><div class="result-unit">Unit quaternion</div>`);
      } else if (op==='Multiply A×B') {
        const r=mul(a,b);
        showResult('A × B', `<div class="result-value">${fmtQ(r)}</div><div class="result-unit">Hamilton product · |r| = ${fmt(nrm(r))}</div>`);
      } else if (op==='Inverse A') {
        const r=inv(a);
        showResult('Inverse A⁻¹', `<div class="result-value">${fmtQ(r)}</div>`);
      } else if (op==='Conjugate A') {
        const r=conj(a);
        showResult('Conjugate A*', `<div class="result-value">${fmtQ(r)}</div>`);
      } else if (op==='Distance A↔B') {
        const d=dist(norm(a),norm(b));
        showResult('Angular Distance', `<div class="result-value">${fmt(d * RotMath.r2d)}°</div><div class="result-unit">${fmt(d)} rad — smallest rotation angle between the two orientations</div>`);
      } else if (op==='A from Euler') {
        const roll=parseFloat(prompt('Roll (deg):','0'))||0;
        const pitch=parseFloat(prompt('Pitch (deg):','0'))||0;
        const yaw=parseFloat(prompt('Yaw (deg):','0'))||0;
        const R = RotMath.eulerZYXtoR(roll*RotMath.d2r, pitch*RotMath.d2r, yaw*RotMath.d2r);
        const q = RotMath.RtoQ(R);
        ['w','x','y','z'].forEach(c => {
          const el = document.getElementById(`qa-${c}`);
          if (el) el.value = fmt(q[c]);
        });
        updateNorm('a');
      }
    };

    function updateSlerp() {
      const t=parseFloat(document.getElementById('slerp-t')?.value)||0.5;
      document.getElementById('slerp-t-val').textContent=t.toFixed(2);
      const q0=norm(readQ('s1')), q1=norm(readQ('s2'));
      const r=slerp(q0,q1,t);
      const el=document.getElementById('slerp-result');
      if (el) el.innerHTML=`<div class="stat-card">
        <div class="stat-label">SLERP(q₀, q₁, t=${t.toFixed(2)})</div>
        <div class="result-value" style="font-size:16px">${fmtQ(r)}</div>
        <div class="stat-unit">|q| = ${fmt(nrm(r))}</div>
      </div>`;
      updateSlerpChart(q0,q1);
    }

    function updateSlerpChart(q0,q1) {
      const canvas=document.getElementById('slerp-chart');
      if (!canvas) return;
      const N=50, ts=Array.from({length:N},(_, i)=>i/(N-1));
      const ws=ts.map(t=>slerp(q0,q1,t).w);
      const xs=ts.map(t=>slerp(q0,q1,t).x);
      const ys=ts.map(t=>slerp(q0,q1,t).y);
      const zs=ts.map(t=>slerp(q0,q1,t).z);
      if (slerpChart) { slerpChart.destroy(); slerpChart=null; }
      slerpChart=new Chart(canvas,{
        type:'line',
        data:{labels:ts.map(t=>t.toFixed(2)),datasets:[
          {label:'w',data:ws,borderColor:'#5865f2',tension:0.4,pointRadius:0},
          {label:'x',data:xs,borderColor:'#ef4444',tension:0.4,pointRadius:0},
          {label:'y',data:ys,borderColor:'#22c55e',tension:0.4,pointRadius:0},
          {label:'z',data:zs,borderColor:'#f59e0b',tension:0.4,pointRadius:0}
        ]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right'}},scales:{y:{min:-1,max:1}}}
      });
    }

    container.querySelectorAll('.qin-a,.qin-b').forEach(el => el.addEventListener('input',()=>{updateNorm('a');updateNorm('b');}));
    container.querySelectorAll('.qin-s1,.qin-s2').forEach(el => el.addEventListener('input',updateSlerp));
    document.getElementById('slerp-t')?.addEventListener('input',updateSlerp);

    window.qtSwitchTab = (tab, btn) => {
      document.querySelectorAll('[id^="qt-tab-"]').forEach(el=>el.classList.remove('active'));
      document.querySelectorAll('.tabs .tab').forEach(b=>b.classList.remove('active'));
      document.getElementById(`qt-tab-${tab}`)?.classList.add('active');
      btn.classList.add('active');
      if (tab==='slerp') setTimeout(updateSlerp,50);
    };

    return () => { if (slerpChart) { slerpChart.destroy(); slerpChart=null; } };
  }
});
