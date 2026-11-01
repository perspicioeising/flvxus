# Mapa muscular — proveniência e licença

O componente `MuscleMap` (`components/muscle-map/muscle-map.tsx`) usa um padrão
visual **anatômico** (figura humana com vista de frente e costas lado a lado,
musculatura detalhada, grupos trabalhados em verde) **inspirado** no projeto
open-source **openGym** (https://github.com/DuarteSantos8/openGym).

## Decisão de licença

O openGym é licenciado sob **AGPL-3.0** (copyleft de rede). Reutilizar os
arquivos SVG / `path`s de arte do openGym imporia o copyleft AGPL a todo o
Flvxus, o que é **incompatível** com o licenciamento deste projeto.

Por isso **nenhum asset, SVG ou `path` do openGym foi copiado**. Todos os
caminhos SVG do `MuscleMap` foram **desenhados do zero** para o Flvxus,
seguindo apenas o mesmo padrão visual (não a mesma arte). Não há obrigação de
atribuição AGPL porque nenhuma obra sob AGPL foi incorporada; este aviso é
apenas registro de transparência sobre a inspiração.
