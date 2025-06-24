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
          <Label htmlFor="name" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <User className="h-4 w-4 text-app-text-accent" />
            Nome Completo *
          </Label>
          <Input
            id="name"
            placeholder="Digite o nome completo"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={`h-11 md:h-12 bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all text-base ${
              errors.name ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <Mail className="h-4 w-4 text-app-text-accent" />
            E-mail *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={`h-11 md:h-12 bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all text-base ${
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
          <Label htmlFor="phone" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <Phone className="h-4 w-4 text-app-text-accent" />
            Telefone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="h-11 md:h-12 bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all text-base"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="birthDate" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <Calendar className="h-4 w-4 text-app-text-accent" />
            Data de Nascimento
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className="h-11 md:h-12 bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all text-base"
            autoComplete="bday"
          />
        </div>
      </div>

      {/* Gênero */}
      <div className="space-y-3">
        <Label htmlFor="gender" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <Users className="h-4 w-4 text-app-text-accent" />
          Gênero
        </Label>
        <Select
          value={data.gender}
          onValueChange={(value) => onChange({ gender: value })}
        >
          <SelectTrigger className="h-11 md:h-12 bg-app-card border-app-border-muted rounded-xl text-base focus:border-app-text-accent">
            <SelectValue placeholder="Selecione o gênero" />
          </SelectTrigger>
          <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
            <SelectItem value="male" className="focus:bg-app-border-accent/20">Masculino</SelectItem>
            <SelectItem value="female" className="focus:bg-app-border-accent/20">Feminino</SelectItem>
            <SelectItem value="other" className="focus:bg-app-border-accent/20">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Helper */}
      <div className="bg-app-text-accent/10 rounded-xl p-4 border border-app-border-accent">
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-app-text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-app-text-primary mb-1">
              Informações Básicas
            </h4>
            <p className="text-sm text-app-text-secondary">
              Os campos marcados com * são obrigatórios. Um convite será enviado por email para o aluno acessar o sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}