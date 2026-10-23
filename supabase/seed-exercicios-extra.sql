-- =============================================================================
-- Flvxus — Exercícios adicionais — Tenant "Treinador Eising"
-- =============================================================================
-- 6 exercícios novos. Rode no SQL Editor do Supabase (autocommit, sem begin/commit).
--
-- Tenant:  ae4e4d12-7d48-4e23-8ef1-ccab78144d5d  (Treinador Eising)
-- Prof.:   04da75ff-9966-408c-942e-461acca2537d  (created_by)
--
-- Ajustes feitos em relação ao texto colado:
--  - tenant_id/created_by trocados para os UUIDs atuais (os antigos não existem mais).
--  - muscle_groups normalizados para o vocabulário do filtro do app:
--    Bíceps/Braquiorradial -> 'Braços'; Glúteos/Quadríceps -> 'Pernas'; Abdômen -> 'Core'.
--
-- Idempotente: remove estes 6 nomes neste tenant antes de inserir (pode rodar 2x).
-- =============================================================================

delete from public.exercises
where tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
  and name in (
    'Face pull na polia',
    'Glúteo no cabo ou máquina (Coice)',
    'Passada andando com halteres (Walking Lunges)',
    'Abdominal na polia (Crunch)',
    'Prancha frontal',
    'Rosca martelo'
  );

insert into public.exercises
  (tenant_id, created_by, name, muscle_groups, equipment, instructions, tips, common_errors)
values

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Face pull na polia',
 ARRAY['Ombros','Costas'], ARRAY['Cabo'],
 'Na polia alta equipada com a corda, segure as extremidades e puxe em direção ao seu rosto, separando as mãos na altura das orelhas enquanto aperta fortemente as escápulas para trás.',
 ARRAY['Foco na contração do deltoide posterior (parte de trás dos ombros)','Mantenha os cotovelos altos durante a puxada','Faça 1 segundo de isometria no pico de contração'],
 ARRAY['Puxar a corda para o peito ou pescoço em vez do rosto','Usar carga excessiva e balançar a lombar','Deixar os ombros caírem para a frente na volta']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Glúteo no cabo ou máquina (Coice)',
 ARRAY['Pernas'], ARRAY['Cabo','Máquina'],
 'De frente para a polia baixa (com tornozeleira) ou no aparelho específico, apoie-se e estenda a perna para trás empurrando o peso com o calcanhar até contrair o glúteo por completo. Retorne devagar.',
 ARRAY['Tronco estabilizado para isolar o glúteo','Pico de contração de 1 a 2 segundos no ponto mais alto','Mantenha o abdômen contraído'],
 ARRAY['Arquear excessivamente a lombar ao chutar para trás','Balançar o corpo para ganhar embalo','Dobrar e esticar o joelho excessivamente (transformando num exercício de coxa)']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Passada andando com halteres (Walking Lunges)',
 ARRAY['Pernas'], ARRAY['Peso Livre'],
 'Segure um halter em cada mão. Dê um passo largo à frente e afunde o quadril verticalmente até que o joelho de trás quase toque o solo. Empurre o chão com a perna da frente, levante-se e avance dando o próximo passo.',
 ARRAY['O joelho da perna da frente não deve ultrapassar excessivamente a ponta do pé','Mantenha o tronco levemente inclinado à frente para focar mais nos glúteos (ou reto para quadríceps)','Passadas firmes e controladas'],
 ARRAY['Dar passos muito curtos','Bater o joelho de trás no chão com força','Perder o equilíbrio por descer rápido demais']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Abdominal na polia (Crunch)',
 ARRAY['Core'], ARRAY['Cabo'],
 'Ajoelhe-se de costas ou de frente para a polia alta segurando a corda atrás da nuca. Contraia o abdômen e flexione a coluna, enrolando o tronco para baixo de modo a tentar encostar os cotovelos nos joelhos.',
 ARRAY['O movimento é de curvar (enrolar) a coluna, não de dobrar o quadril','Mantenha o quadril imobilizado durante a execução','Alongue bem o abdômen na fase de subida'],
 ARRAY['Puxar o peso com os braços em vez do abdômen','Sentar-se sobre os calcanhares','Fazer o movimento rápido e sem resistência']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Prancha frontal',
 ARRAY['Core'], ARRAY['Peso Corporal'],
 'Deite-se de bruços e apoie o peso do corpo nos antebraços e nas pontas dos pés. Mantenha o corpo perfeitamente alinhado numa linha reta, contraindo ativamente o abdômen, pernas e glúteos.',
 ARRAY['Respire de forma controlada enquanto mantém a posição','Olhe para o chão para manter a cervical neutra','Aperte os glúteos para proteger a lombar'],
 ARRAY['Deixar o quadril afundar em direção ao chão','Levantar os glúteos demasiado (formando uma tenda)','Prender a respiração']),

('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', '04da75ff-9966-408c-942e-461acca2537d',
 'Rosca martelo',
 ARRAY['Braços'], ARRAY['Peso Livre'],
 'Em pé ou sentado, segure os halteres ao lado do corpo com uma pegada neutra (palmas viradas para as coxas). Mantendo essa mesma pegada, flexione os cotovelos elevando os pesos e retorne controladamente.',
 ARRAY['Foco no músculo braquial e antebraço','Mantenha os cotovelos fixos ao lado do corpo ao longo de todo o movimento','Movimento controlado na descida'],
 ARRAY['Balançar o tronco para ganhar impulso','Subir o cotovelo no topo do movimento','Soltar os halteres de uma vez na volta']);

-- Verificação (deve retornar 6):
-- select count(*) from public.exercises
-- where tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
--   and name in ('Face pull na polia','Glúteo no cabo ou máquina (Coice)',
--     'Passada andando com halteres (Walking Lunges)','Abdominal na polia (Crunch)',
--     'Prancha frontal','Rosca martelo');
