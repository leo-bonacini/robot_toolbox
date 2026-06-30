Router.register({
  id: 'skid-steer',
  name: 'Skid Steer',
  icon: '🚜',
  category: 'motion',
  description: 'Kinematics for skid-steer (tank-drive) robots',
  tags: ['skid steer', 'tank drive', 'tracks', 'turning radius', 'differential'],

  init(container) {
    const fmt = v => isNaN(v)||!isFinite(v)?'—':parseFloat(v.toFixed(4));

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🚜</span> Skid Steer Calculator</div>
        <div class="tool-description">Kinematic calculations for skid-steer (tank drive) robots. Either enter wheel speeds or desired robot velocities.</div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Parameters</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group">
              <label class="form-label">Track Width L</label>
              <div class="input-group"><input type="number" id="ss-L" class="input" value="0.6" step="0.05" min="0.01"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Wheel Radius r</label>
              <div class="input-group"><input type="number" id="ss-r" class="input" value="0.1" step="0.01" min="0.001"><div class="input-addon">m</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Input</div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm ${true?'btn-primary':'btn-secondary'}" id="ss-mode-ws" onclick="ssModeWS()">Wheel Speeds</button>
              <button class="btn btn-sm btn-secondary" id="ss-mode-rv" onclick="ssModeRV()">Robot Vel</button>
            </div>
          </div>
          <div class="card-body" id="ss-input-body" style="display:flex;flex-direction:column;gap:12px"></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Results</div></div>
        <div class="card-body" id="ss-results"></div>
      </div>

      <div class="info-panel" style="margin-top:12px">
        <strong>v = r(ω_R + ω_L)/2</strong> &nbsp;|&nbsp;
        <strong>ω = r(ω_R − ω_L)/L</strong> &nbsp;|&nbsp;
        <strong>R = L(ω_R + ω_L)/(2(ω_R − ω_L))</strong>
      </div>`;

    let mode='ws';

    function renderInput() {
      const body=document.getElementById('ss-input-body');
      if (mode==='ws') {
        body.innerHTML=`
          <div class="form-group"><label class="form-label">Right Wheel Speed ω_R</label><div class="input-group"><input type="number" id="ss-wR" class="input" value="5" step="0.5"><div class="input-addon">rad/s</div></div></div>
          <div class="form-group"><label class="form-label">Left Wheel Speed ω_L</label><div class="input-group"><input type="number" id="ss-wL" class="input" value="3" step="0.5"><div class="input-addon">rad/s</div></div></div>`;
      } else {
        body.innerHTML=`
          <div class="form-group"><label class="form-label">Linear Velocity v</label><div class="input-group"><input type="number" id="ss-v" class="input" value="0.4" step="0.05"><div class="input-addon">m/s</div></div></div>
          <div class="form-group"><label class="form-label">Angular Velocity ω</label><div class="input-group"><input type="number" id="ss-omega" class="input" value="0.5" step="0.05"><div class="input-addon">rad/s</div></div></div>`;
      }
      body.querySelectorAll('input').forEach(el=>el.addEventListener('input',compute));
    }

    function compute() {
      const L=parseFloat(document.getElementById('ss-L')?.value)||0.6;
      const r=parseFloat(document.getElementById('ss-r')?.value)||0.1;
      let v,omega,wR,wL;

      if (mode==='ws') {
        wR=parseFloat(document.getElementById('ss-wR')?.value)||0;
        wL=parseFloat(document.getElementById('ss-wL')?.value)||0;
        v=r*(wR+wL)/2;
        omega=r*(wR-wL)/L;
      } else {
        v=parseFloat(document.getElementById('ss-v')?.value)||0;
        omega=parseFloat(document.getElementById('ss-omega')?.value)||0;
        wR=(v+omega*L/2)/r;
        wL=(v-omega*L/2)/r;
      }

      const turningR=Math.abs(wR-wL)<1e-6?Infinity:L*(wR+wL)/(2*(wR-wL));
      const rpmR=wR*60/(2*Math.PI), rpmL=wL*60/(2*Math.PI);
      const typeStr=Math.abs(omega)<1e-4?'Straight':omega>0?'Turning Left (CCW)':'Turning Right (CW)';

      document.getElementById('ss-results').innerHTML=`
        <div class="grid-4">
          <div class="stat-card"><div class="stat-label">Linear v</div><div class="stat-value">${fmt(v)}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">Angular ω</div><div class="stat-value">${fmt(omega)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">ω_R (right)</div><div class="stat-value">${fmt(wR)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">ω_L (left)</div><div class="stat-value">${fmt(wL)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">RPM Right</div><div class="stat-value">${fmt(rpmR)}</div><div class="stat-unit">RPM</div></div>
          <div class="stat-card"><div class="stat-label">RPM Left</div><div class="stat-value">${fmt(rpmL)}</div><div class="stat-unit">RPM</div></div>
          <div class="stat-card"><div class="stat-label">Turning Radius R</div><div class="stat-value">${isFinite(turningR)?fmt(turningR):'∞'}</div><div class="stat-unit">m</div></div>
          <div class="stat-card"><div class="stat-label">Motion</div><div class="stat-value" style="font-size:14px">${typeStr}</div></div>
        </div>`;
    }

    window.ssModeWS=()=>{mode='ws';document.getElementById('ss-mode-ws').className='btn btn-sm btn-primary';document.getElementById('ss-mode-rv').className='btn btn-sm btn-secondary';renderInput();compute();};
    window.ssModeRV=()=>{mode='rv';document.getElementById('ss-mode-rv').className='btn btn-sm btn-primary';document.getElementById('ss-mode-ws').className='btn btn-sm btn-secondary';renderInput();compute();};

    ['ss-L','ss-r'].forEach(id=>document.getElementById(id)?.addEventListener('input',compute));
    renderInput(); compute();
  }
});
