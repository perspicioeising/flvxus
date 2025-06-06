-- Primeiro, vamos dropar as constraints problemáticas e recriar corretamente

-- Dropar constraints antigas se existirem
ALTER TABLE diets DROP CONSTRAINT IF EXISTS diets_student_user_id_fkey;
ALTER TABLE diets DROP CONSTRAINT IF EXISTS diets_created_by_fkey;

-- Recriar a tabela de dietas com as constraints corretas
-- Tabela de dietas
CREATE TABLE IF NOT EXISTS diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Informações básicas
  age INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  height NUMERIC,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'athlete')),
  
  -- Objetivos
  goal TEXT CHECK (goal IN ('muscle_gain', 'fat_loss', 'reeducation', 'performance', 'maintenance', 'other')),
  goal_description TEXT, -- Para quando for "other"
  
  -- Perfil financeiro
  budget_profile TEXT CHECK (budget_profile IN ('economic', 'intermediate', 'free')),
  meals_per_day INTEGER CHECK (meals_per_day >= 1 AND meals_per_day <= 6),
  
  -- Preferências
  dietary_style TEXT[] DEFAULT '{}', -- Array de estilos (vegetarian, vegan, omnivore, low_carb, etc)
  food_preferences TEXT[] DEFAULT '{}', -- Array de preferências (common, nutrient_rich, easy_prep, ready_made)
  
  -- Restrições
  restrictions TEXT[] DEFAULT '{}', -- Array de restrições alimentares
  custom_restrictions TEXT,
  
  -- Dados da avaliação física (se usada)
  used_physical_assessment BOOLEAN DEFAULT FALSE,
  physical_assessment_id UUID REFERENCES physical_assessments(id) ON DELETE SET NULL,
  
  -- Dados calculados/gerados
  target_calories NUMERIC,
  target_protein NUMERIC,
  target_carbs NUMERIC,
  target_fat NUMERIC,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Verificar se as outras tabelas existem, senão criar
-- Tabela de refeições da dieta
CREATE TABLE IF NOT EXISTS diet_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID NOT NULL REFERENCES diets(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL, -- breakfast, morning_snack, lunch, afternoon_snack, dinner, evening_snack
  meal_time TIME,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Macronutrientes
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  
  -- Ordem de exibição
  order_index INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de alimentos da refeição
CREATE TABLE IF NOT EXISTS diet_meal_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES diet_meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- g, ml, unidade, colher, xícara, etc
  
  -- Macronutrientes por porção
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  
  -- Substituições sugeridas
  substitutions TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- Ordem de exibição
  order_index INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de lista de compras
CREATE TABLE IF NOT EXISTS diet_shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID NOT NULL REFERENCES diets(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- proteinas, carboidratos, vegetais, frutas, laticinios, etc
  item_name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  
  -- Ordem de exibição
  order_index INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de histórico de dietas
CREATE TABLE IF NOT EXISTS diet_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID NOT NULL REFERENCES diets(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Dados de progresso
  initial_weight NUMERIC,
  final_weight NUMERIC,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Recriar índices para performance
DROP INDEX IF EXISTS idx_diets_student_id;
DROP INDEX IF EXISTS idx_diets_created_by;
DROP INDEX IF EXISTS idx_diets_tenant_id;
DROP INDEX IF EXISTS idx_diets_status;
DROP INDEX IF EXISTS idx_diet_meals_diet_id;
DROP INDEX IF EXISTS idx_diet_meal_foods_meal_id;
DROP INDEX IF EXISTS idx_diet_shopping_lists_diet_id;
DROP INDEX IF EXISTS idx_diet_history_diet_id;
DROP INDEX IF EXISTS idx_diet_history_student_id;

CREATE INDEX idx_diets_student_id ON diets(student_id);
CREATE INDEX idx_diets_created_by ON diets(created_by);
CREATE INDEX idx_diets_tenant_id ON diets(tenant_id);
CREATE INDEX idx_diets_status ON diets(status);
CREATE INDEX idx_diet_meals_diet_id ON diet_meals(diet_id);
CREATE INDEX idx_diet_meal_foods_meal_id ON diet_meal_foods(meal_id);
CREATE INDEX idx_diet_shopping_lists_diet_id ON diet_shopping_lists(diet_id);
CREATE INDEX idx_diet_history_diet_id ON diet_history(diet_id);
CREATE INDEX idx_diet_history_student_id ON diet_history(student_id);

-- Verificar se as funções de trigger existem
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar triggers para updated_at
DROP TRIGGER IF EXISTS update_diets_updated_at ON diets;
DROP TRIGGER IF EXISTS update_diet_meals_updated_at ON diet_meals;
DROP TRIGGER IF EXISTS update_diet_meal_foods_updated_at ON diet_meal_foods;
DROP TRIGGER IF EXISTS update_diet_shopping_lists_updated_at ON diet_shopping_lists;
DROP TRIGGER IF EXISTS update_diet_history_updated_at ON diet_history;

CREATE TRIGGER update_diets_updated_at BEFORE UPDATE ON diets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_meals_updated_at BEFORE UPDATE ON diet_meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_meal_foods_updated_at BEFORE UPDATE ON diet_meal_foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_shopping_lists_updated_at BEFORE UPDATE ON diet_shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_history_updated_at BEFORE UPDATE ON diet_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) se não estiver habilitado
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_history ENABLE ROW LEVEL SECURITY;

-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Trainers can view all diets in their tenant" ON diets;
DROP POLICY IF EXISTS "Students can view their own diets" ON diets;
DROP POLICY IF EXISTS "Users can create diets" ON diets;
DROP POLICY IF EXISTS "Users can update their own diets" ON diets;
DROP POLICY IF EXISTS "Users can view diet meals" ON diet_meals;

-- Recriar políticas RLS para dietas
CREATE POLICY "Trainers can view all diets in their tenant" ON diets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'trainer'
      AND profiles.tenant_id = diets.tenant_id
    )
  );

CREATE POLICY "Students can view their own diets" ON diets
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create diets" ON diets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = diets.tenant_id
    )
  );

CREATE POLICY "Users can update their own diets" ON diets
  FOR UPDATE USING (
    created_by IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para diet_meals
CREATE POLICY "Users can view diet meals" ON diet_meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diets
      WHERE diets.id = diet_meals.diet_id
      AND (
        diets.student_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'trainer'
          AND profiles.tenant_id = diet_meals.tenant_id
        )
      )
    )
  );

CREATE POLICY "Users can insert diet meals" ON diet_meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = diet_meals.tenant_id
    )
  );

-- Políticas para diet_meal_foods
CREATE POLICY "Users can view diet meal foods" ON diet_meal_foods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diet_meals dm
      JOIN diets d ON d.id = dm.diet_id
      WHERE dm.id = diet_meal_foods.meal_id
      AND (
        d.student_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'trainer'
          AND profiles.tenant_id = diet_meal_foods.tenant_id
        )
      )
    )
  );

CREATE POLICY "Users can insert diet meal foods" ON diet_meal_foods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = diet_meal_foods.tenant_id
    )
  );

-- Políticas para diet_shopping_lists
CREATE POLICY "Users can view diet shopping lists" ON diet_shopping_lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diets
      WHERE diets.id = diet_shopping_lists.diet_id
      AND (
        diets.student_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'trainer'
          AND profiles.tenant_id = diet_shopping_lists.tenant_id
        )
      )
    )
  );

CREATE POLICY "Users can insert diet shopping lists" ON diet_shopping_lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.tenant_id = diet_shopping_lists.tenant_id
    )
  );