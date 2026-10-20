-- =============================================================================
-- Flvxus v2 — seed.sql · Catálogo inicial de exercícios (pt-BR)
-- =============================================================================
-- ESTRATÉGIA: catálogo GLOBAL de templates.
--   Os exercícios abaixo têm tenant_id = NULL e created_by = NULL, o que os
--   marca como exercícios-TEMPLATE do sistema, compartilhados por todos os
--   tenants (ver decisão 5 do plano, exercises.tenant_id NULLABLE e a policy
--   exercises_select que trata tenant_id IS NULL como leitura pública para
--   qualquer usuário autenticado). Um professor NÃO edita/apaga esses globais
--   (as policies de INSERT/UPDATE/DELETE exigem tenant_id = app_tenant_id());
--   ele pode criá-los no próprio tenant (cópia com tenant_id preenchido) se
--   quiser personalizar. Catálogo cobre os 8 grupos: peito, costas, pernas,
--   ombros, bíceps, tríceps, abdômen e glúteos.
--
-- Idempotência: limpamos apenas os templates globais antes de reinserir, para
-- que `supabase db reset` seja determinístico sem afetar dados de tenants.
-- =============================================================================

delete from public.exercises where tenant_id is null and created_by is null;

insert into public.exercises
  (tenant_id, created_by, name, muscle_groups, equipment, instructions, tips)
values
  -- ---------------------------------------------------------------- PEITO
  (null, null, 'Supino reto com barra',
   array['peito','tríceps','ombros'], array['barra','banco'],
   'Deite no banco reto, retire a barra do suporte e desça controladamente até o peito, depois empurre até estender os cotovelos.',
   array['Mantenha as escápulas retraídas','Não deixe a lombar arquear em excesso','Desça a barra na linha dos mamilos']),
  (null, null, 'Supino inclinado com halteres',
   array['peito','ombros'], array['halteres','banco inclinado'],
   'No banco inclinado a 30-45°, empurre os halteres para cima partindo da linha do peito até quase estender os cotovelos.',
   array['Controle a descida','Evite bater os halteres no topo','Mantenha os punhos firmes']),
  (null, null, 'Crucifixo na máquina (peck deck)',
   array['peito'], array['máquina'],
   'Sentado, com os antebraços apoiados nas almofadas, aproxime os braços à frente do corpo contraindo o peito.',
   array['Segure a contração 1s','Movimento apenas pelos ombros','Evite usar impulso']),

  -- ---------------------------------------------------------------- COSTAS
  (null, null, 'Puxada frontal na polia',
   array['costas','bíceps'], array['polia','barra'],
   'Sentado, puxe a barra em direção ao peito contraindo as costas, depois retorne controladamente.',
   array['Puxe com os cotovelos, não com as mãos','Evite jogar o tronco para trás','Desça a barra até a clavícula']),
  (null, null, 'Remada curvada com barra',
   array['costas','bíceps'], array['barra'],
   'Com o tronco inclinado à frente e coluna neutra, puxe a barra em direção ao abdômen e retorne devagar.',
   array['Mantenha a coluna reta','Puxe em direção ao umbigo','Não use impulso das pernas']),
  (null, null, 'Remada baixa sentada na polia',
   array['costas','bíceps'], array['polia','triângulo'],
   'Sentado, puxe o triângulo em direção ao abdômen aproximando as escápulas, depois estenda os braços.',
   array['Mantenha o tronco estável','Aperte as escápulas no fim','Evite curvar os ombros']),

  -- ---------------------------------------------------------------- PERNAS
  (null, null, 'Agachamento livre com barra',
   array['pernas','glúteos'], array['barra','rack'],
   'Com a barra apoiada no trapézio, agache flexionando quadris e joelhos até as coxas ficarem paralelas ao chão e suba.',
   array['Joelhos alinhados com os pés','Desça com controle','Mantenha o peito aberto']),
  (null, null, 'Leg press 45°',
   array['pernas','glúteos'], array['máquina leg press'],
   'Apoie os pés na plataforma, destrave e flexione os joelhos até ~90°, depois estenda sem travar as articulações.',
   array['Não deixe os joelhos ultrapassarem demais','Apoio total dos pés','Controle a fase negativa']),
  (null, null, 'Cadeira extensora',
   array['pernas'], array['máquina'],
   'Sentado, estenda os joelhos elevando a almofada até a extensão completa e retorne controladamente.',
   array['Segure a contração no topo','Ajuste o encosto ao joelho','Evite impulso']),
  (null, null, 'Mesa flexora',
   array['pernas'], array['máquina'],
   'Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção aos glúteos e retorne devagar.',
   array['Quadril apoiado na mesa','Movimento controlado','Não arquear a lombar']),

  -- ---------------------------------------------------------------- OMBROS
  (null, null, 'Desenvolvimento com halteres',
   array['ombros','tríceps'], array['halteres','banco'],
   'Sentado com apoio, empurre os halteres acima da cabeça até quase estender os cotovelos e retorne à altura das orelhas.',
   array['Não trave os cotovelos','Mantenha o core firme','Evite arquear as costas']),
  (null, null, 'Elevação lateral com halteres',
   array['ombros'], array['halteres'],
   'Em pé, eleve os halteres lateralmente até a altura dos ombros com leve flexão de cotovelo e desça devagar.',
   array['Suba até a linha dos ombros','Evite usar impulso','Cotovelos levemente flexionados']),
  (null, null, 'Elevação frontal com halteres',
   array['ombros'], array['halteres'],
   'Em pé, eleve os halteres à frente até a altura dos ombros, alternando ou simultâneo, e retorne controladamente.',
   array['Não balance o tronco','Controle a descida','Punhos neutros']),

  -- ---------------------------------------------------------------- BÍCEPS
  (null, null, 'Rosca direta com barra',
   array['bíceps'], array['barra'],
   'Em pé, com a barra na pegada supinada, flexione os cotovelos trazendo a barra ao peito e desça devagar.',
   array['Cotovelos fixos ao lado do corpo','Evite balançar','Estenda totalmente na descida']),
  (null, null, 'Rosca alternada com halteres',
   array['bíceps','antebraços'], array['halteres'],
   'Em pé ou sentado, flexione um cotovelo de cada vez girando o punho para a supinação no topo.',
   array['Supine o punho ao subir','Controle a fase negativa','Mantenha o tronco estável']),
  (null, null, 'Rosca scott na máquina',
   array['bíceps'], array['máquina scott'],
   'Com os braços apoiados no banco inclinado, flexione os cotovelos até o topo e retorne sem estender bruscamente.',
   array['Apoie bem os tríceps no banco','Não estenda em hiperextensão','Movimento lento']),

  -- ---------------------------------------------------------------- TRÍCEPS
  (null, null, 'Tríceps na polia com barra',
   array['tríceps'], array['polia','barra'],
   'Em pé de frente para a polia alta, estenda os cotovelos empurrando a barra para baixo e retorne controladamente.',
   array['Cotovelos colados ao corpo','Estenda totalmente','Evite inclinar demais o tronco']),
  (null, null, 'Tríceps testa com barra',
   array['tríceps'], array['barra','banco'],
   'Deitado no banco, com a barra acima da testa, flexione os cotovelos descendo a barra e estenda de volta.',
   array['Cotovelos apontados para cima','Desça até perto da testa','Controle total do peso']),
  (null, null, 'Mergulho no banco',
   array['tríceps','peito'], array['banco'],
   'Com as mãos apoiadas no banco atrás do corpo, flexione os cotovelos descendo o quadril e empurre para cima.',
   array['Cotovelos para trás','Não desça em excesso','Mantenha o quadril próximo ao banco']),

  -- ---------------------------------------------------------------- ABDÔMEN
  (null, null, 'Abdominal supra no solo',
   array['abdômen'], array['colchonete'],
   'Deitado, joelhos flexionados, eleve o tronco contraindo o abdômen e desça controladamente.',
   array['Não puxe o pescoço','Expire ao subir','Movimento pela contração abdominal']),
  (null, null, 'Prancha isométrica',
   array['abdômen','core'], array['colchonete'],
   'Apoie antebraços e pontas dos pés, mantenha o corpo alinhado e sustente a posição pelo tempo prescrito.',
   array['Quadril alinhado ao tronco','Contraia glúteos e abdômen','Não prenda a respiração']),
  (null, null, 'Elevação de pernas suspenso',
   array['abdômen'], array['barra fixa'],
   'Pendurado na barra, eleve as pernas estendidas ou joelhos em direção ao peito e desça com controle.',
   array['Evite balançar','Controle a descida','Contraia o abdômen inferior']),

  -- ---------------------------------------------------------------- GLÚTEOS
  (null, null, 'Elevação pélvica com barra',
   array['glúteos','pernas'], array['barra','banco'],
   'Com as costas apoiadas no banco e a barra sobre o quadril, eleve o quadril contraindo os glúteos e desça devagar.',
   array['Contraia os glúteos no topo','Queixo neutro','Não hiperestenda a lombar']),
  (null, null, 'Coice na polia (glúteo)',
   array['glúteos'], array['polia','caneleira'],
   'Em pé de frente para a polia baixa, estenda a perna para trás contraindo o glúteo e retorne controladamente.',
   array['Evite arquear a lombar','Movimento só pelo quadril','Contraia no fim do movimento']),
  (null, null, 'Agachamento sumô com halter',
   array['glúteos','pernas'], array['halter'],
   'Com os pés afastados e pontas para fora, segure o halter entre as pernas e agache mantendo o tronco ereto.',
   array['Joelhos na direção dos pés','Peito aberto','Desça até a coxa paralela']);
