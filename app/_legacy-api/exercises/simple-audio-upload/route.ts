// app/api/exercises/simple-audio-upload/route.ts
// SOLUÇÃO TEMPORÁRIA MAIS SIMPLES

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('📤 Upload simplificado de áudio...');
  
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação básica
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { audioData, filename, mimeType } = await request.json();
    
    if (!audioData || !filename) {
      return NextResponse.json(
        { error: 'Dados de áudio e nome do arquivo são obrigatórios' },
        { status: 400 }
      );
    }

    // Converter base64 para buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log('📦 Buffer criado, tamanho:', audioBuffer.length, 'bytes');
    
    // Detectar tipo MIME se não fornecido
    const contentType = mimeType || 'audio/wav';
    console.log('🎵 Usando content-type:', contentType);

    // Tentar buckets em ordem de preferência
    const bucketsToTry = [
      'exercise-audios',  // Bucket preferido
      'avatars',          // Bucket padrão que geralmente existe
      'public'            // Bucket genérico
    ];

    let uploadSuccess = false;
    let finalUrl = '';

    for (const bucketName of bucketsToTry) {
      try {
        console.log(`🧪 Tentando upload no bucket: ${bucketName}`);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filename, audioBuffer, {
            contentType: contentType,
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError) {
          console.log(`✅ Upload bem-sucedido no bucket: ${bucketName}`);
          
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

          finalUrl = urlData.publicUrl;
          uploadSuccess = true;
          break;
        } else {
          console.log(`❌ Falha no bucket ${bucketName}:`, uploadError.message);
        }
        
      } catch (bucketError) {
        console.log(`❌ Erro no bucket ${bucketName}:`, bucketError);
        continue;
      }
    }

    if (!uploadSuccess) {
      // Último recurso: retornar um data URL (funciona mas não é persistente)
      console.log('⚠️ Todos os buckets falharam, usando data URL temporário');
      
      const dataUrl = `data:audio/wav;base64,${audioData}`;
      
      return NextResponse.json({ 
        url: dataUrl,
        message: 'Áudio gerado (temporário)',
        warning: 'Áudio não foi persistido no storage, configure as políticas do Supabase'
      });
    }

    return NextResponse.json({ 
      url: finalUrl,
      message: 'Áudio enviado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no upload' },
      { status: 500 }
    );
  }
}