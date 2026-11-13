# Findings de pentest — estado do projeto (nasce vazio)

Diretório de **estado** (não é distribuído por plugin; nunca sobrescrito por atualização — FR-016).

- `findings.json` — coleção estruturada de findings verificados (schema unificado). Base do dedup histórico e do rastreio de remediação entre runs. Nasce ausente; é criado por `/pentest-dinamico`.
- Relatórios `.md` por run — legíveis, artefato de cada execução.

O `findings.json` alimenta o loop **red→blue**:
`python3 scripts/importar_findings.py --in findings.json --out eventos.jsonl` →
`python3 scripts/prioridade.py all --in eventos.jsonl` (lente `pentest`).

Conteúdo real de findings é sensível — coberto pelos guardas (`bash_guard`) e não sai do repositório.
