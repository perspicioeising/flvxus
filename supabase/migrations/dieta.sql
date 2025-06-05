-- Tabela de dietas
CREATE TABLE diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id), -- Pode ser o personal ou o próprio aluno
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
  dietary_style TEXT[], -- Array de estilos (vegetarian, vegan, omnivore, low_carb, etc)
  food_preferences TEXT[], -- Array de preferências (common, nutrient_rich, easy_prep, ready_made)
  
  -- Restrições
  restrictions TEXT[], -- Array de restrições alimentares
  custom_restrictions TEXT,
  
  -- Dados da avaliação física (se usada)
  used_physical_assessment BOOLEAN DEFAULT FALSE,
  physical_assessment_id UUID REFERENCES physical_assessments(id),
  
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
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de refeições da dieta
CREATE TABLE diet_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID REFERENCES diets(id) ON DELETE CASCADE,
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
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de alimentos da refeição
CREATE TABLE diet_meal_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES diet_meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- g, ml, unidade, colher, xícara, etc
  
  -- Macronutrientes por porção
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  
  -- Substituições sugeridas
  substitutions TEXT[],
  notes TEXT,
  
  -- Ordem de exibição
  order_index INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de lista de compras
CREATE TABLE diet_shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID REFERENCES diets(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- proteinas, carboidratos, vegetais, frutas, laticinios, etc
  item_name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  
  -- Ordem de exibição
  order_index INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de histórico de dietas
CREATE TABLE diet_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID REFERENCES diets(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_diets_student_id ON diets(student_id);
CREATE INDEX idx_diets_created_by ON diets(created_by);
CREATE INDEX idx_diets_tenant_id ON diets(tenant_id);
CREATE INDEX idx_diets_status ON diets(status);
CREATE INDEX idx_diet_meals_diet_id ON diet_meals(diet_id);
CREATE INDEX idx_diet_meal_foods_meal_id ON diet_meal_foods(meal_id);
CREATE INDEX idx_diet_shopping_lists_diet_id ON diet_shopping_lists(diet_id);
CREATE INDEX idx_diet_history_diet_id ON diet_history(diet_id);
CREATE INDEX idx_diet_history_student_id ON diet_history(student_id);

-- RLS (Row Level Security)
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para dietas (personal vê todas, aluno vê apenas as suas)
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

-- Políticas similares para as outras tabelas
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

-- Triggers para updated_at
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