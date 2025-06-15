// app/api/ai/exercise-suggestions/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { exerciseName } = await request.json();

    if (!exerciseName) {
      return NextResponse.json(
        { error: 'Nome do exercício é obrigatório' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Você é um personal trainer especializado. Com base no nome do exercício "${exerciseName}", forneça as seguintes informações detalhadas:

    1. DESCRIÇÃO: Uma descrição completa do exercício, incluindo o que é, qual músculo trabalha, como é realizado e seus benefícios principais. (2-3 parágrafos)

    2. GRUPOS MUSCULARES: Liste APENAS os grupos musculares trabalhados. Use exatamente estes termos quando aplicável: "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Corpo Inteiro", "Cardio"

    3. EQUIPAMENTOS: Liste APENAS os equipamentos necessários. Use exatamente estes termos quando aplicável: "Peso Livre", "Máquina", "Cabo", "Peso Corporal", "Elástico", "Kettlebell", "TRX", "Outros"

    4. VARIAÇÕES: Liste 3-5 variações do exercício, cada uma em uma linha separada, com uma breve descrição.

    5. DICAS DE EXECUÇÃO: Forneça dicas detalhadas incluindo:
    ✔️ Posição inicial (2-3 pontos)
    ✔️ Execução do movimento (3-4 pontos)
    ✔️ Respiração correta

    6. ERROS COMUNS: Liste 5 erros comuns que devem ser evitados, cada um começando com ❌

    Formate a resposta em JSON com a seguinte estrutura:
    {
      "description": "descrição completa",
      "muscle_group": ["grupo1", "grupo2"],
      "equipment": ["equip1", "equip2"],
      "variations": ["variação 1", "variação 2"],
      "tips": ["dica 1", "dica 2"],
      "common_errors": ["erro 1", "erro 2"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse do JSON da resposta
    try {
      // Limpar o texto para extrair apenas o JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido');
      }
      
      const data = JSON.parse(jsonMatch[0]);
      
      // Validar e formatar os dados
      const formattedData = {
        description: data.description || '',
        muscle_group: Array.isArray(data.muscle_group) ? data.muscle_group : [],
        equipment: Array.isArray(data.equipment) ? data.equipment : [],
        variations: Array.isArray(data.variations) ? data.variations : [],
        tips: Array.isArray(data.tips) ? data.tips : [],
        common_errors: Array.isArray(data.common_errors) ? data.common_errors : []
      };

      return NextResponse.json(formattedData);
      
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      
      // Fallback com dados básicos
      return NextResponse.json({
        description: `${exerciseName} é um exercício eficaz para desenvolver força e resistência muscular.`,
        muscle_group: ["Corpo Inteiro"],
        equipment: ["Peso Livre"],
        variations: [],
        tips: [],
        common_errors: []
      });
    }

  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar sugestões com IA' },
      { status: 500 }
    );
  }
}