Router.register({
  id: 'covariance-visualizer',
  name: 'Covariance Visualizer',
  icon: '📊',
  category: 'math',
  description: 'Visualize covariance matrices as confidence ellipses with principal axes',
  tags: ['covariance', 'ellipse', 'uncertainty', 'Gaussian', 'confidence interval', 'principal axes'],

  init(container) {
    const fmt = v => parseFloat(v.toFixed(4));

    container.innerHTML = `
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">📊</span> Covariance Visualizer</div>
        <div class="tool-description">Enter a 2×2 positive-definite covariance matrix to visualize the uncertainty ellipse.</div>
        <div class="tool-actions">
          <button class="btn btn-secondary btn-sm" onclick="covPreset('circular')">Circular</button>
          <button class="btn btn-secondary btn-sm" onclick="covPreset('elongated')">Elongated</button>
          <button class="btn btn-secondary btn-sm" onclick="covPreset('rotated')">Rotated</button>
          <button class="btn btn-secondary btn-sm" onclick="covPreset('narrow')">Narrow</button>
        </div>
      </div>

      <div class="cov-layout">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-header"><div class="card-title">Covariance Matrix Σ</div></div>
            <div class="card-body">
              <div class="matrix-grid" style="grid-template-columns:repeat(2,1fr)">
                ${[['cov-s11','σ_xx','1'],['cov-s12','σ_xy','0'],['cov-s21','σ_yx','0'],['cov-s22','σ_yy','1']].map(([id,lbl,v])=>`
                <div>
                  <div class="form-label" style="margin-bottom:2px">${lbl}</div>
                  <input class="matrix-cell" id="${id}" type="number" step="any" value="${v}" oninput="covCompute()" style="width:100%">
                </div>`).join('')}
              </div>
              <div id="cov-pd-status" style="margin-top:10px"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Properties</div></div>
            <div class="card-body" id="cov-props" style="display:flex;flex-direction:column;gap:10px"></div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Confidence Levels</div></div>
            <div class="card-body">
              <div style="display:flex;flex-direction:column;gap:6px">
                <label class="flex items-center gap-2"><input type="checkbox" id="cov-c1" checked onchange="covDraw()"> <span>1σ (68.3%)</span> <span style="color:#5865f2">●</span></label>
                <label class="flex items-center gap-2"><input type="checkbox" id="cov-c2" checked onchange="covDraw()"> <span>2σ (95.4%)</span> <span style="color:#f59e0b">●</span></label>
                <label class="flex items-center gap-2"><input type="checkbox" id="cov-c3" onchange="covDraw()"> <span>3σ (99.7%)</span> <span style="color:#ef4444">●</span></label>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Uncertainty Ellipse</div></div>
          <div class="card-body" style="display:flex;flex-direction:column;align-items:center;gap:16px">
            <canvas id="cov-canvas" width="400" height="400" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius)"></canvas>
            <div id="cov-ellipse-info" style="text-align:center;font-size:12px;color:var(--text-tertiary)"></div>
          </div>
        </div>
      </div>

      <div class="info-panel" style="margin-top:16px">
        <strong>Eigendecomposition:</strong> Σ = V·Λ·Vᵀ · where V contains eigenvectors (principal axes) and Λ contains eigenvalues (squared semi-axes lengths)<br>
        <strong>Ellipse semi-axes:</strong> a = k·√λ₁, b = k·√λ₂ · where k=1,2,3 for 1σ,2σ,3σ
      </div>`;

    let eigendata = null;

    function eigen2x2(s11, s12, s22) {
      const tr=s11+s22, det=s11*s22-s12*s12;
      const disc=Math.sqrt(Math.max(0,(tr/2)**2-det));
      const l1=tr/2+disc, l2=tr/2-disc;
      if(l1<=0||l2<=0)return null;
      let vx1,vy1;
      if(Math.abs(s12)<1e-10){vx1=1;vy1=0;}
      else{vx1=l1-s22;vy1=s12;const n=Math.sqrt(vx1**2+vy1**2);vx1/=n;vy1/=n;}
      const vx2=-vy1,vy2=vx1;
      const angle=Math.atan2(vy1,vx1)*180/Math.PI;
      return {l1,l2,vx1,vy1,vx2,vy2,angle};
    }

    window.covCompute = () => {
      const s11=parseFloat(document.getElementById('cov-s11')?.value)||0;
      const s12=parseFloat(document.getElementById('cov-s12')?.value)||0;
      const s21=parseFloat(document.getElementById('cov-s21')?.value)||0;
      const s22=parseFloat(document.getElementById('cov-s22')?.value)||0;
      document.getElementById('cov-s21').value=s12;

      const pd=s11>0&&s22>0&&(s11*s22-s12*s12)>0;
      const symm=Math.abs(s12-s21)<1e-8;
      const pdEl=document.getElementById('cov-pd-status');
      if(pdEl)pdEl.innerHTML=`
        <span class="badge ${pd?'badge-success':'badge-error'}">${pd?'✓ Positive Definite':'✗ Not Positive Definite'}</span>
        ${symm?'<span class="badge badge-success" style="margin-left:6px">✓ Symmetric</span>':'<span class="badge badge-warning" style="margin-left:6px">Auto-symmetrized</span>'}`;

      if(!pd){document.getElementById('cov-props').innerHTML='<div class="badge badge-error">Matrix must be symmetric positive definite</div>';return;}

      eigendata=eigen2x2(s11,s12,s22);
      if(!eigendata)return;

      const {l1,l2,angle}=eigendata;
      document.getElementById('cov-props').innerHTML=`
        <div class="flex justify-between"><span class="text-secondary">λ₁ (major)</span><span class="mono-value">${fmt(l1)}</span></div>
        <div class="flex justify-between"><span class="text-secondary">λ₂ (minor)</span><span class="mono-value">${fmt(l2)}</span></div>
        <div class="flex justify-between"><span class="text-secondary">Semi-axis a (1σ)</span><span class="mono-value">${fmt(Math.sqrt(l1))}</span></div>
        <div class="flex justify-between"><span class="text-secondary">Semi-axis b (1σ)</span><span class="mono-value">${fmt(Math.sqrt(l2))}</span></div>
        <div class="flex justify-between"><span class="text-secondary">Rotation angle</span><span class="mono-value">${fmt(angle)}°</span></div>
        <div class="flex justify-between"><span class="text-secondary">Condition number</span><span class="mono-value">${fmt(l1/l2)}</span></div>
        <div class="flex justify-between"><span class="text-secondary">Determinant</span><span class="mono-value">${fmt(s11*s22-s12*s12)}</span></div>`;

      covDraw();
    };

    window.covDraw = () => {
      if(!eigendata)return;
      const canvas=document.getElementById('cov-canvas');
      if(!canvas)return;
      const ctx=canvas.getContext('2d');
      const W=canvas.width,H=canvas.height;
      const isDark=document.documentElement.getAttribute('data-theme')==='dark';

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=isDark?'#111115':'#fafbff';
      ctx.fillRect(0,0,W,H);

      const cx=W/2,cy=H/2;
      const maxR=Math.min(W,H)*0.42;
      const scale=maxR/(3*Math.sqrt(eigendata.l1)+0.1);

      ctx.strokeStyle=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)';
      ctx.lineWidth=1;
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      ctx.strokeStyle=isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)';
      ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();

      const {l1,l2,vx1,vy1,vx2,vy2}=eigendata;
      const ellipses=[
        {k:1,color:'#5865f2',show:'cov-c1'},
        {k:2,color:'#f59e0b',show:'cov-c2'},
        {k:3,color:'#ef4444',show:'cov-c3'}
      ];

      ellipses.reverse().forEach(({k,color,show})=>{
        if(!document.getElementById(show)?.checked)return;
        const a=k*Math.sqrt(l1)*scale, b=k*Math.sqrt(l2)*scale;
        const angle=Math.atan2(vy1,vx1);
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(-angle);
        ctx.beginPath();
        ctx.ellipse(0,0,a,b,0,0,2*Math.PI);
        ctx.strokeStyle=color;
        ctx.lineWidth=k===1?2:1.5;
        ctx.globalAlpha=0.9;
        ctx.stroke();
        ctx.fillStyle=color;
        ctx.globalAlpha=0.05*k;
        ctx.fill();
        ctx.globalAlpha=1;
        ctx.restore();
      });

      const a1=Math.sqrt(l1)*scale, b1=Math.sqrt(l2)*scale;
      const angle=Math.atan2(vy1,vx1);
      const axes=[{v:[vx1,vy1],l:a1,color:'#22c55e'},{v:[vx2,vy2],l:b1,color:'#22c55e'}];
      axes.forEach(({v,l,color})=>{
        const ex=v[0]*l,ey=-v[1]*l;
        ctx.strokeStyle=color;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(cx-ex,cy-ey);ctx.lineTo(cx+ex,cy+ey);ctx.stroke();
      });

      ctx.fillStyle='#ef4444';
      ctx.beginPath();ctx.arc(cx,cy,4,0,2*Math.PI);ctx.fill();

      ctx.fillStyle=isDark?'#9b9db5':'#525970';
      ctx.font='11px sans-serif';ctx.textAlign='center';
      ctx.fillText('x',W-12,cy-4);ctx.fillText('y',cx+4,14);

      const infoEl=document.getElementById('cov-ellipse-info');
      if(infoEl)infoEl.textContent=`1σ ellipse: a=${fmt(Math.sqrt(l1))} · b=${fmt(Math.sqrt(l2))} · θ=${fmt(angle*180/Math.PI)}°`;
    };

    window.covPreset = (name) => {
      const presets={
        circular:{s11:1,s12:0,s22:1},
        elongated:{s11:4,s12:0,s22:0.25},
        rotated:{s11:2,s12:1.5,s22:2},
        narrow:{s11:0.25,s12:0.1,s22:2}
      };
      const p=presets[name];
      if(!p)return;
      document.getElementById('cov-s11').value=p.s11;
      document.getElementById('cov-s12').value=p.s12;
      document.getElementById('cov-s21').value=p.s12;
      document.getElementById('cov-s22').value=p.s22;
      covCompute();
    };

    covCompute();
  }
});
