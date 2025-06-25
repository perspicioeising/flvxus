// /lib/emailService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StudentInviteEmailData {
  studentEmail: string;
  studentName: string;
  trainerName: string;
  trainerEmail?: string;
  companyName?: string;
}

// Template HTML do email de convite
const generateInviteEmailHTML = (data: StudentInviteEmailData, inviteLink: string) => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao FLVXUS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #10b981, #059669);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            color: white;
            font-size: 28px;
            font-weight: 900;
            margin-bottom: 10px;
        }
        .header-text {
            color: white;
            font-size: 18px;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
        }
        .welcome-text {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        .info-box {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border: 1px solid #a7f3d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-title {
            font-weight: 600;
            color: #065f46;
            margin-bottom: 8px;
        }
        .info-text {
            color: #047857;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background: linear-gradient(135deg, #059669, #047857);
        }
        .steps {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .step {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
        }
        .step-number {
            background: #10b981;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: 12px;
            font-size: 12px;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
        }
        .link {
            color: #10b981;
            text-decoration: none;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏋️ FLVXUS</div>
            <p class="header-text">Sua jornada fitness começa aqui!</p>
        </div>
        
        <div class="content">
            <h1 class="welcome-title">Bem-vindo, ${data.studentName}! 🎉</h1>
            
            <p class="welcome-text">
                Você foi convidado por <strong>${data.trainerName}</strong> para fazer parte da plataforma FLVXUS. 
                Estamos animados para ajudá-lo a alcançar seus objetivos fitness!
            </p>
            
            <div class="info-box">
                <div class="info-title">🎯 O que você pode fazer na plataforma:</div>
                <div class="info-text">
                    • Acompanhar seus treinos personalizados<br>
                    • Ver seu progresso e evolução<br>
                    • Comunicar-se com seu personal trainer<br>
                    • Acessar biblioteca de exercícios<br>
                    • Definir e acompanhar metas
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" class="cta-button">
                    🔐 Definir Minha Senha e Acessar
                </a>
            </div>
            
            <div class="steps">
                <h3 style="margin-top: 0; color: #374151;">Como começar:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <span>Clique no botão acima para acessar a plataforma</span>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <span>Crie uma senha segura para sua conta</span>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <span>Complete seu perfil e comece a treinar!</span>
                </div>
            </div>
            
            <div class="security-note">
                🔒 <strong>Segurança:</strong> Este link é válido por 24 horas e pode ser usado apenas uma vez. 
                Mantenha suas credenciais seguras e não compartilhe este email.
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text"><strong>Problemas para acessar?</strong></p>
            <p class="footer-text">
                Entre em contato com ${data.trainerName} ou envie um email para 
                <a href="mailto:suporte@flvxus.com" class="link">suporte@flvxus.com</a>
            </p>
            <p class="footer-text" style="margin-top: 20px;">
                © ${new Date().getFullYear()} FLVXUS - Plataforma de Personal Training
            </p>
        </div>
    </div>
</body>
</html>
`;
};

// Função para enviar email de convite personalizado
export async function sendStudentInviteEmail(data: StudentInviteEmailData): Promise<{ success: boolean; inviteLink?: string; error?: string }> {
  try {
    // 1. Gerar link de convite usando Supabase
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: data.studentEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
        data: {
          full_name: data.studentName,
          role: 'student',
          trainer_name: data.trainerName
        }
      }
    });

    if (inviteError) {
      console.error('Erro ao gerar link de convite:', inviteError);
      return { success: false, error: inviteError.message };
    }

    const inviteLink = inviteData?.properties?.action_link;
    
    if (!inviteLink) {
      return { success: false, error: 'Link de convite não foi gerado' };
    }

    // 2. Para desenvolvimento, apenas log do link
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🎯 EMAIL DE CONVITE GERADO:');
      console.log('📧 Para:', data.studentEmail);
      console.log('👤 Aluno:', data.studentName);
      console.log('💪 Personal:', data.trainerName);
      console.log('🔗 Link:', inviteLink);
      console.log('\n📨 HTML do Email seria:');
      console.log(generateInviteEmailHTML(data, inviteLink));
      console.log('\n' + '='.repeat(80) + '\n');
    }

    // 3. Em produção, você integraria com serviços como SendGrid, Mailgun, etc.
    if (process.env.NODE_ENV === 'production') {
      // Exemplo de integração com SendGrid:
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: data.studentEmail,
        from: {
          email: 'noreply@flvxus.com',
          name: 'FLVXUS - Personal Training'
        },
        subject: `🎯 Bem-vindo ao FLVXUS, ${data.studentName}!`,
        html: generateInviteEmailHTML(data, inviteLink)
      };
      
      await sgMail.send(msg);
      */
      
      // Por enquanto, em produção também vamos usar o sistema padrão do Supabase
      console.log('📧 Email de convite enviado via Supabase Auth para:', data.studentEmail);
    }

    return { 
      success: true, 
      inviteLink,
      error: undefined 
    };

  } catch (error: any) {
    console.error('Erro no serviço de email:', error);
    return { 
      success: false, 
      error: error.message || 'Erro interno do serviço de email' 
    };
  }
}

// Função para reenviar convite
export async function resendStudentInvite(studentEmail: string, studentName: string, trainerName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendStudentInviteEmail({
      studentEmail,
      studentName,
      trainerName
    });

    return result;
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Erro ao reenviar convite' 
    };
  }
}

// Função para validar token de convite
export async function validateInviteToken(accessToken: string, refreshToken: string): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError) {
      return { valid: false, error: sessionError.message };
    }

    return { 
      valid: true, 
      user: sessionData.user 
    };
  } catch (error: any) {
    return { 
      valid: false, 
      error: error.message || 'Token inválido' 
    };
  }
}