// Testes das funções PURAS do gerador de seed da biblioteca global (pt-BR).
import { describe, it, expect } from 'vitest';

import {
  mapearGrupoMuscular,
  mapearGruposMusculares,
  mapearEquipamento,
  mapearEquipamentos,
  escaparSql,
  sqlString,
  sqlTextArray,
  montarTuplaValues,
  montarSeedSql,
  parseInstructionSteps,
  parseCatalogoSql,
  dedupPorExerciseId,
} from './biblioteca-mapeamento.mjs';

describe('de-para de grupos musculares', () => {
  it('mapeia termos individuais (case/acento-insensível)', () => {
    expect(mapearGrupoMuscular('peito')).toBe('Peito');
    expect(mapearGrupoMuscular('Peitorais')).toBe('Peito');
    expect(mapearGrupoMuscular('latíssimo do dorso')).toBe('Costas');
    expect(mapearGrupoMuscular('trapézio')).toBe('Costas');
    expect(mapearGrupoMuscular('quadríceps')).toBe('Pernas');
    expect(mapearGrupoMuscular('panturrilhas')).toBe('Pernas');
    expect(mapearGrupoMuscular('glúteos')).toBe('Pernas');
    expect(mapearGrupoMuscular('Deltoides')).toBe('Ombros');
    expect(mapearGrupoMuscular('bíceps')).toBe('Braços');
    expect(mapearGrupoMuscular('tríceps')).toBe('Braços');
    expect(mapearGrupoMuscular('abdômen')).toBe('Core');
    expect(mapearGrupoMuscular('oblíquos')).toBe('Core');
    expect(mapearGrupoMuscular('sistema cardiovascular')).toBe('Cardio');
    expect(mapearGrupoMuscular('corpo inteiro')).toBe('Corpo Inteiro');
  });

  it('retorna null para termo desconhecido', () => {
    expect(mapearGrupoMuscular('xyz')).toBeNull();
    expect(mapearGrupoMuscular('')).toBeNull();
  });

  it('deduplica e usa a ordem canônica', () => {
    const grupos = mapearGruposMusculares(['tríceps', 'peitorais', 'deltoides', 'tríceps']);
    expect(grupos).toEqual(['Peito', 'Ombros', 'Braços']);
  });

  it('aplica o fallback Corpo Inteiro quando nada casa', () => {
    expect(mapearGruposMusculares(['xyz', 'abc'])).toEqual(['Corpo Inteiro']);
    expect(mapearGruposMusculares([])).toEqual(['Corpo Inteiro']);
  });
});

describe('de-para de equipamentos', () => {
  it('mapeia termos conhecidos', () => {
    expect(mapearEquipamento('barra')).toBe('Peso Livre');
    expect(mapearEquipamento('halteres')).toBe('Peso Livre');
    expect(mapearEquipamento('com peso')).toBe('Peso Livre');
    expect(mapearEquipamento('máquina articulada')).toBe('Máquina');
    expect(mapearEquipamento('Smith')).toBe('Máquina');
    expect(mapearEquipamento('máquina de leg press')).toBe('Máquina');
    expect(mapearEquipamento('cabo')).toBe('Cabo');
    expect(mapearEquipamento('peso corporal')).toBe('Peso Corporal');
    expect(mapearEquipamento('assistido')).toBe('Peso Corporal');
    expect(mapearEquipamento('elástico de resistência')).toBe('Elástico');
    expect(mapearEquipamento('kettlebell')).toBe('Kettlebell');
    expect(mapearEquipamento('trx')).toBe('TRX');
  });

  it('barra fixa é peso corporal (não peso livre)', () => {
    expect(mapearEquipamento('barra fixa')).toBe('Peso Corporal');
  });

  it('deduplica, ordena e aplica fallback Outros', () => {
    expect(mapearEquipamentos(['barra', 'halteres'])).toEqual(['Peso Livre']);
    expect(mapearEquipamentos(['Smith', 'cabo'])).toEqual(['Máquina', 'Cabo']);
    expect(mapearEquipamentos(['rolo'])).toEqual(['Outros']);
    expect(mapearEquipamentos([])).toEqual(['Outros']);
  });
});

describe('escape e arrays SQL', () => {
  it('dobra aspas simples (apóstrofos pt-BR)', () => {
    expect(escaparSql("não balance o tronco p'ra cima")).toBe("não balance o tronco p''ra cima");
    expect(sqlString("isn't")).toBe("'isn''t'");
    expect(sqlString(null)).toBe('null');
    expect(sqlString(undefined)).toBe('null');
  });

  it('monta arrays text[] válidos e escapados', () => {
    expect(sqlTextArray([])).toBe('ARRAY[]::text[]');
    expect(sqlTextArray(['Braços'])).toBe("ARRAY['Braços']");
    expect(sqlTextArray(["Não balance", "Controle a descida"])).toBe(
      "ARRAY['Não balance','Controle a descida']",
    );
    expect(sqlTextArray(["p'ra cima"])).toBe("ARRAY['p''ra cima']");
  });
});

describe('montagem do INSERT', () => {
  const registro = {
    name: 'Rosca direta com barra reta',
    muscleGroups: ['Braços'],
    equipment: ['Peso Livre'],
    thumbnailUrl: 'https://exemplo/25GPyDY.gif',
    instructions: "Em pé, segure a barra. Não balance o tronco.",
    tips: ['Cotovelos fixos', "Não balance"],
    commonErrors: ['Balançar o corpo'],
  };

  it('monta a tupla na ordem esperada e escapada', () => {
    const tupla = montarTuplaValues(registro);
    expect(tupla).toContain("'Rosca direta com barra reta'");
    expect(tupla).toContain("ARRAY['Braços']");
    expect(tupla).toContain("ARRAY['Peso Livre']");
    expect(tupla).toContain("'https://exemplo/25GPyDY.gif'");
  });

  it('escapa apóstrofos dentro de instructions/tips', () => {
    const comApostrofo = {
      ...registro,
      instructions: "Mantém o 'core' firme",
      tips: ["Não 'trave' o cotovelo"],
    };
    const tupla = montarTuplaValues(comApostrofo);
    expect(tupla).toContain("Mantém o ''core'' firme");
    expect(tupla).toContain("Não ''trave'' o cotovelo");
  });

  it('gera um seed idempotente com cabeçalho e WHERE NOT EXISTS', () => {
    const sql = montarSeedSql([registro], { total: 1 });
    expect(sql).toContain('insert into public.exercises');
    expect(sql).toContain('where not exists');
    expect(sql).toContain('e.tenant_id is null and e.name = v.name');
    expect(sql).toContain('source_exercise_id');
    // tenant_id/created_by/source/video_url nulos.
    expect(sql).toContain('null,                 -- tenant_id: GLOBAL');
    expect(sql).toContain('null,                 -- video_url: sempre null nos globais');
  });

  it('seed vazio não gera INSERT', () => {
    const sql = montarSeedSql([], { total: 0 });
    expect(sql).toContain('nenhum registro gerado');
    expect(sql).not.toContain('insert into');
  });
});

describe('parser do catálogo .sql', () => {
  const linhaCatalogo =
    `INSERT INTO public.exercise_gif_catalog (exercise_id, name_pt, name_original, slug, gif_url_source, storage_path, thumbnail_url, body_parts, equipments, target_muscles, secondary_muscles, instructions, created_at, updated_at) VALUES ` +
    `('0CXGHya', 'Crucifixo no cabo (crossover)', 'Cable Crossover', 'crucifixo-no-cabo-crossover', 'https://static/0CXGHya.gif', 'catalogo/x--0CXGHya.gif', 'https://sb/storage/v1/object/public/exercise-gifs/catalogo/x--0CXGHya.gif', ARRAY['peito'], ARRAY['cabo'], ARRAY['peitorais'], ARRAY['deltoides','tríceps'], '["Step:1 Set the cable pulleys to chest height.", "Step:2 Bring the handles across."]', '2026-10-31 19:42:05+00', '2026-10-31 19:42:04+00'), ` +
    `('0JtKWum', 'Burpee com halteres', 'dumbbell burpee', 'burpee-com-halteres', 'https://static/0JtKWum.gif', 'catalogo/b--0JtKWum.gif', 'https://sb/storage/v1/object/public/exercise-gifs/catalogo/b--0JtKWum.gif', ARRAY['cardio'], ARRAY['halteres'], ARRAY['sistema cardiovascular'], ARRAY['core','deltoides'], '["Step:1 Stand with a dumbbell in each hand.", "Step:2 Lower into a squat."]', '2026-10-31 19:42:06+00', '2026-10-31 19:42:06+00');`;

  it('extrai colunas e passos sem o prefixo Step:N', () => {
    const regs = parseCatalogoSql(linhaCatalogo);
    expect(regs.length).toBe(2);
    const [primeiro, segundo] = regs;
    expect(primeiro.exercise_id).toBe('0CXGHya');
    expect(primeiro.name_pt).toBe('Crucifixo no cabo (crossover)');
    expect(primeiro.body_parts).toEqual(['peito']);
    expect(primeiro.equipments).toEqual(['cabo']);
    expect(primeiro.secondary_muscles).toEqual(['deltoides', 'tríceps']);
    expect(primeiro.instructionSteps).toEqual([
      'Set the cable pulleys to chest height.',
      'Bring the handles across.',
    ]);
    expect(segundo.exercise_id).toBe('0JtKWum');
    expect(segundo.body_parts).toEqual(['cardio']);
  });

  it('o de-para do primeiro registro bate com o esperado', () => {
    const [primeiro] = parseCatalogoSql(linhaCatalogo);
    const grupos = mapearGruposMusculares([
      ...primeiro.body_parts,
      ...primeiro.target_muscles,
      ...primeiro.secondary_muscles,
    ]);
    expect(grupos).toEqual(['Peito', 'Ombros', 'Braços']);
    expect(mapearEquipamentos(primeiro.equipments)).toEqual(['Cabo']);
  });

  it('parseInstructionSteps lida com null e JSON inválido', () => {
    expect(parseInstructionSteps('null')).toEqual([]);
    expect(parseInstructionSteps("'não é json'")).toEqual([]);
  });

  it('dedupPorExerciseId remove repetidos preservando o primeiro', () => {
    const entrada = [
      { exercise_id: 'a', name_pt: 'A' },
      { exercise_id: 'b', name_pt: 'B' },
      { exercise_id: 'a', name_pt: 'A2' },
    ];
    const saida = dedupPorExerciseId(entrada);
    expect(saida.map((r) => r.exercise_id)).toEqual(['a', 'b']);
    expect(saida[0].name_pt).toBe('A');
  });
});
