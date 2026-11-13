// Jornada do Gêmeo Digital em 5 etapas: leitura pura, sem $, testável.
// O mod não calcula o nível do canon: lê o que `scripts/completude.py` gravou no COMPLETUDE.md.

import type { Acao, Etapa, Fatos, Jornada } from '../types'

export type Completude = {
  nivel: number
  rotulo: string
  em: string | null
  faltam: string[]
}

/** Lê o cabeçalho e as seções do canon do COMPLETUDE.md; null se o formato não for o do completude.py. */
export const lerCompletude = (texto: string): Completude | null => {
  const m = /\*\*N[ií]vel atual\*\*:\s*([☆★]+)\s*([^\n*]*)/u.exec(texto)
  if (!m) return null
  const estrelas = m[1]!
  const nivel = estrelas.includes('☆') ? 0 : Array.from(estrelas).length
  const em = /\*\*Última atualização\*\*:\s*(\d{4}-\d{2}-\d{2})/.exec(texto)?.[1] ?? null

  // Só as seções do canon (antes da seção de prosa) que faltam para o próximo nível.
  const canon = texto.split(/^## Prosa/m)[0]!
  const faltam: string[] = []
  for (const l of canon.split('\n')) {
    const s = /^- \[ \] `([^`]+)` (★+)/u.exec(l)
    if (s && Array.from(s[2]!).length <= nivel + 1) faltam.push(s[1]!)
  }
  return { nivel, rotulo: `${estrelas} ${m[2]!.trim()}`.trim(), em, faltam }
}

const lista = (itens: string[], max = 4) =>
  itens.length <= max ? itens.join(', ') : `${itens.slice(0, max).join(', ')} e mais ${itens.length - max}`

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/** Comandos que os botões da jornada oferecem: precisam existir no projeto. */
export const COMANDOS_DA_JORNADA = ['montar-gemeo', 'ph3a-loop', 'reduzir-fila'] as const

/** Skill de plugin aparece com o prefixo do plugin (`ph3a-gemeo:montar-gemeo`). */
export const temComando = (comandos: readonly string[], nome: string) =>
  comandos.some(c => c === nome || c.endsWith(`:${nome}`))

export const textoReinstalar = (nome: string) =>
  `O comando /${nome} não existe neste projeto: as skills do Gêmeo Digital não estão instaladas ` +
  '(no modo plugin, os plugins ph3a não foram baixados). Reinstale o gêmeo neste projeto em modo ' +
  'cópia, com o migrate.sh do BOILERPLATE-IA (bash <BOILERPLATE-IA>/migrate.sh . empresa copia), ' +
  `e me diga quando o /${nome} estiver disponível.`

/** Botão que põe `/<nome>` no prompt, ou, se o comando não existe aqui, o pedido de correção. */
const oferecer = (f: Fatos, nome: string, rotulo: string): Acao =>
  f.comandos !== null && !temComando(f.comandos, nome)
    ? { tipo: 'ausente', comando: nome, rotulo: 'Pedir a instalação das skills', texto: textoReinstalar(nome) }
    : { tipo: 'prompt', rotulo, texto: `/${nome}` }

export const montarJornada = (f: Fatos): Jornada => {
  const feita: boolean[] = [
    f.gemeo,
    f.nivel !== null && f.nivel >= 1,
    f.baseline && f.filas,
    f.humanaPendentes === 0,
    f.tarefasPendentes === 0,
  ]
  const indice = feita.findIndex(x => !x)
  const atual = indice === -1 ? null : indice + 1
  const estado = (n: number): Etapa['estado'] => (feita[n - 1] ? 'feita' : n === atual ? 'atual' : 'adiante')

  const canon = (): string => {
    if (!f.gemeo) return 'depende da etapa 1'
    if (f.nivel === null) return 'canon ainda não medido: o /montar-gemeo gera o COMPLETUDE.md'
    const idade = f.completudeEm ? ` (medido em ${f.completudeEm})` : ''
    const proximo = f.nivel < 3 && f.faltamCanon.length > 0
      ? ` · para ${'★'.repeat(f.nivel + 1)} faltam: ${lista(f.faltamCanon)}`
      : ''
    return `${f.nivelRotulo ?? '?'}${idade}${proximo}`
  }

  const loop = (): string => {
    if (f.baseline && f.filas) return 'portões de qualidade instalados e filas criadas'
    if (f.baseline) return 'quality gate instalado, mas falta a pasta tasks/'
    if (f.filas) return 'filas criadas, mas falta o quality gate (quality-baseline.json)'
    return 'ainda não rodou'
  }

  const humana = (): string => {
    if (f.humanaPendentes === null) return 'ainda não existe: chega com o loop (tasks/human.md)'
    if (f.humanaPendentes === 0) {
      return f.humanaRespondidos > 0
        ? `nada esperando você · ${plural(f.humanaRespondidos, 'resposta sua espera', 'respostas suas esperam')} o agente`
        : 'nada esperando você'
    }
    return `${plural(f.humanaPendentes, 'decisão espera', 'decisões esperam')} você`
  }

  const tarefas = (): string => {
    if (f.tarefasPendentes === null) return 'ainda não existe: chega com o loop (tasks/bugs.md, backlog.md, features.md)'
    if (f.tarefasPendentes === 0) return 'fila de trabalho zerada'
    return `${plural(f.tarefasPendentes, 'tarefa', 'tarefas')} na fila de trabalho dos agentes`
  }

  const etapas: Etapa[] = [
    {
      n: 1,
      nome: 'Montar o gêmeo',
      explicacao: 'Cria a pasta gemeo/, onde o contexto do negócio vai morar.',
      estado: estado(1),
      resumo: f.gemeo ? 'gêmeo instalado' : 'ainda não instalado neste projeto',
      acao: f.gemeo
        ? { tipo: 'nenhuma' }
        : {
            tipo: 'prompt',
            rotulo: 'Pedir a instalação',
            texto: 'Instale o Gêmeo Digital neste projeto com o init.sh do BOILERPLATE-IA (modo empresa, entrega por cópia) e me diga o próximo passo.',
          },
    },
    {
      n: 2,
      nome: 'Fixar o canon',
      explicacao: 'O canon é o arquivo da verdade com os números do negócio. Você entrega planilhas, PDFs e contratos; a IA pergunta o que faltar.',
      estado: estado(2),
      resumo: canon(),
      acao: f.gemeo && !(f.nivel !== null && f.nivel >= 3)
        ? oferecer(f, 'montar-gemeo', 'Preparar /montar-gemeo')
        : { tipo: 'nenhuma' },
    },
    {
      n: 3,
      nome: 'Instalar o loop',
      explicacao: 'Instala os portões de qualidade e segurança e faz o check-up: cada problema vira tarefa com prioridade.',
      estado: estado(3),
      resumo: loop(),
      acao: f.gemeo && !(f.baseline && f.filas)
        ? oferecer(f, 'ph3a-loop', 'Preparar /ph3a-loop')
        : { tipo: 'nenhuma' },
    },
    {
      n: 4,
      nome: 'Decidir a fila humana',
      explicacao: 'O que só você decide: preço, gasto, envio a cliente, deploy. A IA para e espera a sua resposta.',
      estado: estado(4),
      resumo: humana(),
      acao: f.humanaPendentes === null ? { tipo: 'nenhuma' } : { tipo: 'aba', aba: 'humana', rotulo: 'Abrir a fila humana' },
    },
    {
      n: 5,
      nome: 'Soltar o orquestrador',
      explicacao: 'Os agentes reduzem a fila de trabalho por prioridade, em branch, e registram o que fizeram na memória.',
      estado: estado(5),
      resumo: tarefas(),
      acao: f.tarefasPendentes ? oferecer(f, 'reduzir-fila', 'Preparar /reduzir-fila') : { tipo: 'nenhuma' },
    },
  ]

  return { etapas, atual }
}
