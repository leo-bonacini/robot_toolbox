Router.register({
  id: 'camera-fov',
  name: 'Camera FOV',
  icon: '📷',
  category: 'vision',
  description: 'Compute field of view from sensor size and focal length',
  tags: ['camera', 'FOV', 'field of view', 'focal length', 'sensor', 'lens', 'optics', 'vision'],

  init(container) {
    const fmt = v => parseFloat(v.toFixed(4));
    const r2d = 180/Math.PI;

    const sensorPresets = {
      '1/4"':  {w:3.6,h:2.7},  '1/3"':  {w:4.8,h:3.6},
      '1/2"':  {w:6.4,h:4.8},  '1/2.3"':{w:6.17,h:4.55},
      '2/3"':  {w:8.8,h:6.6},  '1"':    {w:13.2,h:8.8},
      'M4/3':  {w:17.3,h:13},  'APS-C': {w:23.5,h:15.6},
      'APS-H': {w:28.7,h:19},  'FF':    {w:36,h:24},
      'MF':    {w:53.7,h:40.2}
    };

    container.innerHTML=`
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">📷</span> Camera FOV Calculator</div>
        <div class="tool-description">Calculate horizontal, vertical and diagonal field of view from sensor size and focal length.</div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Camera Parameters</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
            <div class="form-group">
              <label class="form-label">Sensor Preset</label>
              <select class="select" onchange="camPreset(this.value)">
                <option value="">Custom</option>
                ${Object.keys(sensorPresets).map(k=>`<option value="${k}">${k} (${sensorPresets[k].w}×${sensorPresets[k].h} mm)</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sensor Width</label>
              <div class="input-group"><input type="number" id="cam-sw" class="input" value="6.17" step="0.01" min="0.1" oninput="camCompute()"><div class="input-addon">mm</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Sensor Height</label>
              <div class="input-group"><input type="number" id="cam-sh" class="input" value="4.55" step="0.01" min="0.1" oninput="camCompute()"><div class="input-addon">mm</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Focal Length</label>
              <div class="input-group"><input type="number" id="cam-f" class="input" value="3.6" step="0.1" min="0.1" oninput="camCompute()"><div class="input-addon">mm</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Image Resolution</label>
              <div style="display:flex;gap:8px">
                <div class="input-group"><input type="number" id="cam-rw" class="input" value="1920" step="1" min="1" oninput="camCompute()"><div class="input-addon">px</div></div>
                <div class="input-group"><input type="number" id="cam-rh" class="input" value="1080" step="1" min="1" oninput="camCompute()"><div class="input-addon">px</div></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Distance to Object</label>
              <div class="input-group"><input type="number" id="cam-dist" class="input" value="10" step="0.5" min="0.01" oninput="camCompute()"><div class="input-addon">m</div></div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-header"><div class="card-title">FOV Results</div></div>
            <div class="card-body" id="cam-results"></div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">FOV Diagram</div></div>
            <div class="card-body" style="display:flex;justify-content:center">
              <canvas id="cam-canvas" width="360" height="280" style="max-width:100%"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Camera Intrinsics</div></div>
        <div class="card-body" id="cam-intrinsics"></div>
      </div>`;

    window.camPreset = (name) => {
      const p=sensorPresets[name];
      if(!p)return;
      document.getElementById('cam-sw').value=p.w;
      document.getElementById('cam-sh').value=p.h;
      camCompute();
    };

    window.camCompute = () => {
      const sw=parseFloat(document.getElementById('cam-sw')?.value)||6.17;
      const sh=parseFloat(document.getElementById('cam-sh')?.value)||4.55;
      const f=parseFloat(document.getElementById('cam-f')?.value)||3.6;
      const rw=parseInt(document.getElementById('cam-rw')?.value)||1920;
      const rh=parseInt(document.getElementById('cam-rh')?.value)||1080;
      const dist=parseFloat(document.getElementById('cam-dist')?.value)||10;

      const hfov=2*Math.atan(sw/(2*f))*r2d;
      const vfov=2*Math.atan(sh/(2*f))*r2d;
      const dfov=2*Math.atan(Math.sqrt(sw**2+sh**2)/(2*f))*r2d;

      const cw=2*dist*Math.tan(hfov/2/r2d);
      const ch=2*dist*Math.tan(vfov/2/r2d);
      const cpp_x=rw/(sw/f);
      const cpp_y=rh/(sh/f);
      const fx_px=f*(rw/sw);
      const fy_px=f*(rh/sh);
      const cx=rw/2, cy=rh/2;
      const gsd_mm=sw/rw/f*dist*1000;

      document.getElementById('cam-results').innerHTML=`
        <div class="grid-3">
          <div class="stat-card"><div class="stat-label">H-FOV</div><div class="stat-value">${fmt(hfov)}</div><div class="stat-unit">degrees</div></div>
          <div class="stat-card"><div class="stat-label">V-FOV</div><div class="stat-value">${fmt(vfov)}</div><div class="stat-unit">degrees</div></div>
          <div class="stat-card"><div class="stat-label">D-FOV</div><div class="stat-value">${fmt(dfov)}</div><div class="stat-unit">degrees</div></div>
        </div>
        <div class="grid-2" style="margin-top:12px">
          <div class="stat-card"><div class="stat-label">Coverage Width at ${dist}m</div><div class="stat-value">${fmt(cw)}</div><div class="stat-unit">m</div></div>
          <div class="stat-card"><div class="stat-label">Coverage Height at ${dist}m</div><div class="stat-value">${fmt(ch)}</div><div class="stat-unit">m</div></div>
          <div class="stat-card"><div class="stat-label">GSD (Ground Sample Distance)</div><div class="stat-value">${fmt(gsd_mm)}</div><div class="stat-unit">mm/pixel at ${dist}m</div></div>
          <div class="stat-card"><div class="stat-label">Aspect Ratio</div><div class="stat-value">${fmt(sw/sh)}</div><div class="stat-unit">W/H = ${fmt(hfov/vfov)}</div></div>
        </div>`;

      document.getElementById('cam-intrinsics').innerHTML=`
        <div style="font-size:13px;margin-bottom:8px;color:var(--text-secondary)">Camera Matrix K (pixel coordinates):</div>
        <div class="code-block">K = [[${fmt(fx_px)}, 0, ${fmt(cx)}],<br>&nbsp;&nbsp;&nbsp;&nbsp;[0, ${fmt(fy_px)}, ${fmt(cy)}],<br>&nbsp;&nbsp;&nbsp;&nbsp;[0, 0, 1]]<br><br>
fx = ${fmt(fx_px)} px &nbsp;|&nbsp; fy = ${fmt(fy_px)} px<br>
cx = ${fmt(cx)} px &nbsp;|&nbsp; cy = ${fmt(cy)} px</div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="camCopyK(${fx_px},${fy_px},${cx},${cy})">Copy K matrix (YAML)</button>`;

      camDraw(hfov, vfov, dist);
    };

    window.camCopyK = (fx,fy,cx,cy) => {
      Exporter.copyText(`camera_matrix:\n  data: [${fmt(fx)}, 0.0, ${fmt(cx)}, 0.0, ${fmt(fy)}, ${fmt(cy)}, 0.0, 0.0, 1.0]\n  rows: 3\n  cols: 3`);
    };

    function camDraw(hfov, vfov, dist) {
      const canvas=document.getElementById('cam-canvas');
      if(!canvas)return;
      const ctx=canvas.getContext('2d');
      const W=canvas.width,H=canvas.height;
      const isDark=document.documentElement.getAttribute('data-theme')==='dark';
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=isDark?'#111115':'#fafbff';
      ctx.fillRect(0,0,W,H);

      const cx=W*0.15,cy=H/2;
      const scale=Math.min(W*0.6,(H*0.8)/2/Math.tan(hfov/2/180*Math.PI||0.1));
      const rangeX=scale;
      const halfH=Math.tan(hfov/2/180*Math.PI)*rangeX;
      const halfV=Math.tan(vfov/2/180*Math.PI)*rangeX;

      ctx.strokeStyle='#5865f2'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+rangeX,cy-halfH);
      ctx.lineTo(cx+rangeX,cy+halfH); ctx.lineTo(cx,cy); ctx.stroke();
      ctx.fillStyle='rgba(88,101,242,0.08)';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+rangeX,cy-halfH); ctx.lineTo(cx+rangeX,cy+halfH); ctx.closePath(); ctx.fill();

      ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+rangeX,cy-halfV);
      ctx.lineTo(cx+rangeX,cy+halfV); ctx.lineTo(cx,cy); ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx+rangeX,cy-halfH*1.1); ctx.lineTo(cx+rangeX,cy+halfH*1.1); ctx.stroke();

      ctx.fillStyle=isDark?'#9b9db5':'#525970'; ctx.font='11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(`H-FOV: ${fmt(hfov)}°`,cx+rangeX/2,cy-halfH-10);
      ctx.fillStyle='#f59e0b';
      ctx.fillText(`V-FOV: ${fmt(vfov)}°`,cx+rangeX/2,cy+halfV+20);

      ctx.fillStyle='#5865f2';
      ctx.beginPath(); ctx.arc(cx,cy,5,0,2*Math.PI); ctx.fill();
      ctx.fillStyle=isDark?'#f0f0f5':'#0f1117'; ctx.textAlign='left';
      ctx.fillText('Camera',cx+8,cy);
    }

    camCompute();
  }
});
