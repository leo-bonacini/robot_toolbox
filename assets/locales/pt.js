window.LOCALES = window.LOCALES || {};
window.LOCALES.pt = {
  app: { name: 'Robot Toolbox', tagline: 'Ferramentas de engenharia robótica no navegador' },
  nav: {
    home: 'Início', favorites: 'Favoritos', recent: 'Recentes',
    motion: 'Movimento', control: 'Controle', kinematics: 'Cinemática',
    math: 'Matemática', sensors: 'Sensores', coordinates: 'Coordenadas',
    navigation: 'Navegação', utilities: 'Utilitários', vision: 'Visão'
  },
  search: { placeholder: 'Buscar ferramentas...', noResults: 'Sem resultados para "{query}"', hint: 'Busque por nome, categoria ou palavras-chave' },
  settings: {
    title: 'Configurações', theme: 'Tema', themeLight: 'Claro', themeDark: 'Escuro', themeSystem: 'Sistema',
    language: 'Idioma', precision: 'Precisão Decimal', units: 'Unidades Padrão',
    animations: 'Animações', grid: 'Mostrar Grade', save: 'Salvar', reset: 'Restaurar Padrões',
    unitsMetric: 'Métrico (SI)', unitsImperial: 'Imperial'
  },
  tools: {
    home: { name: 'Início', desc: 'Painel e acesso rápido a todas as ferramentas' },
    rotationConverter: { name: 'Conversor de Rotação', desc: 'Converta entre ângulos de Euler, quaternions, matrizes de rotação e eixo-ângulo' },
    quaternionToolbox: { name: 'Caixa de Quaternions', desc: 'Operações com quaternions: normalizar, multiplicar, inverter, interpolar e visualizar' },
    rotationMatrix: { name: 'Matriz de Rotação', desc: 'Valide e analise matrizes de rotação: ortonogalidade, determinante, autovalores' },
    dhCalculator: { name: 'Calculadora DH', desc: 'Tabela de parâmetros Denavit-Hartenberg e cinemática direta para robôs seriais' },
    pidTuner: { name: 'Sintonizador PID', desc: 'Projeto interativo de controlador PID com simulação de resposta ao degrau em tempo real' },
    differentialDrive: { name: 'Tração Diferencial', desc: 'Cálculos cinemáticos para robôs diferenciais: velocidades das rodas, raio de curvatura' },
    ackermann: { name: 'Direção Ackermann', desc: 'Geometria de direção Ackermann: ângulos de esterçamento e raio de curvatura' },
    mecanum: { name: 'Rodas Mecanum', desc: 'Cinemática direta e inversa para robôs com rodas mecanum' },
    skidSteer: { name: 'Skid Steer', desc: 'Cinemática para robôs de tração por derrapagem (tank drive)' },
    unitConverter: { name: 'Conversor de Unidades', desc: 'Conversão completa de unidades para robótica: distância, velocidade, torque, força e mais' },
    matrixCalculator: { name: 'Calculadora de Matrizes', desc: 'Operações matriciais: somar, multiplicar, inverter, determinante, autovalores, decomposição LU' },
    covarianceVisualizer: { name: 'Visualizador de Covariância', desc: 'Visualize matrizes de covariância como elipses de confiança com eixos principais' },
    coordinateFrame: { name: 'Referenciais', desc: 'Converta posições entre ENU, NED, ECEF, UTM e referenciais de corpo' },
    imuNoise: { name: 'Ruído de IMU', desc: 'Calcule parâmetros de ruído de IMU a partir do datasheet para fusão de sensores' },
    cameraFov: { name: 'FOV da Câmera', desc: 'Calcule o campo de visão a partir do tamanho do sensor e comprimento focal' },
    trajectoryGenerator: { name: 'Gerador de Trajetórias', desc: 'Gere e visualize trajetórias: círculo, espiral, Lissajous, Bezier e splines' },
    motionProfile: { name: 'Perfil de Movimento', desc: 'Projete perfis de movimento trapezoidal e em S com gráficos de posição, velocidade e aceleração' }
  },
  actions: {
    calculate: 'Calcular', reset: 'Resetar', copy: 'Copiar', export: 'Exportar', import: 'Importar',
    addRow: 'Adicionar Junta', removeRow: 'Remover', clear: 'Limpar', apply: 'Aplicar', close: 'Fechar',
    favorite: 'Adicionar aos Favoritos', unfavorite: 'Remover dos Favoritos', help: 'Ajuda',
    exportJson: 'Exportar JSON', exportCsv: 'Exportar CSV', exportPng: 'Exportar PNG',
    copyValue: 'Copiar Valor', copiedValue: 'Copiado!'
  },
  labels: {
    roll: 'Rolagem', pitch: 'Arfagem', yaw: 'Guinada', quaternion: 'Quaternion', matrix: 'Matriz',
    axisAngle: 'Eixo-Ângulo', rodrigues: 'Rodrigues', axis: 'Eixo', angle: 'Ângulo',
    degrees: 'graus', radians: 'radianos',
    input: 'Entrada', output: 'Saída', result: 'Resultado', formula: 'Fórmula',
    notes: 'Notas', references: 'Referências', examples: 'Exemplos',
    valid: 'Válida', invalid: 'Inválida', determinant: 'Determinante', eigenvalues: 'Autovalores',
    orthogonal: 'Ortogonal', error: 'Erro',
    kp: 'Ganho Proporcional (Kp)', ki: 'Ganho Integral (Ki)', kd: 'Ganho Derivativo (Kd)',
    overshoot: 'Sobressinal', settlingTime: 'Tempo de Acomodação', riseTime: 'Tempo de Subida', steadyState: 'Erro em Regime Permanente',
    linearVelocity: 'Velocidade Linear', angularVelocity: 'Velocidade Angular', wheelRadius: 'Raio da Roda',
    trackWidth: 'Largura da Trilha', leftWheel: 'Roda Esquerda', rightWheel: 'Roda Direita',
    wheelbase: 'Entre-eixos', steeringAngle: 'Ângulo de Esterçamento', turningRadius: 'Raio de Curvatura',
    innerWheel: 'Roda Interna', outerWheel: 'Roda Externa',
    joint: 'Junta', alpha: 'α (alfa)', a: 'a', d: 'd', theta: 'θ (teta)', type: 'Tipo',
    revolute: 'Rotacional', prismatic: 'Prismática',
    focalLength: 'Distância Focal', sensorWidth: 'Largura do Sensor', sensorHeight: 'Altura do Sensor',
    hFov: 'FOV Horizontal', vFov: 'FOV Vertical', dFov: 'FOV Diagonal',
    noiseDensity: 'Densidade de Ruído', biasInstability: 'Instabilidade de Offset', randomWalk: 'Caminhada Aleatória',
    samplingFreq: 'Frequência de Amostragem', arw: 'Caminhada Aleatória Angular', vrw: 'Caminhada Aleatória de Velocidade',
    maxVelocity: 'Velocidade Máxima', maxAccel: 'Aceleração Máxima', maxJerk: 'Jerk Máximo', distance: 'Distância',
    duration: 'Duração', position: 'Posição', velocity: 'Velocidade', acceleration: 'Aceleração', jerk: 'Jerk'
  },
  help: {
    rotationConverter: {
      desc: 'Converta entre representações comuns de rotação 3D usadas em robótica.',
      formula: 'Uma rotação pode ser representada como ângulos de Euler (rolagem, arfagem, guinada), quaternion q=[w,x,y,z], matriz de rotação 3×3 R (ortonormal, det=1) ou par eixo-ângulo (k̂, θ).',
      notes: 'Ângulos de Euler sofrem de bloqueio de gimbal próximo a ±90° de arfagem. Quaternions e matrizes de rotação são geralmente preferidos para computação numérica.'
    },
    pidTuner: {
      desc: 'Simule a resposta ao degrau de uma planta de segunda ordem controlada por PID.',
      formula: 'u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·ė(t). Modelo da planta: 1/(s²+s). Usa integração de Euler com dt=1ms.',
      notes: 'Aumente Kp para resposta mais rápida. Adicione Ki para eliminar erro em regime permanente. Adicione Kd para reduzir o sobressinal.'
    },
    dhCalculator: {
      desc: 'A convenção de Denavit-Hartenberg descreve a cinemática de manipuladores seriais com 4 parâmetros por junta.',
      formula: 'Tᵢ = Rot_z(θᵢ)·Trans_z(dᵢ)·Trans_x(aᵢ)·Rot_x(αᵢ)',
      notes: 'A pose do efetuador é T = T₁·T₂·...·Tₙ. Use o DH Modificado para robôs modernos (ex: baseados em URDF).'
    }
  },
  messages: {
    copied: 'Copiado para a área de transferência', exportSuccess: 'Exportado com sucesso', importSuccess: 'Importação bem-sucedida',
    importError: 'Falha na importação: formato inválido', noFavorites: 'Nenhum favorito ainda',
    addedFavorite: 'Adicionado aos favoritos', removedFavorite: 'Removido dos favoritos',
    invalidMatrix: 'Não é uma matriz de rotação válida', singularMatrix: 'Matriz singular (não invertível)'
  }
};
