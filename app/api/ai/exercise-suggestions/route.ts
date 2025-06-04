// app/api/ai/exercise-suggestions/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { exerciseName } = await request.json();

    // Mock AI suggestions based on exercise name
    const suggestions = generateExerciseSuggestions(exerciseName);

    return NextResponse.json(suggestions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating suggestions' },
      { status: 500 }
    );
  }
}

function generateExerciseSuggestions(exerciseName: string) {
  // This is a mock implementation. In a real application, this would use an AI model.
  const exercisePatterns = {
    'supino': {
      description: 'Exercício multiarticular para desenvolvimento do peitoral',
      muscle_group: ['Peito', 'Ombros', 'Tríceps'],
      equipment: ['Barra', 'Banco'],
      variations: [
        'Supino inclinado',
        'Supino declinado',
        'Supino com halteres'
      ],
      tips: [
        'Mantenha os cotovelos em ângulo de 45 graus',
        'Retração escapular durante todo o movimento',
        'Respiração controlada: inspire na descida, expire na subida'
      ],
      common_errors: [
        'Arquear excessivamente as costas',
        'Quicar a barra no peito',
        'Não manter os punhos alinhados'
      ]
    },
    'agachamento': {
      description: 'Exercício fundamental para desenvolvimento dos membros inferiores',
      muscle_group: ['Pernas', 'Glúteos', 'Core'],
      equipment: ['Barra', 'Rack'],
      variations: [
        'Agachamento frontal',
        'Agachamento búlgaro',
        'Agachamento hack'
      ],
      tips: [
        'Mantenha o core ativado',
        'Joelhos alinhados com os pés',
        'Desça até a profundidade adequada'
      ],
      common_errors: [
        'Joelhos para dentro',
        'Levantar os calcanhares',
        'Curvar a coluna'
      ]
    }
  };

  // Default suggestions for unknown exercises
  const defaultSuggestions = {
    description: 'Novo exercício para desenvolvimento muscular',
    muscle_group: ['Core'],
    equipment: ['Peso Corporal'],
    variations: [],
    tips: [
      'Mantenha a forma correta durante todo o movimento',
      'Respire de maneira controlada',
      'Mantenha o core ativado'
    ],
    common_errors: [
      'Execução muito rápida',
      'Falta de controle no movimento',
      'Postura incorreta'
    ]
  };

  // Search for pattern matches in exercise name
  const lowerName = exerciseName.toLowerCase();
  for (const [pattern, suggestions] of Object.entries(exercisePatterns)) {
    if (lowerName.includes(pattern)) {
      return suggestions;
    }
  }

  return defaultSuggestions;
}
