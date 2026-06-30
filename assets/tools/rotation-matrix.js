Router.register({
  id: 'rotation-matrix',
  name: 'Rotation Matrix',
  icon: '⬛',
  category: 'kinematics',
  description: 'Validate and analyze rotation matrices: orthogonality, determinant, eigenvalues',
  tags: ['matrix', 'rotation', 'orthogonal', 'determinant', 'eigenvalues', 'SO3'],

  init(container) {
    const p = Storage.getSettings().precision || 6;
    const fmt = v => parseFloat(v.toFixed(p));

    function makeIdentity() { return [[1,0,0],[0,1,0],[0,0,1]]; }
    function transpose(M) { return [[M[0][0],M[1][0],M[2][0]],[M[0][1],M[1][1],M[2][1]],[M[0][2],M[1][2],M[2][2]]]; }

    function inv33(M) {
      const det = RotMath.det33(M);
      if (Math.abs(det) < 1e-10) return null;
      const c = (r,c) => M[r][c];
      return [[
        (c(1,1)*c(2,2)-c(1,2)*c(2,1))/det,
        (c(0,2)*c(2,1)-c(0,1)*c(2,2))/det,
        (c(0,1)*c(1,2)-c(0,2)*c(1,1))/det
      ],[
        (c(1,2)*c(2,0)-c(1,0)*c(2,2))/det,
        (c(0,0)*c(2,2)-c(0,2)*c(2,0))/det,
        (c(0,2)*c(1,0)-c(0,0)*c(1,2))/det
      ],[
        (c(1,0)*c(2,1)-c(1,1)*c(2,0))/det,
        (c(0,1)*c(2,0)-c(0,0)*c(2,1))/det,
        (c(0,0)*c(1,1)-c(0,1)*c(1,0))/det
      ]];
    }

    function eigenvalues3x3(M) {
      const a=M[0][0],b=M[0][1],c=M[0][2],d=M[1][0],e=M[1][1],f=M[1][2],g=M[2][0],h=M[2][1],k=M[2][2];
      const p1=b*d+c*g+f*h;
      if (Math.abs(p1)<1e-10) return [a,e,k].sort((x,y)=>y-x);
      const q=(a+e+k)/3;
      const p2=(a-q)**2+(e-q)**2+(k-q)**2+2*p1;
      const p=Math.sqrt(p2/6);
      const B=[[a-q,b,c],[d,e-q,f],[g,h,k-q]].map(r=>r.map(v=>v/p));
      const r=RotMath.det33(B)/2;
      const phi=r<=-1?Math.PI/3:r>=1?0:Math.acos(r)/3;
      const eig1=q+2*p*Math.cos(phi);
      const eig3=q+2*p*Math.cos(phi+2*Math.PI/3);
      const eig2=3*q-eig1-eig3;
      return [eig1,eig2,eig3];
    }

    function frobeniusNorm(M) {
      let s=0; for(let i=0;i<3;i++) for(let j=0;j<3;j++) s+=M[i][j]**2; return Math.sqrt(s);
    }

    function matrixDiff(A,B) {
      return A.map((r,i)=>r.map((v,j)=>v-B[i][j]));
    }

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">⬛</span> Rotation Matrix Tool</div>
        <div class="tool-description">Enter a 3×3 matrix and analyze its properties as a rotation matrix in SO(3).</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="rmLoad('identity')">Identity</button>
          <button class="btn btn-secondary btn-sm" onclick="rmLoad('x90')">Rx(90°)</button>
          <button class="btn btn-secondary btn-sm" onclick="rmLoad('y45')">Ry(45°)</button>
          <button class="btn btn-secondary btn-sm" onclick="rmLoad('z30')">Rz(30°)</button>
          <button class="btn btn-secondary btn-sm" onclick="rmLoad('random')">Random R</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Input Matrix</div>
            <div id="rm-status" class="badge badge-success">Valid R</div>
          </div>
          <div class="card-body">
            <div class="matrix-grid" style="grid-template-columns:repeat(3,1fr)">
              ${[0,1,2].map(i=>[0,1,2].map(j=>`<input class="matrix-cell rm-input" id="rm-m${i}${j}" type="number" step="any" value="${i===j?1:0}">`).join('')).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Properties</div></div>
          <div class="card-body" id="rm-props"></div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><div class="card-title">Transpose Rᵀ</div></div>
          <div class="card-body" id="rm-transpose"></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Inverse R⁻¹</div></div>
          <div class="card-body" id="rm-inverse"></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Orthogonality Check: RᵀR - I</div></div>
        <div class="card-body" id="rm-ortho"></div>
      </div>`;

    function readM() {
      const M=[];
      for(let i=0;i<3;i++){M.push([]);for(let j=0;j<3;j++)M[i].push(parseFloat(document.getElementById(`rm-m${i}${j}`)?.value)||0);}
      return M;
    }

    function matrixHTML(M, colored=false) {
      return `<div class="matrix-grid" style="grid-template-columns:repeat(3,1fr);pointer-events:none">
        ${M.map(row=>row.map(v=>{
          const c=colored?Math.abs(v)<1e-6?'color:var(--success)':'color:var(--error)':'';
          return `<div class="matrix-cell" style="text-align:center;${c}">${fmt(v)}</div>`;
        }).join('')).join('')}
      </div>`;
    }

    function analyze() {
      const M=readM();
      const det=RotMath.det33(M);
      const Rt=transpose(M);
      const RtR=RotMath.mul33(Rt,M);
      const I=[[1,0,0],[0,1,0],[0,0,1]];
      const diff=matrixDiff(RtR,I);
      const orthErr=frobeniusNorm(diff);
      const isOrth=orthErr<1e-4;
      const isDetOne=Math.abs(det-1)<1e-4;
      const isValid=isOrth&&isDetOne;
      const eigs=eigenvalues3x3(M);
      const invM=inv33(M);

      document.getElementById('rm-status').textContent=isValid?'Valid R':'Invalid!';
      document.getElementById('rm-status').className=`badge ${isValid?'badge-success':'badge-error'}`;

      document.getElementById('rm-props').innerHTML=`
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="flex items-center gap-2 justify-between">
            <span class="text-secondary">Determinant</span>
            <span class="mono-value">${fmt(det)}</span>
            <span class="badge ${Math.abs(det-1)<0.01?'badge-success':'badge-error'}">${Math.abs(det-1)<0.01?'≈ 1':'≠ 1'}</span>
          </div>
          <div class="flex items-center gap-2 justify-between">
            <span class="text-secondary">Orthogonality Error ‖RᵀR-I‖</span>
            <span class="mono-value">${orthErr.toExponential(2)}</span>
            <span class="badge ${isOrth?'badge-success':'badge-error'}">${isOrth?'✓ OK':'✗ Fail'}</span>
          </div>
          <div class="separator"></div>
          <div><div class="text-secondary" style="margin-bottom:6px">Eigenvalues</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${eigs.map((e,i)=>`<span class="mono-value">λ${i+1}=${fmt(e)}</span>`).join('')}
            </div>
            <div class="form-hint" style="margin-top:4px">For valid R: one λ=1 (real), two complex conjugates with |λ|=1</div>
          </div>
          <div><div class="text-secondary" style="margin-bottom:6px">Rotation axis (if valid R)</div>
            ${(() => {
              const aa=RotMath.RtoAxisAngle(M);
              return `<span class="mono-value">k̂=[${fmt(aa.kx)}, ${fmt(aa.ky)}, ${fmt(aa.kz)}] · θ=${fmt(aa.theta*RotMath.r2d)}°</span>`;
            })()}
          </div>
        </div>`;

      document.getElementById('rm-transpose').innerHTML=matrixHTML(Rt);
      document.getElementById('rm-inverse').innerHTML=invM?matrixHTML(invM):`<div class="badge badge-error">Singular matrix – not invertible</div>`;
      document.getElementById('rm-ortho').innerHTML=matrixHTML(diff,true)+`<div style="margin-top:8px;font-size:12px;color:var(--text-tertiary)">Frobenius norm: ${orthErr.toExponential(4)} ${isOrth?'(orthogonal ✓)':'(NOT orthogonal ✗)'}</div>`;
    }

    container.querySelectorAll('.rm-input').forEach(el=>el.addEventListener('input',analyze));

    window.rmLoad = (preset) => {
      let M=makeIdentity();
      if (preset==='x90') M=[[1,0,0],[0,0,-1],[0,1,0]];
      else if (preset==='y45') { const c=Math.cos(Math.PI/4),s=Math.sin(Math.PI/4); M=[[c,0,s],[0,1,0],[-s,0,c]]; }
      else if (preset==='z30') { const c=Math.cos(Math.PI/6),s=Math.sin(Math.PI/6); M=[[c,-s,0],[s,c,0],[0,0,1]]; }
      else if (preset==='random') {
        const phi=Math.random()*2*Math.PI, theta=Math.random()*Math.PI, psi=Math.random()*2*Math.PI;
        M=RotMath.CONVENTIONS['ZYX'](phi,theta,psi);
      }
      for(let i=0;i<3;i++)for(let j=0;j<3;j++) {
        const el=document.getElementById(`rm-m${i}${j}`); if(el) el.value=fmt(M[i][j]);
      }
      analyze();
    };

    analyze();
  }
});
