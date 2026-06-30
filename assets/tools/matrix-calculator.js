Router.register({
  id: 'matrix-calculator',
  name: 'Matrix Calculator',
  icon: '🔢',
  category: 'math',
  description: 'Matrix operations: add, multiply, inverse, determinant, eigenvalues, LU decomposition',
  tags: ['matrix', 'linear algebra', 'determinant', 'inverse', 'eigenvalues', 'LU', 'transpose'],

  init(container) {
    const prec = Storage.getSettings().precision || 4;
    const fmt = v => typeof v==='number'?parseFloat(v.toFixed(prec)):v;

    /* Matrix math (no dependencies) */
    function matAdd(A,B){return A.map((r,i)=>r.map((v,j)=>v+B[i][j]));}
    function matSub(A,B){return A.map((r,i)=>r.map((v,j)=>v-B[i][j]));}
    function matMul(A,B){
      const ra=A.length,ca=A[0].length,cb=B[0].length;
      const C=Array.from({length:ra},()=>Array(cb).fill(0));
      for(let i=0;i<ra;i++)for(let k=0;k<ca;k++)for(let j=0;j<cb;j++)C[i][j]+=A[i][k]*B[k][j];
      return C;
    }
    function matT(A){return A[0].map((_,j)=>A.map(r=>r[j]));}
    function matScale(s,A){return A.map(r=>r.map(v=>v*s));}

    function matDet(A){
      const n=A.length;
      if(n===1)return A[0][0];
      if(n===2)return A[0][0]*A[1][1]-A[0][1]*A[1][0];
      let det=0;
      for(let j=0;j<n;j++){
        const minor=A.slice(1).map(r=>[...r.slice(0,j),...r.slice(j+1)]);
        det+=Math.pow(-1,j)*A[0][j]*matDet(minor);
      }
      return det;
    }

    function matInv(A){
      const n=A.length;
      const aug=A.map((r,i)=>[...r,...Array(n).fill(0).map((_,j)=>j===i?1:0)]);
      for(let col=0;col<n;col++){
        let mx=col, mx_val=Math.abs(aug[col][col]);
        for(let row=col+1;row<n;row++)if(Math.abs(aug[row][col])>mx_val){mx=row;mx_val=Math.abs(aug[row][col]);}
        if(mx_val<1e-12)return null;
        [aug[col],aug[mx]]=[aug[mx],aug[col]];
        const div=aug[col][col];
        aug[col]=aug[col].map(v=>v/div);
        for(let row=0;row<n;row++)if(row!==col){const f=aug[row][col];aug[row]=aug[row].map((v,k)=>v-f*aug[col][k]);}
      }
      return aug.map(r=>r.slice(n));
    }

    function matLU(A){
      const n=A.length;
      const L=Array.from({length:n},(_,i)=>Array(n).fill(0).map((_,j)=>j===i?1:0));
      const U=A.map(r=>[...r]);
      const P=Array.from({length:n},(_,i)=>Array(n).fill(0).map((_,j)=>j===i?1:0));
      const perm=Array.from({length:n},(_,i)=>i);
      for(let k=0;k<n;k++){
        let mx=k;
        for(let i=k+1;i<n;i++)if(Math.abs(U[i][k])>Math.abs(U[mx][k]))mx=i;
        [U[k],U[mx]]=[U[mx],U[k]];
        [L[k],L[mx]]=[L[mx],L[k]];
        [P[k],P[mx]]=[P[mx],P[k]];
        [perm[k],perm[mx]]=[perm[mx],perm[k]];
        for(let i=k+1;i<n;i++){
          if(Math.abs(U[k][k])<1e-12)continue;
          L[i][k]=U[i][k]/U[k][k];
          for(let j=k;j<n;j++)U[i][j]-=L[i][k]*U[k][j];
        }
      }
      for(let i=0;i<n;i++)L[i]=L[i].slice(0,n);
      return {L,U,P};
    }

    function matRank(A){
      const M=A.map(r=>[...r]);
      const rows=M.length, cols=M[0].length;
      let rank=0,r=0;
      for(let c=0;c<cols&&r<rows;c++){
        let mx=r;
        for(let i=r+1;i<rows;i++)if(Math.abs(M[i][c])>Math.abs(M[mx][c]))mx=i;
        if(Math.abs(M[mx][c])<1e-10)continue;
        [M[r],M[mx]]=[M[mx],M[r]];
        for(let i=0;i<rows;i++)if(i!==r){const f=M[i][c]/M[r][c];for(let j=c;j<cols;j++)M[i][j]-=f*M[r][j];}
        rank++;r++;
      }
      return rank;
    }

    function matTrace(A){let t=0;for(let i=0;i<A.length;i++)t+=A[i][i];return t;}

    function eigenvalues2x2(A){
      const tr=A[0][0]+A[1][1], det2=A[0][0]*A[1][1]-A[0][1]*A[1][0];
      const disc=tr*tr-4*det2;
      if(disc>=0)return [(tr+Math.sqrt(disc))/2,(tr-Math.sqrt(disc))/2];
      return [`${fmt(tr/2)} ± ${fmt(Math.sqrt(-disc)/2)}i`];
    }

    /* UI */
    let sizeA=3, sizeB=3;
    let activeOp='multiply';

    function matInput(id,size) {
      return `<div>
        <div class="matrix-size-select">
          <label>Size:</label>
          <select onchange="mcResize('${id}',this.value)">
            ${[2,3,4,5].map(n=>`<option ${n===size?'selected':''}>${n}×${n}</option>`).join('')}
          </select>
        </div>
        <div class="matrix-grid" style="grid-template-columns:repeat(${size},1fr)" id="mat-${id}">
          ${Array.from({length:size},(_,i)=>Array.from({length:size},(_,j)=>
            `<input class="matrix-cell" type="number" step="any" value="${i===j?1:0}" data-r="${i}" data-c="${j}" oninput="mcCompute()">`
          ).join('')).join('')}
        </div>
      </div>`;
    }

    function readMat(id) {
      const grid=document.getElementById(`mat-${id}`);
      if(!grid)return null;
      const inputs=Array.from(grid.querySelectorAll('input'));
      const n=Math.sqrt(inputs.length);
      const M=[];
      for(let i=0;i<n;i++){M.push([]);for(let j=0;j<n;j++)M[i].push(parseFloat(inputs[i*n+j].value)||0);}
      return M;
    }

    function matHTML(M,title='') {
      if(!M)return '<span class="badge badge-error">Undefined</span>';
      if(typeof M[0]==='string'||typeof M[0]==='number')M=[M.map(v=>typeof v==='string'?v:fmt(v))];
      const rows=M.length, cols=M[0].length;
      return `${title?`<div class="section-title" style="margin-bottom:6px">${title}</div>`:''}
      <div class="matrix-grid" style="grid-template-columns:repeat(${cols},1fr);pointer-events:none">
        ${M.map(r=>r.map(v=>`<div class="matrix-cell" style="text-align:center">${typeof v==='number'?fmt(v):v}</div>`).join('')).join('')}
      </div>`;
    }

    function render() {
      const ops=['add','subtract','multiply','transpose A','inverse A','determinant A','rank A','trace A','eigenvalues A','LU decomposition A','scalar×A'];
      container.innerHTML=`
        <div class="tool-header">
          <div class="tool-title"><span class="tool-icon">🔢</span> Matrix Calculator</div>
          <div class="tool-description">Linear algebra operations for matrices up to 5×5.</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
          ${ops.map(op=>`<button class="matrix-op-btn ${op===activeOp?'active':''}" onclick="mcSetOp('${op}')">${op.charAt(0).toUpperCase()+op.slice(1)}</button>`).join('')}
        </div>
        <div class="matrix-io-section">
          <div>
            <div class="section-title" style="margin-bottom:8px">Matrix A</div>
            ${matInput('A',sizeA)}
          </div>
          <div class="matrix-op-panel" id="mc-op-col">
            <div style="text-align:center;padding:8px;font-weight:600;color:var(--accent);font-size:18px" id="mc-op-symbol">×</div>
          </div>
          <div id="mc-B-col">
            <div class="section-title" style="margin-bottom:8px">Matrix B</div>
            ${matInput('B',sizeB)}
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-header"><div class="card-title">Result</div></div>
          <div class="card-body" id="mc-result"></div>
        </div>`;
      updateOpSymbol();
      mcCompute();
    }

    function updateOpSymbol() {
      const sym={add:'+',subtract:'−',multiply:'×'};
      const symEl=document.getElementById('mc-op-symbol');
      const bCol=document.getElementById('mc-B-col');
      if(symEl)symEl.textContent=sym[activeOp]||'';
      if(bCol)bCol.style.display=['add','subtract','multiply'].includes(activeOp)?'':'none';
    }

    window.mcSetOp=(op)=>{activeOp=op;document.querySelectorAll('.matrix-op-btn').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase()===op));updateOpSymbol();mcCompute();};
    window.mcResize=(id,val)=>{const n=parseInt(val);if(id==='A')sizeA=n;else sizeB=n;render();};

    window.mcCompute=()=>{
      const A=readMat('A'), B=readMat('B');
      if(!A)return;
      const res=document.getElementById('mc-result');
      if(!res)return;
      try{
        let html='';
        if(activeOp==='add')html=matHTML(matAdd(A,B),'A + B');
        else if(activeOp==='subtract')html=matHTML(matSub(A,B),'A − B');
        else if(activeOp==='multiply')html=matHTML(matMul(A,B),'A × B');
        else if(activeOp==='transpose A')html=matHTML(matT(A),'Aᵀ');
        else if(activeOp==='inverse A'){const inv=matInv(A);html=inv?matHTML(inv,'A⁻¹'):'<div class="badge badge-error">Matrix is singular (not invertible)</div>';}
        else if(activeOp==='determinant A'){const d=matDet(A);html=`<div class="result-value">det(A) = ${fmt(d)}</div><div class="result-unit" style="margin-top:6px">${Math.abs(d)<1e-10?'Matrix is singular':'Matrix is invertible'}</div>`;}
        else if(activeOp==='rank A')html=`<div class="result-value">rank(A) = ${matRank(A)}</div>`;
        else if(activeOp==='trace A')html=`<div class="result-value">tr(A) = ${fmt(matTrace(A))}</div>`;
        else if(activeOp==='eigenvalues A'){
          if(A.length===2){const ev=eigenvalues2x2(A);html=`<div class="section-title">Eigenvalues of A (2×2)</div><div style="display:flex;gap:12px;margin-top:8px">${ev.map((v,i)=>`<span class="mono-value">λ${i+1} = ${typeof v==='number'?fmt(v):v}</span>`).join('')}</div>`;}
          else if(A.length===3){const ev=RotMath&&RotMath.det33?[fmt(matTrace(A)),'(QR not impl — see Rotation Matrix tool)']:['Use 2×2 or 3×3 Rotation Matrix tool'];html=`<div class="result-value" style="font-size:14px">For eigenvalues of a general 3×3 matrix, use the Rotation Matrix tool or a symbolic solver.</div><div style="margin-top:8px;font-size:12px;color:var(--text-tertiary)">Characteristic polynomial: λ³ − tr(A)λ² + ½((tr A)²−tr(A²))λ − det(A) = 0</div>`;}
          else html='<div class="badge badge-info">Use 2×2 for eigenvalue computation in this tool</div>';
        }
        else if(activeOp==='LU decomposition A'){
          if(A.length>4){html='<div class="badge badge-warning">LU shown for matrices up to 4×4</div>';}
          else{const {L,U,P}=matLU(A);html=`<div class="grid-3">${matHTML(P,'Permutation P')}${matHTML(L,'Lower L')}${matHTML(U,'Upper U')}</div><div class="form-hint" style="margin-top:8px">A = P⁻¹·L·U</div>`;}
        }
        else if(activeOp==='scalar×A'){
          const s=parseFloat(prompt('Enter scalar:','2'))||1;
          html=matHTML(matScale(s,A),`${s} × A`);
        }
        res.innerHTML=html;
      } catch(e){res.innerHTML=`<div class="badge badge-error">Error: ${e.message}</div>`;}
    };

    render();
  }
});
