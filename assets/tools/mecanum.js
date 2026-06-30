Router.register({
  id: 'mecanum',
  name: 'Mecanum Wheels',
  icon: '⚙️',
  category: 'motion',
  description: 'Forward and inverse kinematics for mecanum wheel robots',
  tags: ['mecanum', 'holonomic', 'omni', 'wheel', 'kinematics', 'lateral'],

  init(container) {
    const fmt = v => parseFloat(v.toFixed(4));

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">⚙️</span> Mecanum Wheel Calculator</div>
        <div class="tool-description">Compute wheel velocities from robot motion (IK) or robot motion from wheel velocities (FK). Layout: FL=front-left, FR=front-right, RL=rear-left, RR=rear-right.</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="mecSwap()">⇄ Swap FK/IK</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Robot Geometry</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group">
              <label class="form-label">Wheel Radius r</label>
              <div class="input-group"><input type="number" id="mec-r" class="input" value="0.1" step="0.01" min="0.001"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Half-width l_x (chassis center to wheel lateral)</label>
              <div class="input-group"><input type="number" id="mec-lx" class="input" value="0.3" step="0.01" min="0.01"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Half-length l_y (chassis center to wheel longitudinal)</label>
              <div class="input-group"><input type="number" id="mec-ly" class="input" value="0.25" step="0.01" min="0.01"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Roller Angle</label>
              <div class="input-group"><input type="number" id="mec-phi" class="input" value="45" step="5"><div class="input-addon">deg (45° standard)</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title" id="mec-mode-label">Inverse Kinematics: Robot Vel → Wheel Speeds</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px" id="mec-inputs"></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Results</div></div>
        <div class="card-body" id="mec-results"></div>
      </div>

      <div class="info-panel" style="margin-top:16px">
        <strong>IK (45° rollers):</strong><br>
        ω_FL = (vx − vy − (lx+ly)·ωz)/r<br>
        ω_FR = (vx + vy + (lx+ly)·ωz)/r<br>
        ω_RL = (vx + vy − (lx+ly)·ωz)/r<br>
        ω_RR = (vx − vy + (lx+ly)·ωz)/r
      </div>`;

    let mode='ik';

    function renderInputs() {
      const inp=document.getElementById('mec-inputs');
      const lbl=document.getElementById('mec-mode-label');
      if (mode==='ik') {
        lbl.textContent='Inverse Kinematics: Robot Vel → Wheel Speeds';
        inp.innerHTML=`
          <div class="form-group"><label class="form-label">vx (forward/back)</label><div class="input-group"><input type="number" id="mec-vx" class="input" value="0.5" step="0.1"><div class="input-addon">m/s</div></div></div>
          <div class="form-group"><label class="form-label">vy (lateral, left+)</label><div class="input-group"><input type="number" id="mec-vy" class="input" value="0.3" step="0.1"><div class="input-addon">m/s</div></div></div>
          <div class="form-group"><label class="form-label">ωz (yaw, CCW+)</label><div class="input-group"><input type="number" id="mec-wz" class="input" value="0.2" step="0.05"><div class="input-addon">rad/s</div></div></div>`;
      } else {
        lbl.textContent='Forward Kinematics: Wheel Speeds → Robot Vel';
        inp.innerHTML=`
          <div class="form-group"><label class="form-label">FL wheel ω_FL</label><div class="input-group"><input type="number" id="mec-wFL" class="input" value="2" step="0.1"><div class="input-addon">rad/s</div></div></div>
          <div class="form-group"><label class="form-label">FR wheel ω_FR</label><div class="input-group"><input type="number" id="mec-wFR" class="input" value="4" step="0.1"><div class="input-addon">rad/s</div></div></div>
          <div class="form-group"><label class="form-label">RL wheel ω_RL</label><div class="input-group"><input type="number" id="mec-wRL" class="input" value="2" step="0.1"><div class="input-addon">rad/s</div></div></div>
          <div class="form-group"><label class="form-label">RR wheel ω_RR</label><div class="input-group"><input type="number" id="mec-wRR" class="input" value="4" step="0.1"><div class="input-addon">rad/s</div></div></div>`;
      }
      inp.querySelectorAll('input').forEach(el=>el.addEventListener('input',compute));
    }

    function compute() {
      const r=parseFloat(document.getElementById('mec-r')?.value)||0.1;
      const lx=parseFloat(document.getElementById('mec-lx')?.value)||0.3;
      const ly=parseFloat(document.getElementById('mec-ly')?.value)||0.25;
      const phi=(parseFloat(document.getElementById('mec-phi')?.value)||45)*Math.PI/180;
      const k=1/Math.tan(phi);
      const L=lx+ly;

      let vx,vy,wz,wFL,wFR,wRL,wRR;
      if (mode==='ik') {
        vx=parseFloat(document.getElementById('mec-vx')?.value)||0;
        vy=parseFloat(document.getElementById('mec-vy')?.value)||0;
        wz=parseFloat(document.getElementById('mec-wz')?.value)||0;
        wFL=(vx-vy-L*wz)/r;
        wFR=(vx+vy+L*wz)/r;
        wRL=(vx+vy-L*wz)/r;
        wRR=(vx-vy+L*wz)/r;
      } else {
        wFL=parseFloat(document.getElementById('mec-wFL')?.value)||0;
        wFR=parseFloat(document.getElementById('mec-wFR')?.value)||0;
        wRL=parseFloat(document.getElementById('mec-wRL')?.value)||0;
        wRR=parseFloat(document.getElementById('mec-wRR')?.value)||0;
        vx=r*(wFL+wFR+wRL+wRR)/4;
        vy=r*(-wFL+wFR+wRL-wRR)/4;
        wz=r*(-wFL+wFR-wRL+wRR)/(4*L);
      }

      const maxW=Math.max(Math.abs(wFL),Math.abs(wFR),Math.abs(wRL),Math.abs(wRR));
      const bar=(v,max)=>{
        const pct=max<0.001?0:Math.abs(v/max)*100;
        const col=v>=0?'#22c55e':'#ef4444';
        return `<div style="height:6px;background:var(--border);border-radius:3px;margin-top:4px"><div style="height:100%;width:${pct}%;background:${col};border-radius:3px;transition:width 0.2s"></div></div>`;
      };

      document.getElementById('mec-results').innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div class="stat-card"><div class="stat-label">vx (forward)</div><div class="stat-value">${fmt(vx)}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">vy (lateral)</div><div class="stat-value">${fmt(vy)}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">ωz (yaw)</div><div class="stat-value">${fmt(wz)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">Speed |v|</div><div class="stat-value">${fmt(Math.sqrt(vx**2+vy**2))}</div><div class="stat-unit">m/s</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[['FL',wFL],['FR',wFR],['RL',wRL],['RR',wRR]].map(([lbl,w])=>`
          <div class="stat-card">
            <div class="stat-label">ω_${lbl}</div>
            <div class="stat-value">${fmt(w)}</div>
            <div class="stat-unit">rad/s (${fmt(w*r)} m/s)</div>
            ${bar(w,maxW)}
          </div>`).join('')}
        </div>`;
    }

    window.mecSwap=()=>{mode=mode==='ik'?'fk':'ik';renderInputs();compute();};
    renderInputs(); compute();
    ['mec-r','mec-lx','mec-ly','mec-phi'].forEach(id=>document.getElementById(id)?.addEventListener('input',compute));
  }
});
