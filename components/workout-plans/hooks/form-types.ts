// /components/workout-plans/types/form-types.ts

// Tipos específicos para o formulário que garantem campos obrigatórios
export interface FormWorkout {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  exercises_count?: number;
  estimated_duration?: number;
}

export interface FormSelectedWorkout {
  workout: FormWorkout;
  day_of_week: number;
}

export interface FormData {
  name: string;
  description: string;
  student_id: string;
  start_date: string;
  end_date: string;
  schedule: number[];
}