# LGPD — Mapa de tratamento e adequação

> **Template** — preenchido via /montar-gemeo. Deriva do canon: empresa.{razao_social,cnpj}.
> Documento-modelo — revisar com advogado antes de publicar/assinar.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

[PREENCHER: data de referência AAAA-MM-DD] · **Responsável**: [PREENCHER: nome do encarregado/DPO ou "a formalizar"].

Este é o documento técnico-legal interno: detalha o que é tratado, com que base e por
quanto tempo. A face pública resumida vive em `politica-de-privacidade.md` e deriva daqui.

---

## 1. Dados tratados pela operação

Liste cada dado pessoal que o negócio coleta. Uma linha por dado; só o necessário (minimização).

| Dado | Base legal (LGPD) | Finalidade | Retenção |
|------|-------------------|------------|----------|
| [PREENCHER: dado de identificação — ex.: nome, e-mail] | [PREENCHER: ex.: execução de contrato — Art. 7, V] | [PREENCHER: para que serve] | [PREENCHER: prazo, ex.: conta ativa + [N] anos] |
| [PREENCHER: dado cadastral/fiscal — ex.: documento da organização] | [PREENCHER: ex.: obrigação legal] | [PREENCHER] | [PREENCHER: ex.: [N] anos por obrigação fiscal] |
| [PREENCHER: dado de telemetria/uso do produto] | [PREENCHER: ex.: legítimo interesse — Art. 7, IX] | [PREENCHER: segurança, antifraude] | [PREENCHER: [N] dias] |
| [PREENCHER: dado que exige consentimento explícito] | **Consentimento (opt-in)** | [PREENCHER] | [PREENCHER] |

## 2. Princípios e salvaguardas aplicados

Descreva as decisões de design que reduzem risco. Um bullet por salvaguarda real.

- **Minimização**: [PREENCHER: como o negócio coleta só o estritamente necessário].
- **Anonimização/pseudonimização**: [PREENCHER: ex.: identificadores sensíveis armazenados em hash, nunca em texto claro].
- **Opt-in para dado sensível**: [PREENCHER: qual recurso só ativa com consentimento explícito].
- **Atendimento ao titular**: [PREENCHER: canal de exportação/exclusão e prazo de resposta em dias].

## 3. Papéis no tratamento

Declare em quais contextos o negócio é controlador e em quais é operador.

| Contexto | Papel LGPD | Quem é o titular |
|----------|-----------|------------------|
| [PREENCHER: ex.: conta do cliente] | **Controlador** | [PREENCHER: usuários da organização cliente] |
| [PREENCHER: ex.: dados processados em nome do cliente] | **Operador** | [PREENCHER: cliente é o controlador] |

## 4. Direitos do titular

Como o negócio atende cada direito do Art. 18 (acesso, correção, eliminação, portabilidade,
oposição, informação sobre compartilhamento). Aponte o canal e o prazo.

[PREENCHER: descrição do fluxo de atendimento — portal self-service, e-mail do encarregado, prazo em dias]

## 5. Suboperadores (processadores)

Quem mais toca os dados. Use rótulos genéricos do fornecedor — o contrato precisa de cláusula de proteção de dados (DPA).

| Fornecedor | Dado compartilhado | Base contratual |
|------------|-------------------|-----------------|
| [PREENCHER: fornecedor de banco de dados] | [PREENCHER] | [PREENCHER: DPA padrão] |
| [PREENCHER: fornecedor de hosting] | [PREENCHER] | [PREENCHER] |
| [PREENCHER: provedor de IA, se houver] | [PREENCHER: ex.: sem dado pessoal] | [PREENCHER: política de retenção zero, se aplicável] |

Transferência internacional de dados: [PREENCHER: há ou não; em que país; salvaguarda adotada].

## 6. Plano de adequação (pendências)

Checklist do que falta para a conformidade plena. Marque o que já foi feito.

- [ ] [PREENCHER: nomear/contratar encarregado (DPO) formalmente]
- [ ] [PREENCHER: publicar Política de Privacidade no site]
- [ ] [PREENCHER: elaborar Relatório de Impacto (RIPD) para tratamento de maior risco]
- [ ] [PREENCHER: registrar operações no ROPA interno]
