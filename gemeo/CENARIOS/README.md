# CENARIOS/ — análises "e se" persistidas e re-executáveis

Cada análise relevante do oráculo vira um arquivo `C####-slug.md` (template:
`0000-TEMPLATE.md`) com premissas, o script executado e o `canon_sha` do momento.

Quando o canon muda, o cenário pode ser **re-executado**: a conclusão anterior é
comparada com a nova → status `revalidado` (sustenta) ou `invalidado` (mudou, com diff).

Regra de ouro: cenário é **simulação com premissas declaradas** — nunca fato.
