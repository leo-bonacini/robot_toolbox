window.LOCALES = window.LOCALES || {};
window.LOCALES.en = {
  app: { name: 'Robot Toolbox', tagline: 'Professional Robotics Engineering Tools' },
  nav: {
    home: 'Home', favorites: 'Favorites', recent: 'Recent',
    motion: 'Motion', control: 'Control', kinematics: 'Kinematics',
    math: 'Math', sensors: 'Sensors', coordinates: 'Coordinates',
    navigation: 'Navigation', utilities: 'Utilities', vision: 'Vision'
  },
  search: { placeholder: 'Search tools...', noResults: 'No results for "{query}"', hint: 'Try searching by tool name, category, or keywords' },
  settings: {
    title: 'Settings', theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeSystem: 'System',
    language: 'Language', precision: 'Decimal Precision', units: 'Default Units',
    animations: 'Animations', grid: 'Show Grid', save: 'Save', reset: 'Reset to Defaults',
    unitsMetric: 'Metric (SI)', unitsImperial: 'Imperial'
  },
  tools: {
    home: { name: 'Home', desc: 'Dashboard and quick access to all tools' },
    rotationConverter: { name: 'Rotation Converter', desc: 'Convert between Euler angles, quaternions, rotation matrices and axis-angle representations' },
    quaternionToolbox: { name: 'Quaternion Toolbox', desc: 'Quaternion operations: normalize, multiply, inverse, interpolation and visualization' },
    rotationMatrix: { name: 'Rotation Matrix', desc: 'Validate and analyze rotation matrices: orthogonality, determinant, eigenvalues' },
    dhCalculator: { name: 'DH Calculator', desc: 'Denavit-Hartenberg parameter table and forward kinematics for serial robots' },
    pidTuner: { name: 'PID Tuner', desc: 'Interactive PID controller design with live step-response simulation and metrics' },
    differentialDrive: { name: 'Differential Drive', desc: 'Kinematic calculations for differential drive robots: wheel speeds, turning radius' },
    ackermann: { name: 'Ackermann Steering', desc: 'Ackermann steering geometry: steering angles, turning radius for car-like robots' },
    mecanum: { name: 'Mecanum Wheels', desc: 'Forward and inverse kinematics for mecanum wheel robots' },
    skidSteer: { name: 'Skid Steer', desc: 'Kinematics for skid-steer (tank-drive) robots' },
    unitConverter: { name: 'Unit Converter', desc: 'Robotics unit conversion: distance, velocity, torque, force and more' },
    matrixCalculator: { name: 'Matrix Calculator', desc: 'Matrix operations: add, multiply, inverse, determinant, eigenvalues, LU decomposition' },
    covarianceVisualizer: { name: 'Covariance Visualizer', desc: 'Visualize covariance matrices as confidence ellipses with principal axes' },
    coordinateFrame: { name: 'Coordinate Frames', desc: 'Convert positions between ENU, NED, ECEF, UTM and body frames' },
    imuNoise: { name: 'IMU Noise Calculator', desc: 'Calculate IMU noise parameters from datasheet values for sensor fusion' },
    cameraFov: { name: 'Camera FOV', desc: 'Compute field of view from sensor size and focal length' },
    trajectoryGenerator: { name: 'Trajectory Generator', desc: 'Generate and visualize trajectories: circle, spiral, Lissajous, Bezier and splines' },
    motionProfile: { name: 'Motion Profile', desc: 'Design trapezoidal and S-curve motion profiles with position, velocity and acceleration plots' }
  },
  actions: {
    calculate: 'Calculate', reset: 'Reset', copy: 'Copy', export: 'Export', import: 'Import',
    addRow: 'Add Joint', removeRow: 'Remove', clear: 'Clear', apply: 'Apply', close: 'Close',
    favorite: 'Add to Favorites', unfavorite: 'Remove from Favorites', help: 'Help',
    exportJson: 'Export JSON', exportCsv: 'Export CSV', exportPng: 'Export PNG',
    copyValue: 'Copy Value', copiedValue: 'Copied!'
  },
  labels: {
    roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw', quaternion: 'Quaternion', matrix: 'Matrix',
    axisAngle: 'Axis-Angle', rodrigues: 'Rodrigues', axis: 'Axis', angle: 'Angle',
    degrees: 'degrees', radians: 'radians',
    input: 'Input', output: 'Output', result: 'Result', formula: 'Formula',
    notes: 'Notes', references: 'References', examples: 'Examples',
    valid: 'Valid', invalid: 'Invalid', determinant: 'Determinant', eigenvalues: 'Eigenvalues',
    orthogonal: 'Orthogonal', error: 'Error',
    kp: 'Proportional Gain (Kp)', ki: 'Integral Gain (Ki)', kd: 'Derivative Gain (Kd)',
    overshoot: 'Overshoot', settlingTime: 'Settling Time', riseTime: 'Rise Time', steadyState: 'Steady-State Error',
    linearVelocity: 'Linear Velocity', angularVelocity: 'Angular Velocity', wheelRadius: 'Wheel Radius',
    trackWidth: 'Track Width', leftWheel: 'Left Wheel', rightWheel: 'Right Wheel',
    wheelbase: 'Wheelbase', steeringAngle: 'Steering Angle', turningRadius: 'Turning Radius',
    innerWheel: 'Inner Wheel', outerWheel: 'Outer Wheel',
    joint: 'Joint', alpha: 'α (alpha)', a: 'a', d: 'd', theta: 'θ (theta)', type: 'Type',
    revolute: 'Revolute', prismatic: 'Prismatic',
    focalLength: 'Focal Length', sensorWidth: 'Sensor Width', sensorHeight: 'Sensor Height',
    hFov: 'Horizontal FOV', vFov: 'Vertical FOV', dFov: 'Diagonal FOV',
    noiseDensity: 'Noise Density', biasInstability: 'Bias Instability', randomWalk: 'Random Walk',
    samplingFreq: 'Sampling Frequency', arw: 'Angle Random Walk', vrw: 'Velocity Random Walk',
    maxVelocity: 'Max Velocity', maxAccel: 'Max Acceleration', maxJerk: 'Max Jerk', distance: 'Distance',
    duration: 'Duration', position: 'Position', velocity: 'Velocity', acceleration: 'Acceleration', jerk: 'Jerk'
  },
  help: {
    rotationConverter: {
      desc: 'Convert between common 3D rotation representations used in robotics.',
      formula: 'A rotation can be represented as an Euler angle triplet (roll, pitch, yaw), a quaternion q=[w,x,y,z], a 3×3 rotation matrix R (orthonormal, det=1), or an axis-angle pair (k̂, θ).',
      notes: 'Euler angles suffer from gimbal lock near ±90° pitch. Quaternions and rotation matrices are generally preferred for numerical computation.'
    },
    pidTuner: {
      desc: 'Simulate the step response of a PID-controlled second-order plant.',
      formula: 'u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·ė(t). Plant model: 1/(s²+s). Uses forward Euler integration at dt=1ms.',
      notes: 'Increase Kp for faster response. Add Ki to eliminate steady-state error. Add Kd to reduce overshoot.'
    },
    dhCalculator: {
      desc: 'The Denavit-Hartenberg convention describes serial manipulator kinematics with 4 parameters per joint.',
      formula: 'Tᵢ = Rot_z(θᵢ)·Trans_z(dᵢ)·Trans_x(aᵢ)·Rot_x(αᵢ)',
      notes: 'The end-effector pose is T = T₁·T₂·...·Tₙ. Use Modified DH for most modern robots (e.g. URDF-based).'
    }
  },
  messages: {
    copied: 'Copied to clipboard', exportSuccess: 'Exported successfully', importSuccess: 'Import successful',
    importError: 'Import failed: invalid format', noFavorites: 'No favorites yet',
    addedFavorite: 'Added to favorites', removedFavorite: 'Removed from favorites',
    invalidMatrix: 'Not a valid rotation matrix', singularMatrix: 'Matrix is singular (non-invertible)'
  }
};
