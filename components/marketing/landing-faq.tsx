'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * FAQ curto da landing pública. É um Client Component isolado porque usa o
 * acordeão interativo (`@/components/ui/accordion`).
 *
 * As perguntas e respostas são um resumo das dúvidas comuns da ajuda interna
 * (seção "faq" de SECOES em components/ajuda/conteudo-ajuda.tsx). Mantê-las
 * consistentes com a ajuda: não contradizer o texto de lá. Para o conteúdo
 * completo, a página remete a /documentacao.
 */

interface PerguntaFaq {
  id: string;
  pergunta: string;
  resposta: string;
}

const PERGUNTAS: PerguntaFaq[] = [
  {
    id: 'precisa-personal',
    pergunta: 'Preciso de um personal para usar o Flvxus?',
    resposta:
      'Não. Com o plano Individual você treina por conta própria: cria seus próprios treinos e dietas, acompanha a evolução e participa da Flvxus Arena. Se tiver um personal, ele monta e libera o conteúdo para você no plano dele.',
  },
  {
    id: 'trial',
    pergunta: 'Como funciona o teste grátis?',
    resposta:
      'São 14 dias com acesso a todas as funcionalidades, para você conhecer o Flvxus antes de decidir. Cada plano pode ser mensal ou anual, e no anual você economiza em relação ao mensal.',
  },
  {
    id: 'arena',
    pergunta: 'O que é a Flvxus Arena e como ganho XP?',
    resposta:
      'É a gamificação do app. Você ganha XP por consistência: concluir treinos, cumprir a dieta do dia, bater a meta de água, registrar evolução, progredir carga e fazer check-in. O XP vira níveis permanentes, missões, conquistas e posições nos rankings da academia e globais.',
  },
  {
    id: 'duelo',
    pergunta: 'Como funcionam os desafios entre amigos?',
    resposta:
      'Você desafia um amigo para um duelo de XP de 7, 15 ou 30 dias. O duelo só começa a valer quando os dois aceitam; a partir daí conta o XP que cada um acumular no período. Vence quem somar mais XP e leva a medalha "Campeão de desafio". O duelo não dá XP de bônus — é reconhecimento, não atalho.',
  },
  {
    id: 'convite',
    pergunta: 'Não recebi o convite. E agora?',
    resposta:
      'Confira a caixa de spam ou lixo eletrônico. Se ainda assim não aparecer, o professor pode reenviar o convite para o mesmo e-mail enquanto a conta estiver pendente.',
  },
  {
    id: 'liberar',
    pergunta: 'Como o professor libera um treino para o aluno?',
    resposta:
      'Na ficha do aluno, o professor usa o controle de status para liberar agora ou agendar a liberação. Só depois de liberada a ficha passa a aparecer para o aluno. Quem treina por conta própria não tem essa etapa: o que cria já aparece na hora.',
  },
];

export function LandingFaq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {PERGUNTAS.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="min-h-11 text-left text-base">
            {item.pergunta}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {item.resposta}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
