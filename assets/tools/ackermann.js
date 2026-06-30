Router.register({
  id: 'ackermann',
  name: 'Ackermann Steering',
  icon: '🏎️',
  category: 'motion',
  description: 'Ackermann steering geometry: steering angles, turning radius for car-like robots',
  tags: ['ackermann', 'steering', 'car', 'turning radius', 'wheelbase', 'bicycle model'],

  init(container) {
    const fmt = v => isNaN(v)||!isFinite(v)?'—':parseFloat(v.toFixed(4));
    const d2r = Math.PI/180, r2d = 180/Math.PI;

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🏎️</span> Ackermann Steering Calculator</div>
        <div class="tool-description">Compute steering angles and turning radius for a car-like robot using Ackermann geometry.</div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Vehicle Parameters</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group">
              <label class="form-label">Wheelbase L (front to rear axle)</label>
              <div class="input-group"><input type="number" id="ack-L" class="input" value="2.0" step="0.1" min="0.1"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Track Width d (wheel to wheel)</label>
              <div class="input-group"><input type="number" id="ack-d" class="input" value="1.5" step="0.1" min="0.1"><div class="input-addon">m</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Front Overhang (for center of turn)</label>
              <div class="input-group"><input type="number" id="ack-fo" class="input" value="0" step="0.1"><div class="input-addon">m</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Input Mode</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="tabs" style="margin-bottom:0">
              <button class="tab active" onclick="ackMode('radius',this)">From Turning Radius</button>
              <button class="tab" onclick="ackMode('angle',this)">From Steering Angle</button>
            </div>
            <div id="ack-input-radius">
              <div class="form-group">
                <label class="form-label">Desired Turning Radius R</label>
                <div class="input-group"><input type="number" id="ack-R" class="input" value="5.0" step="0.5" min="0.1"><div class="input-addon">m</div></div>
                <div class="form-hint">ICR radius from rear axle midpoint</div>
              </div>
            </div>
            <div id="ack-input-angle" style="display:none">
              <div class="form-group">
                <label class="form-label">Front Wheel (inner) Steering Angle δ_i</label>
                <div class="input-group"><input type="number" id="ack-delta" class="input" value="20" step="1"><div class="input-addon">deg</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Results</div></div>
        <div class="card-body" id="ack-results"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
        <div class="card">
          <div class="card-header"><div class="card-title">Diagram</div></div>
          <div class="card-body" style="display:flex;justify-content:center">
            <canvas id="ack-canvas" width="380" height="340" style="max-width:100%"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Formula Reference</div></div>
          <div class="card-body" style="font-size:13px;line-height:2">
            <b>Outer wheel angle (Ackermann):</b><br>
            δ_o = atan(L / (R + d/2))<br><br>
            <b>Inner wheel angle:</b><br>
            δ_i = atan(L / (R − d/2))<br><br>
            <b>Simplified (bicycle model):</b><br>
            δ = atan(L / R)<br><br>
            <b>ICR:</b> Instantaneous Center of Rotation<br>
            on rear axle extension line
          </div>
        </div>
      </div>`;

    let inputMode = 'radius';

    window.ackMode = (mode, btn) => {
      inputMode=mode;
      document.getElementById('ack-input-radius').style.display=mode==='radius'?'':'none';
      document.getElementById('ack-input-angle').style.display=mode==='angle'?'':'none';
      document.querySelectorAll('.tabs .tab').forEach(b=>b.classList.toggle('active',b===btn));
      compute();
    };

    function compute() {
      const L=parseFloat(document.getElementById('ack-L')?.value)||2.0;
      const d=parseFloat(document.getElementById('ack-d')?.value)||1.5;
      let R, delta_i, delta_o, delta_bicycle;

      if (inputMode==='radius') {
        R=parseFloat(document.getElementById('ack-R')?.value)||5.0;
        if (R<=d/2) { document.getElementById('ack-results').innerHTML='<div class="badge badge-error">Turning radius too small for track width</div>'; return; }
        delta_i=Math.atan(L/(R-d/2));
        delta_o=Math.atan(L/(R+d/2));
        delta_bicycle=Math.atan(L/R);
      } else {
        delta_i=(parseFloat(document.getElementById('ack-delta')?.value)||20)*d2r;
        R=L/Math.tan(delta_i)+d/2;
        delta_o=Math.atan(L/(R+d/2));
        delta_bicycle=Math.atan(L/R);
      }

      const ackermann_err=Math.abs(delta_i-delta_o)*r2d;
      const vR=1.0, vL=vR*(R-d/2)/(R+d/2);

      document.getElementById('ack-results').innerHTML=`
        <div class="grid-4">
          <div class="stat-card"><div class="stat-label">Turning Radius R</div><div class="stat-value">${fmt(R)}</div><div class="stat-unit">m (from rear axle)</div></div>
          <div class="stat-card"><div class="stat-label">Inner Wheel δ_i</div><div class="stat-value">${fmt(delta_i*r2d)}</div><div class="stat-unit">degrees</div></div>
          <div class="stat-card"><div class="stat-label">Outer Wheel δ_o</div><div class="stat-value">${fmt(delta_o*r2d)}</div><div class="stat-unit">degrees</div></div>
          <div class="stat-card"><div class="stat-label">Bicycle Model δ</div><div class="stat-value">${fmt(delta_bicycle*r2d)}</div><div class="stat-unit">degrees</div></div>
        </div>
        <div class="grid-2" style="margin-top:12px">
          <div class="stat-card"><div class="stat-label">Ackermann Angle Diff |δ_i − δ_o|</div><div class="stat-value">${fmt(ackermann_err)}</div><div class="stat-unit">degrees</div></div>
          <div class="stat-card"><div class="stat-label">Outer/Inner Speed Ratio</div><div class="stat-value">${fmt((R+d/2)/(R-d/2))}</div><div class="stat-unit">for no-slip</div></div>
        </div>`;

      draw(L, d, R, delta_i, delta_o);
    }

    function draw(L, d, R, di, doo) {
      const canvas=document.getElementById('ack-canvas');
      if (!canvas) return;
      const ctx=canvas.getContext('2d');
      const W=canvas.width, H=canvas.height;
      const isDark=document.documentElement.getAttribute('data-theme')==='dark';
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=isDark?'#111115':'#f6f8fd';
      ctx.fillRect(0,0,W,H);

      const margin=50;
      const scale=Math.min((W-margin*2)/L,(H-margin*2)/d)*0.6;
      const cx=W*0.35, cy=H*0.65;

      ctx.strokeStyle=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)';
      ctx.lineWidth=1;
      for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      const rL_x=cx, rL_y=cy;
      const rR_x=cx+d*scale, rR_y=cy;
      const fL_x=cx, fL_y=cy-L*scale;
      const fR_x=cx+d*scale, fR_y=cy-L*scale;

      ctx.strokeStyle=isDark?'#9b9db5':'#525970';
      ctx.lineWidth=2;
      ctx.strokeRect(rL_x-5,fL_y-5,d*scale+10,L*scale+10);

      function drawWheel(x,y,angle,label,color='#5865f2') {
        const wl=18,ww=6;
        ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
        ctx.fillStyle=color; ctx.strokeStyle=color; ctx.lineWidth=2;
        ctx.fillRect(-ww/2,-wl/2,ww,wl);
        ctx.restore();
        ctx.fillStyle=isDark?'#f0f0f5':'#0f1117';
        ctx.font='11px sans-serif'; ctx.textAlign='center';
        ctx.fillText(label,x,y+28);
      }

      drawWheel(rL_x,rL_y,0,'RL');
      drawWheel(rR_x,rR_y,0,'RR');
      drawWheel(fL_x,fL_y,-di,'FL','#22c55e');
      drawWheel(fR_x,fR_y,-doo,'FR','#22c55e');

      const icr_x=cx-d/2*scale+0*scale;
      const icr_y=cy;
      if (R<50/scale) {
        ctx.strokeStyle='#ef444444';
        ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.arc(icr_x,icr_y,R*scale,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle='#ef4444';
        ctx.beginPath();ctx.arc(icr_x,icr_y,4,0,Math.PI*2);ctx.fill();
        ctx.fillText('ICR',icr_x+6,icr_y-6);
      }

      ctx.fillStyle=isDark?'#9b9db5':'#525970';
      ctx.font='11px sans-serif';
      ctx.textAlign='center';
      ctx.fillText(`L=${L.toFixed(1)}m`,cx-30,cy-L*scale/2);
      ctx.fillText(`d=${d.toFixed(1)}m`,cx+d*scale/2,cy+20);
    }

    ['ack-L','ack-d','ack-R','ack-delta','ack-fo'].forEach(id=>document.getElementById(id)?.addEventListener('input',compute));
    compute();
  }
});
