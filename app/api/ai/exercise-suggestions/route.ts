// app/api/ai/exercise-suggestions/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('🚀 Iniciando geração de sugestões de exercício...');
  
  try {
    // Verificar autenticação
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('❌ Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Parse do body da request
    let exerciseName;
    try {
      const body = await request.json();
      exerciseName = body.exerciseName;
      console.log('📝 Nome do exercício recebido:', exerciseName);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json(
        { error: 'Formato de requisição inválido' },
        { status: 400 }
      );
    }

    // Validar nome do exercício
    if (!exerciseName || typeof exerciseName !== 'string' || exerciseName.trim().length === 0) {
      console.error('❌ Nome do exercício inválido:', exerciseName);
      return NextResponse.json(
        { error: 'Nome do exercício é obrigatório' },
        { status: 400 }
      );
    }

    // Limitar tamanho do nome para evitar abuse
    if (exerciseName.length > 100) {
      return NextResponse.json(
        { error: 'Nome do exercício muito longo (máximo 100 caracteres)' },
        { status: 400 }
      );
    }

    // Verificar se a API key existe
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY não está configurada');
      return NextResponse.json(
        { error: 'Configuração da API ausente. Verifique as variáveis de ambiente.' },
        { status: 500 }
      );
    }

    console.log('🤖 Inicializando Google Generative AI...');
    
    // Inicializar Gemini com tratamento de erro
    let genAI, model;
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Usar modelo mais recente
      console.log('✅ Modelo Gemini inicializado com sucesso');
    } catch (initError) {
      console.error('❌ Erro ao inicializar Gemini:', initError);
      return NextResponse.json(
        { error: 'Erro na configuração da IA. Verifique a API key.' },
        { status: 500 }
      );
    }

    // Prompt melhorado
    const prompt = `
Você é um personal trainer especializado. Analise o exercício "${exerciseName}" e forneça as informações em formato JSON válido.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional antes ou depois.

Estrutura obrigatória:
{
  "description": "Descrição detalhada do exercício (2-3 parágrafos explicando o que é, músculos trabalhados, benefícios)",
  "muscle_group": ["Lista dos grupos musculares - use APENAS: Peito, Costas, Pernas, Ombros, Braços, Core, Corpo Inteiro, Cardio"],
  "equipment": ["Lista de equipamentos - use APENAS: Peso Livre, Máquina, Cabo, Peso Corporal, Elástico, Kettlebell, TRX, Outros"],
  "variations": [
    "Variação 1: Descrição breve",
    "Variação 2: Descrição breve", 
    "Variação 3: Descrição breve"
  ],
  "tips": [
    "✔️ Posição inicial:",
    "🟡 Dica específica de posicionamento",
    "🟡 Outra dica de posicionamento",
    "✔️ Execução:",
    "🟡 Como realizar o movimento",
    "🟡 Dica de técnica",
    "✔️ Respiração:",
    "🟡 Quando inspirar/expirar"
  ],
  "common_errors": [
    "❌ Erro comum 1",
    "❌ Erro comum 2",
    "❌ Erro comum 3",
    "❌ Erro comum 4",
    "❌ Erro comum 5"
  ]
}

Exercício: ${exerciseName}
`;

    console.log('📤 Enviando prompt para Gemini...');

    // Fazer a chamada para a API com timeout
    let result;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      result = await model.generateContent(prompt);
      clearTimeout(timeoutId);
      
      console.log('📥 Resposta recebida do Gemini');
    } catch (apiError: any) {
      console.error('❌ Erro na API do Gemini:', apiError);
      
      // Tratar diferentes tipos de erro da API
      if (apiError.message?.includes('API_KEY_INVALID')) {
        return NextResponse.json(
          { error: 'Chave da API inválida. Verifique a configuração.' },
          { status: 500 }
        );
      }
      
      if (apiError.message?.includes('quota') || apiError.message?.includes('QUOTA_EXCEEDED')) {
        return NextResponse.json(
          { error: 'Limite de uso da API atingido. Tente novamente mais tarde.' },
          { status: 429 }
        );
      }

      if (apiError.message?.includes('timeout') || apiError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Timeout na API. Tente novamente.' },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { error: 'Erro na comunicação com a IA. Tente novamente em alguns instantes.' },
        { status: 503 }
      );
    }

    // Processar resposta
    let text;
    try {
      const response = await result.response;
      text = response.text();
      console.log('📄 Texto bruto recebido (primeiros 200 chars):', text.substring(0, 200));
    } catch (responseError) {
      console.error('❌ Erro ao extrair texto da resposta:', responseError);
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      );
    }

    // Parse do JSON da resposta
    try {
      console.log('🔍 Tentando extrair JSON da resposta...');
      
      // Limpar o texto removendo markdown e outros caracteres
      let cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '') // Remove linhas vazias
        .trim();

      // Tentar encontrar JSON válido
      let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ Nenhum JSON encontrado na resposta:', cleanedText);
        throw new Error('Resposta da IA não contém JSON válido');
      }
      
      console.log('🔧 JSON extraído:', jsonMatch[0].substring(0, 200) + '...');
      
      const data = JSON.parse(jsonMatch[0]);
      console.log('✅ JSON parseado com sucesso');
      
      // Validar e formatar os dados
      const formattedData = {
        description: typeof data.description === 'string' ? data.description.trim() : '',
        muscle_group: Array.isArray(data.muscle_group) ? data.muscle_group.filter((g: string) => g && g.trim()) : [],
        equipment: Array.isArray(data.equipment) ? data.equipment.filter((e: string) => e && e.trim()) : [],
        variations: Array.isArray(data.variations) ? data.variations.filter((v: string) => v && v.trim()) : [],
        tips: Array.isArray(data.tips) ? data.tips.filter((t: string) => t && t.trim()) : [],
        common_errors: Array.isArray(data.common_errors) ? data.common_errors.filter((e: string) => e && e.trim()) : []
      };

      console.log('📊 Dados formatados:', {
        description: formattedData.description.length + ' chars',
        muscle_group: formattedData.muscle_group.length + ' items',
        equipment: formattedData.equipment.length + ' items',
        variations: formattedData.variations.length + ' items',
        tips: formattedData.tips.length + ' items',
        common_errors: formattedData.common_errors.length + ' items'
      });

      // Verificar se os dados essenciais foram gerados
      if (!formattedData.description || formattedData.description.length < 50) {
        throw new Error('Descrição insuficiente gerada pela IA');
      }

      if (formattedData.muscle_group.length === 0) {
        throw new Error('Nenhum grupo muscular identificado pela IA');
      }

      if (formattedData.equipment.length === 0) {
        throw new Error('Nenhum equipamento identificado pela IA');
      }

      console.log('🎉 Sugestões geradas com sucesso!');
      return NextResponse.json(formattedData);
      
    } catch (parseError: any) {
      console.error('❌ Erro ao processar resposta da IA:', parseError);
      console.error('📄 Texto original da resposta:', text);
      
      return NextResponse.json(
        { 
          error: 'Não foi possível processar a resposta da IA. Tente novamente.',
          details: parseError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erro geral na API:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}