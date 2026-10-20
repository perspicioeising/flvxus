// app/api/students/[id]/invite/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log('📨 [INVITE] Reenviando convite para estudante:', params.id);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id, full_name')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json({ error: 'Access restricted to trainers' }, { status: 403 });
    }

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, status')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Estudante não encontrado' }, { status: 404 });
    }

    // Obter método preferido do body (se fornecido)
    const body = await request.json();
    let preferredMethod = body.method || 'invite'; // 'invite' ou 'magiclink'

    console.log('📨 [INVITE] Método escolhido:', preferredMethod);
    console.log('📨 [INVITE] Email do estudante:', student.email);

    let linkGenerated = false;
    let actionLink = '';
    let inviteMethod = '';

    if (preferredMethod === 'invite') {
      // Método 1: Invite automático por email
      try {
        console.log('📨 [INVITE] Enviando invite automático...');
        
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          student.email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?new_user=true&welcome=true`,
            data: {
              full_name: student.full_name,
              role: 'student',
              trainer_name: profile.full_name || 'Seu Personal Trainer',
              is_student_creation: true
            }
          }
        );

        if (!inviteError && inviteData?.user) {
          linkGenerated = true;
          inviteMethod = 'invite';
          actionLink = `Email enviado automaticamente para ${student.email}`;
          console.log('✅ [INVITE] Invite automático enviado com sucesso!');
        } else {
          throw inviteError;
        }

      } catch (inviteError) {
        console.error('❌ [INVITE] Invite automático falhou:', inviteError);
        // Fallback para magic link
        preferredMethod = 'magiclink';
      }
    }

    if (preferredMethod === 'magiclink' || !linkGenerated) {
      // Método 2: Magic Link manual
      try {
        console.log('🔗 [INVITE] Gerando magic link...');
        
        const { data: magicData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: student.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?new_user=true&welcome=true`,
            data: {
              full_name: student.full_name,
              role: 'student',
              trainer_name: profile.full_name || 'Seu Personal Trainer',
              is_student_creation: true
            }
          }
        });

        if (magicError) {
          throw magicError;
        }

        if (magicData?.properties?.action_link) {
          actionLink = magicData.properties.action_link;
          linkGenerated = true;
          inviteMethod = 'magiclink';
          console.log('✅ [INVITE] Magic link gerado com sucesso!');
        }

      } catch (magicError) {
        console.error('❌ [INVITE] Magic link falhou:', magicError);
        
        // Último recurso: generateLink com invite
        try {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: student.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?new_user=true&welcome=true`,
              data: {
                full_name: student.full_name,
                role: 'student',
                trainer_name: profile.full_name || 'Seu Personal Trainer',
                is_student_creation: true
              }
            }
          });
          
          if (!linkError && linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
            linkGenerated = true;
            inviteMethod = 'generateLink-invite';
            console.log('✅ [INVITE] Generate Link Invite como último recurso!');
          }
          
        } catch (linkError) {
          console.error('❌ [INVITE] Todos os métodos falharam:', linkError);
          return NextResponse.json({ 
            error: 'Falha ao gerar convite. Tente novamente.' 
          }, { status: 500 });
        }
      }
    }

    // Atualizar status do estudante para pending se estava inactive
    if (student.status !== 'pending') {
      await supabase
        .from('profiles')
        .update({ status: 'pending' })
        .eq('id', params.id);
    }

    // Log do resultado
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CONVITE REENVIADO:');
    console.log('📧 Para:', student.email);
    console.log('👤 Aluno:', student.full_name);
    console.log('💪 Personal:', profile.full_name);
    console.log('📮 Método:', inviteMethod.toUpperCase());
    
    if (inviteMethod === 'invite') {
      console.log('✉️ Status: Email enviado automaticamente');
    } else {
      console.log('🔗 Link:', actionLink);
    }
    
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      message: linkGenerated 
        ? inviteMethod === 'invite'
          ? 'Convite reenviado por email com sucesso!'
          : 'Link de acesso gerado com sucesso!'
        : 'Falha ao gerar convite',
      invite_method: inviteMethod,
      action_link: inviteMethod !== 'invite' ? actionLink : undefined,
      instructions: inviteMethod === 'invite' 
        ? 'Email enviado automaticamente - peça ao aluno para verificar a caixa de entrada'
        : 'Envie este link diretamente para o aluno'
    });

  } catch (error: any) {
    console.error('💥 [INVITE] Erro geral:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao reenviar convite' 
    }, { status: 500 });
  }
}

// GET para verificar opções disponíveis
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json({ error: 'Access restricted to trainers' }, { status: 403 });
    }

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('email, full_name, status, created_at')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Estudante não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        email: student.email,
        name: student.full_name,
        status: student.status,
        created_at: student.created_at
      },
      invite_options: [
        {
          method: 'invite',
          name: 'Email Automático',
          description: 'Supabase envia email automaticamente',
          recommended: true
        },
        {
          method: 'magiclink',
          name: 'Link Manual',
          description: 'Gera link para você enviar',
          recommended: false
        }
      ]
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Erro ao buscar opções de convite' 
    }, { status: 500 });
  }
}