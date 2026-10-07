Router.register({
  id: 'unit-converter',
  name: 'Unit Converter',
  icon: '📏',
  category: 'math',
  description: 'Robotics unit conversion: distance, velocity, torque, force and more',
  tags: ['units', 'conversion', 'SI', 'metric', 'imperial', 'distance', 'velocity', 'torque', 'force', 'pressure'],

  init(container) {
    const categories = {
      distance: {
        icon:'📐', label:'Distance',
        base:'m',
        units:{m:1,km:1e3,cm:0.01,mm:0.001,um:1e-6,nm:1e-9,in:0.0254,ft:0.3048,yd:0.9144,mi:1609.344,nmi:1852}
      },
      velocity: {
        icon:'💨', label:'Velocity',
        base:'m/s',
        units:{'m/s':1,'km/h':1/3.6,'km/s':1000,'cm/s':0.01,'mm/s':0.001,'ft/s':0.3048,'mph':0.44704,'knot':0.514444,'mach':340.29}
      },
      angular_velocity: {
        icon:'🔄', label:'Angular Velocity',
        base:'rad/s',
        units:{'rad/s':1,'deg/s':Math.PI/180,'rpm':Math.PI/30,'rps':2*Math.PI,'rev/min':Math.PI/30,'mrad/s':0.001}
      },
      acceleration: {
        icon:'⚡', label:'Acceleration',
        base:'m/s²',
        units:{'m/s²':1,'cm/s²':0.01,'ft/s²':0.3048,'g':9.80665,'in/s²':0.0254,'Gal':0.01,'mGal':0.00001}
      },
      force: {
        icon:'💪', label:'Force',
        base:'N',
        units:{N:1,kN:1000,MN:1e6,mN:0.001,uN:1e-6,kgf:9.80665,lbf:4.44822,dyn:1e-5,'oz-f':0.278014}
      },
      torque: {
        icon:'🔩', label:'Torque',
        base:'N·m',
        units:{'N·m':1,'N·cm':0.01,'N·mm':0.001,'kN·m':1000,'kgf·m':9.80665,'kgf·cm':0.0980665,'lbf·ft':1.35582,'lbf·in':0.113,'oz·in':0.00706155}
      },
      mass: {
        icon:'⚖️', label:'Mass',
        base:'kg',
        units:{kg:1,g:0.001,mg:1e-6,ug:1e-9,t:1000,lb:0.453592,oz:0.0283495,slug:14.5939,grain:6.47989e-5}
      },
      pressure: {
        icon:'🌡️', label:'Pressure',
        base:'Pa',
        units:{Pa:1,hPa:100,kPa:1000,MPa:1e6,GPa:1e9,bar:1e5,mbar:100,atm:101325,mmHg:133.322,psi:6894.76,kPa:1000}
      },
      temperature: {
        icon:'🌡️', label:'Temperature', base:'K', special:true,
        units:{'K':'K','°C':'°C','°F':'°F','°R':'°R'}
      },
      time: {
        icon:'⏱️', label:'Time',
        base:'s',
        units:{s:1,ms:0.001,us:1e-6,ns:1e-9,ps:1e-12,min:60,h:3600,day:86400,week:604800,year:31557600}
      },
      power: {
        icon:'⚡', label:'Power',
        base:'W',
        units:{W:1,kW:1000,MW:1e6,mW:0.001,hp:745.7,'kgf·m/s':9.80665,BTU_h:0.293071}
      },
      energy: {
        icon:'🔋', label:'Energy',
        base:'J',
        units:{J:1,kJ:1000,MJ:1e6,mJ:0.001,uJ:1e-6,Wh:3600,kWh:3.6e6,cal:4.184,kcal:4184,eV:1.60218e-19,BTU:1055.06}
      },
      angle: {
        icon:'📐', label:'Angle',
        base:'rad',
        units:{rad:1,deg:Math.PI/180,grad:Math.PI/200,rev:2*Math.PI,arcmin:Math.PI/10800,arcsec:Math.PI/648000,mrad:0.001}
      }
    };

    let currentCat = 'distance';
    let fromUnit = 'm';
    let toUnit = 'km';

    function toTemp(val, from, to) {
      let k;
      if (from==='K') k=val;
      else if (from==='°C') k=val+273.15;
      else if (from==='°F') k=(val+459.67)*5/9;
      else if (from==='°R') k=val*5/9;
      if (to==='K') return k;
      if (to==='°C') return k-273.15;
      if (to==='°F') return k*9/5-459.67;
      if (to==='°R') return k*9/5;
      return k;
    }

    function convert(val, from, to, cat) {
      if (cat.special) return toTemp(val, from, to);
      const factorFrom = cat.units[from]||1;
      const factorTo = cat.units[to]||1;
      return val*factorFrom/factorTo;
    }

    function renderCategoryList() {
      return Object.entries(categories).map(([id,cat])=>`
        <div class="unit-category-item ${id===currentCat?'active':''}" onclick="ucSelectCat('${id}')">
          <span class="unit-cat-icon">${cat.icon}</span>
          <span>${cat.label}</span>
        </div>`).join('');
    }

    function renderUnitSelector(catId, selectedUnit, elemId) {
      const cat=categories[catId];
      return `<select class="select" id="${elemId}" onchange="ucCompute()">
        ${Object.keys(cat.units).map(u=>`<option value="${u}" ${u===selectedUnit?'selected':''}>${u}</option>`).join('')}
      </select>`;
    }

    function renderAllResults(val, fromUnit, catId) {
      const cat=categories[catId];
      return Object.keys(cat.units).map(u=>{
        const v=convert(val,fromUnit,u,cat);
        const isFeat=u===toUnit;
        return `<div class="unit-result-item ${isFeat?'featured':''}" onclick="ucSetTo('${u}')">
          <div class="unit-result-name">${u}</div>
          <div class="unit-result-value">${formatVal(v)}</div>
        </div>`;
      }).join('');
    }

    function formatVal(v) {
      if (Math.abs(v)<1e-10&&v!==0) return v.toExponential(4);
      if (Math.abs(v)>=1e7||Math.abs(v)<0.0001&&v!==0) return v.toExponential(4);
      return parseFloat(v.toPrecision(7)).toString();
    }

    function render() {
      container.innerHTML=`
        <div class="tool-header">
          <div class="tool-title"><span class="tool-icon">📏</span> Unit Converter</div>
          <div class="tool-description">Unit conversion for robotics and engineering.</div>
        </div>
        <div class="unit-converter-layout">
          <div class="card">
            <div class="card-body" style="padding:8px">
              <div class="unit-category-list" id="uc-cat-list">${renderCategoryList()}</div>
            </div>
          </div>
          <div class="unit-main">
            <div class="card">
              <div class="card-header"><div class="card-title">${categories[currentCat].label}</div></div>
              <div class="card-body">
                <div class="unit-input-section">
                  <div class="form-group">
                    <label class="form-label">From</label>
                    <div class="input-group">
                      <input type="number" id="uc-val" class="input" value="1" step="any" oninput="ucCompute()">
                      ${renderUnitSelector(currentCat, fromUnit, 'uc-from')}
                    </div>
                  </div>
                  <button class="unit-swap-btn" onclick="ucSwap()">⇄</button>
                  <div class="form-group">
                    <label class="form-label">To</label>
                    <div class="input-group">
                      <input type="number" id="uc-result" class="input" value="" step="any" oninput="ucFromResult()">
                      ${renderUnitSelector(currentCat, toUnit, 'uc-to')}
                    </div>
                  </div>
                </div>
                <div style="margin-top:12px;font-size:12.5px;color:var(--text-tertiary)" id="uc-formula"></div>
              </div>
            </div>
            <div class="card">
              <div class="card-header"><div class="card-title">All Conversions</div></div>
              <div class="card-body">
                <div class="unit-all-results" id="uc-all"></div>
              </div>
            </div>
          </div>
        </div>`;
      ucCompute();
    }

    window.ucSelectCat = (id) => {
      currentCat=id;
      const keys=Object.keys(categories[id].units);
      fromUnit=keys[0]; toUnit=keys[Math.min(1,keys.length-1)];
      render();
    };

    window.ucCompute = () => {
      const val=parseFloat(document.getElementById('uc-val')?.value)||0;
      fromUnit=document.getElementById('uc-from')?.value||fromUnit;
      toUnit=document.getElementById('uc-to')?.value||toUnit;
      const cat=categories[currentCat];
      const result=convert(val,fromUnit,toUnit,cat);
      const resEl=document.getElementById('uc-result');
      if (resEl) resEl.value=formatVal(result);
      const allEl=document.getElementById('uc-all');
      if (allEl) allEl.innerHTML=renderAllResults(val,fromUnit,currentCat);
      const formulaEl=document.getElementById('uc-formula');
      if (formulaEl&&!cat.special) {
        const f1=cat.units[fromUnit], f2=cat.units[toUnit];
        formulaEl.textContent=`1 ${fromUnit} = ${formatVal(f1/f2)} ${toUnit}`;
      }
    };

    window.ucFromResult = () => {
      const val=parseFloat(document.getElementById('uc-result')?.value)||0;
      fromUnit=document.getElementById('uc-from')?.value||fromUnit;
      toUnit=document.getElementById('uc-to')?.value||toUnit;
      const cat=categories[currentCat];
      const result=convert(val,toUnit,fromUnit,cat);
      const inEl=document.getElementById('uc-val');
      if (inEl) inEl.value=formatVal(result);
    };

    window.ucSwap = () => {
      [fromUnit,toUnit]=[toUnit,fromUnit];
      render();
    };

    window.ucSetTo = (unit) => {
      toUnit=unit;
      const sel=document.getElementById('uc-to');
      if (sel) sel.value=unit;
      ucCompute();
    };

    render();
  }
});
