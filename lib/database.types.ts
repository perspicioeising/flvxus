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
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          criteria_type: string
          criteria_value: number
          points_reward: number
          icon: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          criteria_type: string
          criteria_value: number
          points_reward: number
          icon?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          criteria_type?: string
          criteria_value?: number
          points_reward?: number
          icon?: string | null
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
      diets: {
        Row: {
          id: string
          student_id: string
          created_by: string
          name: string
          description: string | null
          age: number
          weight: number
          height: number | null
          gender: 'male' | 'female' | 'other'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete'
          goal: 'muscle_gain' | 'fat_loss' | 'reeducation' | 'performance' | 'maintenance' | 'other'
          goal_description: string | null
          budget_profile: 'economic' | 'intermediate' | 'free'
          meals_per_day: number
          dietary_style: string[]
          food_preferences: string[]
          restrictions: string[]
          custom_restrictions: string | null
          used_physical_assessment: boolean
          physical_assessment_id: string | null
          target_calories: number | null
          target_protein: number | null
          target_carbs: number | null
          target_fat: number | null
          status: 'active' | 'inactive' | 'archived'
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          student_id: string
          created_by: string
          name: string
          description?: string | null
          age: number
          weight: number
          height?: number | null
          gender: 'male' | 'female' | 'other'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete'
          goal: 'muscle_gain' | 'fat_loss' | 'reeducation' | 'performance' | 'maintenance' | 'other'
          goal_description?: string | null
          budget_profile: 'economic' | 'intermediate' | 'free'
          meals_per_day: number
          dietary_style?: string[]
          food_preferences?: string[]
          restrictions?: string[]
          custom_restrictions?: string | null
          used_physical_assessment?: boolean
          physical_assessment_id?: string | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          student_id?: string
          created_by?: string
          name?: string
          description?: string | null
          age?: number
          weight?: number
          height?: number | null
          gender?: 'male' | 'female' | 'other'
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete'
          goal?: 'muscle_gain' | 'fat_loss' | 'reeducation' | 'performance' | 'maintenance' | 'other'
          goal_description?: string | null
          budget_profile?: 'economic' | 'intermediate' | 'free'
          meals_per_day?: number
          dietary_style?: string[]
          food_preferences?: string[]
          restrictions?: string[]
          custom_restrictions?: string | null
          used_physical_assessment?: boolean
          physical_assessment_id?: string | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      diet_meals: {
        Row: {
          id: string
          diet_id: string
          meal_type: string
          meal_time: string | null
          name: string
          description: string | null
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          fiber: number | null
          order_index: number
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          diet_id: string
          meal_type: string
          meal_time?: string | null
          name: string
          description?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          order_index: number
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          diet_id?: string
          meal_type?: string
          meal_time?: string | null
          name?: string
          description?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      diet_meal_foods: {
        Row: {
          id: string
          meal_id: string
          food_name: string
          quantity: number
          unit: string
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          substitutions: string[]
          notes: string | null
          order_index: number
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_name: string
          quantity: number
          unit: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          substitutions?: string[]
          notes?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_name?: string
          quantity?: number
          unit?: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          substitutions?: string[]
          notes?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      diet_shopping_lists: {
        Row: {
          id: string
          diet_id: string
          category: string
          item_name: string
          quantity: string | null
          notes: string | null
          order_index: number
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          diet_id: string
          category: string
          item_name: string
          quantity?: string | null
          notes?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          diet_id?: string
          category?: string
          item_name?: string
          quantity?: string | null
          notes?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      diet_history: {
        Row: {
          id: string
          diet_id: string
          student_id: string
          started_at: string
          ended_at: string | null
          notes: string | null
          initial_weight: number | null
          final_weight: number | null
          satisfaction_rating: number | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          diet_id: string
          student_id: string
          started_at?: string
          ended_at?: string | null
          notes?: string | null
          initial_weight?: number | null
          final_weight?: number | null
          satisfaction_rating?: number | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          diet_id?: string
          student_id?: string
          started_at?: string
          ended_at?: string | null
          notes?: string | null
          initial_weight?: number | null
          final_weight?: number | null
          satisfaction_rating?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      exercise_progress: {
        Row: {
          id: string
          student_id: string
          workout_id: string
          exercise_id: string
          weight: number | null
          notes: string | null
          created_at: string
          updated_at: string
          tenant_id: string
          set_weights: number[] | null
        }
        Insert: {
          id?: string
          student_id: string
          workout_id: string
          exercise_id: string
          weight?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
          set_weights?: number[] | null
        }
        Update: {
          id?: string
          student_id?: string
          workout_id?: string
          exercise_id?: string
          weight?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id?: string
          set_weights?: number[] | null
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string
          video_url: string | null
          audio_url: string | null
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
          audio_url?: string | null
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
          audio_url?: string | null
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
          protocol: string
          date: string
          gender: string
          age: number
          neck: number | null
          shoulders: number | null
          chest: number | null
          abdomen: number | null
          waist: number | null
          hips: number | null
          left_arm: number | null
          right_arm: number | null
          left_thigh: number | null
          right_thigh: number | null
          left_calf: number | null
          right_calf: number | null
          triceps: number | null
          abdominal: number | null
          suprailiac: number | null
          body_density: number | null
          fat_percentage: number | null
          fat_mass: number | null
          lean_mass: number | null
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
          protocol: string
          date: string
          gender: string
          age: number
          neck?: number | null
          shoulders?: number | null
          chest?: number | null
          abdomen?: number | null
          waist?: number | null
          hips?: number | null
          left_arm?: number | null
          right_arm?: number | null
          left_thigh?: number | null
          right_thigh?: number | null
          left_calf?: number | null
          right_calf?: number | null
          triceps?: number | null
          abdominal?: number | null
          suprailiac?: number | null
          body_density?: number | null
          fat_percentage?: number | null
          fat_mass?: number | null
          lean_mass?: number | null
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
          protocol?: string
          date?: string
          gender?: string
          age?: number
          neck?: number | null
          shoulders?: number | null
          chest?: number | null
          abdomen?: number | null
          waist?: number | null
          hips?: number | null
          left_arm?: number | null
          right_arm?: number | null
          left_thigh?: number | null
          right_thigh?: number | null
          left_calf?: number | null
          right_calf?: number | null
          triceps?: number | null
          abdominal?: number | null
          suprailiac?: number | null
          body_density?: number | null
          fat_percentage?: number | null
          fat_mass?: number | null
          lean_mass?: number | null
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
          birth_date: string | null
          gender: string | null
          height: number | null
          weight: number | null
          goals: string[] | null
          medical_conditions: string | null
          emergency_contact: string | null
          preferred_training_time: string | null
          experience_level: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'suspended'
          total_points: number
          last_workout_date: string | null
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
          birth_date?: string | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          goals?: string[] | null
          medical_conditions?: string | null
          emergency_contact?: string | null
          preferred_training_time?: string | null
          experience_level?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          total_points?: number
          last_workout_date?: string | null
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
          birth_date?: string | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          goals?: string[] | null
          medical_conditions?: string | null
          emergency_contact?: string | null
          preferred_training_time?: string | null
          experience_level?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          total_points?: number
          last_workout_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_files: {
        Row: {
          id: string
          student_id: string
          file_type: string
          file_url: string
          file_name: string
          is_shared: boolean
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          student_id: string
          file_type: string
          file_url: string
          file_name: string
          is_shared?: boolean
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          student_id?: string
          file_type?: string
          file_url?: string
          file_name?: string
          is_shared?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string
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
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
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
      workout_history: {
        Row: {
          id: string
          student_id: string
          workout_id: string
          completed_at: string
          duration: number
          exercises_completed: number
          total_weight: number | null
          notes: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          student_id: string
          workout_id: string
          completed_at: string
          duration: number
          exercises_completed: number
          total_weight?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          student_id?: string
          workout_id?: string
          completed_at?: string
          duration?: number
          exercises_completed?: number
          total_weight?: number | null
          notes?: string | null
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
      workouts: {
        Row: {
          id: string
          name: string
          description: string | null
          level: string | null
          goal: string | null
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          level?: string | null
          goal?: string | null
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          level?: string | null
          goal?: string | null
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