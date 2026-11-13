// Leitura pura de tasks/{bugs,backlog,features}.md e tasks/PRIORIDADE.md: sem $, testável.
// O contrato da linha é o de tasks/README.md; a identidade e a ordem são as de
// scripts/prioridade.py, para o painel e o motor nunca discordarem sobre qual item é qual.

import type { Fonte, Modelo, Ordem, Severidade, Tarefa } from '../types'

export const FONTES: readonly Fonte[] = ['bugs', 'backlog', 'features']

const TAREFA = /^\s*-\s*\[([ xX/-])\]\s*(.*)$/
const MARCADOR = /\s*\[prio:\s*(-?[0-9.]+)\s+calc:prioridade\]/g
const TAG = /#(?:area|esforco|eis|modelo)\/\S+/g
const META_EMOJI = /[📅🎯🔺🔼🔽🤖✅❌⏳🚨]/gu
const FRASES_MODELO = ['descreva', 'exemplo —', 'exemplo -', 'nome da feature', 'nome da frente']

const ehCerca = (l: string) => /^\s*(```|~~~)/.test(l)

/** Porte de `_id_from_body` (scripts/prioridade.py): só o texto, sem metadado. */
export const idDe = (body: string) => {
  const t = body
    .replace(MARCADOR, '')
    .replace(TAG, '')
    .replace(/\d{4}-\d{2}-\d{2}/g, '')
    .replace(META_EMOJI, '')
    .replace(/\s(alta|média|media|baixa)\b/gi, '')
    .replace(/[[\]#/]/g, '')
  const slug = Array.from(t.trim().replace(/\s+/g, '-').replace(/^-+|-+$/g, ''))
    .slice(0, 60)
    .join('')
    .toLowerCase()
  return slug || Array.from(body).slice(0, 40).join('')
}

const placeholder = (body: string) => {
  const b = body.toLowerCase()
  return body.includes('{{') || /^[[<][^\]>]{3,}[\]>]/.test(body) || FRASES_MODELO.some(f => b.startsWith(f))
}

const severidadeDe = (t: string): Severidade =>
  t.includes('🔺') ? 'alta' : t.includes('🔼') ? 'media' : t.includes('🔽') ? 'baixa' : null

/** Regra de tasks/README.md para item sem `#modelo/`. */
const modeloPadrao = (esforco: Tarefa['esforco'], area: string | null): Modelo =>
  esforco === 'g' || ['seguranca', 'financeiro', 'operacoes'].includes(area ?? '') ? 'opus' : 'sonnet'

const limparTitulo = (body: string) =>
  body
    .replace(MARCADOR, '')
    .split(/\s(?:📅|🎯|🔺|⏫|🔼|🔽|⏬|🤖|#[\w/-]+)/u)[0]!
    .replace(/\*\*/g, '')
    .trim()

const prazoDeBloco = (l: string) =>
  /^\*\*(?:Prazo|Entrega):?\*\*:?\s*🎯\s*(\d{4}-\d{2}-\d{2})/.exec(l)?.[1] ?? null

export const lerTarefas = (fonte: Fonte, texto: string): Tarefa[] => {
  const linhas = texto.split('\n')
  const tarefas: Tarefa[] = []
  // Prazo herdado por nível de heading: `###` herda do `##` acima; um `##` novo zera.
  const prazos: (string | null)[] = []
  let nivel = 0
  let cerca = false
  let atual: Tarefa | null = null

  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i]!
    if (ehCerca(l)) {
      cerca = !cerca
      continue
    }
    if (cerca) continue

    const h = /^(#{1,6})\s+(.*)$/.exec(l)
    if (h) {
      nivel = h[1]!.length
      prazos.length = nivel
      prazos[nivel - 1] = /🎯\s*(\d{4}-\d{2}-\d{2})/u.exec(h[2]!)?.[1] ?? null
      atual = null
      continue
    }
    const pb = prazoDeBloco(l)
    if (pb && nivel > 0) prazos[nivel - 1] = pb

    const m = TAREFA.exec(l)
    if (m) {
      atual = null
      const estado = m[1]!
      const body = m[2]!.replace(MARCADOR, '').trim()
      if ((estado !== ' ' && estado !== '/') || placeholder(body)) continue
      const area = /#area\/(\S+)/.exec(body)?.[1] ?? null
      const esforco = (/#esforco\/([pmg])\b/.exec(body)?.[1] ?? 'm') as Tarefa['esforco']
      const modeloTag = /#modelo\/(opus|sonnet|haiku)\b/.exec(body)?.[1] as Modelo | undefined
      const score = /\[prio:\s*(-?[0-9.]+)\s+calc:prioridade\]/.exec(m[2]!)?.[1]
      const herdado = [...prazos].reverse().find(p => p) ?? null
      atual = {
        fonte,
        linha: i,
        ancora: `${fonte}\n${l}`,
        id: idDe(body),
        titulo: limparTitulo(body) || body,
        emProgresso: estado === '/',
        severidade: severidadeDe(body),
        area,
        esforco,
        modelo: modeloTag ?? modeloPadrao(esforco, area),
        modeloExplicito: modeloTag !== undefined,
        registrada: /📅\s*(\d{4}-\d{2}-\d{2})/u.exec(body)?.[1] ?? null,
        prazo: /🎯\s*(\d{4}-\d{2}-\d{2})/u.exec(body)?.[1] ?? herdado,
        score: score === undefined ? null : Number(score),
        detalhes: [],
      }
      tarefas.push(atual)
      continue
    }

    const sub = /^\s+-\s+(.*)$/.exec(l)
    if (atual && sub) atual.detalhes.push(sub[1]!.replace(/^`(.*)`$/, '$1').trim())
    else if (l.trim() !== '' && !/^\s/.test(l)) atual = null
  }
  return tarefas
}

/** Ordem de tasks/PRIORIDADE.md: `N. **[BANDA] … · EV x · \`id\` \`#area/…\``. */
export const lerOrdem = (texto: string): Ordem => {
  const asof = /^> asof (\d{4}-\d{2}-\d{2})/m.exec(texto)?.[1] ?? null
  const ids: string[] = []
  for (const l of texto.split('\n')) {
    const m = /^\d+\. \*\*\[.*? · EV \S+ · `(.*?)`(?: `#area\/[^`]*`)?\s*$/.exec(l)
    if (m) ids.push(m[1]!)
  }
  return { asof, ids }
}

const PESO = { alta: 0, media: 1, baixa: 2 } as const

/**
 * PRIORIDADE.md manda: o que o motor ranqueou vem primeiro, na ordem dele. O que ele não
 * viu (item novo depois da última rodada) vai depois, por score gravado, severidade e idade.
 */
export const ordenar = (tarefas: readonly Tarefa[], ordem: Ordem) => {
  const pos = new Map<string, number>()
  ordem.ids.forEach((id, i) => pos.has(id) || pos.set(id, i))
  const rank = (t: Tarefa) => pos.get(t.id) ?? Infinity
  return [...tarefas].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (b.score ?? -Infinity) - (a.score ?? -Infinity) ||
      (a.severidade ? PESO[a.severidade] : 3) - (b.severidade ? PESO[b.severidade] : 3) ||
      (a.registrada ?? '9999').localeCompare(b.registrada ?? '9999'),
  )
}

export const foraDaOrdem = (tarefas: readonly Tarefa[], ordem: Ordem) => {
  const ids = new Set(ordem.ids)
  return tarefas.filter(t => !t.emProgresso && !ids.has(t.id)).length
}

// Aliases de `#area/` que tasks/README.md lista (migrar-tasks.py os renomeia com --apply).
const ALIAS: Record<string, string> = {
  engenharia: 'desenvolvimento', infra: 'desenvolvimento', deploy: 'desenvolvimento',
  dev: 'desenvolvimento', qualidade: 'desenvolvimento',
  conteudo: 'conteudo-cursos', cursos: 'conteudo-cursos',
  juridico: 'operacoes', legal: 'operacoes', sec: 'seguranca',
}

export const areaDe = (t: Tarefa) => (t.area ? ALIAS[t.area] ?? t.area : 'desenvolvimento')

/** Agente de área de um item; `seguranca` atende o par blue/red-team. */
export const agenteDe = (t: Tarefa) => {
  const area = areaDe(t)
  return area === 'seguranca' ? 'agente-soc ou agente-redteam' : `agente-${area}`
}

/**
 * Ordem de despacho que o mod põe no prompt, sem enviar. Quem despacha é o agente principal:
 * ele cria uma worktree por item, aplica a doutrina e consolida. O mod só escreve o pedido.
 */
export const textoDespacho = (tarefas: readonly Tarefa[], asof: string | null) =>
  [
    `Reduza a fila de tarefas: despache 1 subagente por item abaixo, em paralelo, cada um com ` +
      `isolation: "worktree" e o subagent_type e o model indicados (ou o equivalente disponível nesta ` +
      `sessão; sem agente da área, general-purpose). A ordem é a prioridade` +
      (asof ? ` (tasks/PRIORIDADE.md de ${asof}).` : ' (sem tasks/PRIORIDADE.md: score, severidade e idade).'),
    '',
    ...tarefas.flatMap((t, i) => [
      `${i + 1}. tasks/${t.fonte}.md:${t.linha + 1} · ${agenteDe(t)} · ${t.modelo}` +
        (t.modeloExplicito ? '' : ' (padrão, sem #modelo/)'),
      `   ${t.titulo}`,
    ]),
    '',
    'A worktree parte do HEAD, não da árvore de trabalho: se houver mudança não commitada que afete ' +
      'um item (inclusive no próprio arquivo de tasks/), me avise antes de despachar; não commite por conta própria.',
    ...(tarefas.some(t => areaDe(t) === 'seguranca')
      ? ['Item de segurança: só análise; probe ativo exige alvo no ROE e aprovação (.claude/rules/pentest.md).']
      : []),
    '',
    'Cada subagente: lê o item completo na linha indicada e o CLAUDE.md do projeto; resolve com teste ' +
      '(red → green quando houver código); não faz commit, push nem deploy; se precisar de decisão ' +
      'ou ação externa, devolve o pedido para tasks/human.md e para. Ao terminar, devolve o resumo e o diff.',
    'Depois de todos: revise cada worktree, traga para a branch atual só o que passou nos testes, mova ' +
      'os itens resolvidos para tasks/concluidas.md (✅ data) e me diga o que ficou pendente e por quê.',
  ].join('\n')
