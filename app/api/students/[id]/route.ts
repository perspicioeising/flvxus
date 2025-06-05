// app/api/students/[id]/route.ts - CORRIGIDO
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify user is authenticated and is a trainer
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    // Get student profile
    const { data: student, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student') // Garantir que é um estudante
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching student details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify user is authenticated and is a trainer
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validar dados
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Verificar se o estudante existe e pertence ao tenant do trainer
    const { data: existingStudent, error: checkError } = await supabase
      .from('profiles')
      .select('id, user_id, email, full_name')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student')
      .single();

    if (checkError || !existingStudent) {
      return NextResponse.json(
        { error: 'Student not found or access denied' },
        { status: 404 }
      );
    }

    // Processar dados
    const height = data.height ? parseFloat(data.height) : null;
    const weight = data.weight ? parseFloat(data.weight) : null;

    // Update student profile
    const { data: updatedStudent, error } = await supabase
      .from('profiles')
      .update({
        full_name: data.name,
        phone: data.phone || null,
        birth_date: data.birthDate || null,
        gender: data.gender || null,
        height: height,
        weight: weight,
        goals: Array.isArray(data.goals) ? data.goals : [],
        medical_conditions: data.medicalConditions || null,
        emergency_contact: data.emergencyContact || null,
        preferred_training_time: data.preferredTime || null,
        experience_level: data.experienceLevel || null,
        notes: data.notes || null,
        status: data.status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student')
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Se necessário, atualizar também os metadados do usuário de autenticação
    if (existingStudent.user_id && data.name !== existingStudent.full_name) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(existingStudent.user_id, {
          user_metadata: {
            full_name: data.name
          }
        });
      } catch (metadataError) {
        console.warn('Failed to update user metadata:', metadataError);
        // Não falhar a requisição por causa disso
      }
    }

    return NextResponse.json(updatedStudent);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating student details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify user is authenticated and is a trainer
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    // Get student profile to resend invite
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('email, user_id, full_name')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (!student.user_id) {
      return NextResponse.json(
        { error: 'Student does not have a valid user account' },
        { status: 400 }
      );
    }

    // Generate password reset link or invite link
    try {
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: student.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?type=recovery`
        }
      });

      if (resetError) {
        // Se recovery falhar, tentar um novo convite
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: student.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?type=invite`,
            data: {
              full_name: student.full_name,
              role: 'student'
            }
          }
        });

        if (inviteError) {
          return NextResponse.json(
            { error: `Failed to send invite: ${inviteError.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          message: 'Convite reenviado com sucesso',
          type: 'invite'
        });
      }

      return NextResponse.json({ 
        message: 'Link de redefinição de senha enviado com sucesso',
        type: 'recovery'
      });

    } catch (error: any) {
      return NextResponse.json(
        { error: `Error sending email: ${error.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while resending invite' },
      { status: 500 }
    );
  }
}

// DELETE - Para deletar um estudante (opcional)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    // Get student to delete
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Soft delete - just change status to inactive
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'student');

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Student deactivated successfully' 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting student' },
      { status: 500 }
    );
  }
}