# Playbook — Segurança (SOC)

Absorve o antigo `AGENTE-SOC.md`. A triagem é executada pelo motor determinístico
`scripts/prioridade.py` (lente `soc`); este playbook é o **como pensar**.

## Princípio fundamental — Teorema de Bayes

Estime: *"qual a probabilidade de este evento representar ameaça real considerando as evidências?"*.
A cada evidência, atualize a estimativa em **log-odds**:

```text
logit(posterior) = logit(prior) + Σ ln(LR_evidência)
```

A probabilidade final reflete: prior (taxa-base de incidentes), evidências observadas, histórico de
incidentes e frequência de falsos positivos.

## Prior

Taxa histórica de incidentes reais. Ex.: 10 incidentes / 10.000 eventos = **0,1%**. É o ponto de
partida de toda análise (`prioridade.yaml.priors.soc`).

## Evidências (razões de verossimilhança — `prioridade.yaml.lentes.soc`)

| Evidência | Relevância |
|---|---|
| IP em blacklist | Alta |
| Ataque de força bruta | Alta (escala por nº de tentativas, saturado) |
| Acesso administrativo | Alta |
| Uso de TOR | Média |
| Geolocalização incomum | Média |
| User-Agent suspeito | Média |
| Erro isolado de autenticação | Baixa |
| Navegador conhecido | Reduz risco |

Os rótulos viram `LR` numérico no modelo; calibre por feedback (`scripts/recalibrar.py`).

## Processo

1. Coletar evidências do lote.
2. **Correlacionar** em entidades (mesmo IP/usuário/token/ASN/janela) — pontua-se a entidade, não o
   evento cru. "542 tentativas em 5 min" = **uma** evidência forte, não 542.
3. Rodar `scripts/prioridade.py soc --in <lote>` → score + banda + justificativa.
4. Classificar: **Baixa** (0–30, registrar) · **Média** (31–70, alertar e aguardar correlação) ·
   **Alta** (71–100, escalar para humano) · **EXISTENCIAL** (guarda — topo absoluto).
5. Só **Alta/EXISTENCIAL** vira tarefa roteável (`#area/seguranca`) em `tasks/`.

## Aprendizado contínuo

Registrar desfechos em `soc-feedback.yaml` (`ataque_confirmado` / `falso_positivo` / `legitimo` /
`critico`). `recalibrar.py` recomputa os `LR` com **decaimento temporal** (recente > antigo). O
decaimento é só de calibração — **não** rebaixa um incidente grave ainda em aberto.

## Restrições (inegociáveis)

- Nunca bloquear usuário legítimo sem evidência forte.
- Nunca tratar uma evidência como prova definitiva.
- Nunca ignorar contexto histórico nem produzir resposta sem justificativa.
- Toda probabilidade é estimativa sujeita a atualização.

## Formato de saída

Resumo executivo · Score de risco (0–100) · Classificação · Evidências encontradas · Justificativa ·
Recomendação. Meta: maximizar identificação de ameaças reais minimizando esforço humano com falsos
positivos.
