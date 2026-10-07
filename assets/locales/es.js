window.LOCALES = window.LOCALES || {};
window.LOCALES.es = {
  app: { name: 'Robot Toolbox', tagline: 'Herramientas de ingeniería robótica en el navegador' },
  nav: {
    home: 'Inicio', favorites: 'Favoritos', recent: 'Recientes',
    motion: 'Movimiento', control: 'Control', kinematics: 'Cinemática',
    math: 'Matemáticas', sensors: 'Sensores', coordinates: 'Coordenadas',
    navigation: 'Navegación', utilities: 'Utilidades', vision: 'Visión'
  },
  search: { placeholder: 'Buscar herramientas...', noResults: 'Sin resultados para "{query}"', hint: 'Busca por nombre, categoría o palabras clave' },
  settings: {
    title: 'Configuración', theme: 'Tema', themeLight: 'Claro', themeDark: 'Oscuro', themeSystem: 'Sistema',
    language: 'Idioma', precision: 'Precisión Decimal', units: 'Unidades Predeterminadas',
    animations: 'Animaciones', grid: 'Mostrar Cuadrícula', save: 'Guardar', reset: 'Restaurar Predeterminados',
    unitsMetric: 'Métrico (SI)', unitsImperial: 'Imperial'
  },
  tools: {
    home: { name: 'Inicio', desc: 'Panel de control y acceso rápido a todas las herramientas' },
    rotationConverter: { name: 'Conversor de Rotación', desc: 'Convierte entre ángulos de Euler, cuaterniones, matrices de rotación y representación eje-ángulo' },
    quaternionToolbox: { name: 'Caja de Cuaterniones', desc: 'Operaciones con cuaterniones: normalizar, multiplicar, invertir, interpolar y visualizar' },
    rotationMatrix: { name: 'Matriz de Rotación', desc: 'Valida y analiza matrices de rotación: ortogonalidad, determinante, valores propios' },
    dhCalculator: { name: 'Calculadora DH', desc: 'Tabla de parámetros Denavit-Hartenberg y cinemática directa para robots seriales' },
    pidTuner: { name: 'Sintonizador PID', desc: 'Diseño interactivo de controlador PID con simulación de respuesta al escalón en tiempo real' },
    differentialDrive: { name: 'Tracción Diferencial', desc: 'Cálculos cinemáticos para robots diferenciales: velocidades de ruedas y radio de giro' },
    ackermann: { name: 'Dirección Ackermann', desc: 'Geometría de dirección Ackermann: ángulos de giro y radio de curvatura para robots tipo coche' },
    mecanum: { name: 'Ruedas Mecanum', desc: 'Cinemática directa e inversa para robots con ruedas mecanum' },
    skidSteer: { name: 'Skid Steer', desc: 'Cinemática para robots de tracción deslizante (tank drive)' },
    unitConverter: { name: 'Conversor de Unidades', desc: 'Conversión completa de unidades para robótica: distancia, velocidad, par, fuerza y más' },
    matrixCalculator: { name: 'Calculadora de Matrices', desc: 'Operaciones matriciales: suma, multiplicación, inversa, determinante, valores propios, descomposición LU' },
    covarianceVisualizer: { name: 'Visualizador de Covarianza', desc: 'Visualiza matrices de covarianza como elipses de confianza con ejes principales' },
    coordinateFrame: { name: 'Marcos de Referencia', desc: 'Convierte posiciones entre ENU, NED, ECEF, UTM y marcos de cuerpo' },
    imuNoise: { name: 'Ruido de IMU', desc: 'Calcula parámetros de ruido de IMU desde el datasheet para fusión de sensores' },
    cameraFov: { name: 'FOV de Cámara', desc: 'Calcula el campo de visión a partir del tamaño del sensor y la distancia focal' },
    trajectoryGenerator: { name: 'Generador de Trayectorias', desc: 'Genera y visualiza trayectorias: círculo, espiral, Lissajous, Bezier y splines' },
    motionProfile: { name: 'Perfil de Movimiento', desc: 'Diseña perfiles de movimiento trapezoidal y en S con gráficas de posición, velocidad y aceleración' }
  },
  actions: {
    calculate: 'Calcular', reset: 'Reiniciar', copy: 'Copiar', export: 'Exportar', import: 'Importar',
    addRow: 'Añadir Articulación', removeRow: 'Eliminar', clear: 'Limpiar', apply: 'Aplicar', close: 'Cerrar',
    favorite: 'Añadir a Favoritos', unfavorite: 'Quitar de Favoritos', help: 'Ayuda',
    exportJson: 'Exportar JSON', exportCsv: 'Exportar CSV', exportPng: 'Exportar PNG',
    copyValue: 'Copiar Valor', copiedValue: '¡Copiado!'
  },
  labels: {
    roll: 'Alabeo', pitch: 'Cabeceo', yaw: 'Guiñada', quaternion: 'Cuaternión', matrix: 'Matriz',
    axisAngle: 'Eje-Ángulo', rodrigues: 'Rodrigues', axis: 'Eje', angle: 'Ángulo',
    degrees: 'grados', radians: 'radianes',
    input: 'Entrada', output: 'Salida', result: 'Resultado', formula: 'Fórmula',
    notes: 'Notas', references: 'Referencias', examples: 'Ejemplos',
    valid: 'Válida', invalid: 'Inválida', determinant: 'Determinante', eigenvalues: 'Valores Propios',
    orthogonal: 'Ortogonal', error: 'Error',
    kp: 'Ganancia Proporcional (Kp)', ki: 'Ganancia Integral (Ki)', kd: 'Ganancia Derivativa (Kd)',
    overshoot: 'Sobreimpulso', settlingTime: 'Tiempo de Establecimiento', riseTime: 'Tiempo de Subida', steadyState: 'Error en Estado Estacionario',
    linearVelocity: 'Velocidad Lineal', angularVelocity: 'Velocidad Angular', wheelRadius: 'Radio de Rueda',
    trackWidth: 'Ancho de Vía', leftWheel: 'Rueda Izquierda', rightWheel: 'Rueda Derecha',
    wheelbase: 'Distancia entre Ejes', steeringAngle: 'Ángulo de Dirección', turningRadius: 'Radio de Giro',
    innerWheel: 'Rueda Interior', outerWheel: 'Rueda Exterior',
    joint: 'Articulación', alpha: 'α (alfa)', a: 'a', d: 'd', theta: 'θ (theta)', type: 'Tipo',
    revolute: 'Rotacional', prismatic: 'Prismática',
    focalLength: 'Longitud Focal', sensorWidth: 'Ancho del Sensor', sensorHeight: 'Alto del Sensor',
    hFov: 'FOV Horizontal', vFov: 'FOV Vertical', dFov: 'FOV Diagonal',
    noiseDensity: 'Densidad de Ruido', biasInstability: 'Inestabilidad de Sesgo', randomWalk: 'Paseo Aleatorio',
    samplingFreq: 'Frecuencia de Muestreo', arw: 'Paseo Aleatorio Angular', vrw: 'Paseo Aleatorio de Velocidad',
    maxVelocity: 'Velocidad Máxima', maxAccel: 'Aceleración Máxima', maxJerk: 'Jerk Máximo', distance: 'Distancia',
    duration: 'Duración', position: 'Posición', velocity: 'Velocidad', acceleration: 'Aceleración', jerk: 'Jerk'
  },
  help: {
    rotationConverter: {
      desc: 'Convierte entre representaciones comunes de rotación 3D usadas en robótica.',
      formula: 'Una rotación puede representarse como ángulos de Euler (alabeo, cabeceo, guiñada), cuaternión q=[w,x,y,z], matriz de rotación 3×3 R (ortonormal, det=1) o par eje-ángulo (k̂, θ).',
      notes: 'Los ángulos de Euler sufren de bloqueo de cardán cerca de ±90° de cabeceo. Los cuaterniones y matrices de rotación son generalmente preferidos para cálculo numérico.'
    },
    pidTuner: {
      desc: 'Simula la respuesta al escalón de una planta de segundo orden controlada por PID.',
      formula: 'u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·ė(t). Modelo de planta: 1/(s²+s). Usa integración de Euler con dt=1ms.',
      notes: 'Aumenta Kp para respuesta más rápida. Añade Ki para eliminar error en estado estacionario. Añade Kd para reducir el sobreimpulso.'
    },
    dhCalculator: {
      desc: 'La convención de Denavit-Hartenberg describe la cinemática de manipuladores seriales con 4 parámetros por articulación.',
      formula: 'Tᵢ = Rot_z(θᵢ)·Trans_z(dᵢ)·Trans_x(aᵢ)·Rot_x(αᵢ)',
      notes: 'La pose del efector final es T = T₁·T₂·...·Tₙ. Usa DH Modificado para robots modernos (ej: basados en URDF).'
    }
  },
  messages: {
    copied: 'Copiado al portapapeles', exportSuccess: 'Exportado correctamente', importSuccess: 'Importación exitosa',
    importError: 'Error al importar: formato inválido', noFavorites: 'Aún no hay favoritos',
    addedFavorite: 'Añadido a favoritos', removedFavorite: 'Eliminado de favoritos',
    invalidMatrix: 'No es una matriz de rotación válida', singularMatrix: 'Matriz singular (no invertible)'
  }
};
