import { useMemo } from 'react';
import { StudentFormData } from '@/types/student';

interface ValidationRule {
  field: keyof StudentFormData;
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  message: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  stepValidation: {
    [stepNumber: number]: {
      isValid: boolean;
      completedFields: number;
      totalFields: number;
      completionPercentage: number;
    };
  };
}

const VALIDATION_RULES: ValidationRule[] = [
  // Step 1 - Informações Pessoais
  {
    field: 'name',
    required: true,
    minLength: 2,
    message: 'Nome deve ter pelo menos 2 caracteres'
  },
  {
    field: 'email',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email deve ter um formato válido'
  },
  {
    field: 'phone',
    pattern: /^[\d\s\-\(\)]+$/,
    message: 'Telefone deve conter apenas números e símbolos válidos'
  },
  
  // Step 2 - Perfil Físico
  {
    field: 'height',
    pattern: /^\d+(\.\d+)?$/,
    message: 'Altura deve ser um número válido'
  },
  {
    field: 'weight',
    pattern: /^\d+(\.\d+)?$/,
    message: 'Peso deve ser um número válido'
  }
];

// Campos por step para calcular completude
const STEP_FIELDS: Record<number, (keyof StudentFormData)[]> = {
  1: ['name', 'email', 'phone', 'birthDate', 'gender'],
  2: ['height', 'weight', 'goals', 'experienceLevel', 'preferredTime'],
  3: ['medicalConditions', 'emergencyContact', 'notes']
};

// Campos obrigatórios por step
const REQUIRED_FIELDS: Record<number, (keyof StudentFormData)[]> = {
  1: ['name', 'email'],
  2: [],
  3: []
};

export function useFormValidation(data: StudentFormData): ValidationResult {
  return useMemo(() => {
    const errors: ValidationErrors = {};
    
    // Validar cada regra
    VALIDATION_RULES.forEach(rule => {
      const value = data[rule.field];
      const stringValue = typeof value === 'string' ? value : Array.isArray(value) ? value.join(',') : String(value);
      
      // Verificar se é obrigatório
      if (rule.required && (!stringValue || stringValue.trim() === '')) {
        errors[rule.field] = rule.message;
        return;
      }
      
      // Verificar comprimento mínimo
      if (rule.minLength && stringValue && stringValue.length < rule.minLength) {
        errors[rule.field] = rule.message;
        return;
      }
      
      // Verificar padrão
      if (rule.pattern && stringValue && !rule.pattern.test(stringValue)) {
        errors[rule.field] = rule.message;
        return;
      }
    });
    
    // Calcular validação por step
    const stepValidation: ValidationResult['stepValidation'] = {};
    
    Object.entries(STEP_FIELDS).forEach(([stepNumber, fields]) => {
      const step = parseInt(stepNumber);
      const requiredFields = REQUIRED_FIELDS[step] || [];
      
      // Contar campos preenchidos
      let completedFields = 0;
      let hasRequiredFieldErrors = false;
      
      fields.forEach(field => {
        const value = data[field];
        const stringValue = typeof value === 'string' ? value : Array.isArray(value) ? value.join(',') : String(value);
        const isCompleted = stringValue && stringValue.trim() !== '';
        
        if (isCompleted) {
          completedFields++;
        }
        
        // Verificar se há erro em campo obrigatório
        if (requiredFields.includes(field) && (!isCompleted || errors[field])) {
          hasRequiredFieldErrors = true;
        }
      });
      
      const totalFields = fields.length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);
      
      stepValidation[step] = {
        isValid: !hasRequiredFieldErrors,
        completedFields,
        totalFields,
        completionPercentage
      };
    });
    
    // Validação geral
    const isValid = Object.keys(errors).length === 0 && 
                   (REQUIRED_FIELDS[1] || []).every(field => {
                     const value = data[field];
                     const stringValue = typeof value === 'string' ? value : String(value);
                     return stringValue && stringValue.trim() !== '';
                   });
    
    return {
      isValid,
      errors,
      stepValidation
    };
  }, [data]);
}

// Hook para validação de email em tempo real
export function useEmailValidation(email: string) {
  return useMemo(() => {
    if (!email) return { isValid: true, message: '' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      isValid,
      message: isValid ? '' : 'Email deve ter um formato válido'
    };
  }, [email]);
}

// Hook para validação de telefone em tempo real
export function usePhoneValidation(phone: string) {
  return useMemo(() => {
    if (!phone) return { isValid: true, message: '' };
    
    // Remove espaços e caracteres especiais para validação
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const isValid = /^\d{10,11}$/.test(cleanPhone);
    
    return {
      isValid,
      message: isValid ? '' : 'Telefone deve ter 10 ou 11 dígitos'
    };
  }, [phone]);
}