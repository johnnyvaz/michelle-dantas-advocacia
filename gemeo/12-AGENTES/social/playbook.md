# Social — Playbook

> Como transformar pauta em pacotes por rede e cuidar da comunidade. Deriva de
> `gemeo/06-MARKETING/redes/` e de `gemeo/14-MARCA/` e **nunca os contradiz**. Se um número divergir,
> o canon prevalece.

## Objetivo da área

Cada ideia aprovada da pauta chega a cada rede-foco no formato nativo, no horário certo, pronta para o
humano publicar em um clique.

---

## 1. Calendário da semana

1. Partir da pauta do `agente-ideias` e dos pilares/cadência de `calendario-editorial.md`.
2. Distribuir por rede e dia respeitando a cadência e as datas fixas.
3. Preencher a seção "Semana corrente" do calendário (é rascunho interno; reversível).
4. Pilar sem ideia na pauta → tarefa `#area/ideias` pedindo pauta, não post improvisado.

---

## 2. Adaptação por rede

Para cada ideia × rede:

| Campo | De onde vem |
|---|---|
| Formato (carrossel, vídeo curto, texto, artigo) | `perfis-por-rede.md` § formatos |
| Especificação (dimensão, duração, limite de caracteres) | fonte oficial da rede, com data da conferência |
| Tom | `14-MARCA/voz-e-tom.md` + ajuste de `perfis-por-rede.md` |
| Legenda | adaptação da copy aprovada; texto novo de campanha é do `agente-copy` |
| Hashtags | `banco-de-hashtags.md` (pilar × rede) |
| CTA | `banco-de-ctas.md` (objetivo × rede) |
| Horário | `melhores-horarios.md` (medido > seed genérico; dizer qual foi usado) |

Especificação de plataforma muda: conferir antes de produzir, registrar a data.

---

## 3. Pacote pronto para postar

Um arquivo por rede e semana, ao lado do calendário (ex.: `gemeo/06-MARKETING/redes/pacotes/AAAA-Www/<rede>.md`):

```markdown
# <rede> · AAAA-Www
| Dia/hora | Formato | Legenda | Hashtags | CTA | Arte/arquivo | Status |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | <caminho ou "falta arte"> | PRONTO · aguardando publicação |
```

E **um** pedido agregado em `tasks/human.md` por semana (formato do `_FRAMEWORK/allowlist.md`),
deduplicado:

```
- [ ] [APROVAR] Publicar o pacote de redes da semana AAAA-Www 📅 <data> 🔺 alta 🤖 #area/social
  - **Solicitante:** agente-social
  - **Motivo:** calendário da semana; pauta de <data>
  - **Impacto:** <N> peças em <redes>
  - **Risco:** irreversível / Tipo 1 (publicação externa)
  - **Pronto para executar:** `gemeo/06-MARKETING/redes/pacotes/AAAA-Www/`
  - **Decisão:** _(pendente)_
```

Peça sem arte → status "falta arte" e tarefa `#area/design`; peça de vídeo pronta para encenar →
`#area/estudio`.

---

## 4. Comunidade

- Triar comentários, menções e DMs de audiência: dúvida, elogio, crítica, crise, lead.
- **Rascunhar** a resposta na voz da marca; o envio é do humano (pedido em `tasks/human.md`).
- Lead quente (dor explícita + poder de decisão + pergunta direta) → tarefa `#area/vendas` com canal e
  contexto. Não vender na thread.
- Crise ou ataque → item 🔺 em `tasks/human.md` com o rascunho; nada de resposta automática.

---

## 5. Rodízio e memória

Registrar em `memoria.md` só o durável: formato que uma rede rejeita, regra de plataforma que mudou,
padrão de crise. O histórico de posts não é memória: é o calendário.

---

## O que NÃO fazer

- Publicar, agendar na plataforma ou enviar resposta (Tipo 1 → `tasks/human.md`).
- Gerar pauta própria quando falta ideia.
- Usar o seed de horário como se fosse medido.
- Citar preço ou número sem o canon.
