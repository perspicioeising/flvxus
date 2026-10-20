import notificationService from '@/webhooks/notification-service';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verificar se é uma chamada autorizada (ex: Vercel Cron ou similar)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar estudantes que têm treino hoje e ainda não treinaram
    const today = new Date().toISOString().split('T')[0];
    
    const { data: studentsToRemind } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        phone,
        preferred_training_time
      `)
      .eq('role', 'student')
      .eq('status', 'active')
      .not('phone', 'is', null);

    if (studentsToRemind) {
      for (const student of studentsToRemind) {
        // Verificar se já treinou hoje
        const { data: todayWorkout } = await supabase
          .from('workout_progress')
          .select('id')
          .eq('student_id', student.id)
          .gte('completed_at', `${today}T00:00:00`)
          .single();

        if (!todayWorkout) {
          // Verificar se está no horário preferido (±1 hora)
          const now = new Date();
          const currentHour = now.getHours();
          const preferredHour = student.preferred_training_time ? 
            parseInt(student.preferred_training_time.split(':')[0]) : 18;

          if (Math.abs(currentHour - preferredHour) <= 1) {
            await notificationService.sendWorkoutReminder(student.id);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      remindersSent: studentsToRemind?.length || 0 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}