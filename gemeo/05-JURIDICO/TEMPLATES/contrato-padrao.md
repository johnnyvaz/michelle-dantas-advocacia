# Contrato de Assinatura SaaS — Modelo de cláusulas

> **Template** — preenchido via /montar-gemeo. Deriva do canon: empresa.{razao_social,cnpj,site}, planos[].{id,preco,limites}.
> Documento-modelo — revisar com advogado antes de publicar/assinar.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

Esqueleto de contrato para clientes que não cabem nos Termos self-service (planos superiores,
volume grande, exigências específicas). Cada cláusula tem um racional; ajuste com a assessoria.

**Partes**: [RAZÃO SOCIAL], inscrita sob [CNPJ] ("CONTRATADA"), e [PREENCHER: RAZÃO SOCIAL do cliente / CNPJ] ("CONTRATANTE").
**Data**: AAAA-MM-DD.

---

## Cláusulas

1. **Objeto** — Licença de uso da plataforma [PREENCHER: nome fantasia], conforme plano contratado, acessível em [PREENCHER: site].

2. **Vigência** — [PREENCHER: prazo — indeterminado com renovação automática mensal/anual] a partir da ativação.

3. **Remuneração e reajuste** — Valor conforme plano contratado (`planos[].preco` do canon): R$ [X]/mês. Reajuste anual por [PREENCHER: índice de inflação acumulado].

4. **Obrigações da CONTRATADA** — Manter a plataforma disponível ([PREENCHER: SLA de [X]% mensal — usar placeholder até definir, não inventar]); notificar manutenções programadas com [N] horas de antecedência; prover suporte pelo canal contratado.

5. **Obrigações da CONTRATANTE** — Uso lícito; não compartilhar credenciais; respeitar os limites do plano (`planos[].limites`); manter dados cadastrais atualizados.

6. **Propriedade intelectual** — A CONTRATADA é titular exclusiva da plataforma. A CONTRATANTE retém titularidade sobre seus próprios dados ([PREENCHER: o que o cliente cadastra]).

7. **Proteção de dados (LGPD)** — Cada parte é controladora dos próprios dados. A CONTRATADA atua como operadora dos dados que a CONTRATANTE inserir, comprometendo-se a não usá-los para finalidade diversa da prestação do serviço. Detalhe em `../lgpd.md`.

8. **Confidencialidade** — Informações trocadas são confidenciais por [N] anos após o término.

9. **Limitação de responsabilidade** — A CONTRATADA não responde por lucros cessantes ou danos indiretos. Responsabilidade máxima limitada ao valor pago nos últimos [N] meses.

10. **Rescisão** — Qualquer parte rescinde com aviso de [N] dias. Rescisão imediata por inadimplência ou uso indevido. [PREENCHER: janela de carência em que artefatos já distribuídos continuam funcionando por [N] dias].

11. **Disposições gerais** — Foro: [PREENCHER: comarca/UF]. Lei aplicável: direito brasileiro.

---

*Versão do template: [PREENCHER: X.Y] — AAAA-MM-DD.*
