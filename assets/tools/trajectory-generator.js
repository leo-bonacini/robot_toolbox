Router.register({
  id: 'trajectory-generator',
  name: 'Trajectory Generator',
  icon: '🛤️',
  category: 'control',
  description: 'Generate and visualize trajectories: circle, spiral, Lissajous, Bezier and splines',
  tags: ['trajectory', 'path', 'circle', 'spiral', 'Lissajous', 'Bezier', 'spline', 'waypoints'],

  init(container) {
    let chart = null;
    let trajType = 'circle';

    const trajectories = {
      circle: {
        label:'Circle', params:[
          {id:'r',label:'Radius',value:1,min:0.1,step:0.1,unit:'m'},
          {id:'cx',label:'Center X',value:0,step:0.1,unit:'m'},
          {id:'cy',label:'Center Y',value:0,step:0.1,unit:'m'},
          {id:'pts',label:'Points',value:200,min:10,step:10,unit:''}
        ],
        gen(p){const N=p.pts,r=p.r;return Array.from({length:N+1},(_,i)=>{const t=2*Math.PI*i/N;return{x:p.cx+r*Math.cos(t),y:p.cy+r*Math.sin(t)};});}
      },
      figure8: {
        label:'Figure Eight', params:[
          {id:'a',label:'Scale A',value:1,min:0.1,step:0.1,unit:'m'},
          {id:'pts',label:'Points',value:200,min:10,step:10,unit:''}
        ],
        gen(p){const N=p.pts;return Array.from({length:N+1},(_,i)=>{const t=2*Math.PI*i/N;return{x:p.a*Math.sin(t),y:p.a*Math.sin(2*t)/2};});}
      },
      spiral: {
        label:'Spiral', params:[
          {id:'a',label:'Inner radius',value:0.1,min:0,step:0.05,unit:'m'},
          {id:'b',label:'Growth per turn',value:0.2,min:0.01,step:0.05,unit:'m/rev'},
          {id:'turns',label:'Turns',value:3,min:1,step:0.5,unit:''},
          {id:'pts',label:'Points',value:300,min:10,step:10,unit:''}
        ],
        gen(p){const N=p.pts;return Array.from({length:N+1},(_,i)=>{const t=2*Math.PI*p.turns*i/N;return{x:(p.a+p.b*t/(2*Math.PI))*Math.cos(t),y:(p.a+p.b*t/(2*Math.PI))*Math.sin(t)};});}
      },
      lissajous: {
        label:'Lissajous', params:[
          {id:'A',label:'Amplitude X',value:1,min:0.1,step:0.1,unit:'m'},
          {id:'B',label:'Amplitude Y',value:1,min:0.1,step:0.1,unit:'m'},
          {id:'a',label:'Freq ratio a',value:3,min:1,step:1,unit:''},
          {id:'b',label:'Freq ratio b',value:2,min:1,step:1,unit:''},
          {id:'delta',label:'Phase δ',value:0.785,step:0.1,unit:'rad'},
          {id:'pts',label:'Points',value:400,min:10,step:10,unit:''}
        ],
        gen(p){const N=p.pts;return Array.from({length:N+1},(_,i)=>{const t=2*Math.PI*i/N;return{x:p.A*Math.sin(p.a*t+p.delta),y:p.B*Math.sin(p.b*t)};});}
      },
      bezier: {
        label:'Bezier Curve', params:[
          {id:'p0x',label:'P0 X',value:0,step:0.1,unit:''},
          {id:'p0y',label:'P0 Y',value:0,step:0.1,unit:''},
          {id:'p1x',label:'P1 X (ctrl)',value:0,step:0.1,unit:''},
          {id:'p1y',label:'P1 Y (ctrl)',value:1,step:0.1,unit:''},
          {id:'p2x',label:'P2 X (ctrl)',value:1,step:0.1,unit:''},
          {id:'p2y',label:'P2 Y (ctrl)',value:1,step:0.1,unit:''},
          {id:'p3x',label:'P3 X',value:1,step:0.1,unit:''},
          {id:'p3y',label:'P3 Y',value:0,step:0.1,unit:''},
          {id:'pts',label:'Points',value:200,min:10,step:10,unit:''}
        ],
        gen(p){const N=p.pts;return Array.from({length:N+1},(_,i)=>{
          const t=i/N, t1=1-t;
          return{
            x:t1**3*p.p0x+3*t1**2*t*p.p1x+3*t1*t**2*p.p2x+t**3*p.p3x,
            y:t1**3*p.p0y+3*t1**2*t*p.p1y+3*t1*t**2*p.p2y+t**3*p.p3y
          };});}
      },
      racetrack: {
        label:'Racetrack', params:[
          {id:'lx',label:'Length',value:2,min:0.5,step:0.1,unit:'m'},
          {id:'r',label:'End radius',value:0.5,min:0.1,step:0.1,unit:'m'},
          {id:'pts',label:'Points',value:200,min:10,step:10,unit:''}
        ],
        gen(p){const{lx,r,pts}=p;const N=Math.floor(pts);const pts1=Math.floor(N*0.3),pts2=Math.floor(N*0.2);
          const seg=[];
          for(let i=0;i<pts1;i++)seg.push({x:-lx/2+lx*i/pts1,y:-r});
          for(let i=0;i<=pts2;i++){const t=-Math.PI/2+Math.PI*i/pts2;seg.push({x:lx/2+r*Math.cos(t),y:r*Math.sin(t)});}
          for(let i=0;i<pts1;i++)seg.push({x:lx/2-lx*i/pts1,y:r});
          for(let i=0;i<=pts2;i++){const t=Math.PI/2+Math.PI*i/pts2;seg.push({x:-lx/2+r*Math.cos(t),y:r*Math.sin(t)});}
          return seg;}
      }
    };

    function renderParams() {
      const traj=trajectories[trajType];
      if(!traj)return;
      const paramPanel=document.getElementById('traj-params');
      if(!paramPanel)return;
      paramPanel.innerHTML=traj.params.map(p=>`
        <div class="form-group">
          <label class="form-label">${p.label} ${p.unit?`(${p.unit})`:''}</label>
          <input type="number" id="tp-${p.id}" class="input" value="${p.value}" min="${p.min||''}" step="${p.step||0.1}" oninput="trajCompute()">
        </div>`).join('');
    }

    function getParams() {
      const traj=trajectories[trajType];
      const p={};
      traj.params.forEach(param=>{ p[param.id]=parseFloat(document.getElementById(`tp-${param.id}`)?.value)??param.value; });
      return p;
    }

    function trajCompute() {
      const traj=trajectories[trajType];
      if(!traj)return;
      const p=getParams();
      let pts;
      try{ pts=traj.gen(p); } catch(e){ return; }

      const isDark=document.documentElement.getAttribute('data-theme')==='dark';
      const gridC=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';

      if(chart)chart.destroy();
      chart=new Chart(document.getElementById('traj-chart'),{
        type:'scatter',
        data:{datasets:[{
          label:traj.label,
          data:pts.map((p,i)=>({x:p.x,y:p.y,idx:i})),
          borderColor:'#5865f2', backgroundColor:'rgba(88,101,242,0.15)',
          showLine:true, pointRadius:0, borderWidth:2, tension:0
        },{
          label:'Start',data:[{x:pts[0].x,y:pts[0].y}],
          backgroundColor:'#22c55e',borderColor:'#22c55e',pointRadius:8,showLine:false
        },{
          label:'End',data:[{x:pts[pts.length-1].x,y:pts[pts.length-1].y}],
          backgroundColor:'#ef4444',borderColor:'#ef4444',pointRadius:8,showLine:false
        }]},
        options:{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'top',labels:{boxWidth:12}}},
          scales:{
            x:{title:{display:true,text:'X (m)'},grid:{color:gridC}},
            y:{title:{display:true,text:'Y (m)'},grid:{color:gridC}}
          }}
      });

      const length=pts.reduce((s,p,i)=>i===0?0:s+Math.sqrt((p.x-pts[i-1].x)**2+(p.y-pts[i-1].y)**2),0);
      const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
      const bbox={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};
      document.getElementById('traj-stats').innerHTML=`
        <div class="grid-4">
          <div class="stat-card"><div class="stat-label">Path Length</div><div class="stat-value">${parseFloat(length.toFixed(3))}</div><div class="stat-unit">m</div></div>
          <div class="stat-card"><div class="stat-label">Points</div><div class="stat-value">${pts.length}</div></div>
          <div class="stat-card"><div class="stat-label">BBox Width</div><div class="stat-value">${parseFloat((bbox.x1-bbox.x0).toFixed(3))}</div><div class="stat-unit">m</div></div>
          <div class="stat-card"><div class="stat-label">BBox Height</div><div class="stat-value">${parseFloat((bbox.y1-bbox.y0).toFixed(3))}</div><div class="stat-unit">m</div></div>
        </div>`;
    }

    container.innerHTML=`
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">🛤️</span> Trajectory Generator</div>
        <div class="tool-description">Generate and visualize common robot trajectories. Export as CSV for use in your motion planner.</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="trajExport()">Export CSV</button>
          <button class="btn btn-secondary btn-sm" onclick="trajExportChart()">Export PNG</button>
        </div>
      </div>
      <div class="traj-layout">
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-header"><div class="card-title">Trajectory Type</div></div>
            <div class="card-body">
              <div class="traj-type-grid">
                ${Object.entries(trajectories).map(([id,t])=>`
                <button class="traj-type-btn ${id===trajType?'active':''}" onclick="trajSetType('${id}',this)">${t.label}</button>`).join('')}
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">Parameters</div></div>
            <div class="card-body" id="traj-params" style="display:flex;flex-direction:column;gap:10px"></div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="card">
            <div class="card-header"><div class="card-title">Trajectory</div></div>
            <div style="padding:12px;height:380px"><canvas id="traj-chart"></canvas></div>
          </div>
          <div id="traj-stats"></div>
        </div>
      </div>`;

    window.trajSetType=(type,btn)=>{
      trajType=type;
      document.querySelectorAll('.traj-type-btn').forEach(b=>b.classList.toggle('active',b===btn));
      renderParams(); trajCompute();
    };

    window.trajCompute=trajCompute;

    window.trajExport=()=>{
      const traj=trajectories[trajType];
      const p=getParams();
      const pts=traj.gen(p);
      const rows=[['index','x_m','y_m'],...pts.map((p,i)=>[i,p.x.toFixed(6),p.y.toFixed(6)])];
      Exporter.toCsv(rows,`trajectory-${trajType}.csv`);
    };

    window.trajExportChart=()=>{ if(chart) Exporter.chartToPng(chart,`trajectory-${trajType}.png`); };

    renderParams();
    setTimeout(trajCompute,50);

    return ()=>{ if(chart){chart.destroy();chart=null;} };
  }
});
