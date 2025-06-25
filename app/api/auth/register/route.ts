// app/api/auth/register/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cliente admin para operações que requerem privilégios elevados
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    console.log('🚀 [REGISTER] Iniciando registro de trainer...');
    
    const body = await request.json();
    const { name, email, password, businessName, plan = 'free' } = body;

    // Validação básica
    if (!name || !email || !password || !businessName) {
      return NextResponse.json({
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 });
    }

    console.log('📋 [REGISTER] Dados recebidos:', { name, email, businessName, plan });

    // 1. Verificar se o email já existe
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ [REGISTER] Erro ao verificar usuários existentes:', checkError);
      return NextResponse.json({
        error: 'Erro interno do servidor'
      }, { status: 500 });
    }

    const emailExists = existingUser.users.some(user => user.email === email);
    if (emailExists) {
      return NextResponse.json({
        error: 'Este email já está em uso'
      }, { status: 400 });
    }

    // 2. 🔥 VOLTANDO AO MÉTODO QUE FUNCIONAVA: Criar usuário COM confirmação automática
    console.log('🔑 [REGISTER] Criando usuário no Auth...');
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 🔥 VOLTANDO PARA TRUE para funcionar como antes
      user_metadata: {
        full_name: name,
        business_name: businessName,
        plan: plan
      }
    });

    if (authError) {
      console.error('❌ [REGISTER] Erro ao criar usuário:', authError);
      return NextResponse.json({
        error: 'Erro ao criar conta: ' + authError.message
      }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({
        error: 'Falha ao criar usuário'
      }, { status: 500 });
    }

    const userId = authData.user.id;
    console.log('✅ [REGISTER] Usuário criado:', userId);

    // 3. Criar tenant e perfil usando função
    console.log('🏢 [REGISTER] Criando tenant e perfil...');
    
    try {
      const { data: functionResult, error: functionError } = await supabaseAdmin
        .rpc('create_trainer_with_tenant', {
          p_user_id: userId,
          p_full_name: name,
          p_email: email,
          p_business_name: businessName,
          p_plan: plan
        });

      if (functionError) {
        console.warn('⚠️ [REGISTER] Função falhou, tentando método direto:', functionError);
        throw functionError;
      }

      if (!functionResult?.success) {
        console.warn('⚠️ [REGISTER] Função retornou erro:', functionResult);
        throw new Error(functionResult?.error || 'Erro na função');
      }

      console.log('✅ [REGISTER] Função executada com sucesso:', functionResult);

      // 4. 🔥 OPCIONAL: Enviar email de boas-vindas personalizado (se quiser)
      try {
        console.log('📧 [REGISTER] Enviando email de boas-vindas...');
        
        const { data: welcomeData, error: welcomeError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?welcome=true`,
            data: {
              welcome: true,
              business_name: businessName,
              plan: plan
            }
          }
        });

        if (welcomeError) {
          console.warn('⚠️ [REGISTER] Erro no email de boas-vindas (não crítico):', welcomeError);
        } else {
          console.log('✅ [REGISTER] Email de boas-vindas enviado!');
          
          // Log do link para debug
          if (welcomeData?.properties?.action_link) {
            console.log('\n' + '='.repeat(80));
            console.log('📧 EMAIL DE BOAS-VINDAS ENVIADO:');
            console.log('👤 Para:', email);
            console.log('🏢 Empresa:', businessName);
            console.log('🔗 Link:', welcomeData.properties.action_link);
            console.log('='.repeat(80) + '\n');
          }
        }
      } catch (emailError) {
        console.warn('⚠️ [REGISTER] Erro no email (não crítico):', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Conta criada com sucesso!',
        user: {
          id: userId,
          email: email,
          name: name
        },
        tenant: {
          id: functionResult.tenant_id,
          name: businessName,
          plan: plan
        },
        profile: {
          id: functionResult.profile_id
        },
        // 🔥 Não requer confirmação - usuário pode fazer login imediatamente
        confirmation_required: false
      });

    } catch (functionError) {
      console.warn('⚠️ [REGISTER] Função falhou, usando método direto:', functionError);

      // Método alternativo direto
      const { data: tenantData, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
          name: businessName,
          plan: plan,
          plan_type: plan === 'monthly' ? 'premium' : plan === 'annual' ? 'enterprise' : 'free',
          max_students: plan === 'monthly' ? 1000 : plan === 'annual' ? -1 : 5,
          max_trainers: plan === 'monthly' ? 5 : plan === 'annual' ? 20 : 1,
          owner_id: userId
        })
        .select()
        .single();

      if (tenantError) {
        console.error('❌ [REGISTER] Erro ao criar tenant:', tenantError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json({
          error: 'Erro ao criar empresa: ' + tenantError.message
        }, { status: 500 });
      }

      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: name,
          email: email,
          role: 'trainer',
          tenant_id: tenantData.id,
          status: 'active',
          total_points: 0
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ [REGISTER] Erro ao criar perfil:', profileError);
        await supabaseAdmin.from('tenants').delete().eq('id', tenantData.id);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json({
          error: 'Erro ao criar perfil: ' + profileError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Conta criada com sucesso!',
        user: {
          id: userId,
          email: email,
          name: name
        },
        tenant: {
          id: tenantData.id,
          name: businessName,
          plan: plan
        },
        profile: {
          id: profileData.id
        },
        confirmation_required: false
      });
    }

  } catch (error: any) {
    console.error('💥 [REGISTER] Erro geral:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor: ' + error.message
    }, { status: 500 });
  }
}

// Permitir OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}