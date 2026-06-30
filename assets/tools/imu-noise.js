Router.register({
  id: 'imu-noise',
  name: 'IMU Noise Calculator',
  icon: '📡',
  category: 'sensors',
  description: 'Calculate IMU noise parameters from datasheet values for sensor fusion',
  tags: ['IMU', 'noise', 'gyroscope', 'accelerometer', 'Allan deviation', 'sensor', 'calibration', 'ROS'],

  init(container) {
    const fmt = (v,p=4) => isNaN(v)||!isFinite(v)?'—':v.toExponential(p);
    const fmtN = (v,p=4) => isNaN(v)||!isFinite(v)?'—':parseFloat(v.toFixed(p));

    container.innerHTML=`
      <div class="tool-header">
        <div class="tool-title"><span class="tool-icon">📡</span> IMU Noise Calculator</div>
        <div class="tool-description">Convert IMU noise parameters from datasheets to values needed for sensor fusion (e.g. ROS robot_localization).</div>
      </div>

      <div class="tabs">
        <button class="tab active" onclick="imuTab('gyro',this)">Gyroscope</button>
        <button class="tab" onclick="imuTab('accel',this)">Accelerometer</button>
        <button class="tab" onclick="imuTab('ref',this)">Reference</button>
      </div>

      <div id="imu-tab-gyro" class="tab-content active">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">Gyroscope Datasheet Values</div></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
              <div class="form-group">
                <label class="form-label">Angle Random Walk (ARW) — σ_N</label>
                <div class="input-group"><input type="number" id="gyro-arw" class="input" value="0.1" step="any" oninput="imuCompute()"><div class="input-addon">°/√h</div></div>
                <div class="form-hint">Allan deviation plateau at short τ</div>
              </div>
              <div class="form-group">
                <label class="form-label">Bias Instability — σ_B</label>
                <div class="input-group"><input type="number" id="gyro-bi" class="input" value="5" step="any" oninput="imuCompute()"><div class="input-addon">°/h</div></div>
                <div class="form-hint">Allan deviation minimum</div>
              </div>
              <div class="form-group">
                <label class="form-label">In-Run Bias Stability</label>
                <div class="input-group"><input type="number" id="gyro-irb" class="input" value="1" step="any" oninput="imuCompute()"><div class="input-addon">°/h</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">Sampling Rate</label>
                <div class="input-group"><input type="number" id="gyro-hz" class="input" value="200" step="1" oninput="imuCompute()"><div class="input-addon">Hz</div></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Computed Noise Parameters</div></div>
            <div class="card-body" id="gyro-results"></div>
          </div>
        </div>
      </div>

      <div id="imu-tab-accel" class="tab-content">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">Accelerometer Datasheet Values</div></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
              <div class="form-group">
                <label class="form-label">Velocity Random Walk (VRW) — σ_N</label>
                <div class="input-group"><input type="number" id="accel-vrw" class="input" value="0.05" step="any" oninput="imuCompute()"><div class="input-addon">m/s/√h</div></div>
                <div class="form-hint">Or noise density in m/s²/√Hz</div>
              </div>
              <div class="form-group">
                <label class="form-label">Bias Instability</label>
                <div class="input-group"><input type="number" id="accel-bi" class="input" value="50" step="any" oninput="imuCompute()"><div class="input-addon">μg</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">Noise Density (PSD)</label>
                <div class="input-group"><input type="number" id="accel-nd" class="input" value="100" step="any" oninput="imuCompute()"><div class="input-addon">μg/√Hz</div></div>
              </div>
              <div class="form-group">
                <label class="form-label">Sampling Rate</label>
                <div class="input-group"><input type="number" id="accel-hz" class="input" value="200" step="1" oninput="imuCompute()"><div class="input-addon">Hz</div></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Computed Noise Parameters</div></div>
            <div class="card-body" id="accel-results"></div>
          </div>
        </div>
      </div>

      <div id="imu-tab-ref" class="tab-content">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">IMU Noise Model</div></div>
            <div class="card-body" style="font-size:13px;line-height:1.9">
              <strong>Measurement model:</strong><br>
              ω̃ = ω + b + n · where b = bias, n = white noise<br><br>
              <strong>White noise σ (gyro):</strong><br>
              σ_d = ARW [°/√h] × π/180 / √(3600) × √(fs)<br><br>
              <strong>Bias random walk σ (gyro):</strong><br>
              σ_b = BiasInstability [°/h] × π/180 / 3600 / √(fs)<br><br>
              <strong>ROS usage:</strong><br>
              gyroscope_noise_density = σ_d (rad/s/√Hz)<br>
              gyroscope_random_walk = σ_b (rad/s²/√Hz)
            </div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">Common IMU Grades</div></div>
            <div class="card-body">
              <div class="table-wrapper">
                <table><thead><tr><th>Grade</th><th>ARW (°/√h)</th><th>Bias (°/h)</th></tr></thead>
                <tbody>
                  <tr><td>Consumer (MPU6050)</td><td class="value-cell">0.3–1.0</td><td class="value-cell">10–100</td></tr>
                  <tr><td>Automotive (ICM-42688)</td><td class="value-cell">0.08–0.3</td><td class="value-cell">2–20</td></tr>
                  <tr><td>Tactical (ADIS16470)</td><td class="value-cell">0.01–0.08</td><td class="value-cell">1–5</td></tr>
                  <tr><td>Navigation (HG4930)</td><td class="value-cell">0.003–0.01</td><td class="value-cell">0.1–1</td></tr>
                  <tr><td>Strategic (fiber optic)</td><td class="value-cell">&lt;0.001</td><td class="value-cell">&lt;0.01</td></tr>
                </tbody></table>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    window.imuTab=(tab,btn)=>{
      document.querySelectorAll('[id^="imu-tab-"]').forEach(el=>el.classList.remove('active'));
      document.querySelectorAll('.tabs .tab').forEach(b=>b.classList.remove('active'));
      document.getElementById(`imu-tab-${tab}`)?.classList.add('active');
      btn.classList.add('active');
    };

    function resultRow(label, value, unit, note='') {
      return `<div class="flex justify-between items-center" style="padding:6px 0;border-bottom:1px solid var(--border)">
        <div><div class="form-label">${label}</div>${note?`<div class="form-hint">${note}</div>`:''}</div>
        <div style="text-align:right"><div class="mono-value">${value}</div><div class="form-hint">${unit}</div></div>
      </div>`;
    }

    window.imuCompute = () => {
      const arw=parseFloat(document.getElementById('gyro-arw')?.value)||0.1;
      const bi=parseFloat(document.getElementById('gyro-bi')?.value)||5;
      const irb=parseFloat(document.getElementById('gyro-irb')?.value)||1;
      const fs_g=parseFloat(document.getElementById('gyro-hz')?.value)||200;

      const d2r=Math.PI/180;
      const arw_rads_sqrth=arw*d2r/60;
      const gyro_nd=arw_rads_sqrth/Math.sqrt(3600);
      const gyro_nd_sqrthz=gyro_nd;
      const gyro_discrete=gyro_nd*Math.sqrt(fs_g);
      const gyro_rw=bi*d2r/3600/Math.sqrt(fs_g);
      const gyro_bias_rads=bi*d2r/3600;

      document.getElementById('gyro-results').innerHTML=`
        ${resultRow('Noise Density σ_N',fmt(gyro_nd_sqrthz,4),'rad/s/√Hz','ROS gyroscope_noise_density')}
        ${resultRow('Discrete σ_d (for dt)',fmt(gyro_discrete,4),'rad/√s','σ_N × √fs')}
        ${resultRow('Bias Random Walk',fmt(gyro_rw,6),'rad/s²/√Hz','ROS gyroscope_random_walk')}
        ${resultRow('Bias Instability',fmt(gyro_bias_rads,6),'rad/s','at 1 Hz integration')}
        ${resultRow('Initial Bias σ',fmtN(irb*d2r/3600,6),'rad/s','in-run bias stability')}
        <div class="card" style="margin-top:14px;background:var(--code-bg)">
          <div class="card-body" style="padding:12px">
            <div style="font-size:11.5px;font-family:var(--font-mono);color:var(--text-secondary)">
              # robot_localization / imu_filter_madgwick<br>
              gyroscope_noise_density: ${fmt(gyro_nd_sqrthz,6)}<br>
              gyroscope_random_walk: ${fmt(gyro_rw,8)}<br>
              gyroscope_bias_correlation_time: 1000.0<br>
              gyroscope_turn_on_bias_sigma: ${fmtN(irb*d2r/3600,6)}
            </div>
          </div>
        </div>`;

      const vrw=parseFloat(document.getElementById('accel-vrw')?.value)||0.05;
      const abi=parseFloat(document.getElementById('accel-bi')?.value)||50;
      const and=parseFloat(document.getElementById('accel-nd')?.value)||100;
      const fs_a=parseFloat(document.getElementById('accel-hz')?.value)||200;
      const g=9.80665;

      const accel_nd_mspersqrthz=vrw/60;
      const accel_nd_ms2_sqrthz=and*1e-6*g;
      const accel_discrete=accel_nd_ms2_sqrthz*Math.sqrt(fs_a);
      const accel_rw=abi*1e-6*g/Math.sqrt(fs_a);
      const accel_bias_ms2=abi*1e-6*g;

      document.getElementById('accel-results').innerHTML=`
        ${resultRow('Noise Density σ_N (from VRW)',fmt(vrw/3600,6),'m/s²/√Hz','VRW converted')}
        ${resultRow('Noise Density σ_N (from PSD)',fmt(accel_nd_ms2_sqrthz,6),'m/s²/√Hz','ROS accelerometer_noise_density')}
        ${resultRow('Discrete σ_d',fmt(accel_discrete,6),'m/s²/√s','σ_N × √fs')}
        ${resultRow('Bias Random Walk',fmt(accel_rw,8),'m/s³/√Hz','ROS accelerometer_random_walk')}
        ${resultRow('Bias Instability',fmt(accel_bias_ms2,6),'m/s²')}
        <div class="card" style="margin-top:14px;background:var(--code-bg)">
          <div class="card-body" style="padding:12px">
            <div style="font-size:11.5px;font-family:var(--font-mono);color:var(--text-secondary)">
              accelerometer_noise_density: ${fmt(accel_nd_ms2_sqrthz,8)}<br>
              accelerometer_random_walk: ${fmt(accel_rw,10)}<br>
              accelerometer_bias_correlation_time: 300.0<br>
              accelerometer_turn_on_bias_sigma: ${fmt(accel_bias_ms2,6)}
            </div>
          </div>
        </div>`;
    };

    imuCompute();
  }
});
