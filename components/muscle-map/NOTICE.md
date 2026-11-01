# Mapa muscular — proveniência e licença

O componente `MuscleMap` (`components/muscle-map/muscle-map.tsx`) renderiza o
boneco anatômico (vista de frente e costas, musculatura detalhada, grupos
trabalhados em verde/emerald do tema) usando a biblioteca
**`@mjcdev/react-body-highlighter`**.

## Biblioteca usada

- **Pacote:** `@mjcdev/react-body-highlighter` (npm)
- **Licença:** **MIT** (permissiva, compatível com software proprietário)
- **Autor:** MichaelMJC
- **Base:** port para React dos SVGs anatômicos de
  `react-native-body-highlighter`, de **ELABBASSI Hicham** (também MIT).

A MIT exige que o aviso de copyright e a permissão sejam incluídos nas cópias
do software. O texto completo da licença acompanha o pacote em
`node_modules/@mjcdev/react-body-highlighter/LICENSE`. A atribuição abaixo
atende a essa exigência.

```
MIT License

Copyright (c) 2022 ELABBASSI Hicham

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Histórico

A versão anterior do `MuscleMap` usava um SVG desenhado à mão (padrão inspirado
no openGym, AGPL-3.0, sem copiar nenhum asset dele). Esse SVG foi substituído
pela lib MIT acima para obter um boneco anatômico de melhor qualidade visual,
mantendo compatibilidade de licença com o projeto proprietário.
