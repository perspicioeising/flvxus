import type { ReactNode } from 'react';

import { LEGAL_EFFECTIVE_DATE, PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

/**
 * Conteúdo legal versionado do Flvxus, em pt-BR (design.md §2.10).
 *
 * Os textos ficam no CÓDIGO (não no banco) e são expostos em `/termos` e
 * `/privacidade`. Os dados jurídicos reais (razão social, CNPJ, DPO, endereço,
 * prazos de retenção) NÃO são inventados: aparecem como `<TodoJuridico>` —
 * destaque VISÍVEL no render para não passarem despercebidos em produção até o
 * preenchimento pelo responsável jurídico.
 *
 * A Política de Privacidade segue a LGPD (Lei 13.709/2018) e cobre as seções
 * obrigatórias de CA7: controlador/DPO, dados coletados, finalidade/base legal,
 * compartilhamento com operadores, direitos do titular, retenção, cookies e
 * versionamento.
 */

/** Marcação visível de pendência jurídica (nada é inventado). */
export function TodoJuridico({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-yellow-200 px-1 font-medium text-yellow-950 dark:bg-yellow-500/30 dark:text-yellow-100">
      TODO(jurídico): {children}
    </mark>
  );
}

/** Uma seção de um documento legal (vira um bloco `h2` + conteúdo). */
export interface SecaoLegal {
  id: string;
  titulo: string;
  conteudo: ReactNode;
}

/** Documento legal completo consumido por `LegalDocument`. */
export interface DocumentoLegal {
  titulo: string;
  versao: string;
  dataVigencia: string;
  resumo: string;
  secoes: SecaoLegal[];
}

export const TERMOS_DE_USO: DocumentoLegal = {
  titulo: 'Termos de Uso',
  versao: TERMS_VERSION,
  dataVigencia: LEGAL_EFFECTIVE_DATE,
  resumo:
    'Estes Termos regem o uso da plataforma Flvxus por personal trainers e seus alunos. Ao criar uma conta ou definir sua senha de acesso, você declara que leu e concorda com os termos abaixo.',
  secoes: [
    {
      id: 'objeto',
      titulo: '1. Objeto do serviço',
      conteudo: (
        <p>
          O Flvxus é uma plataforma de gestão para personal trainers organizarem
          alunos, treinos, avaliações físicas e acompanhamento. O serviço é
          fornecido no estado em que se encontra, podendo evoluir em recursos ao
          longo do tempo. <TodoJuridico>descrever eventuais planos pagos e limites de uso.</TodoJuridico>
        </p>
      ),
    },
    {
      id: 'elegibilidade',
      titulo: '2. Elegibilidade',
      conteudo: (
        <p>
          Para usar o Flvxus você deve ter capacidade civil plena. Profissionais
          que cadastram alunos declaram possuir habilitação adequada para a
          prestação dos serviços de treinamento físico. O uso por menores de
          idade só é permitido com consentimento e supervisão de responsável
          legal. <TodoJuridico>idade mínima e requisitos profissionais exigidos.</TodoJuridico>
        </p>
      ),
    },
    {
      id: 'conta',
      titulo: '3. Conta e responsabilidades',
      conteudo: (
        <>
          <p>
            Você é responsável por manter a confidencialidade das suas
            credenciais e por toda atividade realizada na sua conta. O professor é
            responsável pelos dados dos alunos que cadastra, inclusive por obter o
            consentimento necessário para o tratamento desses dados.
          </p>
          <p>
            O aluno é responsável pela veracidade das informações que fornece,
            especialmente dados de saúde usados nas avaliações físicas.
          </p>
        </>
      ),
    },
    {
      id: 'uso-aceitavel',
      titulo: '4. Uso aceitável',
      conteudo: (
        <>
          <p>Ao usar o Flvxus, você concorda em não:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>violar leis aplicáveis ou direitos de terceiros;</li>
            <li>acessar contas ou dados de outros usuários sem autorização;</li>
            <li>
              tentar comprometer a segurança, a integridade ou a disponibilidade
              da plataforma;
            </li>
            <li>usar os serviços para fins fraudulentos ou enganosos.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'propriedade-intelectual',
      titulo: '5. Propriedade intelectual',
      conteudo: (
        <p>
          A marca, o software e os conteúdos originais do Flvxus são protegidos
          por direitos de propriedade intelectual. Os dados e conteúdos que você
          insere permanecem seus; ao usá-los na plataforma, você concede ao Flvxus
          a licença necessária para operar o serviço (armazenar e processar esses
          dados para entregar as funcionalidades contratadas).
        </p>
      ),
    },
    {
      id: 'isencoes',
      titulo: '6. Isenções e limitação de responsabilidade',
      conteudo: (
        <p>
          O Flvxus é uma ferramenta de organização e não substitui a avaliação
          profissional. As decisões de treino e saúde são de responsabilidade do
          profissional e do aluno. Na máxima extensão permitida pela lei, o Flvxus
          não se responsabiliza por danos indiretos decorrentes do uso da
          plataforma. <TodoJuridico>limites de responsabilidade e garantias conforme revisão jurídica.</TodoJuridico>
        </p>
      ),
    },
    {
      id: 'suspensao',
      titulo: '7. Suspensão e encerramento',
      conteudo: (
        <p>
          Podemos suspender ou encerrar o acesso em caso de violação destes
          Termos. Você pode encerrar sua conta a qualquer momento; os registros
          legais de aceite são retidos como prova mesmo após o encerramento,
          conforme a Política de Privacidade.
        </p>
      ),
    },
    {
      id: 'alteracoes',
      titulo: '8. Alterações dos Termos',
      conteudo: (
        <p>
          Estes Termos podem ser atualizados. Mudanças relevantes sobem a versão
          do documento e podem exigir um novo aceite no próximo acesso. A versão
          vigente é sempre a indicada no topo desta página.
        </p>
      ),
    },
    {
      id: 'foro',
      titulo: '9. Lei aplicável e foro',
      conteudo: (
        <p>
          Estes Termos são regidos pela legislação brasileira.{' '}
          <TodoJuridico>definir o foro de eleição (comarca) para a resolução de disputas.</TodoJuridico>
        </p>
      ),
    },
  ],
};

export const POLITICA_DE_PRIVACIDADE: DocumentoLegal = {
  titulo: 'Política de Privacidade',
  versao: PRIVACY_VERSION,
  dataVigencia: LEGAL_EFFECTIVE_DATE,
  resumo:
    'Esta Política descreve como o Flvxus trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Ao usar a plataforma, você declara estar ciente destas práticas.',
  secoes: [
    {
      id: 'controlador-dpo',
      titulo: '1. Controlador e Encarregado (DPO)',
      conteudo: (
        <>
          <p>
            O controlador dos dados tratados na plataforma é:{' '}
            <TodoJuridico>razão social</TodoJuridico>, inscrita no{' '}
            <TodoJuridico>CNPJ</TodoJuridico>, com sede em{' '}
            <TodoJuridico>endereço completo</TodoJuridico>.
          </p>
          <p>
            Encarregado pelo Tratamento de Dados Pessoais (DPO):{' '}
            <TodoJuridico>nome e e-mail do encarregado</TodoJuridico>. Use esse
            contato para exercer seus direitos de titular (seção 6).
          </p>
        </>
      ),
    },
    {
      id: 'dados-coletados',
      titulo: '2. Dados coletados',
      conteudo: (
        <>
          <p>Tratamos as seguintes categorias de dados:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Dados cadastrais:</strong> nome, e-mail, telefone e, para
              professores, nome do negócio.
            </li>
            <li>
              <strong>Dados de alunos:</strong> informações cadastrais dos alunos
              inseridas pelo professor.
            </li>
            <li>
              <strong>Dados sensíveis de saúde:</strong> medidas e avaliações
              físicas (dado pessoal sensível, tratado mediante consentimento).
            </li>
            <li>
              <strong>Dados de uso e técnicos:</strong> endereço IP, user-agent do
              navegador e data/hora — inclusive os capturados no momento deste
              aceite, usados como prova do consentimento.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'finalidade-base-legal',
      titulo: '3. Finalidade e base legal',
      conteudo: (
        <>
          <p>Tratamos os dados para as seguintes finalidades e bases legais:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Execução de contrato:</strong> operar a plataforma, gerenciar
              contas, treinos e avaliações.
            </li>
            <li>
              <strong>Consentimento:</strong> tratamento de dados sensíveis de
              saúde e processamento por recursos de inteligência artificial.
            </li>
            <li>
              <strong>Legítimo interesse:</strong> segurança, prevenção a fraudes e
              melhoria do serviço.
            </li>
            <li>
              <strong>Cumprimento de obrigação legal:</strong> retenção de registros
              de aceite como prova.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'compartilhamento',
      titulo: '4. Compartilhamento com operadores',
      conteudo: (
        <>
          <p>
            Compartilhamos dados com operadores estritamente para viabilizar o
            serviço:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Supabase:</strong> hospedagem, banco de dados, autenticação e
              armazenamento de arquivos.
            </li>
            <li>
              <strong>Anthropic:</strong> processamento por inteligência artificial
              em funcionalidades específicas, quando você utiliza esses recursos.
            </li>
            <li>
              <strong>Stripe (uso futuro):</strong> processamento de pagamentos.
              Ainda não está em uso; será ativado quando houver planos pagos.
            </li>
          </ul>
          <p>
            Não vendemos dados pessoais nem os compartilhamos para publicidade de
            terceiros.
          </p>
        </>
      ),
    },
    {
      id: 'direitos-titular',
      titulo: '5. Direitos do titular (art. 18 da LGPD)',
      conteudo: (
        <>
          <p>Como titular, você pode solicitar a qualquer momento:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>confirmação da existência de tratamento e acesso aos dados;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>portabilidade dos dados;</li>
            <li>informação sobre com quem os dados são compartilhados;</li>
            <li>revogação do consentimento.</li>
          </ul>
          <p>
            Para exercer esses direitos, use o contato do Encarregado (seção 1).
          </p>
        </>
      ),
    },
    {
      id: 'retencao',
      titulo: '6. Retenção',
      conteudo: (
        <p>
          Mantemos os dados pelo tempo necessário às finalidades descritas e ao
          cumprimento de obrigações legais. Os registros de aceite legal são
          retidos como prova mesmo após o encerramento da conta.{' '}
          <TodoJuridico>definir os prazos de retenção por categoria de dado.</TodoJuridico>
        </p>
      ),
    },
    {
      id: 'cookies',
      titulo: '7. Cookies',
      conteudo: (
        <p>
          Usamos apenas cookies essenciais de sessão e autenticação (geridos pelo
          Supabase/@supabase/ssr) para manter você conectado e proteger o acesso.
          Não utilizamos cookies de rastreamento publicitário.
        </p>
      ),
    },
    {
      id: 'alteracoes-versionamento',
      titulo: '8. Alterações e versionamento',
      conteudo: (
        <p>
          Esta Política pode ser atualizada. Mudanças relevantes sobem a versão do
          documento e podem exigir um novo aceite no próximo acesso. A versão
          vigente é sempre a indicada no topo desta página.
        </p>
      ),
    },
  ],
};
