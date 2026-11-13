// Leitura pura de tasks/human.md: sem $, testável com o texto do arquivo.
// Dois formatos convivem nos projetos PH3A:
//   checkbox  — `- [ ] [APROVAR] título 📅 2026-10-14 🔺 alta` + linhas `  - **Campo:** valor`
//   cabeçalho — `### H-001 · título` (ou `## H-001`) + `**Estado:** ⏳ pendente · 🎯 2026-09-04` + `**Campo:** valor`

import type { Item, Leitura, Prioridade } from '../types'

const CHECKBOX = /^- \[ \] (.*)$/
const CABECALHO = /^#{2,4} (.+)$/
const CAMPO = /^(\s*)(- )?\*\*([^*]+?):?\*\*:?\s*(.*)$/
const VAZIO = /^_?\(?pendente\)?_?$/i
const SOLUCAO = ['solução', 'decisão', 'resposta']

const ehCerca = (linha: string) => linha.trimStart().startsWith('```')

const prazoDe = (texto: string) => texto.match(/(?:📅|🎯)\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? null

const prioridadeDe = (texto: string): Prioridade => {
  if (/🔺|⏫/.test(texto)) return 'alta'
  if (/🔼/.test(texto)) return 'media'
  if (/🔽|⏬/.test(texto)) return 'baixa'
  return null
}

const limparTitulo = (texto: string) =>
  texto.split(/\s(?:📅|🎯|🔺|⏫|🔼|🔽|⏬|🤖|#[\w/-]+)/u)[0]!.trim()

/** Índice da primeira linha depois do bloco que começa em `inicio`. */
const fimDoBloco = (linhas: string[], inicio: number, formato: Item['formato']) => {
  let i = inicio + 1
  let cerca = false
  for (; i < linhas.length; i++) {
    const l = linhas[i]!
    if (ehCerca(l)) cerca = !cerca
    if (cerca) continue
    if (/^#{1,4} /.test(l)) break
    if (formato === 'checkbox' && l.trim() !== '' && !/^\s/.test(l)) break
  }
  return i
}

type Campos = Record<string, { valor: string; linha: number }>

const lerCampos = (linhas: string[], de: number, ate: number): Campos => {
  const campos: Campos = {}
  let atual: string | null = null
  let anterior = -1
  for (let i = de; i < ate; i++) {
    const linha = linhas[i]!
    const m = linha.match(CAMPO)
    if (m) {
      atual = m[3]!.trim().toLowerCase()
      if (!(atual in campos)) campos[atual] = { valor: (m[4] ?? '').trim(), linha: i }
      else atual = null
      anterior = i
      continue
    }
    const l = linha.trim()
    const campo = atual ? campos[atual] : undefined
    if (campo && l !== '' && anterior === i - 1 && /^\s{4,}/.test(linha)) {
      campo.valor += ` ${l}`
      anterior = i
    } else atual = null
  }
  return campos
}

const solucaoDe = (campos: Campos) => {
  for (const nome of SOLUCAO) {
    const c = campos[nome]
    if (c) return VAZIO.test(c.valor) || c.valor === '' ? null : c.valor
  }
  return null
}

const montar = (
  linhas: string[],
  i: number,
  fim: number,
  formato: Item['formato'],
  bruto: string,
  meta: string,
): Item => {
  const campos = lerCampos(linhas, i + 1, fim)
  const tag = bruto.match(/^\[([^\]]+)\]\s*/)
  const id = bruto.match(/^(H-\d+)\s*·\s*/)
  const resto = bruto.replace(/^\[[^\]]+\]\s*/, '').replace(/^H-\d+\s*·\s*/, '')
  const solucao = solucaoDe(campos)
  const val = (...nomes: string[]) => nomes.map(n => campos[n]?.valor).find(Boolean) ?? null

  return {
    linha: i,
    ancora: linhas[i]!,
    formato,
    tipo: tag?.[1] ?? id?.[1] ?? null,
    titulo: limparTitulo(resto) || resto,
    prazo: prazoDe(meta),
    prioridade: prioridadeDe(meta),
    estado: solucao ? 'respondido' : 'pendente',
    solucao,
    oQueDecidir: val('o que decidir'),
    recomendacao: val('recomendação'),
    opcoes: val('opções'),
    motivo: val('motivo', 'por que está bloqueado', 'bloqueia'),
  }
}

export const lerHuman = (texto: string): Leitura => {
  const linhas = texto.split('\n')
  const itens: Item[] = []
  let cabecalhos = 0
  let cerca = false

  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i]!
    if (ehCerca(l)) cerca = !cerca
    if (cerca) continue

    const cb = l.match(CHECKBOX)
    if (cb) {
      itens.push(montar(linhas, i, fimDoBloco(linhas, i, 'checkbox'), 'checkbox', cb[1]!, cb[1]!))
      continue
    }

    const cab = l.match(CABECALHO)
    if (cab) {
      const fim = fimDoBloco(linhas, i, 'cabecalho')
      const estado = linhas.slice(i + 1, fim).find(x => /^\*\*Estado:?\*\*/.test(x))
      if (!estado) continue
      cabecalhos++
      if (/✅|❌|🚀|decidido|confirmado|resolvido|conclu|executado|rejeitado/i.test(estado)) continue
      itens.push(montar(linhas, i, fim, 'cabecalho', cab[1]!, estado))
    }
  }

  const reconhecido = itens.length > 0 || cabecalhos > 0 || /Aguardando decisão|^## Fila/m.test(texto)
  return { itens, reconhecido }
}

/** Data local AAAA-MM-DD de um instante em ms. */
export const hojeDe = (ms: number) => {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const PESO: Record<string, number> = { alta: 0, media: 1, baixa: 2 }

/** Vencido primeiro, depois prazo mais próximo, depois prioridade. */
export const ordenar = (itens: readonly Item[]) =>
  [...itens].sort(
    (a, b) =>
      (a.prazo ?? '9999').localeCompare(b.prazo ?? '9999') ||
      (PESO[a.prioridade ?? ''] ?? 3) - (PESO[b.prioridade ?? ''] ?? 3),
  )

export type Gravacao = { texto: string } | { erro: string }

/**
 * Grava a resposta do responsável no campo `**Solução:**` do item cuja linha de
 * título é `ancora`. Recusa se a âncora sumiu ou se repete, ou se o item já
 * tem solução: nesse caso a edição é no arquivo, não aqui.
 */
export const gravarSolucao = (texto: string, ancora: string, solucao: string): Gravacao => {
  const resposta = solucao.replace(/\s*\n\s*/g, ' ').trim()
  if (resposta === '') return { erro: 'Resposta vazia.' }

  const linhas = texto.split('\n')
  const achadas: number[] = []
  let cerca = false
  linhas.forEach((l, i) => {
    if (ehCerca(l)) cerca = !cerca
    if (!cerca && l === ancora) achadas.push(i)
  })
  if (achadas.length === 0) return { erro: 'O item mudou no arquivo desde a última leitura. Atualize e tente de novo.' }
  if (achadas.length > 1) return { erro: 'O título do item aparece mais de uma vez no arquivo; responda direto no human.md.' }

  const i = achadas[0]!
  const formato: Item['formato'] = CHECKBOX.test(ancora) ? 'checkbox' : 'cabecalho'
  const fim = fimDoBloco(linhas, i, formato)
  const campos = lerCampos(linhas, i + 1, fim)
  const nome = SOLUCAO.find(n => campos[n])

  if (nome) {
    const c = campos[nome]!
    if (!VAZIO.test(c.valor) && c.valor !== '') return { erro: 'Este item já tem solução; edite no arquivo.' }
    const m = linhas[c.linha]!.match(CAMPO)!
    linhas[c.linha] = `${m[1]}${m[2] ?? ''}**${m[3]!.trim()}:** ${resposta}`
  } else if (formato === 'checkbox') {
    let ultima = i
    for (let j = i + 1; j < fim; j++) if (linhas[j]!.trim() !== '') ultima = j
    const recuo = linhas.slice(i + 1, fim).find(l => /^\s+- /.test(l))?.match(/^\s+/)?.[0] ?? '  '
    linhas.splice(ultima + 1, 0, `${recuo}- **Solução:** ${resposta}`)
  } else {
    const estado = linhas.findIndex((l, j) => j > i && j < fim && /^\*\*Estado:?\*\*/.test(l))
    linhas.splice((estado === -1 ? i : estado) + 1, 0, `**Solução:** ${resposta}`)
  }

  return { texto: linhas.join('\n') }
}
