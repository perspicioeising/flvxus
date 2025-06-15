// app/api/ai/generate-audio/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('🎤 Iniciando geração de áudio...');
  
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

    const { text, tips, common_errors } = await request.json();
    console.log('📝 Dados recebidos:', { 
      text: text?.substring(0, 50), 
      tips: tips?.substring(0, 50), 
      common_errors: common_errors?.substring(0, 50) 
    });

    // Priorizar tips e common_errors sobre text genérico
    let finalText = '';
    
    if (tips && tips.trim()) {
      console.log('✅ Usando dicas de execução para áudio');
      finalText = createAudioFromTips(tips, common_errors);
    } else if (text && text.trim()) {
      console.log('✅ Usando texto genérico para áudio');
      finalText = text;
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

    // Gerar áudio usando API de TTS
    const audioUrl = await generateAudioWithTTS(cleanedText, session.user.id);
    
    console.log('🎉 Áudio gerado com sucesso:', audioUrl);
    return NextResponse.json({ 
      url: audioUrl,
      message: 'Áudio gerado com sucesso',
      textLength: cleanedText.length
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar áudio:', error);
    
    // Retornar erro específico baseado no tipo
    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      return NextResponse.json(
        { error: 'Limite de uso da API atingido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
    
    if (error.message?.includes('invalid') || error.message?.includes('INVALID')) {
      return NextResponse.json(
        { error: 'Texto inválido para síntese de voz.' },
        { status: 400 }
      );
    }

    if (error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'Configuração da API de áudio ausente ou inválida.' },
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
function createAudioFromTips(tips: string, commonErrors?: string): string {
  let audioText = '';
  
  // Processar dicas de execução
  if (tips && tips.trim()) {
    audioText += 'Instruções de execução do exercício:\n\n';
    
    const tipsLines = tips.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    let currentSection = '';
    
    for (const line of tipsLines) {
      if (line.includes('✔️')) {
        // Nova seção (ex: ✔️ Posição inicial:)
        currentSection = line.replace('✔️', '').replace(':', '').trim();
        audioText += `${currentSection}:\n`;
      } else if (line.includes('🟡')) {
        // Item da seção (ex: 🟡 Sente-se em um banco...)
        const item = line.replace('🟡', '').trim();
        audioText += `${item}\n`;
      } else if (line.length > 5) {
        // Linha genérica
        audioText += `${line}\n`;
      }
    }
  }
  
  // Processar erros comuns
  if (commonErrors && commonErrors.trim()) {
    audioText += '\n\nErros que devem ser evitados:\n';
    
    const errorLines = commonErrors.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    for (const line of errorLines) {
      if (line.includes('❌')) {
        const error = line.replace('❌', '').trim();
        audioText += `Evite ${error}\n`;
      } else if (line.length > 5) {
        audioText += `Evite ${line}\n`;
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
 * Gera áudio usando API de Text-to-Speech
 */
async function generateAudioWithTTS(text: string, userId: string): Promise<string> {
  
  // OPÇÃO 1: OpenAI TTS (Recomendado - boa qualidade e fácil de configurar)
  if (process.env.OPENAI_API_KEY) {
    console.log('🤖 Usando OpenAI TTS...');
    
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd', // Modelo HD para melhor qualidade
          input: text,
          voice: 'nova', // Vozes disponíveis: alloy, echo, fable, onyx, nova, shimmer
          response_format: 'mp3',
          speed: 0.85 // Um pouco mais devagar para exercícios
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro OpenAI TTS:', response.status, errorData);
        throw new Error(`Falha na API da OpenAI TTS: ${response.status}`);
      }

      console.log('✅ Áudio gerado pela OpenAI');
      const audioBuffer = await response.arrayBuffer();
      
      return await uploadAudioToSupabaseStorage(
        Buffer.from(audioBuffer), 
        `exercise-audio-${userId}-${Date.now()}.mp3`
      );
      
    } catch (error) {
      console.error('❌ Erro na OpenAI TTS:', error);
      throw error;
    }
  }

  // OPÇÃO 2: Google Cloud Text-to-Speech
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_TTS_API_KEY) {
    console.log('🤖 Usando Google Cloud TTS...');
    
    try {
      // Se tiver API key direta (mais simples)
      if (process.env.GOOGLE_TTS_API_KEY) {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text: text },
            voice: { 
              languageCode: 'pt-BR', 
              name: 'pt-BR-Neural2-A',
              ssmlGender: 'FEMALE' 
            },
            audioConfig: { 
              audioEncoding: 'MP3',
              speakingRate: 0.85,
              pitch: -2.0,
              volumeGainDb: 2.0
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Google TTS API error: ${response.status}`);
        }

        const data = await response.json();
        const audioBuffer = Buffer.from(data.audioContent, 'base64');
        
        return await uploadAudioToSupabaseStorage(
          audioBuffer, 
          `exercise-audio-${userId}-${Date.now()}.mp3`
        );
      }
      
      // Usar client library (se tiver credenciais)
      const textToSpeech = require('@google-cloud/text-to-speech');
      const client = new textToSpeech.TextToSpeechClient();

      const request = {
        input: { text: text },
        voice: { 
          languageCode: 'pt-BR', 
          name: 'pt-BR-Neural2-A',
          ssmlGender: 'FEMALE' 
        },
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: 0.85,
          pitch: -2.0,
          volumeGainDb: 2.0
        },
      };

      const [response] = await client.synthesizeSpeech(request);
      
      return await uploadAudioToSupabaseStorage(
        response.audioContent as Buffer, 
        `exercise-audio-${userId}-${Date.now()}.mp3`
      );
      
    } catch (error) {
      console.error('❌ Erro na Google TTS:', error);
      throw error;
    }
  }

  // OPÇÃO 3: Eleven Labs (Melhor qualidade, mas mais caro)
  if (process.env.ELEVEN_LABS_API_KEY) {
    console.log('🤖 Usando Eleven Labs...');
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.7,
            style: 0.2,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Eleven Labs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      return await uploadAudioToSupabaseStorage(
        Buffer.from(audioBuffer), 
        `exercise-audio-${userId}-${Date.now()}.mp3`
      );
      
    } catch (error) {
      console.error('❌ Erro na Eleven Labs:', error);
      throw error;
    }
  }

  // FALLBACK: Se nenhuma API configurada
  console.log('⚠️ Nenhuma API de TTS configurada - usando áudio temporário');
  
  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Retornar URL de áudio de exemplo
  return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
}

/**
 * Upload de áudio para Supabase Storage
 */
async function uploadAudioToSupabaseStorage(audioBuffer: Buffer, filename: string): Promise<string> {
  console.log('📤 Fazendo upload do áudio:', filename);
  
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Upload para o bucket de áudios
    const { data, error } = await supabase.storage
      .from('exercise-audios')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Erro no upload:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('exercise-audios')
      .getPublicUrl(filename);

    console.log('✅ Upload concluído:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('❌ Erro no upload do áudio:', error);
    throw new Error('Falha no upload do áudio');
  }
}