-- =============================================================================
-- Flvxus — Catálogo CONSOLIDADO de exercícios para o tenant Treinador Eising
-- =============================================================================
-- Rode no SQL Editor do Supabase. Este script:
--   1) Remove o catálogo anterior DESTE tenant (idempotente: rodar 2x não duplica).
--   2) Insere um catálogo único e consolidado = seed base + adicionais, sem
--      duplicidade conceitual.
--
-- Tenant:  ae4e4d12-7d48-4e23-8ef1-ccab78144d5d   (Treinador Eising)
-- Trainer: 04da75ff-9966-408c-942e-461acca2537d   (created_by / owner do tenant)
-- (A linha em public.tenants já foi inserida pelo usuário — não é recriada aqui.)
--
-- IMPORTANTE: os valores de muscle_groups/equipment usam o vocabulário do filtro
-- da aplicação (schemas/exercicio.ts). O PRIMEIRO grupo é sempre um grupo amplo
-- do filtro (correspondência EXATA, case-sensitive) para o filtro funcionar;
-- rótulos mais específicos (ex.: 'Tríceps', 'Glúteos') podem vir como 2º rótulo.
--   Grupos amplos (filtro): Peito, Costas, Pernas, Ombros, Braços, Core,
--                           Corpo Inteiro, Cardio
--   Equip.: Peso Livre, Máquina, Cabo, Peso Corporal, Elástico, Kettlebell,
--           TRX, Outros
-- =============================================================================

-- 1) Limpa exercícios anteriores deste tenant (idempotente). NÃO toca outros tenants.
DELETE FROM public.exercises
WHERE tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d';

-- 2) Insere o catálogo consolidado.
INSERT INTO public.exercises
  (tenant_id, created_by, name, muscle_groups, equipment, instructions, tips, common_errors)
VALUES

-- ============================= PEITO ========================================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Supino reto com barra',
 ARRAY['Peito','Braços'], ARRAY['Peso Livre'],
 'Deite no banco reto com os pés firmes no chão. Retire a barra do suporte com pegada na largura dos ombros. Desça a barra controladamente até tocar levemente o peito (linha dos mamilos), mantendo os cotovelos a ~75°. Empurre até estender os braços sem travar os cotovelos.',
 ARRAY['Mantenha as escápulas retraídas e o peito projetado','Pés firmes no chão, sem levantar o quadril','Desça a barra na linha dos mamilos, não no pescoço','Expire ao empurrar, inspire ao descer'],
 ARRAY['Quicar a barra no peito','Levantar o quadril do banco','Pegada muito aberta ou muito fechada','Travar os cotovelos no topo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Supino reto com halteres',
 ARRAY['Peito','Braços'], ARRAY['Peso Livre'],
 'Deite no banco reto segurando um halter em cada mão na altura do peito. Empurre os halteres para cima até quase estender os braços, mantendo-os alinhados com o peito. Desça controladamente até os cotovelos ficarem na linha do tronco.',
 ARRAY['Maior amplitude de movimento que a barra','Não bata os halteres no topo','Mantenha os punhos firmes e neutros','Controle a descida'],
 ARRAY['Usar impulso para subir os halteres','Descer rápido demais','Halteres desalinhados durante o movimento']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Supino inclinado com halteres',
 ARRAY['Peito','Ombros'], ARRAY['Peso Livre'],
 'No banco inclinado a 30-45°, empurre os halteres para cima partindo da linha do peito até quase estender os braços. Desça controladamente mantendo os cotovelos abertos.',
 ARRAY['Inclinação de 30-45° foca a porção superior do peito','Controle a descida','Mantenha os punhos firmes','Expire ao empurrar'],
 ARRAY['Inclinação muito alta (vira exercício de ombro)','Bater os halteres no topo','Carga excessiva comprometendo a amplitude']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Supino inclinado com barra',
 ARRAY['Peito','Ombros','Braços'], ARRAY['Peso Livre'],
 'No banco inclinado a 30-45°, retire a barra do suporte. Desça controladamente até o peito superior e empurre de volta.',
 ARRAY['Foco na porção clavicular (superior) do peito','Pegada na largura dos ombros ou ligeiramente mais aberta','Escápulas retraídas'],
 ARRAY['Inclinar demais o banco (acima de 45°)','Deixar a barra descer para o pescoço']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Supino declinado com barra',
 ARRAY['Peito','Braços'], ARRAY['Peso Livre','Máquina'],
 'No banco declinado (15-30°) com os pés presos no suporte, retire a barra (ou use os puxadores da máquina) e desça até a porção inferior do peito. Empurre de volta controladamente até quase estender os cotovelos.',
 ARRAY['Foca a porção inferior (esternal) do peito','Peça ajuda de um parceiro para retirar/guardar a barra','Mantenha as escápulas retraídas'],
 ARRAY['Ângulo muito acentuado','Descer a barra no pescoço','Bater a barra no peito']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Crucifixo com halteres (banco reto)',
 ARRAY['Peito'], ARRAY['Peso Livre'],
 'Deite no banco reto com um halter em cada mão, braços estendidos acima do peito com leve flexão nos cotovelos. Abra os braços lateralmente descendo até sentir o alongamento no peito, depois retorne à posição inicial.',
 ARRAY['Mantenha uma leve flexão nos cotovelos o tempo todo','Movimento em arco (não é supino)','Sinta o alongamento na descida e a contração na subida'],
 ARRAY['Estender os cotovelos completamente (vira supino)','Descer demais (risco de lesão no ombro)','Carga muito pesada']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Voador (Peck Deck)',
 ARRAY['Peito'], ARRAY['Máquina'],
 'Sente-se no aparelho com as costas apoiadas. Agarre os puxadores e feche os braços à frente do corpo, apertando o peito. Retorne controladamente.',
 ARRAY['Mantenha 2 segundos de pico de contração no fechamento','Cotovelos levemente flexionados','Peito estufado'],
 ARRAY['Usar impulso do tronco','Soltar o peso de uma vez na volta','Curvar os ombros para frente']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Cross over',
 ARRAY['Peito'], ARRAY['Cabo'],
 'De pé no centro do aparelho de cabos, segure os puxadores das polias altas. Incline o tronco ligeiramente para a frente e puxe os cabos num movimento de abraço até as mãos se encontrarem à frente do corpo, à altura do abdômen ou peito inferior.',
 ARRAY['Mantenha 2 segundos de pico de contração no fecho','Mantenha os cotovelos levemente flexionados durante todo o movimento','Estufe o peito e mantenha as escápulas estáveis'],
 ARRAY['Usar o impulso do tronco para puxar os cabos','Esticar totalmente os braços','Deixar os ombros rodarem para a frente no final do movimento']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Crucifixo inclinado cabo',
 ARRAY['Peito'], ARRAY['Cabo'],
 'Coloque um banco inclinado (30-45°) entre duas polias baixas. Deite-se no banco segurando os puxadores debaixo. Com uma ligeira flexão nos cotovelos, puxe os cabos num movimento de abraço até as mãos se encontrarem por cima do peito superior.',
 ARRAY['Mantenha a ligeira flexão dos cotovelos constante','Estufe o peito e mantenha as escápulas retraídas no banco','Sinta o alongamento máximo do peitoral na fase excêntrica'],
 ARRAY['Esticar completamente os braços na subida','Fletir os cotovelos em excesso, transformando o movimento num supino','Tirar a lombar excessivamente do encosto']),

-- ============================= COSTAS =======================================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Pulley frente aberto',
 ARRAY['Costas','Braços'], ARRAY['Cabo'],
 'Sente-se no puxador. Segure a barra com pegada pronada (palmas para frente) mais aberta que os ombros e puxe em direção ao peito superior, deprimindo as escápulas. Retorne controladamente.',
 ARRAY['Mantenha 2 segundos de pico de contração','Puxe com os cotovelos direcionados para baixo','Foco na expansão de dorsais'],
 ARRAY['Puxar atrás da nuca (risco de lesão)','Usar muito impulso','Encolher os trapézios']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Pulley frente triângulo',
 ARRAY['Costas','Braços'], ARRAY['Cabo'],
 'Sente-se no puxador vertical. Segure o triângulo e puxe para baixo em direção ao peito, inclinando o tronco levemente para trás.',
 ARRAY['Mantenha 2 segundos de pico de contração','Peito estufado','Puxe direcionando os cotovelos para baixo'],
 ARRAY['Balançar o corpo para puxar o peso','Não estender os braços na volta','Curvar as costas']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Pull down com corda',
 ARRAY['Costas'], ARRAY['Cabo'],
 'De frente para a polia alta, segure a corda com os braços estendidos. Incline ligeiramente o tronco para a frente e empurre a corda para baixo em direção às coxas, mantendo os braços quase retos.',
 ARRAY['Mantenha os cotovelos travados numa ligeira flexão ao longo do movimento','Contraia as dorsais ao puxar a corda até à linha do quadril','Controle a subida para sentir o alongamento'],
 ARRAY['Flexionar os cotovelos e transformar num exercício de tríceps','Balançar o tronco para ganhar impulso','Levantar demasiado a cabeça']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Remada curvada com barra',
 ARRAY['Costas','Braços'], ARRAY['Peso Livre'],
 'Em pé, segure a barra com pegada pronada na largura dos ombros. Incline o tronco a ~45° com os joelhos levemente flexionados. Puxe a barra em direção ao abdômen (umbigo), apertando as escápulas. Desça controladamente.',
 ARRAY['Mantenha as costas retas (neutras) durante todo o movimento','Puxe a barra na direção do umbigo','Aperte as escápulas no topo','Core ativado para proteger a lombar'],
 ARRAY['Arredondar as costas','Usar impulso com o corpo','Puxar para o peito','Barra muito longe do corpo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Remada baixa triângulo',
 ARRAY['Costas','Braços'], ARRAY['Máquina','Cabo'],
 'Sente-se no aparelho de remada, apoie os pés e segure o triângulo. Puxe em direção ao abdômen, retraindo as escápulas.',
 ARRAY['Mantenha 2 segundos de pico de contração','Estufe o peito ao puxar','Tronco levemente inclinado para trás na puxada'],
 ARRAY['Balançar excessivamente o tronco para frente e trás','Puxar apenas com os braços sem usar as costas','Encolher os ombros']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Remada baixa pegada aberta',
 ARRAY['Costas','Ombros'], ARRAY['Máquina','Cabo'],
 'Sente-se no aparelho e utilize uma barra reta. Segure com pegada aberta e puxe em direção à parte inferior do peito, abrindo os cotovelos.',
 ARRAY['Mantenha 2 segundos de pico de contração','Foco na parte superior das costas e deltoide posterior','Cotovelos alinhados com os ombros'],
 ARRAY['Deixar os ombros caírem para frente','Puxar para a barriga (errado para esta pegada)']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Remada unilateral com halter',
 ARRAY['Costas','Braços'], ARRAY['Peso Livre'],
 'Apoie um joelho e a mão do mesmo lado no banco. Com a outra mão, segure o halter e puxe em direção ao quadril, levando o cotovelo para trás e para cima. Desça controladamente.',
 ARRAY['Mantenha as costas paralelas ao chão','Puxe com o cotovelo, não com a mão','Aperte a escápula no topo do movimento','Não gire o tronco'],
 ARRAY['Girar o tronco para subir o peso','Não completar a amplitude','Usar impulso']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Serrote',
 ARRAY['Costas','Braços'], ARRAY['Peso Livre'],
 'Apoie um joelho e uma mão em um banco. Com a outra mão, segure um halter e puxe-o em direção ao quadril, mantendo o cotovelo rente ao corpo.',
 ARRAY['Mantenha 2 segundos de pico de contração','Coluna paralela ao chão','Puxe o halter em direção ao quadril'],
 ARRAY['Girar excessivamente o tronco','Puxar o peso em direção ao peito','Deixar o ombro cair na descida']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Remada sentada na polia (cabo)',
 ARRAY['Costas','Braços'], ARRAY['Cabo'],
 'Sentado na máquina de remada com os pés apoiados e joelhos levemente flexionados. Segure o triângulo e puxe em direção ao abdômen, apertando as escápulas. Retorne controladamente.',
 ARRAY['Mantenha o peito projetado','Puxe os cotovelos para trás','Não balance o tronco para frente e para trás'],
 ARRAY['Balançar o tronco para gerar impulso','Arredondar os ombros','Não estender os braços completamente na volta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Pullover na polia',
 ARRAY['Costas','Peito'], ARRAY['Cabo'],
 'Em pé de frente para a polia alta, segure a barra com braços estendidos. Puxe a barra em arco até a altura das coxas, mantendo os braços quase estendidos. Retorne controladamente.',
 ARRAY['Braços quase estendidos o tempo todo','Foco na contração do grande dorsal','Movimento em arco, não puxada reta'],
 ARRAY['Flexionar demais os cotovelos (vira tríceps)','Usar impulso com o tronco']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Levantamento terra (deadlift convencional)',
 ARRAY['Costas','Pernas'], ARRAY['Peso Livre'],
 'Com a barra no chão, posicione os pés na largura dos ombros. Agache com as costas retas, segure a barra e levante estendendo quadril e joelhos simultaneamente até ficar ereto. Retorne controladamente ao chão.',
 ARRAY['Costas SEMPRE neutras — nunca arredonde','Barra próxima ao corpo durante todo o movimento','Empurre o chão com os pés','Quadril e joelhos estendem juntos','Core fortemente ativado'],
 ARRAY['Arredondar a lombar (risco de lesão grave)','Barra longe do corpo','Hiperextensão no topo','Subir primeiro o quadril']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Meio Terra',
 ARRAY['Costas','Pernas'], ARRAY['Peso Livre'],
 'No rack, posicione a barra na altura dos joelhos. Segure a barra e estenda o quadril e os joelhos até ficar em pé, contraindo os glúteos e as costas.',
 ARRAY['Foco na contração das costas e glúteos no topo','Mantenha a barra colada nas coxas','Coluna neutra'],
 ARRAY['Hiperextender a lombar no topo','Deixar as costas arredondarem','Fazer um agachamento em vez de puxada']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Hiper extensão no banco romano',
 ARRAY['Pernas','Costas'], ARRAY['Máquina'],
 'Posicione-se no banco romano com o quadril apoiado. Desça o tronco de forma controlada e suba até alinhar com as pernas.',
 ARRAY['Movimento controlado','Contraia os glúteos no topo','Não ultrapasse a linha reta do corpo'],
 ARRAY['Hiperextensão excessiva da coluna no topo','Descer soltando o peso','Fazer o movimento muito rápido']),

-- ============================= OMBROS =======================================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Desenvolvimento com halteres',
 ARRAY['Ombros','Braços'], ARRAY['Peso Livre'],
 'Sentado com encosto a 90°, segure os halteres na altura dos ombros com palmas para frente. Empurre para cima até quase estender os braços. Desça controladamente.',
 ARRAY['Não trave os cotovelos no topo','Mantenha o core ativado','Movimento controlado na descida'],
 ARRAY['Arquear a lombar','Usar impulso das pernas','Bater os halteres no topo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Desenvolvimento com barra (militar)',
 ARRAY['Ombros','Braços'], ARRAY['Peso Livre'],
 'Em pé ou sentado, retire a barra do rack na altura dos ombros. Empurre para cima até estender os braços. Desça controladamente até a altura do queixo.',
 ARRAY['Core ativado para estabilidade','Não hiperextenda a lombar','Pegada na largura dos ombros ou ligeiramente mais aberta'],
 ARRAY['Inclinar demais o tronco para trás','Descer a barra atrás da nuca']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação lateral com halteres',
 ARRAY['Ombros'], ARRAY['Peso Livre'],
 'Em pé, segure um halter em cada mão ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros (paralelo ao chão), com leve flexão nos cotovelos. Desça controladamente.',
 ARRAY['Cotovelos levemente flexionados','Eleve até a altura dos ombros, não acima','Controle a descida — não deixe cair'],
 ARRAY['Subir acima dos ombros','Usar impulso balançando o corpo','Cotovelos completamente estendidos']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação lateral sentado com halteres',
 ARRAY['Ombros'], ARRAY['Peso Livre'],
 'Sente-se em um banco com as costas retas. Segure um halter em cada mão e eleve lateralmente até a altura dos ombros, mantendo os cotovelos levemente flexionados.',
 ARRAY['Tronco firme por estar sentado','Foco na porção medial do deltoide','Mova os cotovelos para cima, não apenas as mãos'],
 ARRAY['Usar impulso com o corpo','Elevar os braços acima da linha do ombro','Esticar totalmente os cotovelos']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação lateral máquina ou unilateral no cabo',
 ARRAY['Ombros'], ARRAY['Máquina','Cabo'],
 'Utilizando a máquina ou a polia baixa, eleve o braço lateralmente até a altura do ombro, mantendo tensão contínua.',
 ARRAY['Tensão contínua fornecida pelo cabo/máquina','Movimento suave sem trancos','Foco no deltoide lateral'],
 ARRAY['Inclinar excessivamente o tronco (no cabo)','Puxar com o trapézio tensionando o pescoço']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação unilateral cabo',
 ARRAY['Ombros'], ARRAY['Cabo'],
 'De lado para a polia baixa, segure o puxador com uma mão. Eleve o braço lateralmente até à altura do ombro, mantendo uma ligeira flexão no cotovelo.',
 ARRAY['Tensão contínua','Movimento sem trancos'],
 ARRAY['Inclinar demasiado o tronco','Puxar com o trapézio']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação frontal com halteres',
 ARRAY['Ombros'], ARRAY['Peso Livre'],
 'Em pé, segure os halteres à frente das coxas com palmas viradas para trás. Eleve um braço (ou ambos) à frente até a altura dos ombros. Desça controladamente.',
 ARRAY['Cotovelos levemente flexionados','Não ultrapasse a altura dos ombros','Alterne os braços ou faça simultâneo'],
 ARRAY['Usar impulso do tronco','Elevar muito acima da linha dos ombros']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação frontal corda ou halteres',
 ARRAY['Ombros'], ARRAY['Cabo','Peso Livre'],
 'De pé, segure a corda na polia baixa ou os halteres à frente do corpo. Eleve os braços estendidos até à altura dos ombros e desça controladamente.',
 ARRAY['Mantenha o abdômen contraído','Foco no deltoide anterior'],
 ARRAY['Balançar o tronco','Elevar muito acima da linha dos ombros']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Crucifixo inverso (posterior de ombro)',
 ARRAY['Ombros','Costas'], ARRAY['Peso Livre'],
 'Deite de bruços no banco inclinado ou incline o tronco em pé. Com halteres, abra os braços lateralmente até a altura dos ombros, apertando as escápulas. Retorne controladamente.',
 ARRAY['Foco no deltóide posterior e romboides','Aperte as escápulas no topo','Leve flexão nos cotovelos'],
 ARRAY['Usar impulso','Braços muito estendidos (estresse no cotovelo)','Peso excessivo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Voador inverso (Peck Deck Inverso)',
 ARRAY['Ombros','Costas'], ARRAY['Máquina'],
 'Sente-se no aparelho de frente para o encosto (ao contrário do voador tradicional). Segure os pegadores com os braços à frente do corpo e puxe-os para trás num arco, apertando a parte posterior dos ombros e as escápulas.',
 ARRAY['Mantenha 2 segundos de pico de contração','Foco no deltoide posterior','Mantenha os cotovelos levemente flexionados'],
 ARRAY['Levantar os ombros (encolher o pescoço) durante a puxada','Usar impulso da lombar','Deixar os pesos baterem na fase de retorno']),

-- ============================= BRAÇOS (BÍCEPS) ==============================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta com barra reta',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Em pé, segure a barra com pegada supinada (palmas para cima) na largura dos ombros. Flexione os cotovelos levando a barra até os ombros. Desça controladamente.',
 ARRAY['Cotovelos fixos ao lado do corpo','Não balance o tronco','Controle a fase excêntrica (descida)','Extensão completa embaixo sem travar'],
 ARRAY['Balançar o corpo para subir o peso','Cotovelos se movendo para frente','Descer rápido demais']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta com barra W (EZ)',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Mesmo movimento da rosca direta, mas com a barra W que posiciona os punhos em ângulo mais natural, reduzindo o estresse nos punhos.',
 ARRAY['Mais confortável para os punhos que a barra reta','Cotovelos fixos','Extensão completa embaixo'],
 ARRAY['Balançar o tronco','Não estender completamente embaixo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta barra livre ou cabo com barra',
 ARRAY['Braços'], ARRAY['Peso Livre','Cabo'],
 'De pé, segure a barra (livre ou na polia) com pegada supinada. Mantenha os cotovelos fixos ao lado do tronco e flexione-os, elevando a barra em direção ao peito.',
 ARRAY['Mantenha o tronco imóvel','Controle a descida','Tensão contínua com o cabo'],
 ARRAY['Balançar o tronco para ganhar impulso','Erguer os cotovelos no topo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta cabo',
 ARRAY['Braços'], ARRAY['Cabo'],
 'De pé, de frente para a polia baixa. Segure a barra reta e flexione os cotovelos trazendo-a em direção ao peito.',
 ARRAY['Mantenha 2 segundos de pico de contração','Cotovelos fixos ao lado do corpo','Tensão contínua proporcionada pelo cabo'],
 ARRAY['Balançar o tronco','Afastar os cotovelos do corpo','Não estender os braços completamente']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta corda',
 ARRAY['Braços'], ARRAY['Cabo'],
 'Na polia baixa, segure a corda com pegada neutra. Flexione os cotovelos trazendo a corda em direção aos ombros.',
 ARRAY['Pegada neutra foca no braquial','Cotovelos estabilizados','Abra levemente a corda no final'],
 ARRAY['Usar impulso lombar','Cotovelos indo para frente durante a subida']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta banco 45 graus',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Sente-se num banco inclinado a 45° com um halter em cada mão e os braços pendentes, palmas viradas para a frente. Flexione os cotovelos elevando os halteres em direção aos ombros, e desça controladamente até estender os braços.',
 ARRAY['O banco inclinado promove maior alongamento da cabeça longa do bíceps','Mantenha os cotovelos a apontar para o chão durante o movimento','Ombros firmemente apoiados no encosto'],
 ARRAY['Usar o impulso dos ombros para iniciar a subida','Balançar o tronco ou tirar as costas do banco','Levantar os cotovelos no final da contração']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca direta sentado com halteres',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Sente-se num banco com as costas perfeitamente retas (90°) segurando um halter em cada mão. Com os braços estendidos ao lado do corpo, flexione os cotovelos trazendo os pesos em direção aos ombros e desça controladamente.',
 ARRAY['Mantenha as costas totalmente apoiadas no encosto','Evite balançar os ombros','Mantenha os cotovelos fixos ao lado do tronco'],
 ARRAY['Usar o impulso do corpo','Elevar os cotovelos no final da subida','Descer os halteres demasiado rápido sem controlo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca scott máquina ou cabo',
 ARRAY['Braços'], ARRAY['Máquina','Cabo'],
 'Sente-se no banco scott e apoie os tríceps. Segure a barra ou puxador e flexione os cotovelos até contrair o bíceps por completo, descendo devagar.',
 ARRAY['Mantenha 2 segundos de pico de contração','Apoio total do braço na almofada','Extensão quase completa na volta'],
 ARRAY['Levantar o cotovelo do apoio','Usar o corpo para ajudar a puxar','Descansar no topo do movimento']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca alternada com halteres',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Em pé com um halter em cada mão. Flexione um braço por vez, girando o punho de neutro para supinado (palma para cima) durante a subida. Desça controladamente e alterne.',
 ARRAY['Supinação durante o movimento recruta mais bíceps','Cotovelos fixos','Controle a descida de cada repetição'],
 ARRAY['Balançar o corpo','Mover o cotovelo para frente','Peso pesado demais sem alternar']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca martelo com halteres',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Em pé, segure os halteres com pegada neutra (palmas voltadas uma para a outra). Flexione os cotovelos levando os halteres até os ombros. Desça controladamente.',
 ARRAY['Pegada neutra foca o braquial e braquiorradial','Cotovelos fixos ao lado do corpo','Pode ser alternada ou simultânea'],
 ARRAY['Balançar o tronco','Girar os punhos (vira rosca alternada)']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca concentrada (sentado)',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Sentado, apoie o cotovelo na parte interna da coxa. Com o halter, flexione o braço até o ombro. Desça controladamente.',
 ARRAY['Isola o bíceps eliminando compensação','Controle total do movimento','Aperte no topo por 1-2 segundos'],
 ARRAY['Usar o tronco para ajudar','Não completar a amplitude']),

-- ============================= BRAÇOS (TRÍCEPS) ============================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps pulley (puxada na polia alta)',
 ARRAY['Braços'], ARRAY['Cabo'],
 'Em pé de frente para a polia alta, segure a barra/corda. Com os cotovelos fixos ao lado do corpo, estenda os braços para baixo até travar. Retorne controladamente.',
 ARRAY['Cotovelos FIXOS ao lado do corpo — só o antebraço se move','Aperte no final da extensão','Com corda: abra as mãos no final para maior contração'],
 ARRAY['Mover os cotovelos para frente ou para trás','Usar impulso do tronco','Carga excessiva']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps corda',
 ARRAY['Braços'], ARRAY['Cabo'],
 'De frente para a polia alta, segure a corda. Mantenha os cotovelos ao lado do corpo e estenda os braços para baixo, separando a corda no final.',
 ARRAY['Mantenha 2 segundos de pico de contração no final','Cotovelos fixos ao lado do tronco','Abra a corda no final do movimento'],
 ARRAY['Afastar os cotovelos do corpo','Usar o peso do corpo para empurrar','Perder a tensão no topo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps corda unilateral',
 ARRAY['Braços'], ARRAY['Cabo'],
 'De frente para a polia alta, segure a extremidade da corda com uma mão. Mantenha o cotovelo fixo ao lado do tronco e estenda o braço completamente para baixo.',
 ARRAY['Mantenha 2 segundos de pico de contração no final','O cotovelo não se deve mover da linha da cintura','Execute com tensão contínua'],
 ARRAY['Usar o peso do corpo para empurrar o cabo','Afastar o cotovelo do tronco','Amplitude encurtada']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps testa corda',
 ARRAY['Braços'], ARRAY['Cabo'],
 'Deitado no banco ou de pé, segure a corda na polia. Mantenha os cotovelos fixos a apontar para a frente/cima e estenda os braços, separando a corda no final.',
 ARRAY['Cotovelos estabilizados','Extensão completa'],
 ARRAY['Movimentar os cotovelos','Amplitude encurtada']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps testa corda banco 35 graus',
 ARRAY['Braços'], ARRAY['Cabo'],
 'Deite no banco inclinado a 35° de costas para a polia. Segure a corda, mantenha os cotovelos fixos apontando para cima/frente e estenda os braços.',
 ARRAY['Foco na cabeça longa do tríceps','Cotovelos estabilizados','Extensão completa'],
 ARRAY['Deixar os cotovelos se moverem para trás e para frente','Carga excessiva prejudicando a amplitude']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps testa com barra W',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Deite no banco reto com a barra W. Braços estendidos acima do peito. Flexione os cotovelos descendo a barra em direção à testa (sem tocar). Estenda de volta.',
 ARRAY['Cotovelos apontando para o teto, fixos','Desça até perto da testa ou logo acima','Controle total — peso moderado'],
 ARRAY['Abrir os cotovelos','Bater a barra na testa','Peso excessivo sem controle']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps francês com halter (sentado)',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Sentado, segure um halter com as duas mãos acima da cabeça, braços estendidos. Flexione os cotovelos descendo o halter atrás da cabeça. Estenda de volta.',
 ARRAY['Cotovelos apontando para cima e próximos da cabeça','Movimento só dos antebraços','Extensão completa no topo'],
 ARRAY['Abrir os cotovelos para os lados','Usar impulso do tronco','Amplitude incompleta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Tríceps francês na corda',
 ARRAY['Braços'], ARRAY['Cabo'],
 'De costas para a polia alta ou baixa, segure a corda atrás da cabeça. Estenda os braços para cima apontando os cotovelos para o teto e retorne.',
 ARRAY['Cotovelos apontados para cima e fechados','Alongamento máximo do tríceps','Tronco estabilizado'],
 ARRAY['Abrir muito os cotovelos','Mover os ombros durante a execução','Não estender completamente os braços']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Paralela (peso do corpo)',
 ARRAY['Braços','Peito'], ARRAY['Peso Corporal'],
 'Apoie-se nas barras paralelas com os braços estendidos. Desça o corpo controladamente fletindo os cotovelos até os ombros ficarem abaixo do nível dos mesmos, e empurre o corpo de volta à posição inicial.',
 ARRAY['Incline o tronco para a frente para focar no peitoral, ou mantenha-se reto para focar nos tríceps','Mantenha os cotovelos apontados para trás','Desça com controlo'],
 ARRAY['Descer excessivamente ao ponto de forçar a articulação do ombro','Balançar as pernas para ganhar impulso','Fazer o movimento de forma rápida']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Mergulho no banco (dips no banco)',
 ARRAY['Braços','Peito'], ARRAY['Peso Corporal'],
 'Apoie as mãos na borda do banco atrás de você, pernas estendidas à frente. Flexione os cotovelos descendo o corpo até ~90° nos cotovelos. Empurre de volta.',
 ARRAY['Cotovelos apontando para trás, não para os lados','Para dificultar: eleve os pés em outro banco','Mantenha o corpo próximo ao banco'],
 ARRAY['Descer demais (estresse no ombro)','Cotovelos abertos para os lados','Não completar a extensão']),

-- ============================= PERNAS =======================================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Agachamento livre',
 ARRAY['Pernas','Core'], ARRAY['Peso Livre'],
 'Posicione a barra nos trapézios, pés na largura dos ombros. Desça flexionando joelhos e quadril até passar de 90°, empurrando o chão para subir.',
 ARRAY['Joelhos acompanham a ponta dos pés','Peito aberto e tronco firme','Calcanhares não saem do chão','Core ativado'],
 ARRAY['Joelho valgo (entrando)','Curvar as costas (buttwink)','Jogar o peso para as pontas dos pés']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Agachamento livre com barra',
 ARRAY['Pernas','Core'], ARRAY['Peso Livre'],
 'Com a barra apoiada nos trapézios (agachamento alto) ou nas escápulas (baixo), pés na largura dos ombros. Agache flexionando quadril e joelhos até as coxas ficarem paralelas ao chão ou abaixo. Retorne empurrando o chão.',
 ARRAY['Joelhos na direção dos pés (não para dentro)','Costas neutras o tempo todo','Desça até pelo menos a paralela','Core ativado, peito projetado'],
 ARRAY['Joelhos colapsando para dentro (valgo)','Arredondar a lombar','Não descer o suficiente','Levantar os calcanhares']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Hack machine',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Posicione as costas bem apoiadas no encosto da máquina e os ombros debaixo das almofadas. Coloque os pés na plataforma à largura dos ombros. Desça controladamente, fletindo os joelhos até perfazerem um ângulo de 90°, e empurre a plataforma para voltar à posição inicial.',
 ARRAY['Apoio total das costas e lombar no encosto','Joelhos acompanham a direção das pontas dos pés','Força centrada nos calcanhares'],
 ARRAY['Levantar os calcanhares da plataforma','Estender os joelhos de forma brusca (travar) no topo','Descolar a zona lombar do encosto na descida']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Leg 45',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sente-se no aparelho e posicione os pés na plataforma. Destrave a máquina, desça a plataforma controladamente até os joelhos chegarem perto do peito e empurre.',
 ARRAY['Apoio total das costas no banco','Pés inteiros na plataforma','Amplitude completa sem levantar o quadril'],
 ARRAY['Travar os joelhos de forma brusca no topo','Tirar o calcanhar da plataforma','Tirar a lombar do encosto na descida']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Leg press 45°',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sentado na máquina com os pés na plataforma na largura dos ombros. Destrave e desça a plataforma flexionando os joelhos até ~90°. Empurre de volta sem travar os joelhos.',
 ARRAY['Pés mais altos na plataforma = mais glúteos e posterior','Pés mais baixos = mais quadríceps','NÃO trave os joelhos no topo','Costas e lombar firmemente apoiadas no encosto'],
 ARRAY['Travar os joelhos (risco grave)','Tirar a lombar do encosto','Amplitude muito curta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Extensor (Cadeira Extensora)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sente-se na máquina com os joelhos alinhados ao eixo de rotação. Estenda as pernas completamente e retorne devagar.',
 ARRAY['Mantenha 2 segundos de pico de contração no topo','Segure firme nas manoplas laterais','Controle absoluto na descida'],
 ARRAY['Chutar o peso','Levantar o quadril do banco','Amplitude incompleta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Cadeira extensora',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sentado na máquina, ajuste o apoio na canela logo acima do tornozelo. Estenda as pernas até ficarem retas, apertando o quadríceps. Retorne controladamente.',
 ARRAY['Aperte o quadríceps no topo por 1-2 segundos','Controle a descida — não deixe cair','Ajuste o encosto para alinhar o joelho ao eixo da máquina'],
 ARRAY['Usar impulso','Hiperextensão dos joelhos','Descer rápido demais']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Flexor deitado (Mesa Flexora)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Deite-se de bruços na máquina. Posicione o rolo acima dos calcanhares. Flexione os joelhos trazendo o rolo em direção aos glúteos e volte controladamente.',
 ARRAY['Mantenha 2 segundos de pico de contração','Mantenha o quadril pressionado contra o banco','Extensão controlada'],
 ARRAY['Levantar o quadril ao puxar o peso','Fazer o movimento com trancos','Descer rápido demais']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Flexor sentado (Cadeira Flexora)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sente-se na máquina com as costas bem apoiadas. Posicione o rolo almofadado logo abaixo dos gémeos/tornozelos e ajuste o suporte superior por cima das coxas. Faça a flexão dos joelhos empurrando o rolo para baixo e para trás.',
 ARRAY['Mantenha 2 segundos de pico de contração no ponto de maior tensão','Movimento controlado na fase excêntrica (volta)','Mantenha o quadril fixo no banco'],
 ARRAY['Levantar o quadril ou usar o corpo para ganhar impulso','Deixar o peso voltar de forma brusca','Amplitude incompleta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Mesa flexora (cadeira flexora)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Deitado de bruços na máquina, com o apoio na parte posterior da canela. Flexione os joelhos trazendo os calcanhares em direção aos glúteos. Retorne controladamente.',
 ARRAY['Quadril firme no apoio — não levante','Aperte no topo por 1-2 segundos','Controle a descida'],
 ARRAY['Levantar o quadril do apoio','Usar impulso','Amplitude incompleta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Stiff',
 ARRAY['Pernas','Costas'], ARRAY['Peso Livre'],
 'De pé, segure a barra à frente do corpo. Mantendo as pernas semi-retas, desça o tronco empurrando o quadril para trás até sentir alongar os posteriores, e retorne contraindo os glúteos.',
 ARRAY['Coluna reta o tempo todo','Barra próxima às pernas','Empurre o quadril para trás, não para baixo'],
 ARRAY['Arredondar a coluna (corcunda)','Flexionar muito os joelhos (vira agachamento)','Afastar a barra do corpo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Stiff (levantamento terra romeno)',
 ARRAY['Pernas','Costas'], ARRAY['Peso Livre'],
 'Em pé com a barra na frente das coxas, joelhos levemente flexionados (e fixos). Incline o tronco à frente empurrando o quadril para trás, descendo a barra ao longo das pernas até sentir o alongamento dos posteriores. Retorne contraindo os glúteos.',
 ARRAY['Joelhos levemente flexionados e FIXOS','Costas retas — o movimento é no quadril','Barra próxima às pernas','Sinta o alongamento nos posteriores'],
 ARRAY['Arredondar a lombar','Flexionar os joelhos (vira agachamento)','Barra longe do corpo']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Avanço (passada) com halteres',
 ARRAY['Pernas'], ARRAY['Peso Livre'],
 'Em pé com um halter em cada mão, dê um passo largo à frente. Flexione ambos os joelhos até o joelho de trás quase tocar o chão. Empurre de volta à posição inicial.',
 ARRAY['Joelho da frente não ultrapassa a ponta do pé','Tronco ereto','Passos largos = mais glúteos','Alternar as pernas ou fazer todas de um lado'],
 ARRAY['Joelho da frente passando muito do pé','Tronco inclinado','Passos curtos demais']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Afundo no Smith com step',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Posicione um step debaixo da barra do Smith. Coloque o pé da frente sobre o step e o pé de trás apoiado no chão. Desça o quadril de forma controlada até o joelho de trás quase tocar no chão, e empurre usando a perna da frente.',
 ARRAY['O step aumenta a amplitude de movimento e ativa mais o glúteo','Mantenha o tronco direito e o abdômen contraído','O joelho da frente não deve colapsar para dentro'],
 ARRAY['Empurrar com a perna de trás em vez da perna da frente','Curvar as costas','Descer pouco']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação de quadril',
 ARRAY['Pernas'], ARRAY['Peso Livre','Máquina'],
 'Apoie as escápulas no banco e coloque a barra no quadril. Desça o quadril e empurre para cima espremendo os glúteos no topo.',
 ARRAY['Mantenha 2 segundos de pico de contração no topo','Queixo apontado para o peito','Empurre usando os calcanhares'],
 ARRAY['Hiperextensão da lombar','Pés muito longe ou muito perto dos glúteos','Não estender o quadril completamente']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Hip thrust (elevação pélvica) com barra',
 ARRAY['Pernas'], ARRAY['Peso Livre'],
 'Sentado no chão com as costas apoiadas na borda de um banco e a barra sobre o quadril (use proteção). Pés no chão na largura dos ombros. Empurre o quadril para cima até o tronco ficar paralelo ao chão, apertando os glúteos no topo. Desça controladamente.',
 ARRAY['Aperte fortemente os glúteos no topo','Queixo levemente recolhido','Pés posicionados para que os joelhos fiquem a ~90° no topo','Use uma almofada/proteção na barra'],
 ARRAY['Hiperextender a lombar no topo','Pés muito longe ou muito perto','Não apertar os glúteos (usar só lombar)']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdutor (Cadeira Abdutora)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sente-se na máquina com as costas apoiadas e as pernas posicionadas pelo lado de dentro das almofadas. Empurre as almofadas para fora, afastando os joelhos o máximo possível, e retorne controladamente.',
 ARRAY['Mantenha 2 segundos de pico de contração com as pernas abertas','Apoie-se bem no encosto para isolar os glúteos','Controle o peso na volta sem deixar as placas baterem'],
 ARRAY['Fazer o movimento de forma rápida e explosiva','Descolar a lombar do encosto','Usar o tronco para ajudar no afastamento']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Adutor (Cadeira Adutora)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sente-se na máquina com as costas apoiadas e os joelhos posicionados pelo lado de fora das almofadas (pernas abertas). Faça força para fechar as pernas contra a resistência da máquina até as almofadas se encontrarem, voltando devagar à posição inicial.',
 ARRAY['Mantenha 2 segundos de pico de contração no fecho','Tronco estabilizado no encosto','Controle a abertura para evitar lesões musculares'],
 ARRAY['Deixar os pesos baterem na volta (fase excêntrica rápida demais)','Usar o impulso do quadril para fechar a máquina','Amplitude de movimento demasiado curta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdução de quadril na máquina',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sentado na máquina, abra as pernas contra a resistência, apertando os glúteos. Retorne controladamente.',
 ARRAY['Foco na contração dos glúteos médio/mínimo','Segure a abertura máxima por 1-2 segundos','Tronco ereto ou levemente inclinado à frente'],
 ARRAY['Usar impulso','Movimento rápido sem controle','Apoiar-se nas mãos para forçar a abertura']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Panturrilha em pé na máquina ou no smith',
 ARRAY['Pernas'], ARRAY['Máquina','Peso Livre'],
 'Posicione os ombros sob as almofadas ou a barra. Com as pontas dos pés no degrau, desça os calcanhares ao máximo e suba ficando na ponta dos pés.',
 ARRAY['Mantenha 2 segundos de pico de contração no topo','Alongamento máximo na descida','Joelhos estendidos (mas não travados)'],
 ARRAY['Fazer o movimento apressado','Flexionar os joelhos','Subir pouco']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Panturrilha sentada',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'Sente-se no aparelho com os joelhos sob as almofadas. Desça os calcanhares ao máximo e empurre ficando nas pontas dos pés.',
 ARRAY['Foco no sóleo','Pico de contração no topo'],
 ARRAY['Movimento rápido sem alongar','Levantar o quadril']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Panturrilha no leg press (ou em pé na máquina)',
 ARRAY['Pernas'], ARRAY['Máquina'],
 'No leg press, posicione apenas a ponta dos pés na borda inferior da plataforma. Estenda os tornozelos empurrando a plataforma (flexão plantar), depois desça controladamente alongando a panturrilha.',
 ARRAY['Amplitude completa: desça bem (dorsiflexão) e suba bem (flexão plantar)','Segure a contração no topo por 1-2 segundos','Pode ser feita em pé na máquina específica'],
 ARRAY['Amplitude parcial (erro mais comum)','Usar impulso','Velocidade excessiva']),

-- ============================= CORE (ABDÔMEN) ==============================

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdominal infra na torre',
 ARRAY['Core'], ARRAY['Máquina'],
 'Apoie os antebraços nos suportes da torre. Com as pernas unidas, eleve os joelhos (ou pernas estendidas) em direção ao peito e desça devagar.',
 ARRAY['Mantenha 2 segundos de pico de contração','Foco em enrolar a pélvis, não apenas levantar a perna','Controle a descida para evitar balanço'],
 ARRAY['Usar embalo do corpo','Soltar a descida rapidamente','Deixar a lombar descolar excessivamente do encosto']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdominal supra na prancha declinada',
 ARRAY['Core'], ARRAY['Peso Livre'],
 'Prenda os pés na prancha declinada. Flexione o tronco em direção aos joelhos, contraindo fortemente o abdômen, e desça segurando o movimento.',
 ARRAY['Contração máxima no topo','Subida em bloco enrolando o tronco','Mãos no peito ou nas têmporas'],
 ARRAY['Puxar a cabeça com as mãos (esforço no pescoço)','Descer até relaxar completamente o abdômen','Usar impulso da lombar']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdominal supra no solo',
 ARRAY['Core'], ARRAY['Peso Corporal'],
 'Deite-se de costas num tapete com os joelhos dobrados e os pés bem apoiados no solo. Coloque as mãos ao lado da cabeça (ou cruzadas no peito) e flexione o tronco, elevando apenas os ombros do chão. Volte à posição inicial devagar.',
 ARRAY['Concentre a força no abdômen e não no pescoço','Mantenha a lombar sempre apoiada no chão','Expire na subida e inspire na descida'],
 ARRAY['Puxar a cabeça com as mãos forçando a cervical','Tirar a lombar do chão (subir demasiado)','Fazer o movimento de forma rápida e sem contração consciente']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdominal crunch (tradicional)',
 ARRAY['Core'], ARRAY['Peso Corporal'],
 'Deitado com os joelhos flexionados e pés no chão. Mãos atrás da cabeça ou cruzadas no peito. Eleve os ombros do chão contraindo o abdômen. Desça controladamente.',
 ARRAY['NÃO puxe a cabeça com as mãos — a força vem do abdômen','Eleve só os ombros, não o tronco inteiro','Expire ao subir, inspire ao descer'],
 ARRAY['Puxar o pescoço','Levantar demais (vira sit-up)','Usar impulso']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdominal oblíquo (crunch com rotação)',
 ARRAY['Core'], ARRAY['Peso Corporal'],
 'Deitado com os joelhos flexionados. Ao subir, gire o tronco levando o cotovelo em direção ao joelho oposto. Alterne os lados.',
 ARRAY['A rotação vem do tronco, não do cotovelo','Contraia os oblíquos ao girar','Movimento controlado'],
 ARRAY['Puxar o pescoço','Girar só o cotovelo sem rodar o tronco','Usar impulso']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Prancha (plank) isométrica',
 ARRAY['Core'], ARRAY['Peso Corporal'],
 'Apoie os antebraços e as pontas dos pés no chão, corpo em linha reta da cabeça aos calcanhares. Mantenha a posição pelo tempo definido.',
 ARRAY['Não deixe o quadril subir nem descer','Core bem contraído','Respire normalmente','Olhe para o chão (pescoço neutro)'],
 ARRAY['Quadril muito alto ou muito baixo','Prender a respiração','Empurrar a cabeça com as mãos']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Elevação de pernas (deitado)',
 ARRAY['Core'], ARRAY['Peso Corporal'],
 'Deitado com as mãos sob os glúteos ou ao lado do corpo. Eleve as pernas estendidas até ~90° e desça controladamente sem tocar o chão.',
 ARRAY['Mantenha a lombar pressionada no chão','Para facilitar: flexione levemente os joelhos','Controle a descida — parte mais difícil'],
 ARRAY['Arquear a lombar (desprender do chão)','Deixar as pernas caírem','Usar impulso']);
