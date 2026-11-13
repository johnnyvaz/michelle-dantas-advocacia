# Operações — Playbook

> Conhecimento de domínio da área. Deriva do canon e de `05-JURIDICO` — **nunca os contradiz** (se um número ou cláusula divergir, o canon/contexto prevalece).

### Objetivo da área

Manter a plataforma legalmente defensável (LGPD, contratos, termos) e o Gêmeo Digital fiel à realidade (canon atualizado).

### Princípios (como fazer bem)

- Conformidade que protege o negócio, não que o trava — risco sempre classificado.
- Documento enxuto que cobre o essencial; revisar, não acumular.
- Dado pessoal só vai para IA depois de anonimizado/auditado.
- Sem base legal ou cláusula no contexto → declarar a lacuna, não inventar.

### Processos / Frameworks

**LGPD — classificação e base legal.** Mapear os dados tratados pela plataforma (ex.: cadastro, pagamentos, matrículas/assinaturas, mensagens de agente de IA, leads de CRM) e tratá-los como dado pessoal (Art. 5, I). Dado sensível (Art. 5, II — biometria, saúde, voz) exige proteção mais alta por precaução. Base legal típica: execução de contrato (Art. 7, V) para o cliente ativo e consentimento (Art. 7, I) para captação. Detalhe vigente em `gemeo/05-JURIDICO/lgpd.md` — sempre conferir lá antes de afirmar.

**Direitos do titular.** Acesso, correção, eliminação, portabilidade e revogação de consentimento — atender em **até 15 dias** (Art. 19). Solicitação de exclusão → escalar para desenvolvimento executar.

**Contratos e termos.** Termos de uso, política de privacidade e propriedade intelectual vivem em `05-JURIDICO` — revisar trimestralmente ou ao surgir novo tipo de dado/integração (novo suboperador). Para clientes que processam dados de seus próprios usuários (white-label), prever DPA (a plataforma é operadora). Checklist de revisão: preço claro, limite de responsabilidade ao valor do contrato, retenção definida, direitos do titular incluídos.

**Conformidade do produto.** Toda nova feature que cria tratamento de dado novo, ou nova integração/suboperador, passa por avaliação de risco antes de subir. Incidente de segurança → notificar em até 72h (Art. 48).

**Operação do gêmeo.** Manter o canon e o contexto fiéis: rodar as fontes (`atualizar-gemeo`), consolidar números, marcar o que está `null`. **Nunca editar número do canon à mão** — usar as skills, que mostram a conta. Atualizar OKRs/roadmap via `atualizar-jira`.

### Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `montar-gemeo` | Preencher o canon de um negócio do zero (entrevista guiada) |
| `atualizar-gemeo` | Refresh consolidado das fontes antes de demo/reunião |
| `atualizar-jira` | Atualizar OKRs, sprints, roadmap e status |
| `anonymize-data` | Gerar script de anonimização antes de usar dados com IA |
| `prompt-audit` | Auditar prompt quanto a dado pessoal/credencial antes de enviar à IA |
| `deploy` | Release/deploy — **só com aprovação humana** (ação externa irreversível) |

### Fontes no cérebro

- Canon: `gemeo/00-CANON/canon.yaml` — a área é responsável por mantê-lo atualizado
- Contexto: `gemeo/05-JURIDICO/` — `lgpd.md`, `termos-de-uso.md`, `politica-de-privacidade.md`, `propriedade-intelectual.md`, `TEMPLATES/`

### O que NÃO fazer

- Inventar base legal, cláusula contratual ou suboperador — usar `05-JURIDICO` ou marcar lacuna.
- Enviar dado pessoal real para IA sem anonimizar/auditar.
- Editar número do canon à mão — usar as skills `atualizar-*`.
- Fazer deploy ou exclusão de dados sozinho — sinalizar para aprovação.
