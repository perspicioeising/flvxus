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

    const data = await request.json();
    const { name } = data;

    // Mock AI response for now - in production this would call an actual AI service
    const exerciseData = {
      description: `${name} é um exercício eficaz para desenvolvimento muscular que trabalha múltiplos grupos musculares simultaneamente.`,
      muscle_group: ["Peito", "Ombros"],
      equipment: ["Peso Livre"],
      variations: [
        `${name} com halter`,
        `${name} na máquina`,
        `${name} unilateral`
      ],
      tips: [
        "Mantenha a postura alinhada durante todo o movimento",
        "Respire de forma controlada",
        "Foque na contração muscular"
      ],
      common_errors: [
        "Arquear as costas",
        "Movimentação muito rápida",
        "Amplitude inadequada"
      ]
    };

    return NextResponse.json(exerciseData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating exercise data' },
      { status: 500 }
    );
  }
}