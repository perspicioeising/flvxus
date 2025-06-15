// app/api/ai/generate-audio/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      );
    }

    // Usar a API do Google Text-to-Speech
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'pt-BR',
            name: 'pt-BR-Wavenet-A', // Voz feminina natural
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95, // Velocidade ligeiramente mais lenta para clareza
            pitch: 0,
            volumeGainDb: 0
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao gerar áudio');
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    // Converter base64 para buffer
    const audioBuffer = Buffer.from(audioContent, 'base64');

    // Gerar nome único para o arquivo
    const fileName = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
    const filePath = `exercises/audio/${fileName}`;

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obter URL público
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Erro ao gerar áudio:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar áudio' },
      { status: 500 }
    );
  }
}