'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, addDays } from 'date-fns';
import { Camera, Building2, Crown, Users, Mail, Key, Loader2, User, Zap, TrendingUp, Shield, Settings } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  tenant: {
    id: string;
    name: string;
    plan: string;
    plan_type: string;
    max_students: number;
    max_trainers: number;
    created_at: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    tenant_name: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        tenant_name: data.tenant.name,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        avatarUrl = await handleAvatarUpload(avatarFile);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          tenant_name: formData.tenant_name,
          avatar_url: avatarUrl,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });

      await fetchProfile();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        profile?.email || '',
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique seu email para alterar sua senha.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const trialEndDate = addDays(new Date(profile?.tenant.created_at || ''), 14);
  const isTrialActive = new Date() < trialEndDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 dark:from-green-500/10 dark:via-blue-400/10 dark:to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Meu Perfil
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">Configurações Avançadas</span> • Dashboard Personalizado
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="group bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-14 px-8 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Personal Information Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
              
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Atualize suas informações de perfil
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-6">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="relative group/avatar">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-md opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-300"></div>
                    <Avatar className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                      <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                      <AvatarFallback className="w-32 h-32 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center text-white font-black text-4xl">
                        {profile?.full_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-2 right-2 p-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-110"
                    >
                      <Camera className="h-5 w-5" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAvatarFile(file);
                      }}
                    />
                    {avatarFile && (
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Nome Completo
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                          <Input
                            id="name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          E-mail
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            value={profile?.email}
                            disabled
                            className="h-14 text-lg bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 text-gray-600 dark:text-gray-400 border-0 rounded-xl shadow-lg"
                          />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Information Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-green-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
              
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Gerencie as configurações da sua empresa
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="business-name" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nome da Empresa
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50"></div>
                      <Input
                        id="business-name"
                        value={formData.tenant_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, tenant_name: e.target.value }))}
                        className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Plano Atual
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/50">
                        <div className="flex items-center gap-3">
                          <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="font-bold text-purple-800 dark:text-purple-300 capitalize text-lg">
                              {profile?.tenant.plan}
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 capitalize">
                              {profile?.tenant.plan_type}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isTrialActive && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-300 dark:border-yellow-600 rounded-full font-semibold">
                          Trial até {format(trialEndDate, 'dd/MM/yyyy')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Limits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group/limit">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover/limit:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover/limit:scale-105 transition-all duration-300">
                      <div className="p-6 text-center">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-1">
                            <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Limite de Alunos</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">{profile?.tenant.max_students}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative group/limit">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover/limit:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover/limit:scale-105 transition-all duration-300">
                      <div className="p-6 text-center">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-1">
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Limite de Treinadores</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">{profile?.tenant.max_trainers}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                            <TrendingUp className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-yellow-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
              
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      Segurança
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Gerencie suas credenciais de acesso
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative">
                <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200/50 dark:border-red-700/50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                      <p className="font-bold text-red-800 dark:text-red-300 text-lg">Alterar Senha</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Enviaremos um email com instruções para alterar sua senha
                      </p>
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      <Key className="h-5 w-5 mr-3" />
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-14 px-8 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0 h-14"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}