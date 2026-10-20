-- =============================================================================
-- Flvxus — Catálogo de exercícios para o tenant do Bruno
-- =============================================================================
-- Rode no SQL Editor do Supabase. Remove exercícios globais antigos (seed) e
-- insere um catálogo completo vinculado ao seu tenant (editável por você).
-- Tenant: c007ef49-db42-4598-80a6-41cb41df5a4f
-- Usuário: b3033cc4-868b-48c9-b01d-1f8f81a5f94e
-- =============================================================================

-- 0) ATENÇÃO: exercícios em uso em modelos/fichas de treino têm FK (on delete
--    restrict). Como estamos recomeçando o catálogo, limpamos primeiro os itens
--    de treino que referenciam exercícios. ISSO APAGA TODOS OS ITENS DE MODELOS
--    E FICHAS DE TREINO do banco. Se quiser preservar algum treino, NÃO rode
--    esta seção — faça uma limpeza cirúrgica.
DELETE FROM public.workout_plan_items;
DELETE FROM public.workout_exercises;

-- 1) Limpa o catálogo global antigo (tenant_id IS NULL)
DELETE FROM public.exercises WHERE tenant_id IS NULL;

-- 2) Limpa exercícios anteriores deste tenant (para ser idempotente)
DELETE FROM public.exercises
WHERE tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f'
  AND created_by = 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e';

-- 3) Insere o catálogo completo
INSERT INTO public.exercises
  (tenant_id, created_by, name, muscle_groups, equipment, instructions, tips, common_errors)
VALUES

-- ============================= PEITO ========================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Supino reto com barra',
 ARRAY['peito','tríceps','ombros'],
 ARRAY['barra','banco reto'],
 'Deite no banco reto com os pés firmes no chão. Retire a barra do suporte com pegada na largura dos ombros. Desça a barra controladamente até tocar levemente o peito (linha dos mamilos), mantendo os cotovelos a ~75°. Empurre até estender os braços sem travar os cotovelos.',
 ARRAY['Mantenha as escápulas retraídas e o peito projetado','Pés firmes no chão, sem levantar o quadril','Desça a barra na linha dos mamilos, não no pescoço','Expire ao empurrar, inspire ao descer'],
 ARRAY['Quicar a barra no peito','Levantar o quadril do banco','Pegada muito aberta ou muito fechada','Travar os cotovelos no topo']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Supino reto com halteres',
 ARRAY['peito','tríceps','ombros'],
 ARRAY['halteres','banco reto'],
 'Deite no banco reto segurando um halter em cada mão na altura do peito. Empurre os halteres para cima até quase estender os braços, mantendo-os alinhados com o peito. Desça controladamente até os cotovelos ficarem na linha do tronco.',
 ARRAY['Maior amplitude de movimento que a barra','Não bata os halteres no topo','Mantenha os punhos firmes e neutros','Controle a descida — fase excêntrica é importante'],
 ARRAY['Usar impulso para subir os halteres','Descer rápido demais','Halteres desalinhados durante o movimento']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Supino inclinado com halteres',
 ARRAY['peito','ombros'],
 ARRAY['halteres','banco inclinado'],
 'No banco inclinado a 30-45°, empurre os halteres para cima partindo da linha do peito até quase estender os braços. Desça controladamente mantendo os cotovelos abertos.',
 ARRAY['Inclinação de 30-45° foca a porção superior do peito','Controle a descida','Mantenha os punhos firmes','Expire ao empurrar'],
 ARRAY['Inclinação muito alta (vira exercício de ombro)','Bater os halteres no topo','Usar carga excessiva comprometendo a amplitude']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Supino inclinado com barra',
 ARRAY['peito','ombros','tríceps'],
 ARRAY['barra','banco inclinado'],
 'No banco inclinado a 30-45°, retire a barra do suporte. Desça controladamente até o peito superior e empurre de volta.',
 ARRAY['Foco na porção clavicular (superior) do peito','Pegada na largura dos ombros ou ligeiramente mais aberta','Escápulas retraídas'],
 ARRAY['Inclinar demais o banco (acima de 45°)','Deixar a barra descer para o pescoço']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Supino declinado com barra',
 ARRAY['peito','tríceps'],
 ARRAY['barra','banco declinado'],
 'No banco declinado (15-30°), retire a barra e desça até a porção inferior do peito. Empurre de volta controladamente.',
 ARRAY['Foca a porção inferior (esternal) do peito','Peça ajuda de um parceiro para retirar/guardar a barra','Mantenha as escápulas retraídas'],
 ARRAY['Ângulo muito acentuado','Não ter um parceiro para auxiliar com a barra']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Crucifixo com halteres (banco reto)',
 ARRAY['peito'],
 ARRAY['halteres','banco reto'],
 'Deite no banco reto com um halter em cada mão, braços estendidos acima do peito com leve flexão nos cotovelos. Abra os braços lateralmente descendo até sentir o alongamento no peito, depois retorne à posição inicial.',
 ARRAY['Mantenha uma leve flexão nos cotovelos o tempo todo','Movimento em arco (não é supino)','Sinta o alongamento na descida e a contração na subida'],
 ARRAY['Estender os cotovelos completamente (vira supino)','Descer demais (risco de lesão no ombro)','Usar carga muito pesada']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Crucifixo na máquina (peck deck)',
 ARRAY['peito'],
 ARRAY['máquina peck deck'],
 'Sentado com as costas apoiadas, segure as alças ou apoie os antebraços nas almofadas. Aproxime os braços à frente contraindo o peito. Retorne controladamente.',
 ARRAY['Segure a contração por 1-2 segundos','Movimento apenas pelos ombros, sem usar impulso','Ajuste o banco para que os braços fiquem na altura do peito'],
 ARRAY['Usar impulso do tronco','Braços muito altos ou muito baixos','Soltar o peso de volta sem controle']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Cross-over (polia alta)',
 ARRAY['peito'],
 ARRAY['polia','cross-over'],
 'Em pé entre as polias altas, segure as alças e dê um passo à frente para tensão. Com leve flexão nos cotovelos, traga as mãos para baixo e à frente, cruzando na altura do abdômen. Retorne controladamente.',
 ARRAY['Tronco levemente inclinado à frente','Foco na contração do peito inferior','Mantenha os cotovelos na mesma angulação durante todo o movimento'],
 ARRAY['Usar peso demais e compensar com o corpo','Variar a angulação dos cotovelos','Movimentos rápidos sem controle']),

-- ============================= COSTAS =======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Puxada frontal na polia (pegada aberta)',
 ARRAY['costas','bíceps'],
 ARRAY['polia','barra'],
 'Sentado na máquina de puxada, segure a barra com pegada pronada (palmas para frente) mais aberta que os ombros. Puxe a barra até a altura do queixo/peito superior, apertando as escápulas. Retorne controladamente.',
 ARRAY['Puxe com os cotovelos, não com os bíceps','Aperte as escápulas no final do movimento','Mantenha o tronco levemente inclinado para trás'],
 ARRAY['Inclinar demais o tronco','Puxar a barra atrás da nuca (risco de lesão)','Não estender completamente os braços na fase excêntrica']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Puxada frontal (pegada fechada supinada)',
 ARRAY['costas','bíceps'],
 ARRAY['polia','barra triângulo'],
 'Sentado na puxada, segure a barra com pegada supinada (palmas para você) na largura dos ombros. Puxe até o peito contraindo as costas.',
 ARRAY['Boa ativação do bíceps além das costas','Foco em puxar com os cotovelos para trás','Extensão completa no topo'],
 ARRAY['Usar impulso com o tronco','Não completar a amplitude']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Remada curvada com barra',
 ARRAY['costas','bíceps','lombar'],
 ARRAY['barra'],
 'Em pé, segure a barra com pegada pronada na largura dos ombros. Incline o tronco a ~45° com os joelhos levemente flexionados. Puxe a barra em direção ao abdômen, apertando as escápulas. Desça controladamente.',
 ARRAY['Mantenha as costas retas (neutras) durante todo o movimento','Puxe a barra na direção do umbigo','Aperte as escápulas no topo','Core ativado para proteger a lombar'],
 ARRAY['Arredondar as costas','Usar impulso com o corpo','Barra muito longe do corpo']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Remada unilateral com halter',
 ARRAY['costas','bíceps'],
 ARRAY['halter','banco'],
 'Apoie um joelho e a mão do mesmo lado no banco. Com a outra mão, segure o halter e puxe em direção ao quadril, levando o cotovelo para trás e para cima. Desça controladamente.',
 ARRAY['Mantenha as costas paralelas ao chão','Puxe com o cotovelo, não com a mão','Aperte a escápula no topo do movimento','Não gire o tronco'],
 ARRAY['Girar o tronco para subir o peso','Não completar a amplitude','Usar impulso']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Remada sentada na polia (cabo)',
 ARRAY['costas','bíceps'],
 ARRAY['polia','triângulo'],
 'Sentado na máquina de remada com os pés apoiados e joelhos levemente flexionados. Segure o triângulo e puxe em direção ao abdômen, apertando as escápulas. Retorne controladamente.',
 ARRAY['Mantenha o peito projetado','Puxe os cotovelos para trás','Não balance o tronco para frente e para trás'],
 ARRAY['Balançar o tronco para gerar impulso','Arredondar os ombros','Não estender os braços completamente na volta']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Pullover na polia',
 ARRAY['costas','peito'],
 ARRAY['polia','barra reta'],
 'Em pé de frente para a polia alta, segure a barra com braços estendidos. Puxe a barra em arco até a altura das coxas, mantendo os braços quase estendidos. Retorne controladamente.',
 ARRAY['Braços quase estendidos o tempo todo','Foco na contração do grande dorsal','Movimento em arco, não puxada reta'],
 ARRAY['Flexionar demais os cotovelos (vira tríceps)','Usar impulso com o tronco']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Levantamento terra (deadlift convencional)',
 ARRAY['costas','glúteos','posterior de coxa','lombar'],
 ARRAY['barra','anilhas'],
 'Com a barra no chão, posicione os pés na largura dos ombros. Agache com as costas retas, segure a barra e levante estendendo quadril e joelhos simultaneamente até ficar ereto. Retorne controladamente ao chão.',
 ARRAY['Costas SEMPRE neutras — nunca arredonde','Barra próxima ao corpo durante todo o movimento','Empurre o chão com os pés','Quadril e joelhos estendem juntos','Core fortemente ativado'],
 ARRAY['Arredondar a lombar (risco de lesão grave)','Barra longe do corpo','Hiperextensão no topo','Subir primeiro o quadril deixando as costas horizontais']),

-- ============================= OMBROS =======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Desenvolvimento com halteres (sentado)',
 ARRAY['ombros','tríceps'],
 ARRAY['halteres','banco com encosto'],
 'Sentado com encosto a 90°, segure os halteres na altura dos ombros com palmas para frente. Empurre para cima até quase estender os braços. Desça controladamente.',
 ARRAY['Não trave os cotovelos no topo','Mantenha o core ativado','Movimento controlado na descida'],
 ARRAY['Arquear a lombar','Usar impulso das pernas','Travar os cotovelos']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Desenvolvimento com barra (militar)',
 ARRAY['ombros','tríceps'],
 ARRAY['barra','rack'],
 'Em pé ou sentado, retire a barra do rack na altura dos ombros. Empurre para cima até estender os braços. Desça controladamente até a altura do queixo.',
 ARRAY['Core ativado para estabilidade','Não hiperextenda a lombar','Pegada na largura dos ombros ou ligeiramente mais aberta'],
 ARRAY['Inclinar demais o tronco para trás','Descer a barra atrás da nuca']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Elevação lateral com halteres',
 ARRAY['ombros'],
 ARRAY['halteres'],
 'Em pé, segure um halter em cada mão ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros (paralelo ao chão), com leve flexão nos cotovelos. Desça controladamente.',
 ARRAY['Cotovelos levemente flexionados','Eleve até a altura dos ombros, não acima','Controle a descida — não deixe cair','Imagine derramar uma jarra de água na subida'],
 ARRAY['Subir acima dos ombros','Usar impulso balançando o corpo','Cotovelos completamente estendidos']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Elevação frontal com halteres',
 ARRAY['ombros'],
 ARRAY['halteres'],
 'Em pé, segure os halteres à frente das coxas com palmas viradas para trás. Eleve um braço (ou ambos) à frente até a altura dos ombros. Desça controladamente.',
 ARRAY['Cotovelos levemente flexionados','Não ultrapasse a altura dos ombros','Alterne os braços ou faça simultâneo'],
 ARRAY['Usar impulso do tronco','Elevar muito acima da linha dos ombros']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Crucifixo inverso (posterior de ombro)',
 ARRAY['ombros','costas'],
 ARRAY['halteres','banco inclinado'],
 'Deite de bruços no banco inclinado ou incline o tronco em pé. Com halteres, abra os braços lateralmente até a altura dos ombros, apertando as escápulas. Retorne controladamente.',
 ARRAY['Foco no deltóide posterior e romboides','Aperte as escápulas no topo','Leve flexão nos cotovelos'],
 ARRAY['Usar impulso','Braços muito estendidos (estresse no cotovelo)','Peso excessivo']),

-- ============================= BÍCEPS =======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Rosca direta com barra reta',
 ARRAY['bíceps'],
 ARRAY['barra reta'],
 'Em pé, segure a barra com pegada supinada (palmas para cima) na largura dos ombros. Flexione os cotovelos levando a barra até os ombros. Desça controladamente.',
 ARRAY['Cotovelos fixos ao lado do corpo','Não balance o tronco','Controle a fase excêntrica (descida)','Extensão completa embaixo sem travar'],
 ARRAY['Balançar o corpo para subir o peso','Cotovelos se movendo para frente','Descer rápido demais']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Rosca direta com barra W (EZ)',
 ARRAY['bíceps'],
 ARRAY['barra W'],
 'Mesmo movimento da rosca direta, mas com a barra W que posiciona os punhos em ângulo mais natural, reduzindo o estresse nos punhos.',
 ARRAY['Mais confortável para os punhos que a barra reta','Cotovelos fixos','Extensão completa embaixo'],
 ARRAY['Balançar o tronco','Não estender completamente embaixo']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Rosca alternada com halteres',
 ARRAY['bíceps'],
 ARRAY['halteres'],
 'Em pé com um halter em cada mão. Flexione um braço por vez, girando o punho de neutro para supinado (palma para cima) durante a subida. Desça controladamente e alterne.',
 ARRAY['Supinação durante o movimento recruta mais bíceps','Cotovelos fixos','Controle a descida de cada repetição'],
 ARRAY['Balançar o corpo','Mover o cotovelo para frente','Não alternar (fazer os dois de uma vez com peso pesado)']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Rosca martelo com halteres',
 ARRAY['bíceps','antebraço'],
 ARRAY['halteres'],
 'Em pé, segure os halteres com pegada neutra (palmas voltadas uma para a outra). Flexione os cotovelos levando os halteres até os ombros. Desça controladamente.',
 ARRAY['Pegada neutra foca o braquial e braquiorradial','Cotovelos fixos ao lado do corpo','Pode ser alternada ou simultânea'],
 ARRAY['Balançar o tronco','Girar os punhos (vira rosca alternada)']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Rosca concentrada (sentado)',
 ARRAY['bíceps'],
 ARRAY['halter','banco'],
 'Sentado, apoie o cotovelo na parte interna da coxa. Com o halter, flexione o braço até o ombro. Desça controladamente.',
 ARRAY['Isola o bíceps eliminando compensação','Controle total do movimento','Aperte no topo por 1-2 segundos'],
 ARRAY['Usar o tronco para ajudar','Não completar a amplitude']),

-- ============================= TRÍCEPS ======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Tríceps pulley (puxada na polia alta)',
 ARRAY['tríceps'],
 ARRAY['polia','barra reta ou corda'],
 'Em pé de frente para a polia alta, segure a barra/corda. Com os cotovelos fixos ao lado do corpo, estenda os braços para baixo até travar. Retorne controladamente.',
 ARRAY['Cotovelos FIXOS ao lado do corpo — só o antebraço se move','Aperte no final da extensão','Com corda: abra as mãos no final para maior contração'],
 ARRAY['Mover os cotovelos para frente ou para trás','Usar impulso do tronco','Carga excessiva']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Tríceps testa com barra W',
 ARRAY['tríceps'],
 ARRAY['barra W','banco reto'],
 'Deite no banco reto com a barra W. Braços estendidos acima do peito. Flexione os cotovelos descendo a barra em direção à testa (sem tocar). Estenda de volta.',
 ARRAY['Cotovelos apontando para o teto, fixos','Desça até perto da testa ou logo acima','Controle total — peso moderado'],
 ARRAY['Abrir os cotovelos','Bater a barra na testa','Usar peso excessivo sem controle']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Tríceps francês com halter (sentado)',
 ARRAY['tríceps'],
 ARRAY['halter','banco com encosto'],
 'Sentado, segure um halter com as duas mãos acima da cabeça, braços estendidos. Flexione os cotovelos descendo o halter atrás da cabeça. Estenda de volta.',
 ARRAY['Cotovelos apontando para cima e próximos da cabeça','Movimento só dos antebraços','Extensão completa no topo'],
 ARRAY['Abrir os cotovelos para os lados','Usar impulso do tronco','Amplitude incompleta']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Mergulho no banco (dips no banco)',
 ARRAY['tríceps','peito','ombros'],
 ARRAY['banco'],
 'Apoie as mãos na borda do banco atrás de você, pernas estendidas à frente. Flexione os cotovelos descendo o corpo até ~90° nos cotovelos. Empurre de volta.',
 ARRAY['Cotovelos apontando para trás, não para os lados','Para dificultar: eleve os pés em outro banco','Mantenha o corpo próximo ao banco'],
 ARRAY['Descer demais (estresse no ombro)','Cotovelos abertos para os lados','Não completar a extensão']),

-- ============================= PERNAS =======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Agachamento livre com barra',
 ARRAY['quadríceps','glúteos','posterior de coxa','core'],
 ARRAY['barra','rack'],
 'Com a barra apoiada nos trapézios (agachamento alto) ou nas escápulas (baixo), pés na largura dos ombros. Agache flexionando quadril e joelhos até as coxas ficarem paralelas ao chão ou abaixo. Retorne empurrando o chão.',
 ARRAY['Joelhos na direção dos pés (não para dentro)','Costas neutras o tempo todo','Desça até pelo menos a paralela','Core ativado, peito projetado','Pés firmes, peso no meio do pé/calcanhar'],
 ARRAY['Joelhos colapsando para dentro (valgo)','Arredondar a lombar','Não descer o suficiente','Levantar os calcanhares']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Leg press 45°',
 ARRAY['quadríceps','glúteos','posterior de coxa'],
 ARRAY['máquina leg press'],
 'Sentado na máquina com os pés na plataforma na largura dos ombros. Destrave e desça a plataforma flexionando os joelhos até ~90°. Empurre de volta sem travar os joelhos.',
 ARRAY['Pés mais altos na plataforma = mais glúteos e posterior','Pés mais baixos = mais quadríceps','NÃO trave os joelhos no topo','Costas e lombar firmemente apoiadas no encosto'],
 ARRAY['Travar os joelhos (risco grave)','Tirar a lombar do encosto','Amplitude muito curta']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Cadeira extensora',
 ARRAY['quadríceps'],
 ARRAY['máquina extensora'],
 'Sentado na máquina, ajuste o apoio na canela logo acima do tornozelo. Estenda as pernas até ficarem retas, apertando o quadríceps. Retorne controladamente.',
 ARRAY['Aperte o quadríceps no topo por 1-2 segundos','Controle a descida — não deixe cair','Ajuste o encosto para que os joelhos fiquem alinhados com o eixo da máquina'],
 ARRAY['Usar impulso','Hiperextensão dos joelhos','Descer rápido demais']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Mesa flexora (cadeira flexora)',
 ARRAY['posterior de coxa'],
 ARRAY['máquina flexora'],
 'Deitado de bruços na máquina, com o apoio na parte posterior da canela. Flexione os joelhos trazendo os calcanhares em direção aos glúteos. Retorne controladamente.',
 ARRAY['Quadril firme no apoio — não levante','Aperte no topo por 1-2 segundos','Controle a descida'],
 ARRAY['Levantar o quadril do apoio','Usar impulso','Amplitude incompleta']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Stiff (levantamento terra romeno)',
 ARRAY['posterior de coxa','glúteos','lombar'],
 ARRAY['barra'],
 'Em pé com a barra na frente das coxas, joelhos levemente flexionados (e fixos). Incline o tronco à frente empurrando o quadril para trás, descendo a barra ao longo das pernas até sentir o alongamento dos posteriores. Retorne contraindo os glúteos.',
 ARRAY['Joelhos levemente flexionados e FIXOS','Costas retas — o movimento é no quadril','Barra próxima às pernas','Sinta o alongamento nos posteriores'],
 ARRAY['Arredondar a lombar','Flexionar os joelhos (vira agachamento)','Barra longe do corpo']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Avanço (passada) com halteres',
 ARRAY['quadríceps','glúteos'],
 ARRAY['halteres'],
 'Em pé com um halter em cada mão, dê um passo largo à frente. Flexione ambos os joelhos até o joelho de trás quase tocar o chão. Empurre de volta à posição inicial.',
 ARRAY['Joelho da frente não ultrapassa a ponta do pé','Tronco ereto','Passos largos = mais glúteos','Alternar as pernas ou fazer todas de um lado'],
 ARRAY['Joelho da frente passando muito do pé','Tronco inclinado','Passos curtos demais']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Panturrilha no leg press (ou em pé na máquina)',
 ARRAY['panturrilha'],
 ARRAY['máquina leg press'],
 'No leg press, posicione apenas a ponta dos pés na borda inferior da plataforma. Estenda os tornozelos empurrando a plataforma (flexão plantar), depois desça controladamente alongando a panturrilha.',
 ARRAY['Amplitude completa: desça bem (dorsiflexão) e suba bem (flexão plantar)','Segure a contração no topo por 1-2 segundos','Pode ser feita em pé na máquina específica ou no step'],
 ARRAY['Amplitude parcial (o erro mais comum)','Usar impulso','Velocidade excessiva']),

-- ============================= GLÚTEOS ======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Hip thrust (elevação pélvica) com barra',
 ARRAY['glúteos','posterior de coxa'],
 ARRAY['barra','banco'],
 'Sentado no chão com as costas apoiadas na borda de um banco e a barra sobre o quadril (use proteção). Pés no chão na largura dos ombros. Empurre o quadril para cima até o tronco ficar paralelo ao chão, apertando os glúteos no topo. Desça controladamente.',
 ARRAY['Aperte fortemente os glúteos no topo','Queixo levemente recolhido','Pés posicionados para que os joelhos fiquem a ~90° no topo','Use uma almofada/proteção na barra'],
 ARRAY['Hiperextender a lombar no topo','Pés muito longe ou muito perto','Não apertar os glúteos (usar só lombar)']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Abdução de quadril na máquina',
 ARRAY['glúteos'],
 ARRAY['máquina abdutora'],
 'Sentado na máquina, abra as pernas contra a resistência, apertando os glúteos. Retorne controladamente.',
 ARRAY['Foco na contração dos glúteos médio/mínimo','Segure a abertura máxima por 1-2 segundos','Tronco ereto ou levemente inclinado à frente (recruta mais glúteo)'],
 ARRAY['Usar impulso','Movimento rápido sem controle','Apoiar-se nas mãos para forçar a abertura']),

-- ============================= ABDÔMEN ======================================

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Abdominal crunch (tradicional)',
 ARRAY['abdômen'],
 ARRAY['colchonete'],
 'Deitado com os joelhos flexionados e pés no chão. Mãos atrás da cabeça ou cruzadas no peito. Eleve os ombros do chão contraindo o abdômen. Desça controladamente.',
 ARRAY['NÃO puxe a cabeça com as mãos — a força vem do abdômen','Eleve só os ombros, não o tronco inteiro','Expire ao subir, inspire ao descer','Mantenha a lombar no chão'],
 ARRAY['Puxar o pescoço','Levantar demais (vira sit-up)','Usar impulso']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Prancha (plank) isométrica',
 ARRAY['abdômen','core'],
 ARRAY['colchonete'],
 'Apoie os antebraços e as pontas dos pés no chão, corpo em linha reta da cabeça aos calcanhares. Mantenha a posição pelo tempo definido.',
 ARRAY['Não deixe o quadril subir (pirâmide) nem descer (lombar sobrecarregada)','Core bem contraído','Respire normalmente','Olhe para o chão (pescoço neutro)'],
 ARRAY['Quadril muito alto ou muito baixo','Prender a respiração','Mãos entrelaçadas empurrando a cabeça']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Elevação de pernas (deitado)',
 ARRAY['abdômen'],
 ARRAY['colchonete'],
 'Deitado com as mãos sob os glúteos ou ao lado do corpo. Eleve as pernas estendidas até ~90° e desça controladamente sem tocar o chão.',
 ARRAY['Mantenha a lombar pressionada no chão','Para facilitar: flexione levemente os joelhos','Controle a descida — essa é a parte mais difícil'],
 ARRAY['Arquear a lombar (desprender do chão)','Deixar as pernas caírem','Usar impulso']),

('c007ef49-db42-4598-80a6-41cb41df5a4f', 'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
 'Abdominal oblíquo (crunch com rotação)',
 ARRAY['abdômen','oblíquos'],
 ARRAY['colchonete'],
 'Deitado com os joelhos flexionados. Ao subir, gire o tronco levando o cotovelo em direção ao joelho oposto. Alterne os lados.',
 ARRAY['A rotação vem do tronco, não do cotovelo','Contraia os oblíquos ao girar','Movimento controlado'],
 ARRAY['Puxar o pescoço','Girar só o cotovelo sem rodar o tronco','Usar impulso']);
