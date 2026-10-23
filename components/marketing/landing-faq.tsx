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
    id: 'convite',
    pergunta: 'Não recebi o convite. E agora?',
    resposta:
      'Confira a caixa de spam ou lixo eletrônico. Se ainda assim não aparecer, o professor pode reenviar o convite para o mesmo e-mail enquanto a conta estiver pendente.',
  },
  {
    id: 'liberar',
    pergunta: 'Como o professor libera um treino para o aluno?',
    resposta:
      'Na ficha do aluno, o professor usa o controle de status para liberar agora ou agendar a liberação. Só depois de liberada a ficha passa a aparecer para o aluno.',
  },
  {
    id: 'aluno-nao-ve',
    pergunta: 'O aluno não está vendo o treino. Por quê?',
    resposta:
      'O motivo mais comum é a ficha ainda estar em rascunho ou revisão — o aluno só vê fichas liberadas. Se a liberação foi agendada, a ficha aparece apenas na data ou prazo definido.',
  },
  {
    id: 'dieta',
    pergunta: 'A dieta não aparece para o aluno. O que verificar?',
    resposta:
      'Assim como os treinos, a dieta só fica visível depois de liberada. Vale confirmar se o professor já liberou a dieta na área de dietas.',
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
