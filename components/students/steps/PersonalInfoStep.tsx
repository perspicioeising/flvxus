'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Calendar, Users } from 'lucide-react';
import { StudentFormData } from '@/types/student';

interface PersonalInfoStepProps {
  data: StudentFormData;
  onChange: (updates: Partial<StudentFormData>) => void;
  errors: Record<string, string>;
}

export function PersonalInfoStep({ data, onChange, errors }: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      
      {/* Nome e Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Nome Completo *
          </Label>
          <Input
            id="name"
            placeholder="Digite o nome completo"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={`h-11 md:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-base ${
              errors.name ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            E-mail *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={`h-11 md:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-base ${
              errors.email ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Telefone e Data de Nascimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Telefone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="h-11 md:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-base"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Data de Nascimento
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className="h-11 md:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-base"
            autoComplete="bday"
          />
        </div>
      </div>

      {/* Gênero */}
      <div className="space-y-3">
        <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Gênero
        </Label>
        <Select
          value={data.gender}
          onValueChange={(value) => onChange({ gender: value })}
        >
          <SelectTrigger className="h-11 md:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-base">
            <SelectValue placeholder="Selecione o gênero" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
            <SelectItem value="male">Masculino</SelectItem>
            <SelectItem value="female">Feminino</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Helper */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Informações Básicas
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Os campos marcados com * são obrigatórios. Um convite será enviado por email para o aluno acessar o sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}