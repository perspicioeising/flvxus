'use client';

import { AlertTriangle, Info } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Conteúdo da página de Ajuda do Flvxus, em pt-BR.
 *
 * Fonte única do texto: as páginas de ajuda do professor e do aluno montam
 * apenas o cabeçalho e renderizam este componente com o papel correto. As
 * seções de cada papel saem do inventário real de funcionalidades do app
 * (descrevem o que o código faz, sem inventar recursos).
 *
 * É um Client Component porque usa o acordeão interativo
 * (`@/components/ui/accordion`) e a navegação por âncoras do índice. Não lê
 * dados do usuário: o conteúdo é estático.
 */

export type PapelAjuda = 'trainer' | 'student';

/** Um bloco de parágrafo ou lista dentro de uma subseção. */
type Bloco =
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'captura'; descricao: string }
  | { tipo: 'nota'; texto: string };

/** Uma subseção da ajuda (vira um item do acordeão). */
interface Subsecao {
  id: string;
  titulo: string;
  blocos: Bloco[];
}

/** Um grupo de subseções com título (vira uma seção com âncora). */
interface Secao {
  id: string;
  titulo: string;
  descricao: string;
  /** Em quais papéis esta seção aparece. */
  papeis: PapelAjuda[];
  subsecoes: Subsecao[];
}

const SECOES: Secao[] = [
  {
    id: 'visao-geral',
    titulo: 'Visão geral do Flvxus',
    descricao: 'O que é o app e como ele organiza o trabalho entre professor e aluno.',
    papeis: ['trainer', 'student'],
    subsecoes: [
      {
        id: 'o-que-e',
        titulo: 'O que é o Flvxus',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'O Flvxus é uma plataforma para personal trainers acompanharem seus alunos de ponta a ponta: cadastro, avaliação física, montagem de treinos, dieta e evolução. O professor monta e libera o conteúdo; o aluno treina, registra o que fez e acompanha o próprio progresso.',
          },
          {
            tipo: 'paragrafo',
            texto:
              'Cada pessoa usa uma área própria, de acordo com o seu papel. O professor tem a área de gestão (alunos, avaliações, exercícios, modelos, treinos e dietas). O aluno tem a área de uso (treino do dia, execução, dieta, evolução e conquistas).',
          },
        ],
      },
      {
        id: 'papeis-privacidade',
        titulo: 'Áreas separadas e privacidade dos dados',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Professor e aluno enxergam coisas diferentes. O professor vê e gerencia os dados dos seus alunos; o aluno vê apenas o que é dele. Um aluno nunca vê os dados de outro aluno.',
          },
          {
            tipo: 'nota',
            texto:
              'O aluno só vê treinos e dietas depois que o professor libera. Enquanto estão em rascunho ou revisão, esses conteúdos ficam invisíveis para o aluno. Essa é a regra mais importante do app: liberar é o que entrega o conteúdo ao aluno.',
          },
        ],
      },
      {
        id: 'app-instalavel',
        titulo: 'Instalar como aplicativo no celular',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Além de rodar no navegador, o Flvxus pode ser instalado como aplicativo no celular, com ícone próprio e abertura em tela cheia (sem a barra do navegador). Não precisa baixar de nenhuma loja — a instalação é feita pelo próprio navegador. A experiência é pensada para o celular primeiro (mobile-first), com menu inferior nas telas pequenas e menu lateral nas telas maiores.',
          },
          {
            tipo: 'paragrafo',
            texto:
              'No Android, usando o Google Chrome:',
          },
          {
            tipo: 'lista',
            itens: [
              'Abra o Flvxus no Google Chrome.',
              'Toque no menu do navegador (ícone de três pontos no canto superior direito).',
              'Toque em "Instalar aplicativo" (ou "Adicionar à tela inicial", conforme a versão).',
              'Confirme em "Instalar". O ícone do Flvxus aparece na tela inicial.',
            ],
          },
          {
            tipo: 'paragrafo',
            texto:
              'No iPhone ou iPad, a instalação só funciona pelo Safari (limitação da Apple):',
          },
          {
            tipo: 'lista',
            itens: [
              'Abra o Flvxus no Safari.',
              'Toque no botão Compartilhar (o quadrado com uma seta para cima, na barra inferior).',
              'Role a lista e toque em "Adicionar à Tela de Início".',
              'Toque em "Adicionar" no canto superior direito. O ícone aparece na tela inicial.',
            ],
          },
          {
            tipo: 'nota',
            texto:
              'Depois de instalado, abra o app pelo ícone na tela inicial: ele ocupa a tela toda, como um aplicativo normal. Como o conteúdo vem da web, as atualizações são automáticas — você sempre usa a versão mais recente, sem atualizar por loja.',
          },
        ],
      },
    ],
  },
  {
    id: 'acesso',
    titulo: 'Acesso e conta',
    descricao: 'Entrar, sair e recuperar a senha.',
    papeis: ['trainer', 'student'],
    subsecoes: [
      {
        id: 'login-logout',
        titulo: 'Entrar e sair',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'O acesso é feito com e-mail e senha na tela de login. Depois de entrar, você cai direto na sua área (professor ou aluno). Para sair, use o botão "Sair" disponível no menu lateral (desktop) ou no menu inferior (celular).',
          },
        ],
      },
      {
        id: 'esqueci-senha',
        titulo: 'Esqueci minha senha',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Na tela de login há a opção de redefinir a senha. Você informa o e-mail, recebe um link e, ao abri-lo, define uma nova senha. Depois disso é só entrar normalmente com a senha nova.',
          },
        ],
      },
      {
        id: 'tema',
        titulo: 'Tema claro e escuro',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'O app tem tema claro e escuro. Use o botão de tema no cabeçalho para alternar conforme a sua preferência.',
          },
        ],
      },
    ],
  },

  // ===================== PROFESSOR =====================
  {
    id: 'prof-primeiros-passos',
    titulo: 'Para o professor: primeiros passos',
    descricao: 'Criar sua conta e entender o painel inicial.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-cadastro',
        titulo: 'Criar conta de professor',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'O personal cria a própria conta pela tela de cadastro, informando nome, e-mail e senha. A conta de professor é criada junto com o seu espaço de trabalho, onde ficarão seus alunos e conteúdos.',
          },
          {
            tipo: 'paragrafo',
            texto:
              'Quando a confirmação de e-mail está ativa, após o cadastro aparece uma tela pedindo para você verificar o e-mail. Confirme pelo link recebido antes de entrar.',
          },
        ],
      },
      {
        id: 'prof-visao-geral',
        titulo: 'Painel inicial (Visão geral)',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A Visão geral é a primeira tela do professor. Ela resume o essencial: total de alunos, quantos estão ativos e inativos, e quantas avaliações estão vencidas.',
          },
          {
            tipo: 'lista',
            itens: [
              'Avaliações vencidas: alunos ativos que estão há muito tempo sem avaliação (ou nunca avaliados), dos mais atrasados para os menos atrasados.',
              'Fichas aguardando liberação: fichas em rascunho, revisão ou aprovadas que o aluno ainda não vê.',
              'Atividade recente: últimas avaliações e fichas criadas, para você retomar de onde parou.',
            ],
          },
          { tipo: 'captura', descricao: 'tela de Visão geral com os contadores, as pendências e a atividade recente.' },
        ],
      },
    ],
  },
  {
    id: 'prof-alunos',
    titulo: 'Para o professor: alunos',
    descricao: 'Convidar, gerenciar e acessar a ficha de cada aluno.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-convidar-aluno',
        titulo: 'Cadastrar e convidar aluno por e-mail',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Para adicionar um aluno, use a opção de novo aluno e preencha os dados. Ao convidar por e-mail, o app cria o acesso do aluno e envia um convite para ele definir a própria senha e entrar. O aluno entra com o status pendente até ativar a conta.',
          },
        ],
      },
      {
        id: 'prof-reenviar-convite',
        titulo: 'Reenviar convite',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Se o aluno ainda não ativou a conta (status pendente), você pode reenviar o convite a qualquer momento, sem precisar recadastrar. O botão de reenviar fica disponível na lista e na ficha do aluno pendente.',
          },
        ],
      },
      {
        id: 'prof-gerenciar-alunos',
        titulo: 'Listar, filtrar, editar e mudar status',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A lista de alunos tem filtros e paginação para você achar rápido quem procura. Em cada aluno é possível editar o cadastro e mudar o status entre ativo, inativo e arquivado, conforme o acompanhamento.',
          },
          { tipo: 'captura', descricao: 'lista de alunos com filtros e os cartões de cada aluno com status.' },
        ],
      },
      {
        id: 'prof-ficha-atalhos',
        titulo: 'Ficha do aluno e atalhos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A ficha do aluno reúne os dados dele e um bloco de atalhos para as ações mais comuns, já com o aluno pré-selecionado: criar treino, nova avaliação, dieta, ver evolução e treinar com o aluno.',
          },
          {
            tipo: 'nota',
            texto:
              'O atalho "Treinar com o aluno" muda conforme a situação: se o aluno não tem nenhuma ficha liberada, ele o leva a criar/liberar uma; se tem uma, abre direto a execução; se tem várias, você escolhe qual.',
          },
        ],
      },
    ],
  },
  {
    id: 'prof-avaliacao',
    titulo: 'Para o professor: avaliação física',
    descricao: 'Protocolos, medidas, composição corporal, fotos e histórico.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-criar-avaliacao',
        titulo: 'Criar e editar uma avaliação',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Você registra a avaliação do aluno com os dados que coletou. A composição corporal (IMC, percentual de gordura e massas) é calculada automaticamente a partir das medidas informadas, então você não precisa fazer as contas na mão.',
          },
          {
            tipo: 'lista',
            itens: [
              'Dobras cutâneas: campos por protocolo para o cálculo do percentual de gordura.',
              'Circunferências: medidas corporais (cintura, quadril, braços etc.).',
              'Anamnese: histórico e informações de saúde relevantes.',
            ],
          },
        ],
      },
      {
        id: 'prof-fotos',
        titulo: 'Fotos da avaliação',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'É possível anexar fotos à avaliação. Elas ficam guardadas de forma privada e servem para o acompanhamento visual da evolução.',
          },
        ],
      },
      {
        id: 'prof-historico-graficos',
        titulo: 'Histórico e gráficos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'As avaliações formam um histórico com gráficos de evolução (peso, percentual de gordura, cintura e outras medidas), ajudando a enxergar a tendência ao longo do tempo.',
          },
          { tipo: 'captura', descricao: 'formulário de avaliação com dobras, circunferências e os gráficos de evolução.' },
        ],
      },
    ],
  },
  {
    id: 'prof-exercicios',
    titulo: 'Para o professor: biblioteca de exercícios',
    descricao: 'Catálogo global, acervo próprio, mídia e duplicação.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-catalogo-acervo',
        titulo: 'Catálogo global e acervo próprio',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Você tem acesso a um catálogo global de exercícios, compartilhado e somente leitura, além do seu acervo próprio, onde pode criar, editar e excluir exercícios. Há filtros para encontrar exercícios rapidamente.',
          },
        ],
      },
      {
        id: 'prof-duplicar-exercicio',
        titulo: 'Duplicar um exercício do catálogo',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Se um exercício do catálogo global está quase do jeito que você quer, duplique-o para o seu acervo. A cópia fica editável, então você ajusta nome, descrição e mídia sem mexer no original.',
          },
        ],
      },
      {
        id: 'prof-midia-exercicio',
        titulo: 'Mídia do exercício (GIF/vídeo)',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Cada exercício do seu acervo pode ter vídeo e miniatura de demonstração. Essa mídia é a que aparece para o aluno durante a execução do treino, ajudando-o a fazer o movimento correto.',
          },
          { tipo: 'captura', descricao: 'formulário de exercício com o campo de mídia e a prévia do vídeo/GIF.' },
        ],
      },
    ],
  },
  {
    id: 'prof-modelos',
    titulo: 'Para o professor: modelos de treino',
    descricao: 'Criar e reutilizar modelos para montar fichas mais rápido.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-criar-modelo',
        titulo: 'Criar e organizar modelos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Modelos de treino são esqueletos reutilizáveis. Você monta um modelo com seus exercícios e a prescrição de cada um (séries, repetições, descanso, carga alvo e observações) e reusa esse modelo com vários alunos.',
          },
          {
            tipo: 'paragrafo',
            texto:
              'Dentro do modelo é possível reordenar os exercícios (subir e descer) para deixar a sequência do jeito que você treina.',
          },
        ],
      },
      {
        id: 'prof-buscar-modelos',
        titulo: 'Buscar e filtrar modelos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A lista de modelos permite buscar e filtrar, para você reaproveitar o modelo certo na hora de montar a ficha de um aluno.',
          },
        ],
      },
    ],
  },
  {
    id: 'prof-treinos',
    titulo: 'Para o professor: montagem de treino',
    descricao: 'Fichas por aluno, divisões, modelos, clonagem e liberação.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-criar-ficha',
        titulo: 'Criar a ficha de um aluno',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A ficha é o treino de um aluno específico. Toda ficha nasce em rascunho — ou seja, só você a vê — até o momento em que você a libera. Você monta a ficha escolhendo exercícios e definindo a prescrição de cada série.',
          },
        ],
      },
      {
        id: 'prof-divisoes',
        titulo: 'Divisões A, B, C, D, E',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A ficha pode ser organizada em divisões (A, B, C, D, E), o clássico treino dividido por grupos. Cada divisão tem seus exercícios e o aluno escolhe qual divisão vai treinar no dia.',
          },
        ],
      },
      {
        id: 'prof-de-modelo',
        titulo: 'Criar a ficha a partir de modelos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Para ganhar tempo, você cria a ficha a partir de um modelo pronto. Dá também para montar a ficha a partir de vários modelos de uma vez — um modelo por divisão — para formar um A/B/C completo em poucos cliques.',
          },
        ],
      },
      {
        id: 'prof-clonar-ficha',
        titulo: 'Clonar uma ficha para outro aluno',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Se você já montou uma ficha boa e quer aplicá-la a outro aluno, clone-a. A cópia leva todos os itens, divisões e a prescrição, mas sempre nasce como rascunho — ela nunca entra liberada, para você revisar antes de entregar.',
          },
        ],
      },
      {
        id: 'prof-liberacao',
        titulo: 'Liberar agora ou agendar a liberação',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Liberar é o que torna a ficha visível ao aluno. Você pode liberar imediatamente ou agendar a liberação para uma data específica ou para daqui a um número de dias. Ao chegar a data/prazo definido, a ficha passa a aparecer para o aluno.',
          },
          {
            tipo: 'nota',
            texto:
              'Enquanto a ficha está em rascunho, revisão ou aprovada, o aluno não a vê. Se um aluno reclamar que não encontra o treino, verifique se a ficha já foi liberada.',
          },
          { tipo: 'captura', descricao: 'controle de status da ficha com as opções de liberar agora e agendar liberação.' },
        ],
      },
      {
        id: 'prof-treinar-presencial',
        titulo: 'Treinar presencialmente com o aluno',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Quando você acompanha o treino presencialmente, pode abrir a mesma tela de execução que o aluno usa, a partir de uma ficha liberada, e registrar a sessão em nome dele. Assim as cargas e repetições do dia ficam gravadas mesmo quando quem opera o app é você.',
          },
        ],
      },
    ],
  },
  {
    id: 'prof-dieta',
    titulo: 'Para o professor: dieta',
    descricao: 'Gerar com IA, revisar o rascunho e liberar.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-dieta-ia',
        titulo: 'Gerar dieta com IA (rascunho)',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'O app conta com recursos de IA para acelerar seu trabalho: gerar uma dieta, sugerir um treino e ajudar a analisar uma avaliação. Em todos os casos, a IA produz apenas um rascunho — nada é entregue ao aluno automaticamente.',
          },
        ],
      },
      {
        id: 'prof-dieta-revisar',
        titulo: 'Revisar e aprovar',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Você revisa e edita o rascunho gerado pela IA e só então aprova. A aprovação é o que transforma o rascunho em uma dieta (ou ficha/análise) de verdade. Nada sai da IA direto para o aluno sem a sua revisão.',
          },
        ],
      },
      {
        id: 'prof-dieta-liberar',
        titulo: 'Liberar a dieta',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Assim como os treinos, a dieta só fica visível ao aluno depois que você a libera. Você controla o status da dieta na área de dietas e libera quando estiver pronta.',
          },
        ],
      },
    ],
  },
  {
    id: 'prof-evolucao-extras',
    titulo: 'Para o professor: evolução e recursos em breve',
    descricao: 'Acompanhar o progresso do aluno e o que ainda está por vir.',
    papeis: ['trainer'],
    subsecoes: [
      {
        id: 'prof-evolucao',
        titulo: 'Evolução do aluno',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Pela ficha do aluno você acompanha a evolução dele: aderência aos treinos, progressão de carga/volume/frequência e os gráficos das avaliações físicas. É a mesma visão de progresso que o aluno vê da parte dele.',
          },
        ],
      },
      {
        id: 'prof-em-breve',
        titulo: 'Agenda e Configurações (em breve)',
        blocos: [
          {
            tipo: 'nota',
            texto:
              'As áreas de Agenda e Configurações ainda estão em construção e não aparecem no menu. Elas serão disponibilizadas em uma próxima versão.',
          },
        ],
      },
    ],
  },

  // ===================== ALUNO =====================
  {
    id: 'aluno-primeiros-passos',
    titulo: 'Para o aluno: primeiros passos',
    descricao: 'Ativar a conta e conhecer a tela inicial.',
    papeis: ['student'],
    subsecoes: [
      {
        id: 'aluno-ativar-conta',
        titulo: 'Aceitar o convite e definir a senha',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Seu professor envia um convite para o seu e-mail. Ao abrir o link do convite, você define a sua senha. Depois disso, é só entrar com o e-mail e a senha que você criou.',
          },
          {
            tipo: 'nota',
            texto:
              'Não achou o convite? Verifique a caixa de spam/lixo eletrônico. Se mesmo assim não encontrar, peça ao seu professor para reenviar o convite.',
          },
        ],
      },
      {
        id: 'aluno-inicio',
        titulo: 'Tela inicial (Início)',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A tela de Início mostra o treino do dia a partir da ficha liberada, atalhos para Treinos, Dieta, Evolução e Conquistas, e um resumo da sua última avaliação. É o ponto de partida para o dia a dia.',
          },
          { tipo: 'captura', descricao: 'tela inicial do aluno com o treino do dia e os atalhos.' },
        ],
      },
    ],
  },
  {
    id: 'aluno-treinos',
    titulo: 'Para o aluno: treinos',
    descricao: 'Ver as fichas liberadas e executar o treino.',
    papeis: ['student'],
    subsecoes: [
      {
        id: 'aluno-ver-treinos',
        titulo: 'Ver os treinos liberados',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Em Treinos você encontra as fichas que o professor liberou. A navegação pode ser por dia da semana ou por divisão (A, B, C), conforme como o seu treino foi montado.',
          },
          {
            tipo: 'nota',
            texto:
              'Se o treino que você espera não aparece, provavelmente o professor ainda não o liberou. Fale com ele para confirmar.',
          },
        ],
      },
      {
        id: 'aluno-executar',
        titulo: 'Executar o treino',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A execução é guiada: você vê um exercício e uma série por vez, para focar no que está fazendo agora. Primeiro escolha o dia/divisão que vai treinar.',
          },
          {
            tipo: 'lista',
            itens: [
              'Registre a carga e as repetições de cada série conforme for fazendo.',
              'O timer de descanso inicia sozinho ao concluir uma série, para você controlar o intervalo.',
              'Dá para editar uma série já concluída, caso tenha registrado errado.',
              'Cada exercício mostra o GIF/vídeo de demonstração e instruções, dicas e erros comuns que você pode abrir quando quiser.',
            ],
          },
          {
            tipo: 'paragrafo',
            texto:
              'Ao terminar, você finaliza a sessão informando uma observação e a intensidade percebida (RPE, de 1 a 10) — o quanto o treino foi puxado para você.',
          },
          { tipo: 'captura', descricao: 'tela de execução mostrando uma série por vez, o timer de descanso e o botão de finalizar.' },
        ],
      },
    ],
  },
  {
    id: 'aluno-dieta',
    titulo: 'Para o aluno: dieta',
    descricao: 'Ver a dieta liberada pelo professor.',
    papeis: ['student'],
    subsecoes: [
      {
        id: 'aluno-ver-dieta',
        titulo: 'Ver a dieta liberada',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Em Dieta você vê a dieta mais recente que o professor liberou, apenas para leitura. Ela traz as metas (calorias e macros), restrições, observações e as refeições com horário, alimentos e totais.',
          },
          {
            tipo: 'nota',
            texto:
              'Se ainda não há dieta, é porque o professor não liberou nenhuma. Ela aparece aqui assim que for liberada.',
          },
        ],
      },
    ],
  },
  {
    id: 'aluno-progresso',
    titulo: 'Para o aluno: evolução e conquistas',
    descricao: 'Acompanhar o próprio progresso e a gamificação.',
    papeis: ['student'],
    subsecoes: [
      {
        id: 'aluno-evolucao',
        titulo: 'Evolução e gráficos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Em Evolução você acompanha a sua aderência aos treinos (quantos concluiu no período) e os gráficos de progressão de carga, volume e frequência, além dos gráficos das avaliações físicas (peso, percentual de gordura, cintura).',
          },
        ],
      },
      {
        id: 'aluno-conquistas',
        titulo: 'Conquistas e pontos',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'A área de Conquistas resume a sua gamificação: pontos acumulados, sua sequência (streak) de treinos e as conquistas que você desbloqueou. Treinar com constância é o que faz esses números crescerem.',
          },
        ],
      },
      {
        id: 'aluno-avaliacoes',
        titulo: 'Minhas avaliações',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Você também pode ver as suas avaliações físicas registradas pelo professor, para acompanhar os resultados ao longo do tempo.',
          },
        ],
      },
      {
        id: 'aluno-perfil',
        titulo: 'Perfil',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'No Perfil você edita seus dados pessoais: nome, telefone, data de nascimento, gênero e altura.',
          },
        ],
      },
    ],
  },

  // ===================== FAQ =====================
  {
    id: 'faq',
    titulo: 'Dúvidas comuns',
    descricao: 'Respostas rápidas para as situações mais frequentes.',
    papeis: ['trainer', 'student'],
    subsecoes: [
      {
        id: 'faq-convite',
        titulo: 'Não recebi o convite',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Confira a caixa de spam/lixo eletrônico. Se ainda assim não aparecer, o professor pode reenviar o convite para o mesmo e-mail enquanto a conta estiver pendente.',
          },
        ],
      },
      {
        id: 'faq-liberar',
        titulo: 'Como libero um treino para o aluno? (professor)',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Abra a ficha e use o controle de status para liberar agora ou agendar a liberação. Só depois de liberada a ficha passa a aparecer para o aluno.',
          },
        ],
      },
      {
        id: 'faq-aluno-nao-ve',
        titulo: 'O aluno não vê o treino',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'O motivo mais comum é a ficha ainda estar em rascunho ou revisão. O aluno só vê fichas liberadas. Confirme o status da ficha; se foi agendada, ela aparece só na data/prazo definido.',
          },
        ],
      },
      {
        id: 'faq-dieta-nao-aparece',
        titulo: 'A dieta não aparece para o aluno',
        blocos: [
          {
            tipo: 'paragrafo',
            texto:
              'Assim como os treinos, a dieta só fica visível depois de liberada. Verifique se o professor liberou a dieta na área de dietas.',
          },
        ],
      },
    ],
  },
];

/** Converte um bloco de conteúdo em JSX. */
function Blocos({ blocos }: { blocos: Bloco[] }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {blocos.map((bloco, i) => {
        if (bloco.tipo === 'paragrafo') {
          return <p key={i}>{bloco.texto}</p>;
        }
        if (bloco.tipo === 'lista') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {bloco.itens.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        if (bloco.tipo === 'nota') {
          return (
            <div
              key={i}
              className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-foreground dark:border-emerald-900 dark:bg-emerald-950/40"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>{bloco.texto}</span>
            </div>
          );
        }
        // captura (placeholder de screenshot)
        return (
          <p
            key={i}
            className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs italic"
          >
            [imagem: {bloco.descricao}]
          </p>
        );
      })}
    </div>
  );
}

export function ConteudoAjuda({ role }: { role: PapelAjuda }) {
  const secoes = SECOES.filter((s) => s.papeis.includes(role));

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* Índice (navegação por âncoras) — coluna lateral em telas grandes. */}
      <nav aria-label="Índice da ajuda" className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nesta página
        </p>
        <ul className="space-y-1 text-sm">
          {secoes.map((secao) => (
            <li key={secao.id}>
              <a
                href={`#${secao.id}`}
                className="block rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {secao.titulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Conteúdo */}
      <div className="min-w-0 space-y-8">
        {secoes.map((secao) => (
          <section key={secao.id} id={secao.id} className="scroll-mt-6">
            <div className="mb-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {secao.titulo}
              </h2>
              <p className="text-sm text-muted-foreground">{secao.descricao}</p>
            </div>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <Accordion type="multiple" className="w-full">
                  {secao.subsecoes.map((sub) => (
                    <AccordionItem key={sub.id} value={sub.id} id={sub.id}>
                      <AccordionTrigger className="text-left text-base">
                        <h3 className="text-base font-medium">{sub.titulo}</h3>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Blocos blocos={sub.blocos} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        ))}

        {/* Rodapé: aviso sobre conteúdo gerado por IA. */}
        <Alert>
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Conteúdo gerado por IA é uma sugestão</AlertTitle>
          <AlertDescription>
            Dietas e treinos criados com apoio de inteligência artificial são sugestões
            e passam pela revisão do profissional. Eles não substituem o acompanhamento
            de um profissional habilitado (educador físico, nutricionista ou médico).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
