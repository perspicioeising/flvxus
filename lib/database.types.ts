export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          name: string
          description: string
          video_url: string | null
          muscle_group: string[]
          equipment: string[]
          variations: string[]
          tips: string[]
          common_errors: string[]
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          video_url?: string | null
          muscle_group: string[]
          equipment: string[]
          variations?: string[]
          tips?: string[]
          common_errors?: string[]
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          video_url?: string | null
          muscle_group?: string[]
          equipment?: string[]
          variations?: string[]
          tips?: string[]
          common_errors?: string[]
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      physical_assessments: {
        Row: {
          id: string
          student_id: string
          weight: number
          height: number
          body_fat: number | null
          muscle_mass: number | null
          bmi: number | null
          measurements: Json | null
          notes: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          student_id: string
          weight: number
          height: number
          body_fat?: number | null
          muscle_mass?: number | null
          bmi?: number | null
          measurements?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          student_id?: string
          weight?: number
          height?: number
          body_fat?: number | null
          muscle_mass?: number | null
          bmi?: number | null
          measurements?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      posture_assessments: {
        Row: {
          id: string
          student_id: string
          front_image_url: string | null
          side_image_url: string | null
          back_image_url: string | null
          ai_analysis: Json | null
          recommendations: string | null
          notes: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          student_id: string
          front_image_url?: string | null
          side_image_url?: string | null
          back_image_url?: string | null
          ai_analysis?: Json | null
          recommendations?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          student_id?: string
          front_image_url?: string | null
          side_image_url?: string | null
          back_image_url?: string | null
          ai_analysis?: Json | null
          recommendations?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          avatar_url: string | null
          email: string
          phone: string | null
          role: 'trainer' | 'student'
          trainer_id: string | null
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          avatar_url?: string | null
          email: string
          phone?: string | null
          role: 'trainer' | 'student'
          trainer_id?: string | null
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string | null
          email?: string
          phone?: string | null
          role?: 'trainer' | 'student'
          trainer_id?: string | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          plan: 'free' | 'platinum' | 'gold'
          plan_type: 'monthly' | 'annual'
          max_students: number
          max_trainers: number
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan: 'free' | 'platinum' | 'gold'
          plan_type: 'monthly' | 'annual'
          max_students: number
          max_trainers: number
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: 'free' | 'platinum' | 'gold'
          plan_type?: 'monthly' | 'annual'
          max_students?: number
          max_trainers?: number
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          name: string
          description: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          goal: string
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          goal: string
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          goal?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          sets: number
          reps: number | null
          duration: number | null
          rest: number
          notes: string | null
          order: number
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          sets: number
          reps?: number | null
          duration?: number | null
          rest: number
          notes?: string | null
          order: number
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          sets?: number
          reps?: number | null
          duration?: number | null
          rest?: number
          notes?: string | null
          order?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      workout_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          student_id: string
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          student_id: string
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          student_id?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      workout_plan_items: {
        Row: {
          id: string
          workout_plan_id: string
          workout_id: string
          day_of_week: number
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          workout_plan_id: string
          workout_id: string
          day_of_week: number
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          workout_plan_id?: string
          workout_id?: string
          day_of_week?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      appointments: {
        Row: {
          id: string
          trainer_id: string
          student_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          trainer_id: string
          student_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          trainer_id?: string
          student_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}