# Metodologia — Como levantar os perfis cognitivos

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `time[].{nome,cargo,decisor,perfil_cognitivo}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

A camada de **adesão** é o diferencial do gêmeo: ela permite ao oráculo responder não só
*"qual o impacto desta decisão?"* mas *"o time abraça esta decisão?"*. Para isso, cada
decisor precisa de um **perfil cognitivo** — e a qualidade da previsão depende da
**qualidade da fonte** desse perfil.

## Níveis de confiança da fonte (do mais fraco ao mais forte)

Marque a confiança no topo de cada `Team/perfil-*.md`. O oráculo **cita** esse nível ao
prever adesão.

| Nível | Fonte | Confiança | Quando usar |
|-------|-------|-----------|-------------|
| 🟡 **Ilustrativo** | Questionário rápido respondido pelo founder *sobre* a pessoa | Baixa | Bootstrap: preencher o gêmeo rápido para ter uma 1ª leitura. |
| 🟠 **Inferido** | Entrevista estruturada com a própria pessoa | Média | Há tempo para 30–60 min com cada decisor. |
| 🟢 **Medido** | **Dossiê de perfil cognitivo**: transcrição real (entrevista/áudios, mín. ~15 min) processada por uma metodologia de perfil cognitivo no pipeline dados → drivers → perfil → recomendações | Alta | Perfil definitivo; o que sustenta uma previsão de adesão confiável. Usa `Team/perfil-completo-TEMPLATE.md`. |

> **Regra inviolável:** perfil sem fonte da própria pessoa (entrevista/transcrição) é
> **ilustrativo**. Nunca apresente um perfil ilustrativo como medição. O Intake do
> `perfil-TEMPLATE.md` gera o nível 🟡 — é ponto de partida, não chegada.

## O caminho recomendado

1. **Bootstrap (🟡):** founder responde o Intake de cada decisor (ver `Team/perfil-TEMPLATE.md`).
   Gera um perfil ilustrativo por pessoa em minutos.
2. **Validação (🟠):** entrevista cada decisor com as próprias perguntas do Intake — agora
   respondidas em 1ª pessoa. Ajusta drivers e gatilhos.
3. **Medição (🟢):** colete uma transcrição real e extraia os drivers de evidência direta
   (só o que foi dito, sem inferência). É o que estabiliza a `Team/matriz-decisao-adesao.md`.

## Metodologia de referência — perfil cognitivo

Para estruturar os perfis com rigor, o padrão-ouro deste framework é apoiar-se numa
**metodologia de perfil cognitivo** (ex.: DISC, OCEAN / Big Five, Eneagrama, ou um dossiê
de análise de perfil cognitivo de fornecedor especializado), baseada em **drivers**
(motivadores cognitivos organizados em categorias) e mapeamento de personalidade
(OCEAN / DISC / Eneagrama). Resumo do pipeline:

```
TRANSCRIÇÃO → DADOS (unidades de evidência) → DRIVERS → PERFIL/GATILHOS → MAPEAMENTO
            → SIMULAÇÕES DE VALIDAÇÃO → recomendações: como engajar / como delegar
```

- Cada driver só é confirmado com **2+ evidências literais** da fala da pessoa (zero-inferência).
- Drivers dominantes = obsessões; ausências notáveis = pontos cegos.
- O oráculo cruza os **drivers dominantes** de cada decisor com a decisão em jogo para
  prever a postura (apoia / resiste / neutro).

### Ingestão do dossiê no gêmeo

O dossiê produzido por uma análise de perfil cognitivo (evidências, drivers, perfil completo,
recomendações, simulações, síntese narrativa, contexto de agente) alimenta o
[`Team/perfil-completo-TEMPLATE.md`](./Team/perfil-completo-TEMPLATE.md), que o integra
ao gêmeo em três camadas:

1. **Adesão** — postura prevista por tipo de decisão → `Team/matriz-decisao-adesao.md`;
2. **Operação** — como delegar tarefas à pessoa (contexto de agente) → usado por humanos
   e por agentes de IA ao escrever tarefas;
3. **Desenvolvimento** — extrair o melhor (forças/fluxo) e endereçar pontos cegos, com
   plano revisado periodicamente e **calibração previsão × desfecho real** a cada decisão.

Convenção de arquivos: `Team/<slug>/perfil-completo.md` + documentos-fonte em
`Team/<slug>/dossie/`. Trabalhar com pessoas não é só número: é esta camada que faz o
gêmeo de uma empresa de **serviço** — onde o ativo é gente — responder perguntas que
planilha nenhuma responde.

> O essencial é manter a disciplina dos níveis de confiança acima: a fonte determina o
> peso da previsão. Perfil psicológico é dado sensível (LGPD): exige consentimento
> registrado e fica restrito a este repo privado.

## Como o gêmeo usa isto

- Cada decisor (`time[]` com `decisor` verdadeiro) tem um perfil em `Team/`.
- A postura prevista por decisão vive em `Team/matriz-decisao-adesao.md`.
- A versão "de parede" desses perfis é `Cultura/valores-e-cultura.md`.
