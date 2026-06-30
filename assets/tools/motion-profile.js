Router.register({
  id: 'motion-profile',
  name: 'Motion Profile',
  icon: '📈',
  category: 'control',
  description: 'Design trapezoidal and S-curve motion profiles with position, velocity and acceleration plots',
  tags: ['motion profile', 'trapezoidal', 'S-curve', 'velocity', 'acceleration', 'jerk', 'trajectory'],

  init(container) {
    let charts = {};

    container.innerHTML=`
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">📈</span> Motion Profile Generator</div>
        <div class="tool-description">Design 1D motion profiles for point-to-point moves. Supports trapezoidal (linear ramp) and S-curve (jerk-limited) profiles.</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="mpExportCsv()">Export CSV</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Profile Type</div></div>
          <div class="card-body">
            <div style="display:flex;gap:8px;margin-bottom:16px">
              <button class="btn btn-primary btn-sm" id="mp-trap-btn" onclick="mpSetType('trap',this)">Trapezoidal</button>
              <button class="btn btn-secondary btn-sm" id="mp-scurve-btn" onclick="mpSetType('scurve',this)">S-Curve</button>
              <button class="btn btn-secondary btn-sm" id="mp-tri-btn" onclick="mpSetType('tri',this)">Triangular</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px">
              <div class="form-group">
                <label class="form-label">Total Distance</label>
                <div class="input-group"><input type="number" id="mp-dist" class="input" value="1.0" step="0.1" min="0.01" oninput="mpCompute()"><div class="input-addon">m</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">Max Velocity</label>
                <div class="input-group"><input type="number" id="mp-vmax" class="input" value="0.5" step="0.05" min="0.01" oninput="mpCompute()"><div class="input-addon">m/s</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">Max Acceleration</label>
                <div class="input-group"><input type="number" id="mp-amax" class="input" value="1.0" step="0.1" min="0.01" oninput="mpCompute()"><div class="input-addon">m/s²</div></div>
              </div>
              <div class="form-group" id="mp-jerk-group">
                <label class="form-label">Max Jerk (S-curve only)</label>
                <div class="input-group"><input type="number" id="mp-jmax" class="input" value="5.0" step="0.5" min="0.1" oninput="mpCompute()"><div class="input-addon">m/s³</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">Start Velocity</label>
                <div class="input-group"><input type="number" id="mp-v0" class="input" value="0" step="0.1" oninput="mpCompute()"><div class="input-addon">m/s</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">End Velocity</label>
                <div class="input-group"><input type="number" id="mp-v1" class="input" value="0" step="0.1" oninput="mpCompute()"><div class="input-addon">m/s</div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Metrics</div></div>
          <div class="card-body" id="mp-metrics"></div>
        </div>
      </div>

      <div class="motion-charts" style="margin-top:16px">
        <div class="motion-chart-row">
          <div class="card"><div class="card-header"><div class="card-title">Position</div></div><div style="padding:12px;height:200px"><canvas id="mp-pos-chart"></canvas></div></div>
          <div class="card"><div class="card-header"><div class="card-title">Velocity</div></div><div style="padding:12px;height:200px"><canvas id="mp-vel-chart"></canvas></div></div>
        </div>
        <div class="motion-chart-row">
          <div class="card"><div class="card-header"><div class="card-title">Acceleration</div></div><div style="padding:12px;height:200px"><canvas id="mp-acc-chart"></canvas></div></div>
          <div class="card"><div class="card-header"><div class="card-title">Jerk</div></div><div style="padding:12px;height:200px"><canvas id="mp-jrk-chart"></canvas></div></div>
        </div>
      </div>`;

    let profileType = 'trap';

    window.mpSetType=(type,btn)=>{
      profileType=type;
      document.querySelectorAll('[id^="mp-"][id$="-btn"]').forEach(b=>b.className='btn btn-secondary btn-sm');
      btn.className='btn btn-primary btn-sm';
      const jg=document.getElementById('mp-jerk-group');
      if(jg)jg.style.opacity=type==='scurve'?'1':'0.4';
      mpCompute();
    };

    function trapProfile(dist, vmax, amax, v0, v1, N=1000) {
      const ta=(vmax-v0)/amax, td=(vmax-v1)/amax;
      const da=v0*ta+0.5*amax*ta**2, dd=vmax*td-0.5*amax*td**2;
      let tc, vcruise=vmax;
      if(da+dd>dist){
        vcruise=Math.sqrt((2*amax*dist+(v0**2+v1**2))/2);
        const ta2=(vcruise-v0)/amax, td2=(vcruise-v1)/amax;
        const da2=v0*ta2+0.5*amax*ta2**2;
        const tc2=0;
        const T=ta2+tc2+td2;
        return sample(T, N, t=>{
          if(t<=ta2){const v=v0+amax*t;return{v,a:amax,s:v0*t+0.5*amax*t**2};}
          else{const dt=t-ta2;const v=vcruise-amax*dt;return{v,a:-amax,s:da2+vcruise*dt-0.5*amax*dt**2};}
        });
      }
      tc=Math.max(0,(dist-da-dd)/vmax);
      const T=ta+tc+td;
      return sample(T, N, t=>{
        if(t<=ta){const v=v0+amax*t;return{v,a:amax,s:v0*t+0.5*amax*t**2};}
        else if(t<=ta+tc){const dt=t-ta;return{v:vmax,a:0,s:da+vmax*dt};}
        else{const dt=t-(ta+tc);const v=vmax-amax*dt;return{v,a:-amax,s:da+vmax*tc+vmax*dt-0.5*amax*dt**2};}
      });
    }

    function triProfile(dist, amax, v0, v1, N=1000) {
      const vpeak=Math.sqrt(amax*dist+(v0**2+v1**2)/2);
      return trapProfile(dist,vpeak,amax,v0,v1,N);
    }

    function scurveProfile(dist, vmax, amax, jmax, v0, v1, N=1000) {
      const tj=amax/jmax;
      const ta_jerk=tj;
      const v_jerk=0.5*jmax*tj**2;
      const vmax_actual=Math.min(vmax, v0+v_jerk+amax*(ta_jerk));
      const ta=(vmax_actual-v0)/amax;
      const td=(vmax_actual-v1)/amax;
      const da=v0*ta+0.5*amax*ta**2;
      const dd=vmax_actual*td-0.5*amax*td**2;
      const tc=Math.max(0,(dist-da-dd)/vmax_actual);
      const T=ta+tc+td;
      return sample(T, N, t=>{
        if(t<=ta_jerk){const a=jmax*t;const v=v0+0.5*jmax*t**2;const s=v0*t+jmax*t**3/6;return{v,a,s,j:jmax};}
        else if(t<=ta-ta_jerk){const dt=t-ta_jerk;const a=amax;const v=v0+v_jerk+amax*dt;const s=v0*ta_jerk+jmax*ta_jerk**3/6+v_jerk*dt+0.5*amax*dt**2;return{v,a,s,j:0};}
        else if(t<=ta){const dt=t-(ta-ta_jerk);const a=amax-jmax*dt;const vm=v0+v_jerk+amax*(ta-2*ta_jerk);const sm=v0*ta_jerk+jmax*ta_jerk**3/6+v_jerk*(ta-2*ta_jerk)+0.5*amax*(ta-2*ta_jerk)**2;const s=sm+vm*dt+0.5*amax*dt**2-jmax*dt**3/6;return{v:vm+amax*dt-0.5*jmax*dt**2,a,s,j:-jmax};}
        else if(t<=ta+tc){const dt=t-ta;const s=da+vmax_actual*dt;return{v:vmax_actual,a:0,s,j:0};}
        else{const dt=t-(ta+tc);const s=da+vmax_actual*tc+vmax_actual*dt-0.5*amax*dt**2;const v=vmax_actual-amax*dt;return{v,a:-amax,s,j:0};}
      });
    }

    function sample(T, N, fn) {
      const ts=Array.from({length:N+1},(_,i)=>T*i/N);
      const pts=ts.map(t=>({t,...fn(t)}));
      const jerks=pts.map((pt,i)=>{if(i===0||i===pts.length-1)return 0;return(pts[i+1].a-pts[i-1].a)/(2*T/N);});
      pts.forEach((pt,i)=>{pt.j=pt.j??jerks[i];});
      return{ts,pts,T};
    }

    function makeChart(id, label, getter, color, unit) {
      const canvas=document.getElementById(id);
      if(!canvas)return null;
      if(charts[id]){charts[id].destroy();}
      const isDark=document.documentElement.getAttribute('data-theme')==='dark';
      const gridC=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';
      return charts[id]=new Chart(canvas,{
        type:'line',
        data:{labels:[],datasets:[{label,data:[],borderColor:color,borderWidth:1.5,pointRadius:0,fill:true,backgroundColor:color+'20',tension:0}]},
        options:{responsive:true,maintainAspectRatio:false,animation:false,
          plugins:{legend:{display:false}},
          scales:{x:{type:'linear',title:{display:true,text:'Time (s)'},grid:{color:gridC},ticks:{maxTicksLimit:8}},
                  y:{title:{display:true,text:unit},grid:{color:gridC}}}}
      });
    }

    window.mpCompute=()=>{
      const dist=parseFloat(document.getElementById('mp-dist')?.value)||1;
      const vmax=parseFloat(document.getElementById('mp-vmax')?.value)||0.5;
      const amax=parseFloat(document.getElementById('mp-amax')?.value)||1;
      const jmax=parseFloat(document.getElementById('mp-jmax')?.value)||5;
      const v0=parseFloat(document.getElementById('mp-v0')?.value)||0;
      const v1=parseFloat(document.getElementById('mp-v1')?.value)||0;

      let result;
      if(profileType==='trap') result=trapProfile(dist,vmax,amax,v0,v1);
      else if(profileType==='scurve') result=scurveProfile(dist,vmax,amax,jmax,v0,v1);
      else result=triProfile(dist,amax,v0,v1);

      const {ts,pts,T}=result;
      const labels=ts;
      const poss=pts.map(p=>p.s), vels=pts.map(p=>p.v), accs=pts.map(p=>p.a), jrks=pts.map(p=>p.j||0);
      const actualVmax=Math.max(...vels.map(Math.abs));
      const actualAmax=Math.max(...accs.map(Math.abs));
      const actualJmax=Math.max(...jrks.map(Math.abs));

      if(!charts['mp-pos-chart']) {
        makeChart('mp-pos-chart','Position','s','#5865f2','m');
        makeChart('mp-vel-chart','Velocity','v','#22c55e','m/s');
        makeChart('mp-acc-chart','Acceleration','a','#f59e0b','m/s²');
        makeChart('mp-jrk-chart','Jerk','j','#ef4444','m/s³');
      }

      [['mp-pos-chart',poss],['mp-vel-chart',vels],['mp-acc-chart',accs],['mp-jrk-chart',jrks]].forEach(([id,data])=>{
        const c=charts[id];
        if(!c)return;
        c.data.labels=labels;
        c.data.datasets[0].data=data;
        c.update('none');
      });

      document.getElementById('mp-metrics').innerHTML=`
        <div class="grid-2" style="gap:10px">
          <div class="stat-card"><div class="stat-label">Total Time</div><div class="stat-value">${parseFloat(T.toFixed(3))}</div><div class="stat-unit">s</div></div>
          <div class="stat-card"><div class="stat-label">Total Distance</div><div class="stat-value">${parseFloat(pts[pts.length-1].s.toFixed(4))}</div><div class="stat-unit">m</div></div>
          <div class="stat-card"><div class="stat-label">Peak Velocity</div><div class="stat-value">${parseFloat(actualVmax.toFixed(4))}</div><div class="stat-unit">m/s</div></div>
          <div class="stat-card"><div class="stat-label">Peak Acceleration</div><div class="stat-value">${parseFloat(actualAmax.toFixed(4))}</div><div class="stat-unit">m/s²</div></div>
          ${profileType==='scurve'?`<div class="stat-card"><div class="stat-label">Peak Jerk</div><div class="stat-value">${parseFloat(actualJmax.toFixed(4))}</div><div class="stat-unit">m/s³</div></div>`:''}
          <div class="stat-card"><div class="stat-label">Profile</div><div class="stat-value" style="font-size:14px">${profileType==='trap'?'Trapezoidal':profileType==='scurve'?'S-Curve':'Triangular'}</div></div>
        </div>`;

      window._mpResult={ts,pts};
    };

    window.mpExportCsv=()=>{
      if(!window._mpResult)return;
      const{ts,pts}=window._mpResult;
      const rows=[['t_s','pos_m','vel_ms','acc_ms2','jerk_ms3'],
        ...pts.map(p=>[p.t?.toFixed(4)||'0',p.s.toFixed(6),p.v.toFixed(6),p.a.toFixed(6),(p.j||0).toFixed(6)])];
      Exporter.toCsv(rows,'motion-profile.csv');
    };

    setTimeout(()=>mpCompute(),50);

    return ()=>{ Object.values(charts).forEach(c=>{try{c.destroy();}catch{}}); charts={}; };
  }
});
