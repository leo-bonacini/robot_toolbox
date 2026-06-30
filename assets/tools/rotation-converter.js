/* ============================================================
   ROTATION MATH UTILITIES (shared across rotation tools)
   ============================================================ */
const RotMath = (() => {
  const d2r = Math.PI / 180;
  const r2d = 180 / Math.PI;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fmt(v, p = 6) { return parseFloat(v.toFixed(p)); }

  /* Rotation matrices from axis rotations */
  function Rx(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [[1,0,0],[0,c,-s],[0,s,c]];
  }
  function Ry(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [[c,0,s],[0,1,0],[-s,0,c]];
  }
  function Rz(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [[c,-s,0],[s,c,0],[0,0,1]];
  }

  function mul33(A, B) {
    const C = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) for (let k=0;k<3;k++) C[i][j]+=A[i][k]*B[k][j];
    return C;
  }

  function transpose33(R) {
    return [[R[0][0],R[1][0],R[2][0]],[R[0][1],R[1][1],R[2][1]],[R[0][2],R[1][2],R[2][2]]];
  }

  /* Euler (ZYX = yaw-pitch-roll = extrinsic RPY) to rotation matrix */
  function eulerZYXtoR(roll, pitch, yaw) {
    return mul33(mul33(Rz(yaw), Ry(pitch)), Rx(roll));
  }

  const CONVENTIONS = {
    'ZYX': (r,p,y) => mul33(mul33(Rz(y),Ry(p)),Rx(r)),
    'XYZ': (r,p,y) => mul33(mul33(Rx(r),Ry(p)),Rz(y)),
    'ZXZ': (r,p,y) => mul33(mul33(Rz(r),Rx(p)),Rz(y)),
    'ZYZ': (r,p,y) => mul33(mul33(Rz(r),Ry(p)),Rz(y)),
    'XYX': (r,p,y) => mul33(mul33(Rx(r),Ry(p)),Rx(y)),
  };

  /* Rotation matrix to Euler ZYX (roll, pitch, yaw) */
  function Rtoeuler(R, conv = 'ZYX') {
    if (conv === 'ZYX') {
      const pitch = Math.asin(-clamp(R[2][0], -1, 1));
      let roll, yaw;
      if (Math.abs(R[2][0]) < 0.9999) {
        roll = Math.atan2(R[2][1], R[2][2]);
        yaw  = Math.atan2(R[1][0], R[0][0]);
      } else {
        roll = Math.atan2(-R[1][2], R[1][1]);
        yaw  = 0;
      }
      return { roll, pitch, yaw };
    }
    if (conv === 'XYZ') {
      const pitch = Math.asin(clamp(R[0][2], -1, 1));
      let roll, yaw;
      if (Math.abs(R[0][2]) < 0.9999) {
        roll = Math.atan2(-R[1][2], R[2][2]);
        yaw  = Math.atan2(-R[0][1], R[0][0]);
      } else {
        roll = Math.atan2(R[1][0], R[1][1]);
        yaw  = 0;
      }
      return { roll, pitch, yaw };
    }
    return Rtoeuler(R, 'ZYX');
  }

  /* Rotation matrix to quaternion */
  function RtoQ(R) {
    const tr = R[0][0]+R[1][1]+R[2][2];
    let w,x,y,z;
    if (tr > 0) {
      const s = 0.5/Math.sqrt(tr+1);
      w=0.25/s; x=(R[2][1]-R[1][2])*s; y=(R[0][2]-R[2][0])*s; z=(R[1][0]-R[0][1])*s;
    } else if (R[0][0]>R[1][1]&&R[0][0]>R[2][2]) {
      const s=2*Math.sqrt(1+R[0][0]-R[1][1]-R[2][2]);
      w=(R[2][1]-R[1][2])/s; x=0.25*s; y=(R[0][1]+R[1][0])/s; z=(R[0][2]+R[2][0])/s;
    } else if (R[1][1]>R[2][2]) {
      const s=2*Math.sqrt(1+R[1][1]-R[0][0]-R[2][2]);
      w=(R[0][2]-R[2][0])/s; x=(R[0][1]+R[1][0])/s; y=0.25*s; z=(R[1][2]+R[2][1])/s;
    } else {
      const s=2*Math.sqrt(1+R[2][2]-R[0][0]-R[1][1]);
      w=(R[1][0]-R[0][1])/s; x=(R[0][2]+R[2][0])/s; y=(R[1][2]+R[2][1])/s; z=0.25*s;
    }
    const n = Math.sqrt(w*w+x*x+y*y+z*z);
    return { w:w/n, x:x/n, y:y/n, z:z/n };
  }

  /* Quaternion to rotation matrix */
  function QtoR(q) {
    const {w,x,y,z} = q;
    return [
      [1-2*(y*y+z*z), 2*(x*y-w*z), 2*(x*z+w*y)],
      [2*(x*y+w*z), 1-2*(x*x+z*z), 2*(y*z-w*x)],
      [2*(x*z-w*y), 2*(y*z+w*x), 1-2*(x*x+y*y)]
    ];
  }

  /* Axis-angle to rotation matrix (Rodrigues formula) */
  function AxisAngleToR(kx, ky, kz, theta) {
    const n = Math.sqrt(kx*kx+ky*ky+kz*kz);
    if (n < 1e-10) return [[1,0,0],[0,1,0],[0,0,1]];
    kx/=n; ky/=n; kz/=n;
    const c=Math.cos(theta), s=Math.sin(theta), t=1-c;
    return [
      [t*kx*kx+c, t*kx*ky-s*kz, t*kx*kz+s*ky],
      [t*kx*ky+s*kz, t*ky*ky+c, t*ky*kz-s*kx],
      [t*kx*kz-s*ky, t*ky*kz+s*kx, t*kz*kz+c]
    ];
  }

  /* Rotation matrix to axis-angle */
  function RtoAxisAngle(R) {
    const theta = Math.acos(clamp((R[0][0]+R[1][1]+R[2][2]-1)/2, -1, 1));
    if (Math.abs(theta) < 1e-10) return { kx:0, ky:0, kz:1, theta:0 };
    const s = 2*Math.sin(theta);
    return { kx:(R[2][1]-R[1][2])/s, ky:(R[0][2]-R[2][0])/s, kz:(R[1][0]-R[0][1])/s, theta };
  }

  /* Rodrigues vector: v = k̂*theta */
  function RtoRodrigues(R) {
    const aa = RtoAxisAngle(R);
    return { rx: aa.kx*aa.theta, ry: aa.ky*aa.theta, rz: aa.kz*aa.theta };
  }

  function RodriguesToR(rx, ry, rz) {
    const theta = Math.sqrt(rx*rx+ry*ry+rz*rz);
    if (theta < 1e-10) return [[1,0,0],[0,1,0],[0,0,1]];
    return AxisAngleToR(rx/theta, ry/theta, rz/theta, theta);
  }

  /* Validate rotation matrix */
  function isValidR(R) {
    if (!R || R.length !== 3) return false;
    const Rt = transpose33(R);
    const I = mul33(R, Rt);
    const identity = [[1,0,0],[0,1,0],[0,0,1]];
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) {
      if (Math.abs(I[i][j]-identity[i][j]) > 1e-4) return false;
    }
    const det = R[0][0]*(R[1][1]*R[2][2]-R[1][2]*R[2][1])
              - R[0][1]*(R[1][0]*R[2][2]-R[1][2]*R[2][0])
              + R[0][2]*(R[1][0]*R[2][1]-R[1][1]*R[2][0]);
    return Math.abs(det-1) < 1e-4;
  }

  function det33(R) {
    return R[0][0]*(R[1][1]*R[2][2]-R[1][2]*R[2][1])
          -R[0][1]*(R[1][0]*R[2][2]-R[1][2]*R[2][0])
          +R[0][2]*(R[1][0]*R[2][1]-R[1][1]*R[2][0]);
  }

  return { d2r, r2d, fmt, Rx, Ry, Rz, mul33, transpose33, CONVENTIONS,
    eulerZYXtoR, Rtoeuler, RtoQ, QtoR, AxisAngleToR, RtoAxisAngle, RtoRodrigues, RodriguesToR,
    isValidR, det33 };
})();

/* ============================================================
   ROTATION CONVERTER TOOL
   ============================================================ */
Router.register({
  id: 'rotation-converter',
  name: 'Rotation Converter',
  icon: '🔄',
  category: 'kinematics',
  description: 'Convert between Euler angles, quaternions, rotation matrices and axis-angle representations',
  tags: ['euler', 'quaternion', 'matrix', 'rotation', 'axis-angle', 'rodrigues', 'rpy', 'transform'],

  init(container) {
    let precision = Storage.getSettings().precision || 4;
    let convention = 'ZYX';
    let useRadians = false;
    let updating = false;

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🔄</span> Rotation Converter</div>
        <div class="tool-description">Convert between common 3D rotation representations. Edit any panel to update all others.</div>
        <div class="tool-actions">
          <label class="btn btn-secondary btn-sm">
            <input type="checkbox" id="rc-radians" style="margin-right:5px"> Use Radians
          </label>
          <button class="btn btn-secondary btn-sm" id="rc-copy-json">⬇ Copy JSON</button>
          <button class="btn btn-ghost btn-sm" onclick="Modals.openSettings()">Settings</button>
        </div>
      </div>

      <div class="rotation-grid" id="rc-grid">
        <!-- Euler Angles -->
        <div class="rotation-panel" id="rc-euler-panel">
          <div class="rotation-panel-header">
            <div>
              <div class="rotation-panel-title">Euler Angles</div>
              <div style="font-size:11px;color:var(--text-tertiary)">Convention:</div>
            </div>
            <div class="euler-convention-tabs" id="rc-convention-tabs">
              ${['ZYX','XYZ','ZXZ','ZYZ'].map(c=>`<button class="convention-tab ${c==='ZYX'?'active':''}" onclick="rcSetConvention('${c}')">${c}</button>`).join('')}
            </div>
          </div>
          <div class="rotation-panel-body">
            <div class="rotation-inputs">
              ${[['roll','r'],['pitch','p'],['yaw','y']].map(([name,lbl])=>`
              <div class="rotation-input-row">
                <div class="rotation-input-label">${lbl.toUpperCase()}</div>
                <input class="input rc-euler" id="rc-${name}" type="number" step="any" value="0" placeholder="${name}">
                <div class="rotation-input-unit" id="rc-unit-${name}">deg</div>
              </div>`).join('')}
            </div>
            <div style="margin-top:10px;padding:8px 10px;background:var(--code-bg);border-radius:var(--radius);font-size:11.5px;color:var(--text-tertiary)">
              Intrinsic: rotations about axes of the rotating body
            </div>
          </div>
        </div>

        <!-- Quaternion -->
        <div class="rotation-panel" id="rc-quat-panel">
          <div class="rotation-panel-header">
            <div class="rotation-panel-title">Quaternion <span style="font-family:var(--font-mono);font-size:11px">[w, x, y, z]</span></div>
          </div>
          <div class="rotation-panel-body">
            <div class="rotation-inputs">
              ${['w','x','y','z'].map(c=>`
              <div class="rotation-input-row">
                <div class="rotation-input-label">${c}</div>
                <input class="input rc-quat" id="rc-q${c}" type="number" step="any" value="${c==='w'?1:0}">
              </div>`).join('')}
            </div>
            <div id="rc-qnorm" style="margin-top:8px;font-size:11.5px;color:var(--text-tertiary)">|q| = 1.000000</div>
          </div>
        </div>

        <!-- Rotation Matrix -->
        <div class="rotation-panel" id="rc-mat-panel">
          <div class="rotation-panel-header">
            <div class="rotation-panel-title">Rotation Matrix <span style="font-family:var(--font-mono);font-size:11px">SO(3)</span></div>
            <div id="rc-mat-status" class="badge badge-success">Valid R</div>
          </div>
          <div class="rotation-panel-body">
            <div class="matrix-display" style="grid-template-columns:repeat(3,1fr);gap:3px">
              ${[0,1,2].map(i=>[0,1,2].map(j=>`<input class="matrix-cell-display rc-mat" id="rc-m${i}${j}" type="number" step="any" value="${i===j?1:0}">`).join('')).join('')}
            </div>
            <div id="rc-det" style="margin-top:8px;font-size:11.5px;color:var(--text-tertiary)">det = 1.000000</div>
          </div>
        </div>

        <!-- Axis-Angle -->
        <div class="rotation-panel" id="rc-aa-panel">
          <div class="rotation-panel-header">
            <div class="rotation-panel-title">Axis-Angle</div>
          </div>
          <div class="rotation-panel-body">
            <div class="rotation-inputs">
              ${['x','y','z'].map(c=>`
              <div class="rotation-input-row">
                <div class="rotation-input-label">k<sub>${c}</sub></div>
                <input class="input rc-aa" id="rc-aa${c}" type="number" step="any" value="${c==='z'?1:0}">
              </div>`).join('')}
              <div class="rotation-input-row">
                <div class="rotation-input-label">θ</div>
                <input class="input rc-aa" id="rc-aatheta" type="number" step="any" value="0">
                <div class="rotation-input-unit" id="rc-aaunit">deg</div>
              </div>
            </div>
            <div style="margin-top:8px;font-size:11.5px;color:var(--text-tertiary)">Axis k̂ will be normalized automatically</div>
          </div>
        </div>

        <!-- Rodrigues Vector -->
        <div class="rotation-panel" id="rc-rod-panel" style="grid-column:1/-1">
          <div class="rotation-panel-header">
            <div class="rotation-panel-title">Rodrigues Vector <span style="font-family:var(--font-mono);font-size:11px">v = k̂·θ</span></div>
          </div>
          <div class="rotation-panel-body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
              ${['rx','ry','rz'].map(c=>`
              <div class="rotation-input-row">
                <div class="rotation-input-label">${c[1]}</div>
                <input class="input rc-rod" id="rc-${c}" type="number" step="any" value="0">
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Formula Reference</div></div>
        <div class="card-body">
          <div class="info-panel" style="background:var(--accent-light);border-color:var(--accent)">
            <strong>ZYX (Aerospace / ROS convention):</strong> R = R_z(yaw) · R_y(pitch) · R_x(roll)<br>
            <strong>Quaternion:</strong> w = cos(θ/2), [x,y,z] = k̂ · sin(θ/2)<br>
            <strong>Rodrigues:</strong> v = k̂ · θ (compact axis-angle)
          </div>
        </div>
      </div>`;

    const p = n => parseFloat(n) || 0;

    function readR() {
      const R = [];
      for (let i=0;i<3;i++) {
        R.push([]);
        for (let j=0;j<3;j++) R[i].push(p(document.getElementById(`rc-m${i}${j}`)?.value));
      }
      return R;
    }

    function writeR(R) {
      for (let i=0;i<3;i++) for (let j=0;j<3;j++) {
        const el = document.getElementById(`rc-m${i}${j}`);
        if (el) el.value = RotMath.fmt(R[i][j], precision);
      }
      const det = RotMath.det33(R);
      const detEl = document.getElementById('rc-det');
      if (detEl) detEl.textContent = `det = ${RotMath.fmt(det, precision)}`;
      const statusEl = document.getElementById('rc-mat-status');
      if (statusEl) {
        const valid = RotMath.isValidR(R);
        statusEl.textContent = valid ? 'Valid R' : 'Invalid!';
        statusEl.className = `badge ${valid ? 'badge-success' : 'badge-error'}`;
      }
    }

    function writeQ(q) {
      ['w','x','y','z'].forEach(c => {
        const el = document.getElementById(`rc-q${c}`);
        if (el) el.value = RotMath.fmt(q[c], precision);
      });
      const n = Math.sqrt(q.w**2+q.x**2+q.y**2+q.z**2);
      const normEl = document.getElementById('rc-qnorm');
      if (normEl) normEl.textContent = `|q| = ${RotMath.fmt(n, precision)}`;
    }

    function writeEuler(angles) {
      const factor = useRadians ? 1 : RotMath.r2d;
      document.getElementById('rc-roll').value = RotMath.fmt(angles.roll*factor, precision);
      document.getElementById('rc-pitch').value = RotMath.fmt(angles.pitch*factor, precision);
      document.getElementById('rc-yaw').value = RotMath.fmt(angles.yaw*factor, precision);
    }

    function writeAA(aa) {
      document.getElementById('rc-aax').value = RotMath.fmt(aa.kx, precision);
      document.getElementById('rc-aay').value = RotMath.fmt(aa.ky, precision);
      document.getElementById('rc-aaz').value = RotMath.fmt(aa.kz, precision);
      const factor = useRadians ? 1 : RotMath.r2d;
      document.getElementById('rc-aatheta').value = RotMath.fmt(aa.theta*factor, precision);
    }

    function writeRod(rod) {
      document.getElementById('rc-rx').value = RotMath.fmt(rod.rx, precision);
      document.getElementById('rc-ry').value = RotMath.fmt(rod.ry, precision);
      document.getElementById('rc-rz').value = RotMath.fmt(rod.rz, precision);
    }

    function updateFromR(R) {
      if (updating) return;
      updating = true;
      writeR(R);
      writeQ(RotMath.RtoQ(R));
      writeEuler(RotMath.Rtoeuler(R, convention));
      writeAA(RotMath.RtoAxisAngle(R));
      writeRod(RotMath.RtoRodrigues(R));
      updating = false;
    }

    function fromEuler() {
      if (updating) return;
      const f = useRadians ? 1 : RotMath.d2r;
      const roll = p(document.getElementById('rc-roll')?.value)*f;
      const pitch = p(document.getElementById('rc-pitch')?.value)*f;
      const yaw = p(document.getElementById('rc-yaw')?.value)*f;
      const conv = RotMath.CONVENTIONS[convention] || RotMath.CONVENTIONS['ZYX'];
      updateFromR(conv(roll, pitch, yaw));
    }

    function fromQuat() {
      if (updating) return;
      const q = { w:p(document.getElementById('rc-qw')?.value), x:p(document.getElementById('rc-qx')?.value), y:p(document.getElementById('rc-qy')?.value), z:p(document.getElementById('rc-qz')?.value) };
      const n = Math.sqrt(q.w**2+q.x**2+q.y**2+q.z**2);
      if (n < 1e-10) return;
      q.w/=n; q.x/=n; q.y/=n; q.z/=n;
      updateFromR(RotMath.QtoR(q));
    }

    function fromMatrix() {
      if (updating) return;
      updateFromR(readR());
    }

    function fromAA() {
      if (updating) return;
      const f = useRadians ? 1 : RotMath.d2r;
      const kx=p(document.getElementById('rc-aax')?.value),ky=p(document.getElementById('rc-aay')?.value),kz=p(document.getElementById('rc-aaz')?.value);
      const theta=p(document.getElementById('rc-aatheta')?.value)*f;
      updateFromR(RotMath.AxisAngleToR(kx,ky,kz,theta));
    }

    function fromRod() {
      if (updating) return;
      const rx=p(document.getElementById('rc-rx')?.value),ry=p(document.getElementById('rc-ry')?.value),rz=p(document.getElementById('rc-rz')?.value);
      updateFromR(RotMath.RodriguesToR(rx,ry,rz));
    }

    container.querySelectorAll('.rc-euler').forEach(el => el.addEventListener('input', fromEuler));
    container.querySelectorAll('.rc-quat').forEach(el => el.addEventListener('input', fromQuat));
    container.querySelectorAll('.rc-mat').forEach(el => el.addEventListener('input', fromMatrix));
    container.querySelectorAll('.rc-aa').forEach(el => el.addEventListener('input', fromAA));
    container.querySelectorAll('.rc-rod').forEach(el => el.addEventListener('input', fromRod));

    container.querySelector('#rc-radians')?.addEventListener('change', function() {
      useRadians = this.checked;
      ['rc-unit-roll','rc-unit-pitch','rc-unit-yaw','rc-aaunit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = useRadians ? 'rad' : 'deg';
      });
      fromMatrix();
    });

    container.querySelector('#rc-copy-json')?.addEventListener('click', () => {
      const R = readR();
      const q = RotMath.RtoQ(R);
      const aa = RotMath.RtoAxisAngle(R);
      const f = useRadians ? 1 : RotMath.r2d;
      const e = RotMath.Rtoeuler(R, convention);
      Exporter.copyText(JSON.stringify({ euler_deg: {roll:e.roll*RotMath.r2d, pitch:e.pitch*RotMath.r2d, yaw:e.yaw*RotMath.r2d}, quaternion:{w:q.w,x:q.x,y:q.y,z:q.z}, rotation_matrix:R }, null, 2));
    });

    window.rcSetConvention = (c) => {
      convention = c;
      document.querySelectorAll('.convention-tab').forEach(b => b.classList.toggle('active', b.textContent===c));
      fromMatrix();
    };

    fromEuler();
  }
});
