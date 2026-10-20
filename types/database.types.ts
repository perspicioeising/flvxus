// =============================================================================
// Flvxus v2 — Tipos do banco (types/database.types.ts)
// =============================================================================
// ATENÇÃO: este arquivo foi ESCRITO À MÃO porque o Docker não está disponível
// neste ambiente, então `supabase start` / `supabase gen types --local` não
// sobem aqui (ver docs/pendencias.md). Ele reflete fielmente o schema das
// migrations em supabase/migrations/, mas DEVE ser REGENERADO com o CLI assim
// que o banco local (ou o projeto hospedado) estiver disponível:
//
//   supabase gen types typescript --local > types/database.types.ts
//   # ou, contra o projeto hospedado:
//   supabase gen types typescript --project-id <REF> > types/database.types.ts
//
// A fonte única de verdade dos tipos é o banco; este arquivo é um substituto
// temporário com a MESMA forma que o gerador do Supabase produz.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// -----------------------------------------------------------------------------
// Enums (§6.1 de docs/architecture.md)
// -----------------------------------------------------------------------------
export type UserRole = 'trainer' | 'student';
export type StudentStatus = 'active' | 'inactive' | 'pending' | 'archived';
export type GoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'conditioning'
  | 'rehabilitation'
  | 'performance';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type AssessmentProtocol = 'pollock_3' | 'pollock_7' | 'guedes' | 'durnin' | 'manual';
export type PlanStatus = 'draft' | 'pending_review' | 'approved' | 'released' | 'archived';
export type AiJobType = 'generate_diet' | 'suggest_workout' | 'analyze_assessment' | 'weekly_adherence';
export type AiJobStatus = 'pending' | 'succeeded' | 'failed' | 'rejected';
export type AppointmentStatus = 'scheduled' | 'done' | 'canceled' | 'no_show';
export type ConsentType = 'data_processing' | 'health_data' | 'ai_processing' | 'terms';
export type DataRequestType = 'export' | 'delete';
export type DataRequestStatus = 'requested' | 'processing' | 'completed' | 'rejected';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          plan: string;
          max_students: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          plan?: string;
          max_students?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          plan?: string;
          max_students?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          tenant_id: string;
          role: UserRole;
          trainer_id: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          gender: string | null;
          height_cm: number | null;
          status: StudentStatus | null;
          experience_level: ExperienceLevel | null;
          goal: GoalType | null;
          total_points: number;
          last_workout_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tenant_id: string;
          role: UserRole;
          trainer_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          height_cm?: number | null;
          status?: StudentStatus | null;
          experience_level?: ExperienceLevel | null;
          goal?: GoalType | null;
          total_points?: number;
          last_workout_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tenant_id?: string;
          role?: UserRole;
          trainer_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          height_cm?: number | null;
          status?: StudentStatus | null;
          experience_level?: ExperienceLevel | null;
          goal?: GoalType | null;
          total_points?: number;
          last_workout_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          muscle_groups: string[];
          equipment: string[];
          video_url: string | null;
          thumbnail_url: string | null;
          instructions: string | null;
          tips: string[];
          common_errors: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name: string;
          muscle_groups?: string[];
          equipment?: string[];
          video_url?: string | null;
          thumbnail_url?: string | null;
          instructions?: string | null;
          tips?: string[];
          common_errors?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          name?: string;
          muscle_groups?: string[];
          equipment?: string[];
          video_url?: string | null;
          thumbnail_url?: string | null;
          instructions?: string | null;
          tips?: string[];
          common_errors?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          is_template: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          is_template?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          is_template?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          order_index: number;
          sets: number | null;
          reps: string | null;
          rest_seconds: number | null;
          target_load: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          order_index?: number;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          target_load?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_id?: string;
          order_index?: number;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          target_load?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      workout_plans: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          name: string;
          status: PlanStatus;
          source_workout_id: string | null;
          released_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          name: string;
          status?: PlanStatus;
          source_workout_id?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          trainer_id?: string;
          name?: string;
          status?: PlanStatus;
          source_workout_id?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_plan_items: {
        Row: {
          id: string;
          plan_id: string;
          exercise_id: string;
          weekday: number | null;
          order_index: number;
          sets: number | null;
          reps: string | null;
          rest_seconds: number | null;
          target_load: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          exercise_id: string;
          weekday?: number | null;
          order_index?: number;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          target_load?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          exercise_id?: string;
          weekday?: number | null;
          order_index?: number;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          target_load?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string | null;
          student_id: string;
          started_at: string;
          finished_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plan_id?: string | null;
          student_id: string;
          started_at?: string;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          plan_id?: string | null;
          student_id?: string;
          started_at?: string;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_set_logs: {
        Row: {
          id: string;
          session_id: string;
          plan_item_id: string | null;
          set_number: number;
          reps_done: number | null;
          load_done: number | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          plan_item_id?: string | null;
          set_number: number;
          reps_done?: number | null;
          load_done?: number | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          plan_item_id?: string | null;
          set_number?: number;
          reps_done?: number | null;
          load_done?: number | null;
          completed?: boolean;
          created_at?: string;
        };
      };
      physical_assessments: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          assessed_at: string;
          age: number | null;
          gender: string | null;
          protocol: AssessmentProtocol | null;
          weight_kg: number | null;
          height_cm: number | null;
          bmi: number | null;
          body_fat_pct: number | null;
          lean_mass_kg: number | null;
          fat_mass_kg: number | null;
          muscle_mass_kg: number | null;
          neck_cm: number | null;
          shoulder_cm: number | null;
          chest_cm: number | null;
          waist_cm: number | null;
          abdomen_cm: number | null;
          hip_cm: number | null;
          left_arm_cm: number | null;
          right_arm_cm: number | null;
          left_thigh_cm: number | null;
          right_thigh_cm: number | null;
          left_calf_cm: number | null;
          right_calf_cm: number | null;
          skf_triceps: number | null;
          skf_subscapular: number | null;
          skf_chest: number | null;
          skf_midaxillary: number | null;
          skf_suprailiac: number | null;
          skf_abdominal: number | null;
          skf_thigh: number | null;
          measurements: Json;
          anamnesis: Json | null;
          goal: GoalType | null;
          ai_analysis: Json | null;
          ai_recommendations: Json | null;
          photos_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          assessed_at?: string;
          age?: number | null;
          gender?: string | null;
          protocol?: AssessmentProtocol | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          bmi?: number | null;
          body_fat_pct?: number | null;
          lean_mass_kg?: number | null;
          fat_mass_kg?: number | null;
          muscle_mass_kg?: number | null;
          neck_cm?: number | null;
          shoulder_cm?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          abdomen_cm?: number | null;
          hip_cm?: number | null;
          left_arm_cm?: number | null;
          right_arm_cm?: number | null;
          left_thigh_cm?: number | null;
          right_thigh_cm?: number | null;
          left_calf_cm?: number | null;
          right_calf_cm?: number | null;
          skf_triceps?: number | null;
          skf_subscapular?: number | null;
          skf_chest?: number | null;
          skf_midaxillary?: number | null;
          skf_suprailiac?: number | null;
          skf_abdominal?: number | null;
          skf_thigh?: number | null;
          measurements?: Json;
          anamnesis?: Json | null;
          goal?: GoalType | null;
          ai_analysis?: Json | null;
          ai_recommendations?: Json | null;
          photos_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          trainer_id?: string;
          assessed_at?: string;
          age?: number | null;
          gender?: string | null;
          protocol?: AssessmentProtocol | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          bmi?: number | null;
          body_fat_pct?: number | null;
          lean_mass_kg?: number | null;
          fat_mass_kg?: number | null;
          muscle_mass_kg?: number | null;
          neck_cm?: number | null;
          shoulder_cm?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          abdomen_cm?: number | null;
          hip_cm?: number | null;
          left_arm_cm?: number | null;
          right_arm_cm?: number | null;
          left_thigh_cm?: number | null;
          right_thigh_cm?: number | null;
          left_calf_cm?: number | null;
          right_calf_cm?: number | null;
          skf_triceps?: number | null;
          skf_subscapular?: number | null;
          skf_chest?: number | null;
          skf_midaxillary?: number | null;
          skf_suprailiac?: number | null;
          skf_abdominal?: number | null;
          skf_thigh?: number | null;
          measurements?: Json;
          anamnesis?: Json | null;
          goal?: GoalType | null;
          ai_analysis?: Json | null;
          ai_recommendations?: Json | null;
          photos_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posture_assessments: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          assessed_at: string;
          front_image_path: string | null;
          side_image_path: string | null;
          back_image_path: string | null;
          ai_analysis: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          assessed_at?: string;
          front_image_path?: string | null;
          side_image_path?: string | null;
          back_image_path?: string | null;
          ai_analysis?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          trainer_id?: string;
          assessed_at?: string;
          front_image_path?: string | null;
          side_image_path?: string | null;
          back_image_path?: string | null;
          ai_analysis?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      diets: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          status: PlanStatus;
          goal: GoalType | null;
          target_kcal: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          restrictions: string[];
          notes: string | null;
          based_on_assessment_id: string | null;
          released_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          trainer_id: string;
          status?: PlanStatus;
          goal?: GoalType | null;
          target_kcal?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          restrictions?: string[];
          notes?: string | null;
          based_on_assessment_id?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          trainer_id?: string;
          status?: PlanStatus;
          goal?: GoalType | null;
          target_kcal?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          restrictions?: string[];
          notes?: string | null;
          based_on_assessment_id?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      diet_meals: {
        Row: {
          id: string;
          diet_id: string;
          name: string;
          time: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          diet_id: string;
          name: string;
          time?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          diet_id?: string;
          name?: string;
          time?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      diet_meal_foods: {
        Row: {
          id: string;
          meal_id: string;
          food_name: string;
          quantity: number | null;
          unit: string | null;
          kcal: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_id: string;
          food_name: string;
          quantity?: number | null;
          unit?: string | null;
          kcal?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_id?: string;
          food_name?: string;
          quantity?: number | null;
          unit?: string | null;
          kcal?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          created_at?: string;
        };
      };
      diet_shopping_lists: {
        Row: {
          id: string;
          diet_id: string;
          items: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          diet_id: string;
          items?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          diet_id?: string;
          items?: Json;
          created_at?: string;
        };
      };
      diet_history: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          diet_id: string;
          event: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          diet_id: string;
          event: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          diet_id?: string;
          event?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          tenant_id: string;
          trainer_id: string;
          student_id: string | null;
          starts_at: string;
          ends_at: string | null;
          status: AppointmentStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          trainer_id: string;
          student_id?: string | null;
          starts_at: string;
          ends_at?: string | null;
          status?: AppointmentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          trainer_id?: string;
          student_id?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          status?: AppointmentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          points: number;
          rule: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          points?: number;
          rule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          points?: number;
          rule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
      };
      ai_usage_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          job_type: AiJobType;
          model: string | null;
          input_tokens: number | null;
          output_tokens: number | null;
          estimated_cost_usd: number | null;
          status: string | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          job_type: AiJobType;
          model?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          estimated_cost_usd?: number | null;
          status?: string | null;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          job_type?: AiJobType;
          model?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          estimated_cost_usd?: number | null;
          status?: string | null;
          latency_ms?: number | null;
          created_at?: string;
        };
      };
      ai_generations: {
        Row: {
          id: string;
          tenant_id: string;
          created_by: string | null;
          job_type: AiJobType;
          status: AiJobStatus;
          input: Json | null;
          output: Json | null;
          target_table: string | null;
          target_id: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          created_by?: string | null;
          job_type: AiJobType;
          status?: AiJobStatus;
          input?: Json | null;
          output?: Json | null;
          target_table?: string | null;
          target_id?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          created_by?: string | null;
          job_type?: AiJobType;
          status?: AiJobStatus;
          input?: Json | null;
          output?: Json | null;
          target_table?: string | null;
          target_id?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      consent_records: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          consent_type: ConsentType;
          granted: boolean;
          granted_at: string | null;
          revoked_at: string | null;
          policy_version: string | null;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          consent_type: ConsentType;
          granted: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          policy_version?: string | null;
          ip?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          consent_type?: ConsentType;
          granted?: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          policy_version?: string | null;
          ip?: string | null;
          created_at?: string;
        };
      };
      data_requests: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          request_type: DataRequestType;
          status: DataRequestStatus;
          requested_at: string;
          completed_at: string | null;
          export_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          request_type: DataRequestType;
          status?: DataRequestStatus;
          requested_at?: string;
          completed_at?: string | null;
          export_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          request_type?: DataRequestType;
          status?: DataRequestStatus;
          requested_at?: string;
          completed_at?: string | null;
          export_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      app_tenant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      app_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
    };
    Enums: {
      user_role: UserRole;
      student_status: StudentStatus;
      goal_type: GoalType;
      experience_level: ExperienceLevel;
      assessment_protocol: AssessmentProtocol;
      plan_status: PlanStatus;
      ai_job_type: AiJobType;
      ai_job_status: AiJobStatus;
      appointment_status: AppointmentStatus;
      consent_type: ConsentType;
      data_request_type: DataRequestType;
      data_request_status: DataRequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Atalhos utilitários no estilo do gerador do Supabase.
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
