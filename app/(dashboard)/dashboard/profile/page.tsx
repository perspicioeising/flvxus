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
import { Camera, Building2, Crown, Users, Mail, Key, Loader2 } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando perfil...</h2>
          <p className="text-muted-foreground">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  const trialEndDate = addDays(new Date(profile?.tenant.created_at || ''), 14);
  const isTrialActive = new Date() < trialEndDate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profile?.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
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
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={profile?.email}
                      disabled
                      className="bg-muted/50 text-muted-foreground"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Gerencie as configurações da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business-name">Nome da Empresa</Label>
                <Input
                  id="business-name"
                  value={formData.tenant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, tenant_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Plano Atual</Label>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 flex items-center gap-3">
                    <Crown className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium capitalize">{profile?.tenant.plan}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {profile?.tenant.plan_type}
                      </p>
                    </div>
                  </div>

                  {isTrialActive && (
                    <Badge variant="secondary">
                      Trial até {format(trialEndDate, 'dd/MM/yyyy')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Limite de Alunos</Label>
                <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{profile?.tenant.max_students}</p>
                    <p className="text-sm text-muted-foreground">alunos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Limite de Treinadores</Label>
                <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{profile?.tenant.max_trainers}</p>
                    <p className="text-sm text-muted-foreground">treinadores</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Gerencie suas credenciais de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Enviaremos um email com instruções para alterar sua senha
                </p>
              </div>
              <Button
                variant="outline"
                className="min-w-[140px]"
                onClick={handlePasswordChange}
              >
                <Key className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
