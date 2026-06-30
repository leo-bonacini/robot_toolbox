Router.register({
  id: 'coordinate-frame',
  name: 'Coordinate Frames',
  icon: '🌐',
  category: 'coordinates',
  description: 'Convert positions between ENU, NED, ECEF, UTM and body frames',
  tags: ['ENU', 'NED', 'ECEF', 'UTM', 'coordinate frame', 'GPS', 'navigation', 'transform'],

  init(container) {
    const fmt = v => parseFloat(v.toFixed(6));
    const d2r=Math.PI/180, r2d=180/Math.PI;

    const WGS84 = { a:6378137.0, f:1/298.257223563 };
    WGS84.b=WGS84.a*(1-WGS84.f);
    WGS84.e2=2*WGS84.f-WGS84.f**2;

    function llhToECEF(lat,lon,alt){
      const phi=lat*d2r, lam=lon*d2r;
      const sinphi=Math.sin(phi);
      const N=WGS84.a/Math.sqrt(1-WGS84.e2*sinphi**2);
      const x=(N+alt)*Math.cos(phi)*Math.cos(lam);
      const y=(N+alt)*Math.cos(phi)*Math.sin(lam);
      const z=(N*(1-WGS84.e2)+alt)*Math.sin(phi);
      return {x,y,z};
    }

    function ecefToLLH(x,y,z){
      const p=Math.sqrt(x**2+y**2);
      let lat=Math.atan2(z,p*(1-WGS84.e2));
      for(let i=0;i<10;i++){
        const sinlat=Math.sin(lat);
        const N=WGS84.a/Math.sqrt(1-WGS84.e2*sinlat**2);
        const lat2=Math.atan2(z+WGS84.e2*N*sinlat,p);
        if(Math.abs(lat2-lat)<1e-12)break;
        lat=lat2;
      }
      const sinlat=Math.sin(lat);
      const N=WGS84.a/Math.sqrt(1-WGS84.e2*sinlat**2);
      const lon=Math.atan2(y,x);
      const alt=p/Math.cos(lat)-N;
      return {lat:lat*r2d,lon:lon*r2d,alt};
    }

    function ecefToENU(dx,dy,dz,lat,lon){
      const phi=lat*d2r,lam=lon*d2r;
      const sl=Math.sin(lam),cl=Math.cos(lam);
      const sp=Math.sin(phi),cp=Math.cos(phi);
      const e=-sl*dx+cl*dy;
      const n=-sp*cl*dx-sp*sl*dy+cp*dz;
      const u=cp*cl*dx+cp*sl*dy+sp*dz;
      return {e,n,u};
    }

    function enuToNED(e,n,u){return {n,e,d:-u};}
    function nedToENU(n,e,d){return {e,n,u:-d};}

    container.innerHTML=`
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🌐</span> Coordinate Frame Converter</div>
        <div class="tool-description">Convert between common navigation and robotics coordinate frames.</div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">WGS-84 Reference Point (Origin)</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group">
              <label class="form-label">Latitude</label>
              <div class="input-group"><input type="number" id="cf-lat0" class="input" value="-22.9068" step="0.0001"><div class="input-addon">°N</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Longitude</label>
              <div class="input-group"><input type="number" id="cf-lon0" class="input" value="-43.1729" step="0.0001"><div class="input-addon">°E</div></div>
            </div>
            <div class="form-group">
              <label class="form-label">Altitude</label>
              <div class="input-group"><input type="number" id="cf-alt0" class="input" value="0" step="1"><div class="input-addon">m</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Point to Convert</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="tabs"><button class="tab active" onclick="cfSetMode('llh',this)">LLH (GPS)</button><button class="tab" onclick="cfSetMode('ecef',this)">ECEF</button><button class="tab" onclick="cfSetMode('enu',this)">ENU</button></div>
            <div id="cf-input-llh">
              <div class="form-group"><label class="form-label">Latitude</label><div class="input-group"><input type="number" id="cf-lat" class="input" value="-22.9100" step="0.0001"><div class="input-addon">°N</div></div></div>
              <div class="form-group" style="margin-top:8px"><label class="form-label">Longitude</label><div class="input-group"><input type="number" id="cf-lon" class="input" value="-43.1800" step="0.0001"><div class="input-addon">°E</div></div></div>
              <div class="form-group" style="margin-top:8px"><label class="form-label">Altitude</label><div class="input-group"><input type="number" id="cf-alt" class="input" value="0" step="1"><div class="input-addon">m</div></div></div>
            </div>
            <div id="cf-input-ecef" style="display:none">
              <div class="form-group"><label class="form-label">X</label><div class="input-group"><input type="number" id="cf-ex" class="input" value="4280627" step="1"><div class="input-addon">m</div></div></div>
              <div class="form-group" style="margin-top:8px"><label class="form-label">Y</label><div class="input-group"><input type="number" id="cf-ey" class="input" value="-4300000" step="1"><div class="input-addon">m</div></div></div>
              <div class="form-group" style="margin-top:8px"><label class="form-label">Z</label><div class="input-group"><input type="number" id="cf-ez" class="input" value="-2442100" step="1"><div class="input-addon">m</div></div></div>
            </div>
            <div id="cf-input-enu" style="display:none">
              <div class="form-group"><label class="form-label">East</label><div class="input-group"><input type="number" id="cf-ee" class="input" value="100" step="1"><div class="input-addon">m</div></div></div>
              <div class="form-group" style="margin-top:8px"><label class="form-label">North</label><div class="input-group"><input type="number" id="cf-en" class="input" value="50" step="1"><div class="input-addon">m</div></div></div>
              <div class="form-group" style="margin-top:8px"><label class="form-label">Up</label><div class="input-group"><input type="number" id="cf-eu" class="input" value="10" step="1"><div class="input-addon">m</div></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Conversion Results</div></div>
        <div class="card-body" id="cf-results"></div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">Frame Orientation Reference</div></div>
        <div class="card-body">
          <div class="grid-3">
            ${[
              ['ENU','East-North-Up','X=East, Y=North, Z=Up','#22c55e','Robotics, ROS REP 103'],
              ['NED','North-East-Down','X=North, Y=East, Z=Down','#3b82f6','Aerospace, autopilots'],
              ['ECEF','Earth-Centered Earth-Fixed','Origin at Earth center','#f59e0b','GPS, geodesy']
            ].map(([name,desc,axes,color,use])=>`
            <div class="frame-card">
              <div class="frame-name"><span class="frame-dot" style="background:${color}"></span>${name}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">${desc}</div>
              <div style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-tertiary)">${axes}</div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">${use}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>`;

    let inputMode='llh';

    window.cfSetMode=(mode,btn)=>{
      inputMode=mode;
      ['llh','ecef','enu'].forEach(m=>document.getElementById(`cf-input-${m}`).style.display=m===mode?'':'none');
      document.querySelectorAll('.tabs .tab').forEach(b=>b.classList.toggle('active',b===btn));
      cfCompute();
    };

    function cfCompute() {
      const lat0=parseFloat(document.getElementById('cf-lat0')?.value)||0;
      const lon0=parseFloat(document.getElementById('cf-lon0')?.value)||0;
      const alt0=parseFloat(document.getElementById('cf-alt0')?.value)||0;
      const p0=llhToECEF(lat0,lon0,alt0);

      let lat,lon,alt,ecef,enu;

      if(inputMode==='llh'){
        lat=parseFloat(document.getElementById('cf-lat')?.value)||0;
        lon=parseFloat(document.getElementById('cf-lon')?.value)||0;
        alt=parseFloat(document.getElementById('cf-alt')?.value)||0;
        ecef=llhToECEF(lat,lon,alt);
        enu=ecefToENU(ecef.x-p0.x,ecef.y-p0.y,ecef.z-p0.z,lat0,lon0);
      } else if(inputMode==='ecef'){
        const x=parseFloat(document.getElementById('cf-ex')?.value)||0;
        const y=parseFloat(document.getElementById('cf-ey')?.value)||0;
        const z=parseFloat(document.getElementById('cf-ez')?.value)||0;
        ecef={x,y,z};
        const llh=ecefToLLH(x,y,z);
        lat=llh.lat; lon=llh.lon; alt=llh.alt;
        enu=ecefToENU(x-p0.x,y-p0.y,z-p0.z,lat0,lon0);
      } else {
        const e=parseFloat(document.getElementById('cf-ee')?.value)||0;
        const n=parseFloat(document.getElementById('cf-en')?.value)||0;
        const u=parseFloat(document.getElementById('cf-eu')?.value)||0;
        enu={e,n,u};
        ecef={x:p0.x,y:p0.y,z:p0.z};
        lat=lat0; lon=lon0; alt=alt0;
      }

      const ned=enuToNED(enu.e,enu.n,enu.u);

      document.getElementById('cf-results').innerHTML=`
        <div class="frame-grid">
          <div class="frame-card">
            <div class="frame-name"><span class="frame-dot" style="background:#22c55e"></span>ENU</div>
            <div class="form-group"><div class="form-label">East</div><div class="mono-value">${fmt(enu.e)} m</div></div>
            <div class="form-group" style="margin-top:6px"><div class="form-label">North</div><div class="mono-value">${fmt(enu.n)} m</div></div>
            <div class="form-group" style="margin-top:6px"><div class="form-label">Up</div><div class="mono-value">${fmt(enu.u)} m</div></div>
          </div>
          <div class="frame-card">
            <div class="frame-name"><span class="frame-dot" style="background:#3b82f6"></span>NED</div>
            <div class="form-group"><div class="form-label">North</div><div class="mono-value">${fmt(ned.n)} m</div></div>
            <div class="form-group" style="margin-top:6px"><div class="form-label">East</div><div class="mono-value">${fmt(ned.e)} m</div></div>
            <div class="form-group" style="margin-top:6px"><div class="form-label">Down</div><div class="mono-value">${fmt(ned.d)} m</div></div>
          </div>
          <div class="frame-card">
            <div class="frame-name"><span class="frame-dot" style="background:#f59e0b"></span>WGS-84 LLH</div>
            <div class="form-group"><div class="form-label">Latitude</div><div class="mono-value">${fmt(lat)}°</div></div>
            <div class="form-group" style="margin-top:6px"><div class="form-label">Longitude</div><div class="mono-value">${fmt(lon)}°</div></div>
            <div class="form-group" style="margin-top:6px"><div class="form-label">Altitude</div><div class="mono-value">${fmt(alt)} m</div></div>
          </div>
        </div>`;
    }

    container.querySelectorAll('input').forEach(el=>el.addEventListener('input',cfCompute));
    cfCompute();
  }
});
