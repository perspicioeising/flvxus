// app/api/ai/generate-audio/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  console.log('🎤 Iniciando geração de áudio com Gemini GenAI...');
  
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('❌ Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { text, tips, common_errors, exerciseName, name } = await request.json();
    console.log('📝 Dados recebidos:', { 
      text: text?.substring(0, 50), 
      tips: tips?.substring(0, 50), 
      common_errors: common_errors?.substring(0, 50),
      exerciseName: exerciseName?.substring(0, 30),
      name: name?.substring(0, 30)
    });

    // Usar exerciseName ou name como fallback
    const exerciseTitle = exerciseName || name || "Exercício";

    // Priorizar tips e common_errors sobre text genérico
    let finalText = '';
    
    if (tips && tips.trim()) {
      console.log('✅ Usando dicas de execução para áudio');
      finalText = createAudioFromTips(tips, common_errors, exerciseTitle);
    } else if (text && text.trim()) {
      console.log('✅ Usando texto genérico para áudio');
      finalText = `${exerciseTitle}. ${text}`;
    } else {
      return NextResponse.json(
        { error: 'É necessário fornecer dicas de execução ou texto para gerar áudio' },
        { status: 400 }
      );
    }

    // Validar tamanho do texto
    if (finalText.length > 3000) {
      return NextResponse.json(
        { error: 'Texto muito longo para síntese. Máximo de 3000 caracteres.' },
        { status: 400 }
      );
    }

    // Limpar texto para síntese
    const cleanedText = cleanTextForAudio(finalText);
    console.log('🧹 Texto limpo para síntese:', cleanedText.substring(0, 100) + '...');
    
    if (cleanedText.length < 10) {
      return NextResponse.json(
        { error: 'Texto muito curto ou inválido para síntese' },
        { status: 400 }
      );
    }

    // Gerar áudio usando Gemini TTS
    const audioUrl = await generateAudioWithGeminiGenAI(cleanedText, session.user.id, exerciseTitle);
    
    console.log('🎉 Áudio gerado com sucesso:', audioUrl);
    return NextResponse.json({ 
      url: audioUrl,
      message: 'Áudio gerado com sucesso',
      textLength: cleanedText.length
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar áudio:', error);
    
    // Tratamento de erros mais específicos
    if (error.message === 'API_KEY_ERROR') {
      return NextResponse.json(
        { error: 'Chave da API do Gemini inválida ou não configurada.' },
        { status: 500 }
      );
    }
    
    if (error.message === 'QUOTA_EXCEEDED') {
      return NextResponse.json(
        { error: 'Limite de uso da API atingido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
    
    if (error.message === 'SAFETY_ERROR') {
      return NextResponse.json(
        { error: 'Conteúdo rejeitado pelos filtros de segurança. Tente um texto mais simples.' },
        { status: 400 }
      );
    }
    
    if (error.message === 'MODEL_NOT_AVAILABLE') {
      return NextResponse.json(
        { error: 'Modelo de TTS não disponível. Verifique se o Gemini 2.0 Flash está habilitado.' },
        { status: 503 }
      );
    }
    
    if (error.message === 'INVALID_REQUEST') {
      return NextResponse.json(
        { error: 'Requisição inválida. Verifique o formato do texto.' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('GEMINI_API_ERROR')) {
      return NextResponse.json(
        { error: `Erro na API do Gemini: ${error.message.replace('GEMINI_API_ERROR: ', '')}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno ao gerar áudio. Tente novamente.' },
      { status: 500 }
    );
  }
}

/**
 * Cria um texto otimizado para áudio baseado nas dicas e erros comuns
 */
function createAudioFromTips(tips: string, commonErrors?: string, exerciseName?: string): string {
  let audioText = '';
  
  // Adicionar nome do exercício se fornecido
  if (exerciseName && exerciseName.trim()) {
    audioText += `Exercício: ${exerciseName}. `;
  }
  
  // Processar dicas de execução
  if (tips && tips.trim()) {
    audioText += 'Instruções de execução: ';
    
    const tipsLines = tips.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    let currentSection = '';
    
    for (const line of tipsLines) {
      if (line.includes('✔️')) {
        // Nova seção (ex: ✔️ Posição inicial:)
        currentSection = line.replace('✔️', '').replace(':', '').trim();
        audioText += `${currentSection}: `;
      } else if (line.includes('🟡')) {
        // Item da seção (ex: 🟡 Sente-se em um banco...)
        const item = line.replace('🟡', '').trim();
        audioText += `${item}. `;
      } else if (line.length > 5) {
        // Linha genérica
        audioText += `${line}. `;
      }
    }
  }
  
  // Processar erros comuns
  if (commonErrors && commonErrors.trim()) {
    audioText += 'Erros que devem ser evitados: ';
    
    const errorLines = commonErrors.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    for (const line of errorLines) {
      if (line.includes('❌')) {
        const error = line.replace('❌', '').trim();
        audioText += `Evite ${error}. `;
      } else if (line.length > 5) {
        audioText += `Evite ${line}. `;
      }
    }
  }
  
  return audioText.trim();
}

/**
 * Limpa o texto para síntese de voz
 */
function cleanTextForAudio(text: string): string {
  return text
    // Remove emojis e símbolos especiais
    .replace(/[✔️🟡❌💪🏋️⚡🔥❤️🎯]/g, '')
    // Remove caracteres especiais que podem causar problemas na síntese
    .replace(/[^\w\s\.\,\!\?\:\;\-\(\)]/g, ' ')
    // Substitui quebras de linha por pausas adequadas
    .replace(/\n\n+/g, '. ')  // Duas quebras = pausa longa
    .replace(/\n/g, ', ')     // Uma quebra = pausa curta
    // Remove múltiplos espaços
    .replace(/\s+/g, ' ')
    // Garante pontuação adequada para pausas naturais
    .replace(/([a-z])([A-Z])/g, '$1. $2')
    // Remove pontuação dupla
    .replace(/[\.]{2,}/g, '.')
    .replace(/[,]{2,}/g, ',')
    // Remove vírgulas antes de pontos
    .replace(/,\./g, '.')
    // Trim final
    .trim()
    // Adiciona ponto final se não houver
    .replace(/([^\.!?])$/, '$1.');
}

/**
 * Gera áudio usando Google GenAI TTS
 */
async function generateAudioWithGeminiGenAI(text: string, userId: string, exerciseName?: string): Promise<string> {
  console.log('🤖 Usando Google GenAI TTS...');
  console.log('📝 Texto original recebido:', text);
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Simplificar o texto para evitar rejeições
    const simpleText = text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // Limitar tamanho
    
    console.log('📤 Texto simplificado:', simpleText);
    
    // Tentar diferentes modelos que suportam TTS
    const ttsModels = [
      "gemini-2.5-flash-preview-tts",
      "gemini-2.0-flash-thinking-exp", 
      "gemini-exp-1206"
    ];
    
    let response;
    let usedModel = '';
    
    for (const model of ttsModels) {
      try {
        console.log(`🧪 Tentando modelo: ${model}`);
        
        response = await ai.models.generateContent({
          model: model,
          contents: simpleText,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Aoede" }
              }
            }
          }
        });
        
        // Se chegou aqui, o modelo funcionou
        usedModel = model;
        console.log(`✅ Modelo ${model} funcionou!`);
        break;
        
      } catch (modelError: any) {
        console.log(`❌ Modelo ${model} falhou:`, modelError.message);
        
        if (modelError.message?.includes('does not support requested modality')) {
          console.log(`⚠️ Modelo ${model} não suporta AUDIO, tentando próximo...`);
          continue;
        }
        
        // Se for outro tipo de erro, pode ser mais sério
        if (modelError.message?.includes('API key') || modelError.message?.includes('quota')) {
          throw modelError;
        }
      }
    }
    
    if (!response || !usedModel) {
      throw new Error('Nenhum modelo de TTS disponível. Os modelos gemini-2.5-flash-preview-tts, gemini-2.0-flash-thinking-exp e gemini-exp-1206 não estão acessíveis.');
    }

    console.log('📋 Resposta completa do Gemini:', {
      model: usedModel,
      candidates: response.candidates?.length,
      hasContent: !!response.candidates?.[0]?.content,
      hasParts: !!response.candidates?.[0]?.content?.parts,
      hasAudio: !!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
    });

    // Extrair dados de áudio da resposta
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      console.error('❌ Estrutura da resposta:', JSON.stringify(response, null, 2));
      
      // Verificar se há texto na resposta (fallback)
      const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        console.log('📝 Resposta em texto:', textResponse);
        throw new Error(`Modelo ${usedModel} retornou texto em vez de áudio. TTS pode não estar habilitado.`);
      }
      
      throw new Error('Nenhum dado de áudio retornado pelo Gemini');
    }

    console.log(`✅ Áudio gerado pelo Gemini GenAI (${usedModel}), tamanho:`, audioData.length, 'chars');
    
    // Converter base64 para buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log('📦 Buffer de áudio criado, tamanho:', audioBuffer.length, 'bytes');
    
    // Nome de arquivo mais limpo para exercícios
    const safeExerciseName = (exerciseName || 'exercise')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
    
    const filename = `exercise-${safeExerciseName}-${Date.now()}.wav`;
    
    // Tentar upload direto com melhor tratamento de erro
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      console.log('📤 Tentando upload direto no bucket exercise-audios...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exercise-audios')
        .upload(filename, audioBuffer, {
          contentType: 'audio/wav',
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Erro no upload direto:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload direto bem-sucedido:', uploadData);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('exercise-audios')
        .getPublicUrl(filename);

      console.log('🌐 URL pública gerada:', urlData.publicUrl);
      return urlData.publicUrl;
      
    } catch (directError: any) {
      console.warn('⚠️ Upload direto falhou:', directError.message);
      
      // Fallback: usar rota alternativa que tenta múltiplos buckets
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/exercises/simple-audio-upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieStore.toString()
          },
          body: JSON.stringify({
            audioData: audioData,
            filename: filename
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha no upload alternativo');
        }

        const result = await response.json();
        console.log('✅ Upload alternativo bem-sucedido:', result.url);
        
        if (result.warning) {
          console.warn('⚠️', result.warning);
        }
        
        return result.url;
        
      } catch (alternativeError: any) {
        console.error('❌ Upload alternativo também falhou:', alternativeError);
        throw new Error(`Falha completa no upload: ${directError.message}`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro detalhado na Gemini GenAI TTS:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      stack: error.stack?.split('\n')[0]
    });
    
    if (error.message?.includes('API key') || error.message?.includes('api_key') || error.status === 401) {
      throw new Error('API_KEY_ERROR');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA') || error.status === 429) {
      throw new Error('QUOTA_EXCEEDED');
    }
    
    if (error.message?.includes('SAFETY') || error.message?.includes('safety') || error.message?.includes('blocked')) {
      throw new Error('SAFETY_ERROR');
    }
    
    if (error.message?.includes('does not support requested modality')) {
      throw new Error('MODEL_NOT_AVAILABLE');
    }
    
    if (error.status === 400) {
      throw new Error('INVALID_REQUEST');
    }
    
    // Log completo do erro para debug
    console.error('❌ Erro completo:', error);
    throw new Error(`GEMINI_API_ERROR: ${error.message}`);
  }
}

/**
 * Upload de áudio para Supabase Storage
 */
async function uploadAudioToSupabaseStorage(audioBuffer: Buffer, filename: string): Promise<string> {
  console.log('📤 Fazendo upload do áudio:', filename);
  console.log('📦 Tamanho do buffer:', audioBuffer.length, 'bytes');
  
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verificar autenticação do usuário
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('❌ Erro de autenticação no upload:', authError);
      throw new Error('Usuário não autenticado para upload');
    }

    console.log('✅ Usuário autenticado:', session.user.id);

    // Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      throw new Error(`Erro ao verificar perfil: ${profileError.message}`);
    }

    console.log('✅ Perfil do usuário:', { role: profile.role, tenant_id: profile.tenant_id });

    if (profile.role !== 'trainer') {
      throw new Error('Apenas treinadores podem fazer upload de áudios');
    }

    // Listar buckets existentes para debug
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    console.log('📁 Buckets disponíveis:', buckets?.map(b => b.name));
    
    if (listError) {
      console.warn('⚠️ Erro ao listar buckets:', listError);
    }

    // Verificar se o bucket exercise-audios existe
    const exerciseAudiosBucket = buckets?.find(bucket => bucket.name === 'exercise-audios');
    
    if (!exerciseAudiosBucket) {
      console.log('📁 Bucket exercise-audios não existe, tentando criar...');
      
      // Tentar criar bucket (pode falhar se não tiver permissão)
      const { data: createData, error: bucketError } = await supabase.storage.createBucket('exercise-audios', {
        public: true,
        allowedMimeTypes: ['audio/wav', 'audio/flac', 'audio/mpeg', 'audio/mp3'],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (bucketError) {
        console.error('❌ Erro ao criar bucket:', bucketError);
        
        // Se o bucket já existe, tentar continuar
        if (bucketError.message?.includes('already exists')) {
          console.log('✅ Bucket já existe, continuando...');
        } else {
          throw new Error(`Erro ao criar bucket: ${bucketError.message}`);
        }
      } else {
        console.log('✅ Bucket criado com sucesso:', createData);
      }
    } else {
      console.log('✅ Bucket exercise-audios já existe');
    }

    // Tentar fazer upload do arquivo
    console.log('📤 Iniciando upload do arquivo...');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exercise-audios')
      .upload(filename, audioBuffer, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: true // Permitir sobrescrever se já existir
      });

    if (uploadError) {
      console.error('❌ Erro detalhado no upload:', {
        message: uploadError.message,
        details: uploadError,
        filename: filename,
        bufferSize: audioBuffer.length,
        userRole: profile.role,
        userId: session.user.id
      });
      
      // Diagnóstico específico para RLS
      if (uploadError.message?.includes('row-level security policy') || uploadError.message?.includes('policy')) {
        throw new Error('Política de segurança do Storage não configurada corretamente. Verifique as políticas RLS do bucket exercise-audios.');
      }
      
      if (uploadError.message?.includes('size')) {
        throw new Error(`Arquivo muito grande: ${audioBuffer.length} bytes. Limite pode ser menor.`);
      }
      
      if (uploadError.message?.includes('type')) {
        throw new Error('Tipo de arquivo não permitido. Verifique as configurações de MIME types do bucket.');
      }
      
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    console.log('✅ Upload realizado com sucesso:', uploadData);

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('exercise-audios')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;
    console.log('🌐 URL pública gerada:', publicUrl);

    return publicUrl;

  } catch (error: any) {
    console.error('❌ Erro completo no upload do áudio:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    throw new Error(`Falha no upload do áudio: ${error.message}`);
  }
}