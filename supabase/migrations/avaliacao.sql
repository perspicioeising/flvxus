-- Verificar se a tabela existe e tem todas as colunas necessárias
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'physical_assessments';

-- Se a tabela não existir, criar:
CREATE TABLE IF NOT EXISTS physical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  protocol TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  bmi NUMERIC,
  fat_percentage NUMERIC,
  fat_mass NUMERIC,
  lean_mass NUMERIC,
  body_density NUMERIC,
  
  -- Circunferências (cm)
  neck NUMERIC,
  shoulders NUMERIC,
  chest NUMERIC,
  chest_circ NUMERIC,
  waist NUMERIC,
  abdomen NUMERIC,
  hips NUMERIC,
  left_arm NUMERIC,
  right_arm NUMERIC,
  left_thigh NUMERIC,
  right_thigh NUMERIC,
  left_calf NUMERIC,
  right_calf NUMERIC,
  
  -- Dobras cutâneas (mm)
  triceps NUMERIC,
  biceps NUMERIC,
  subscapular NUMERIC,
  abdominal NUMERIC,
  suprailiac NUMERIC,
  midaxillary NUMERIC,
  thigh NUMERIC,
  
  -- Metadados e IA
  ai_analysis JSONB,
  ai_recommendations JSONB,
  notes TEXT,
  calculations_used TEXT,
  accuracy_estimate TEXT,
  measurements JSONB DEFAULT '{}',
  
  -- Sistema
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE physical_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Trainers can view assessments in tenant" ON physical_assessments;
DROP POLICY IF EXISTS "Trainers can create assessments" ON physical_assessments;
DROP POLICY IF EXISTS "Trainers can update assessments" ON physical_assessments;
DROP POLICY IF EXISTS "Trainers can delete assessments" ON physical_assessments;
DROP POLICY IF EXISTS "Students can view own assessments" ON physical_assessments;

CREATE POLICY "Trainers can view assessments in tenant" ON physical_assessments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'trainer' 
    AND profiles.tenant_id = physical_assessments.tenant_id
  )
);

CREATE POLICY "Trainers can create assessments" ON physical_assessments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'trainer' 
    AND profiles.tenant_id = physical_assessments.tenant_id
  )
);

CREATE POLICY "Trainers can update assessments" ON physical_assessments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'trainer' 
    AND profiles.tenant_id = physical_assessments.tenant_id
  )
);

CREATE POLICY "Trainers can delete assessments" ON physical_assessments
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'trainer' 
    AND profiles.tenant_id = physical_assessments.tenant_id
  )
);

CREATE POLICY "Students can view own assessments" ON physical_assessments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'student' 
    AND profiles.id = physical_assessments.student_id
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_physical_assessments_student_id ON physical_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_physical_assessments_tenant_id ON physical_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_physical_assessments_created_at ON physical_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_physical_assessments_date ON physical_assessments(date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_physical_assessments_updated_at ON physical_assessments;
CREATE TRIGGER update_physical_assessments_updated_at
    BEFORE UPDATE ON physical_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
