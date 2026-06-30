Router.register({
  id: 'pid-tuner',
  name: 'PID Tuner',
  icon: '🎛️',
  category: 'control',
  description: 'Interactive PID controller design with live step-response simulation and metrics',
  tags: ['pid', 'control', 'step response', 'overshoot', 'settling time', 'tuning', 'controller'],

  init(container) {
    let chart = null;

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🎛️</span> PID Tuner</div>
        <div class="tool-description">Tune a PID controller for the plant G(s) = 1/(s²+s). Drag sliders to see the live step response.</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="pidPreset('slow')">Slow</button>
          <button class="btn btn-secondary btn-sm" onclick="pidPreset('fast')">Fast</button>
          <button class="btn btn-secondary btn-sm" onclick="pidPreset('critical')">Critically Damped</button>
          <button class="btn btn-secondary btn-sm" onclick="pidExportChart()">Export PNG</button>
        </div>
      </div>

      <div class="pid-layout">
        <div class="pid-panel">
          <div class="card">
            <div class="card-header"><div class="card-title">Controller Gains</div></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:20px">
              ${[
                ['Kp','kp','0','10','0.01','1.5','Proportional gain — speeds up response'],
                ['Ki','ki','0','5','0.001','0.5','Integral gain — eliminates steady-state error'],
                ['Kd','kd','0','3','0.001','0.2','Derivative gain — reduces overshoot']
              ].map(([label,id,min,max,step,val,hint])=>`
              <div class="pid-slider-group">
                <div class="slider-wrapper">
                  <div class="slider-header">
                    <span class="form-label">${label}</span>
                    <span class="slider-value" id="${id}-val">${val}</span>
                  </div>
                  <input type="range" id="${id}-slider" min="${min}" max="${max}" step="${step}" value="${val}">
                  <div class="slider-header" style="margin-top:6px">
                    <input type="number" id="${id}-input" class="input" style="width:80px;padding:4px 8px;font-size:12px" min="${min}" max="${max}" step="${step}" value="${val}">
                    <span class="form-hint">${hint}</span>
                  </div>
                </div>
              </div>`).join('')}

              <div>
                <div class="form-label" style="margin-bottom:6px">Setpoint</div>
                <div class="input-group">
                  <input type="number" id="pid-setpoint" class="input" value="1" step="0.1">
                  <div class="input-addon">units</div>
                </div>
              </div>
              <div>
                <div class="form-label" style="margin-bottom:6px">Simulation Time (s)</div>
                <input type="number" id="pid-duration" class="input" value="10" min="1" max="50" step="1">
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Performance Metrics</div></div>
            <div class="card-body">
              <div class="pid-metrics">
                <div class="stat-card">
                  <div class="stat-label">Overshoot</div>
                  <div class="stat-value" id="met-overshoot">—</div>
                  <div class="stat-unit">%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Rise Time</div>
                  <div class="stat-value" id="met-rise">—</div>
                  <div class="stat-unit">s</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Settling Time</div>
                  <div class="stat-value" id="met-settle">—</div>
                  <div class="stat-unit">s (±2%)</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Steady-State Error</div>
                  <div class="stat-value" id="met-sse">—</div>
                  <div class="stat-unit">units</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="chart-wrapper card">
            <div class="card-header"><div class="card-title">Step Response</div></div>
            <div style="padding:12px;height:360px"><canvas id="pid-chart"></canvas></div>
          </div>
          <div class="chart-wrapper card">
            <div class="card-header"><div class="card-title">Control Signal u(t)</div></div>
            <div style="padding:12px;height:200px"><canvas id="pid-chart-u"></canvas></div>
          </div>
        </div>
      </div>

      <div class="info-panel" style="margin-top:16px">
        <strong>Plant:</strong> G(s) = 1/(s² + s) &nbsp;|&nbsp;
        <strong>Controller:</strong> C(s) = Kp + Ki/s + Kd·s &nbsp;|&nbsp;
        <strong>Simulation:</strong> Forward Euler, dt = 1 ms
      </div>`;

    function simulate(kp, ki, kd, setpoint, duration) {
      const dt=0.001;
      const N=Math.floor(duration/dt);
      const skip=Math.max(1,Math.floor(N/2000));
      const ts=[],ys=[],us=[];
      let y=0,yd=0,integral=0,prevErr=0;

      for(let i=0;i<N;i++){
        const err=setpoint-y;
        integral+=err*dt;
        const deriv=(err-prevErr)/dt;
        prevErr=err;
        const u=kp*err+ki*integral+kd*deriv;
        const usat=Math.max(-100,Math.min(100,u));
        const ydd=usat-yd;
        yd+=ydd*dt;
        y+=yd*dt;
        if(i%skip===0){ ts.push(i*dt); ys.push(y); us.push(usat); }
      }
      return {ts,ys,us};
    }

    function metrics(ts,ys,setpoint) {
      const n=ys.length;
      let peak=ys[0],riseIdx=-1,settleIdx=-1;
      for(let i=0;i<n;i++) if(ys[i]>peak) peak=ys[i];
      const overshoot=setpoint>0?Math.max(0,(peak-setpoint)/setpoint*100):0;
      for(let i=0;i<n;i++) if(riseIdx<0&&ys[i]>=0.9*setpoint) riseIdx=i;
      for(let i=n-1;i>=0;i--) if(Math.abs(ys[i]-setpoint)>0.02*setpoint){settleIdx=i+1;break;}
      const sse=Math.abs(ys[n-1]-setpoint);
      return { overshoot, rise:riseIdx>=0?ts[riseIdx]:null, settle:settleIdx>0&&settleIdx<n?ts[settleIdx]:null, sse };
    }

    function update() {
      const kp=parseFloat(document.getElementById('kp-input')?.value)||0;
      const ki=parseFloat(document.getElementById('ki-input')?.value)||0;
      const kd=parseFloat(document.getElementById('kd-input')?.value)||0;
      const sp=parseFloat(document.getElementById('pid-setpoint')?.value)||1;
      const dur=parseFloat(document.getElementById('pid-duration')?.value)||10;

      const {ts,ys,us}=simulate(kp,ki,kd,sp,dur);
      const m=metrics(ts,ys,sp);

      document.getElementById('met-overshoot').textContent=m.overshoot.toFixed(1);
      document.getElementById('met-rise').textContent=m.rise!=null?m.rise.toFixed(3):'—';
      document.getElementById('met-settle').textContent=m.settle!=null?m.settle.toFixed(3):'—';
      document.getElementById('met-sse').textContent=m.sse.toFixed(4);

      const isDark=document.documentElement.getAttribute('data-theme')==='dark';
      const gridC=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';

      if(chart) chart.destroy();
      chart=new Chart(document.getElementById('pid-chart'),{
        type:'line',
        data:{labels:ts,datasets:[
          {label:'Output y(t)',data:ys,borderColor:'#5865f2',borderWidth:1.5,pointRadius:0,fill:false,tension:0},
          {label:'Setpoint',data:ts.map(()=>sp),borderColor:'#22c55e',borderDash:[5,5],borderWidth:1,pointRadius:0}
        ]},
        options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
          plugins:{legend:{position:'top',labels:{boxWidth:12}}},
          scales:{x:{type:'linear',title:{display:true,text:'Time (s)'},grid:{color:gridC},ticks:{maxTicksLimit:10}},
                  y:{title:{display:true,text:'Position'},grid:{color:gridC}}}}
      });

      if(window._pidChartU) window._pidChartU.destroy();
      window._pidChartU=new Chart(document.getElementById('pid-chart-u'),{
        type:'line',
        data:{labels:ts,datasets:[{label:'Control u(t)',data:us,borderColor:'#f59e0b',borderWidth:1,pointRadius:0,fill:false,tension:0}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{boxWidth:12}}},
          scales:{x:{type:'linear',title:{display:true,text:'Time (s)'},grid:{color:gridC},ticks:{maxTicksLimit:10}},
                  y:{title:{display:true,text:'u(t)'},grid:{color:gridC}}}}
      });
    }

    function syncSlider(id) {
      const slider=document.getElementById(`${id}-slider`);
      const input=document.getElementById(`${id}-input`);
      const val=document.getElementById(`${id}-val`);
      slider.addEventListener('input',()=>{ input.value=slider.value; val.textContent=slider.value; update(); });
      input.addEventListener('input',()=>{ slider.value=input.value; val.textContent=input.value; update(); });
    }
    ['kp','ki','kd'].forEach(syncSlider);
    ['pid-setpoint','pid-duration'].forEach(id => document.getElementById(id)?.addEventListener('input',update));

    window.pidPreset = (name) => {
      const presets={slow:{kp:0.5,ki:0.1,kd:0.05},fast:{kp:3,ki:1,kd:0.5},critical:{kp:1,ki:0,kd:1}};
      const p=presets[name];
      if(!p) return;
      ['kp','ki','kd'].forEach(id=>{
        document.getElementById(`${id}-slider`).value=p[id];
        document.getElementById(`${id}-input`).value=p[id];
        document.getElementById(`${id}-val`).textContent=p[id];
      });
      update();
    };

    window.pidExportChart = () => {
      if(chart) Exporter.chartToPng(chart,'pid-response.png');
    };

    update();
    return () => {
      if(chart){ chart.destroy(); chart=null; }
      if(window._pidChartU){ window._pidChartU.destroy(); window._pidChartU=null; }
    };
  }
});
