Router.register({
  id: 'differential-drive',
  name: 'Differential Drive',
  icon: '🚗',
  category: 'motion',
  description: 'Kinematic calculations for differential drive robots: wheel speeds, turning radius',
  tags: ['differential drive', 'wheel speed', 'unicycle', 'mobile robot', 'kinematics'],

  init(container) {
    const fmt = v => isNaN(v)||!isFinite(v) ? '—' : parseFloat(v.toFixed(4));

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🚗</span> Differential Drive Calculator</div>
        <div class="tool-description">Calculate wheel velocities from robot motion commands and vice versa.</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="ddSwapMode()">⇄ Swap Input/Output</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Robot Geometry</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group">
              <label class="form-label">Wheel Radius r</label>
              <div class="input-group"><input type="number" id="dd-r" class="input" value="0.1" step="0.01" min="0.001"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Track Width L (distance between wheels)</label>
              <div class="input-group"><input type="number" id="dd-L" class="input" value="0.5" step="0.01" min="0.001"><div class="input-addon">m</div></div>
            </div>
          </div>
        </div>

        <div class="card" id="dd-input-card">
          <div class="card-header"><div class="card-title" id="dd-mode-title">From Robot Velocities → Wheel Speeds</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px" id="dd-inputs"></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Results</div></div>
        <div class="card-body" id="dd-results"></div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Visual Diagram</div></div>
        <div class="card-body" style="display:flex;justify-content:center">
          <canvas id="dd-canvas" width="400" height="300" style="max-width:100%;border-radius:var(--radius)"></canvas>
        </div>
      </div>

      <div class="info-panel" style="margin-top:16px">
        <strong>Forward kinematics:</strong> v = r(ω_R + ω_L)/2 · &nbsp; ω = r(ω_R − ω_L)/L<br>
        <strong>Inverse kinematics:</strong> ω_R = (v + ωL/2)/r · &nbsp; ω_L = (v − ωL/2)/r<br>
        <strong>Turning radius:</strong> R = (ω_R + ω_L)/(ω_R − ω_L) · L/2 &nbsp; (∞ when straight)
      </div>`;

    let mode = 'fwd'; // fwd: robot vel -> wheel, inv: wheel -> robot vel

    function renderInputs() {
      const inp = document.getElementById('dd-inputs');
      const title = document.getElementById('dd-mode-title');
      if (mode==='fwd') {
        title.textContent = 'From Robot Velocities → Wheel Speeds';
        inp.innerHTML = `
          <div class="form-group">
            <label class="form-label">Linear Velocity v</label>
            <div class="input-group"><input type="number" id="dd-v" class="input" value="0.5" step="0.01"><div class="input-addon">m/s</div></div>
          </div>
          <div class="form-group">
            <label class="form-label">Angular Velocity ω</label>
            <div class="input-group"><input type="number" id="dd-omega" class="input" value="0.5" step="0.01"><div class="input-addon">rad/s</div></div>
          </div>`;
      } else {
        title.textContent = 'From Wheel Speeds → Robot Velocities';
        inp.innerHTML = `
          <div class="form-group">
            <label class="form-label">Right Wheel Speed ω_R</label>
            <div class="input-group"><input type="number" id="dd-wR" class="input" value="6" step="0.1"><div class="input-addon">rad/s</div></div>
          </div>
          <div class="form-group">
            <label class="form-label">Left Wheel Speed ω_L</label>
            <div class="input-group"><input type="number" id="dd-wL" class="input" value="4" step="0.1"><div class="input-addon">rad/s</div></div>
          </div>`;
      }
      inp.querySelectorAll('input').forEach(el=>el.addEventListener('input',compute));
    }

    function compute() {
      const r=parseFloat(document.getElementById('dd-r')?.value)||0.1;
      const L=parseFloat(document.getElementById('dd-L')?.value)||0.5;
      let v,omega,wR,wL;

      if (mode==='fwd') {
        v=parseFloat(document.getElementById('dd-v')?.value)||0;
        omega=parseFloat(document.getElementById('dd-omega')?.value)||0;
        wR=(v+omega*L/2)/r;
        wL=(v-omega*L/2)/r;
      } else {
        wR=parseFloat(document.getElementById('dd-wR')?.value)||0;
        wL=parseFloat(document.getElementById('dd-wL')?.value)||0;
        v=r*(wR+wL)/2;
        omega=r*(wR-wL)/L;
      }

      const rpmR=wR*60/(2*Math.PI);
      const rpmL=wL*60/(2*Math.PI);
      const vR=wR*r, vL=wL*r;
      const R=Math.abs(wR-wL)<1e-6?Infinity:L/2*(wR+wL)/(wR-wL);
      const turningR=fmt(R)===Infinity?'∞ (straight)':fmt(R)+' m';

      document.getElementById('dd-results').innerHTML=`
        <div class="grid-4">
          <div class="stat-card"><div class="stat-label">Linear Velocity v</div><div class="stat-value">${fmt(v)}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">Angular Velocity ω</div><div class="stat-value">${fmt(omega)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">Right Wheel ω_R</div><div class="stat-value">${fmt(wR)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">Left Wheel ω_L</div><div class="stat-value">${fmt(wL)}</div><div class="stat-unit">rad/s</div></div>
          <div class="stat-card"><div class="stat-label">Right Wheel Speed</div><div class="stat-value">${fmt(vR)}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">Left Wheel Speed</div><div class="stat-value">${fmt(vL)}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">Right RPM</div><div class="stat-value">${fmt(rpmR)}</div><div class="stat-unit">RPM</div></div>
          <div class="stat-card"><div class="stat-label">Left RPM</div><div class="stat-value">${fmt(rpmL)}</div><div class="stat-unit">RPM</div></div>
        </div>
        <div style="margin-top:14px" class="flex items-center gap-3">
          <div class="stat-card" style="flex:1"><div class="stat-label">Turning Radius R</div><div class="stat-value" style="font-size:18px">${turningR}</div></div>
          <div class="stat-card" style="flex:1"><div class="stat-label">Motion Type</div><div class="stat-value" style="font-size:16px">${Math.abs(omega)<1e-6?'Straight':omega>0?'Turning Left':'Turning Right'}</div></div>
        </div>`;

      drawDiagram(r, L, wR, wL, v, omega);
    }

    function drawDiagram(r, L, wR, wL, v, omega) {
      const canvas=document.getElementById('dd-canvas');
      if (!canvas) return;
      const ctx=canvas.getContext('2d');
      const W=canvas.width, H=canvas.height;
      const isDark=document.documentElement.getAttribute('data-theme')==='dark';
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=isDark?'#18181e':'#f6f8fd';
      ctx.fillRect(0,0,W,H);

      const cx=W/2, cy=H/2;
      const scale=Math.min(W,H)*0.3;
      const bW=scale*0.6, bH=scale*0.4;

      ctx.strokeStyle=isDark?'#9b9db5':'#525970';
      ctx.lineWidth=2;
      ctx.strokeRect(cx-bW/2, cy-bH/2, bW, bH);
      ctx.fillStyle=isDark?'#5865f2':'#5865f2';
      ctx.fillRect(cx-bW/2, cy-bH/2, bW, bH);
      ctx.globalAlpha=0.3;
      ctx.fillRect(cx-bW/2, cy-bH/2, bW, bH);
      ctx.globalAlpha=1;

      function drawWheel(x, y, speed, label) {
        const wh=scale*0.35, ww=scale*0.08;
        const color=speed>0?'#22c55e':speed<0?'#ef4444':'#9b9db5';
        ctx.fillStyle=color;
        ctx.strokeStyle=color;
        ctx.lineWidth=2;
        ctx.fillRect(x-ww/2,y-wh/2,ww,wh);
        ctx.strokeRect(x-ww/2,y-wh/2,ww,wh);

        const arrowL=Math.min(scale*0.25,Math.abs(speed/10)*scale*0.5);
        if (Math.abs(speed)>0.01) {
          const dir=speed>0?-1:1;
          ctx.beginPath();
          ctx.moveTo(x,y); ctx.lineTo(x,y+dir*arrowL);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x-5,y+dir*arrowL+(-dir)*8);
          ctx.lineTo(x,y+dir*arrowL);
          ctx.lineTo(x+5,y+dir*arrowL+(-dir)*8);
          ctx.stroke();
        }

        ctx.fillStyle=isDark?'#f0f0f5':'#0f1117';
        ctx.font=`12px ${getComputedStyle(document.documentElement).getPropertyValue('--font-sans')}`;
        ctx.textAlign='center';
        ctx.fillText(`${label}: ${Math.abs(speed).toFixed(2)} r/s`,x,y+wh/2+18);
      }

      drawWheel(cx-bW/2-scale*0.06, cy, wL, 'L');
      drawWheel(cx+bW/2+scale*0.06, cy, wR, 'R');

      if (Math.abs(v)>0.01) {
        ctx.strokeStyle='#5865f2';
        ctx.lineWidth=3;
        ctx.beginPath();
        const vy=v>0?-40:40;
        ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+vy);
        ctx.stroke();
        ctx.fillStyle='#5865f2';
        ctx.font='bold 12px sans-serif';
        ctx.textAlign='center';
        ctx.fillText(`v=${v.toFixed(2)}m/s`,cx,cy+vy+(v>0?-8:18));
      }

      ctx.fillStyle=isDark?'#9b9db5':'#525970';
      ctx.font='11px sans-serif';
      ctx.textAlign='center';
      ctx.fillText(`L = ${L.toFixed(2)}m`,cx,cy+bH/2+36);
    }

    window.ddSwapMode = () => {
      mode=mode==='fwd'?'inv':'fwd';
      renderInputs();
      compute();
    };

    document.getElementById('dd-r')?.addEventListener('input',compute);
    document.getElementById('dd-L')?.addEventListener('input',compute);
    renderInputs();
    compute();
  }
});
