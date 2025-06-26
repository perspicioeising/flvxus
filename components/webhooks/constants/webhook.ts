export const WEBHOOK_STEPS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    shortTitle: 'Básico',
    description: 'Nome e URL do webhook',
    color: 'achievement-workout'
  },
  {
    id: 'events',
    title: 'Eventos',
    shortTitle: 'Eventos',
    description: 'Selecione os eventos que quer monitorar',
    color: 'achievement-exercise'
  },
  {
    id: 'config',
    title: 'Configurações',
    shortTitle: 'Config',
    description: 'Timeout, retry e headers customizados',
    color: 'achievement-weight'
  },
  {
    id: 'review',
    title: 'Revisão',
    shortTitle: 'Revisar',
    description: 'Revise e teste seu webhook',
    color: 'achievement-consecutive'
  }
];

export const AVAILABLE_EVENTS = [
  { 
    key: 'student.created', 
    label: 'Aluno Criado', 
    description: 'Quando um novo aluno é cadastrado',
    category: 'Estudantes',
    icon: '👤'
  },
  { 
    key: 'student.updated', 
    label: 'Aluno Atualizado', 
    description: 'Quando dados de um aluno são alterados',
    category: 'Estudantes',
    icon: '✏️'
  },
  { 
    key: 'student.status_changed', 
    label: 'Status do Aluno', 
    description: 'Quando status do aluno muda',
    category: 'Estudantes',
    icon: '🔄'
  },
  { 
    key: 'diet.created', 
    label: 'Dieta Criada', 
    description: 'Quando uma nova dieta é gerada',
    category: 'Nutrição',
    icon: '🥗'
  },
  { 
    key: 'diet.updated', 
    label: 'Dieta Atualizada', 
    description: 'Quando uma dieta é modificada',
    category: 'Nutrição',
    icon: '🍎'
  },
  { 
    key: 'workout.created', 
    label: 'Treino Criado', 
    description: 'Quando um novo treino é criado',
    category: 'Treinos',
    icon: '💪'
  },
  { 
    key: 'workout.completed', 
    label: 'Treino Completado', 
    description: 'Quando um aluno completa um treino',
    category: 'Treinos',
    icon: '✅'
  },
  { 
    key: 'assessment.created', 
    label: 'Avaliação Criada', 
    description: 'Quando uma avaliação física é feita',
    category: 'Avaliações',
    icon: '📊'
  },
  { 
    key: 'user.login', 
    label: 'Login de Usuário', 
    description: 'Quando alguém faz login no sistema',
    category: 'Sistema',
    icon: '🔐'
  }
];