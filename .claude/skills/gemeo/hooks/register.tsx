import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Aba, Acao, Etapa, Fatos, FilaHumana, FilaTarefas, Filtro, Item, Painel, Tarefa } from '../types'
import { gravarSolucao, hojeDe, lerHuman, ordenar as ordenarHumana } from './humana'
import { COMANDOS_DA_JORNADA, lerCompletude, montarJornada } from './jornada'
import { FONTES, agenteDe, foraDaOrdem, lerOrdem, lerTarefas, ordenar as ordenarTarefas, textoDespacho } from './tarefas'

const PANE = 'gemeo'
const HUMAN = 'tasks/human.md'
const TASKS = 'tasks'
const CANON = 'gemeo/00-CANON/canon.yaml'
const COMPLETUDE = 'gemeo/COMPLETUDE.md'
const BASELINE = 'quality-baseline.json'
// Onde um projeto guarda a própria cópia do mod. `.claude/skills/gemeo` é onde o semear.py a
// instala: o Claude Code carrega dali sozinho num projeto confiável (gemeo@skills-dir).
const PROPRIAS = ['.claude/skills/gemeo', 'mods/gemeo']

const painel = atom({ plugin: 'gemeo', key: 'painel' } as const, null)
const aba = atom({ plugin: 'gemeo', key: 'aba' } as const, 'jornada')
const itemAberto = atom({ plugin: 'gemeo', key: 'itemAberto' } as const, null)
const tarefaAberta = atom({ plugin: 'gemeo', key: 'tarefaAberta' } as const, null)
const filtro = atom({ plugin: 'gemeo', key: 'filtro' } as const, 'todas')
const selecionadas = atom({ plugin: 'gemeo', key: 'selecionadas' } as const, [])
const bandaOculta = atom({ plugin: 'gemeo', key: 'bandaOculta' } as const, false)
const aviso = atom({ plugin: 'gemeo', key: 'aviso' } as const, null)

type $ = EngineInterface

const PRIO = { alta: '🔺', media: '🔼', baixa: '🔽' } as const
const ROTULO = { bugs: 'bug', backlog: 'backlog', features: 'feature' } as const
const FILTROS: readonly Filtro[] = ['todas', ...FONTES]
const ABAS: readonly { id: Aba; rotulo: string }[] = [
  { id: 'jornada', rotulo: 'Jornada' },
  { id: 'humana', rotulo: 'Fila humana' },
  { id: 'tarefas', rotulo: 'Tarefas' },
]
const MARCA = { feita: '✅', atual: '▶ ', adiante: '○ ' } as const

const pendentes = (fh: FilaHumana) => fh.itens.filter(it => it.estado === 'pendente')
const respondidos = (fh: FilaHumana) => fh.itens.filter(it => it.estado === 'respondido')
const vencido = (prazo: string | null, hoje: string) => prazo !== null && prazo < hoje
const idItem = (it: Item) => `item:${it.linha}`
const chaveTarefa = (t: Tarefa) => `${t.fonte}:${t.linha + 1}`
const idadeDias = (de: string, ate: string) => Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000)
const cortar = (texto: string, cabe: number) => (texto.length > cabe ? `${texto.slice(0, Math.max(10, cabe - 1))}…` : texto)

// ── Leitura do disco ─────────────────────────────────────────────────────────

const ehProjeto = async ($: $, pasta: string) => {
  if (await $.fs.exists(`${pasta}/${CANON}`)) return true
  if (await $.fs.exists(`${pasta}/${HUMAN}`)) return true
  for (const f of FONTES) if (await $.fs.exists(`${pasta}/${TASKS}/${f}.md`)) return true
  return false
}

/** Sobe a partir da pasta da sessão até achar gemeo/ ou tasks/: o projeto atual e só ele. */
const acharPasta = async ($: $, cwd: string) => {
  let pasta = cwd.replace(/\/+$/, '')
  while (pasta !== '') {
    if (await ehProjeto($, pasta)) return pasta
    pasta = pasta.slice(0, pasta.lastIndexOf('/'))
  }
  return null
}

/**
 * Só uma cópia atua por projeto. A genérica (`gemeo`) atua em todos, menos onde o projeto
 * tem a sua; uma cópia renomeada (`gemeo-<projeto>`) atua só no projeto que a guarda.
 */
const deveAtuar = async ($: $, pasta: string) => {
  const raiz = $.plugin.root.replace(/\/+$/, '')
  const propria = PROPRIAS.some(p => raiz === `${pasta}/${p}`)
  if (propria || $.plugin.name !== 'gemeo') return propria
  for (const p of PROPRIAS) if (await $.fs.exists(`${pasta}/${p}/.claude-plugin/plugin.json`)) return false
  return true
}

const lerHumana = async ($: $, pasta: string): Promise<FilaHumana | null> => {
  const arquivo = `${pasta}/${HUMAN}`
  if (!(await $.fs.exists(arquivo))) return null
  try {
    const { itens, reconhecido } = lerHuman(await $.fs.read(arquivo))
    return { arquivo, itens, erro: reconhecido ? null : 'formato não reconhecido' }
  } catch (err) {
    return { arquivo, itens: [], erro: `não lido: ${String(err).slice(0, 80)}` }
  }
}

const lerFilas = async ($: $, pasta: string): Promise<FilaTarefas | null> => {
  const erros: string[] = []
  let tarefas: Tarefa[] = []
  let achou = false
  let ordem = { asof: null as string | null, ids: [] as string[] }
  for (const f of FONTES) {
    const arquivo = `${pasta}/${TASKS}/${f}.md`
    if (!(await $.fs.exists(arquivo))) continue
    achou = true
    try {
      tarefas.push(...lerTarefas(f, await $.fs.read(arquivo)))
    } catch (err) {
      erros.push(`${f}.md não lido: ${String(err).slice(0, 80)}`)
    }
  }
  if (!achou) return null
  const prioridade = `${pasta}/${TASKS}/PRIORIDADE.md`
  if (await $.fs.exists(prioridade)) ordem = lerOrdem(await $.fs.read(prioridade).catch(() => ''))
  tarefas = ordenarTarefas(tarefas, ordem)
  return { tarefas, foraDaOrdem: foraDaOrdem(tarefas, ordem), asof: ordem.asof, erros }
}

/**
 * Comandos que a pessoa pode rodar agora. Uma skill copiada em .claude/skills conta mesmo se o engine
 * ainda não a listou. Se o engine não responder, devolve null: a jornada não bloqueia nada às cegas.
 */
const lerComandos = async ($: $, pasta: string): Promise<string[] | null> => {
  let nomes: string[]
  try {
    nomes = (await $.command.list()).map(c => c.name)
  } catch {
    return null
  }
  for (const c of COMANDOS_DA_JORNADA) {
    if (await $.fs.exists(`${pasta}/.claude/skills/${c}/SKILL.md`)) nomes.push(c)
  }
  return nomes
}

const lerFatos = async ($: $, pasta: string, humana: FilaHumana | null, filas: FilaTarefas | null): Promise<Fatos> => {
  const completude = (await $.fs.exists(`${pasta}/${COMPLETUDE}`))
    ? lerCompletude(await $.fs.read(`${pasta}/${COMPLETUDE}`).catch(() => ''))
    : null
  return {
    gemeo: await $.fs.exists(`${pasta}/${CANON}`),
    nivel: completude?.nivel ?? null,
    nivelRotulo: completude?.rotulo ?? null,
    completudeEm: completude?.em ?? null,
    faltamCanon: completude?.faltam ?? [],
    baseline: await $.fs.exists(`${pasta}/${BASELINE}`),
    filas: humana !== null || filas !== null,
    humanaPendentes: humana ? pendentes(humana).length : null,
    humanaRespondidos: humana ? respondidos(humana).length : 0,
    tarefasPendentes: filas ? filas.tarefas.filter(t => !t.emProgresso).length : null,
    comandos: await lerComandos($, pasta),
  }
}

const varrer = async ($: $) => {
  const achada = await acharPasta($, await $.session.cwd())
  const pasta = achada !== null && (await deveAtuar($, achada)) ? achada : null
  const agora = await $.clock.now()
  const novo: Painel = { lidoEm: agora, hoje: hojeDe(agora), pasta, nome: null, fatos: null, jornada: null, humana: null, tarefas: null }
  if (pasta !== null) {
    novo.nome = pasta.split('/').pop() ?? pasta
    novo.humana = await lerHumana($, pasta)
    novo.tarefas = await lerFilas($, pasta)
    novo.fatos = await lerFatos($, pasta, novo.humana, novo.tarefas)
    novo.jornada = montarJornada(novo.fatos)
  }
  await update($, painel, () => novo)
  // Tarefa que saiu do arquivo (resolvida, editada) deixa de estar marcada.
  const vivas = new Set(novo.tarefas?.tarefas.map(t => t.ancora) ?? [])
  await update($, selecionadas, s => s.filter(a => vivas.has(a)))

  return novo
}

const reler = ($: $) => varrer($).then(() => undefined, () => undefined)

// ── Ações ────────────────────────────────────────────────────────────────────

const abrir = async ($: $, qual: Aba) => {
  await update($, aba, () => qual)
  await $.ui.open({ id: PANE, title: 'Gêmeo Digital', focus: true, columns: 100 })
}

/** Põe um texto no prompt, sem enviar, e devolve o teclado ao prompt. Quem envia é a pessoa. */
const preencher = async ($: $, texto: string, ok: string) => {
  const r = await $.prompt.fill({ text: texto, mode: 'append' })
  if (!r.isFilled) {
    await update($, aviso, () => '✗ Não consegui preencher o prompt agora (feche o diálogo aberto e tente de novo).')
    return false
  }
  await update($, aviso, () => ok)
  await $.ui.close({ id: PANE })
  return true
}

/** O próximo passo em uma frase, para a resposta do /gemeo na conversa. */
const resumoAcao = (acao: Acao) => {
  if (acao.tipo === 'prompt') return `Próximo passo: ${acao.texto}`
  if (acao.tipo === 'aba') return 'Próximo passo: responder a fila humana (/humano).'
  if (acao.tipo === 'ausente') return `⚠ O comando /${acao.comando} não está instalado neste projeto: o painel tem o pedido de instalação.`
  return ''
}

const agir = async ($: $, acao: Acao) => {
  if (acao.tipo === 'aba') await update($, aba, () => acao.aba)
  if (acao.tipo === 'prompt') await preencher($, acao.texto, `✓ ${acao.texto.split(' ')[0]} está no prompt: revise e envie.`)
  if (acao.tipo === 'ausente') await preencher($, acao.texto, `✓ O pedido de instalação está no prompt: revise e envie.`)
}

const responder = async ($: $, pasta: string, fh: FilaHumana, it: Item, texto: string) => {
  try {
    const r = gravarSolucao(await $.fs.read(fh.arquivo), it.ancora, texto)
    if ('erro' in r) {
      await update($, aviso, () => `✗ ${r.erro}`)
      return
    }
    await $.fs.write(fh.arquivo, r.texto)
    let sync = ''
    const script = `${pasta}/scripts/sync-obsidian.sh`
    if (await $.fs.exists(script)) {
      const run = await $.process.run(['bash', script], { cwd: pasta, timeoutMs: 60_000 })
      sync = run.exitCode === 0 ? ' · cofre sincronizado' : ` · sync do cofre falhou (código ${run.exitCode})`
    }
    await update($, aviso, () => `✓ Solução gravada em ${HUMAN}${sync}`)
    await update($, itemAberto, () => null)
    $.ui.toast('Gêmeo: resposta gravada na fila humana')
  } catch (err) {
    await update($, aviso, () => `✗ Não gravou: ${String(err).slice(0, 120)}`)
  }
  await varrer($)
}

/** Texto que leva o item para a conversa: o bastante para discutir sem abrir o arquivo. */
export const textoDiscussao = (it: Item) =>
  [
    `Vamos discutir este item da fila humana (${HUMAN}:${it.linha + 1}):`,
    `${it.tipo ? `[${it.tipo}] ` : ''}${it.titulo}${it.prazo ? ` · prazo ${it.prazo}` : ''}`,
    it.oQueDecidir && `O que decidir: ${it.oQueDecidir}`,
    !it.oQueDecidir && it.motivo && `Motivo: ${it.motivo}`,
    it.opcoes && `Opções: ${it.opcoes}`,
    it.recomendacao && `Recomendação do agente: ${it.recomendacao}`,
    '',
    'Minha posição: ',
  ]
    .filter(l => typeof l === 'string')
    .join('\n')

const despachar = async ($: $, tarefas: readonly Tarefa[], asof: string | null) => {
  if (tarefas.length === 0) {
    await update($, aviso, () => '✗ Nenhum item marcado.')
    return
  }
  if (await preencher($, textoDespacho(tarefas, asof), `✓ Despacho de ${tarefas.length} item(ns) no prompt: revise e envie.`)) {
    await update($, selecionadas, () => [])
  }
}

// ── Registro ─────────────────────────────────────────────────────────────────

// Outro plugin com o mesmo comando (ex.: os antigos fila-humana/fila-tasks ainda ligados) faz o
// engine recusar o registro. Um comando recusado não pode derrubar a faixa, a releitura e o painel.
const registrar = async ($: $, name: string, description: string) => {
  try {
    await $.command.register({ name, description })
    return true
  } catch {
    return false
  }
}

export const register: Register = (on, options) => {
  const intervalo = Math.max(10, Number(options.intervaloSegundos ?? 60)) * 1000
  const lote = Math.max(1, Math.min(10, Number(options.lote ?? 3)))

  on('session.start', async ($, e, next) => {
    // `/gemeo` existe em qualquer pasta: é por ele que um projeto sem gêmeo descobre como começar.
    const recusados: string[] = []
    if (!(await registrar($, 'gemeo', 'Gêmeo Digital: em qual das 5 etapas o projeto está e o próximo passo'))) recusados.push('/gemeo')
    const lida = await varrer($).catch(() => null)
    // Sem gemeo/ nem tasks/ (ou outra cópia cuida deste projeto): só o /gemeo, sem faixa nem releitura.
    if (!lida?.pasta) return next(e)
    $.clock.every(intervalo, () => reler($))
    if (!(await registrar($, 'humano', 'Gêmeo: decisões pendentes no tasks/human.md deste projeto'))) recusados.push('/humano')
    if (!(await registrar($, 'fila', 'Gêmeo: bugs, backlog e features por prioridade, com despacho de subagentes'))) recusados.push('/fila')
    if (recusados.length > 0) {
      $.ui.toast(`Gêmeo: ${recusados.join(', ')} já é de outro plugin (os antigos fila-humana/fila-tasks?). Desligue-o; o painel segue no /gemeo.`)
    }
    const n = lida.fatos?.humanaPendentes ?? 0
    if (n > 0) $.ui.toast(`🙋 ${n} decisão(ões) esperando você em ${HUMAN} — ${recusados.includes('/humano') ? '/gemeo' : '/humano'}`)

    return next(e)
  })

  on('command.run', { command: 'gemeo' }, async $ => {
    const lida = await varrer($).catch(() => null)
    await abrir($, 'jornada')
    const j = lida?.jornada
    if (!j) return { text: 'Gêmeo Digital: este projeto ainda não tem o gêmeo. O painel mostra como começar.' }
    if (j.atual === null) return { text: 'Gêmeo Digital: tudo em dia.' }
    return { text: `Gêmeo Digital: etapa ${j.atual} de 5 (${j.etapas[j.atual - 1]!.nome}). ${resumoAcao(j.etapas[j.atual - 1]!.acao)}` }
  })

  on('command.run', { command: 'humano' }, async $ => {
    const lida = await varrer($).catch(() => null)
    if (!lida?.humana) return { text: `Fila humana: este projeto não tem ${HUMAN}.` }
    await abrir($, 'humana')
    return { text: `Fila humana aberta: ${pendentes(lida.humana).length} pendente(s).` }
  })

  on('command.run', { command: 'fila' }, async $ => {
    const lida = await varrer($).catch(() => null)
    if (!lida?.tarefas) return { text: `Fila de tarefas: este projeto não tem ${TASKS}/bugs.md, backlog.md nem features.md.` }
    await abrir($, 'tarefas')
    return { text: `Fila de tarefas aberta: ${lida.tarefas.tarefas.filter(t => !t.emProgresso).length} pendente(s).` }
  })

  // Um agente mexeu no que a jornada ou as filas leem: relê para o painel não mostrar número velho.
  const mexeu = (caminho: string) =>
    /\/tasks\/[^/]+\.md$/.test(caminho) || caminho.endsWith(COMPLETUDE) || caminho.endsWith(`/${BASELINE}`) || caminho.endsWith(CANON)
  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const ran = await next(e)
    if (mexeu(e.file_path)) await reler($)

    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const ran = await next(e)
    if (mexeu(e.file_path)) await reler($)

    return ran
  }).catch(($, e, next) => next(e))

  // Faixa: aparece quando há decisão esperando ou quando a montagem (etapas 1–3) não terminou.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const p = await read($, painel)
    const j = p?.jornada
    if (e.props.hasSurvey || !p || !j || !p.fatos || (await read($, bandaOculta))) return next(e)

    const pend = p.humana ? pendentes(p.humana) : []
    const montando = j.atual !== null && j.atual <= 3
    if (pend.length === 0 && !montando) return next(e)

    const nVencidos = pend.filter(it => vencido(it.prazo, p.hoje)).length
    const etapa = montando ? j.etapas[j.atual! - 1] : undefined
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text color={pend.length > 0 ? 'warning' : undefined} wrap="truncate-end">
          🧬 Gêmeo
          {etapa && ` · etapa ${etapa.n}/5: ${etapa.nome}`}
          {pend.length > 0 && <Text bold>{` · 🙋 ${pend.length} esperando você`}</Text>}
          {nVencidos > 0 && ` · ${nVencidos} ${nVencidos > 1 ? 'vencidos' : 'vencido'}`}{' '}
        </Text>
        <Button key="ver" label="Ver" onPress={() => abrir($, pend.length > 0 && !montando ? 'humana' : 'jornada')} />
        <Text> </Text>
        <Button key="ocultar" label="Ocultar" onPress={() => update($, bandaOculta, () => true)} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const tabela = $.ui.resolve(e)
    const { Box, Button, Text } = tabela
    const Input = 'Input' in tabela ? tabela.Input : null
    const p = await read($, painel)
    const qual = await read($, aba)
    const msg = await read($, aviso)
    const largura = Math.max(40, e.props.bodyColumns)

    if (p === null) return <Text dimColor>Lendo o projeto…</Text>

    // Sem gêmeo nem filas: explica como começar, nas palavras de quem não programa.
    if (p.pasta === null || p.jornada === null) {
      return (
        <Box flexDirection="column">
          <Text bold>🧬 Gêmeo Digital</Text>
          <Text wrap="wrap">Este projeto ainda não tem o gêmeo (nem gemeo/ nem tasks/).</Text>
          <Text> </Text>
          <Text wrap="wrap">O gêmeo transforma um protótipo em produto em 5 etapas: montar o gêmeo, fixar o canon, instalar o loop, decidir a fila humana e soltar o orquestrador.</Text>
          <Text> </Text>
          <Button
            key="instalar"
            label="Pedir a instalação ao Claude"
            hotkey="i"
            onPress={() => agir($, { tipo: 'prompt', rotulo: '', texto: 'Instale o Gêmeo Digital neste projeto com o init.sh do BOILERPLATE-IA (modo empresa, entrega por cópia) e me diga o próximo passo.' })}
          />
          {msg && <Text color={msg.startsWith('✓') ? 'success' : 'error'} wrap="wrap">{msg}</Text>}
        </Box>
      )
    }

    const segundos = Math.round(((await $.clock.now()) - p.lidoEm) / 1000)
    const nPend = p.humana ? pendentes(p.humana).length : 0
    const nTarefas = p.tarefas ? p.tarefas.tarefas.filter(t => !t.emProgresso).length : 0
    const contagem: Record<Aba, string> = { jornada: '', humana: p.humana ? ` ${nPend}` : '', tarefas: p.tarefas ? ` ${nTarefas}` : '' }

    const cabecalho = (
      <Box flexDirection="column">
        <Box>
          <Text dimColor wrap="truncate-end">{p.nome} · lido há {segundos}s </Text>
          <Button key="atualizar" label="Atualizar" hotkey="r" onPress={() => reler($)} />
        </Box>
        <Box>
          {ABAS.map(a => (
            <Box key={`aw-${a.id}`}>
              <Button key={`aba-${a.id}`} label={a.id === qual ? `‹${a.rotulo}${contagem[a.id]}›` : `${a.rotulo}${contagem[a.id]}`} onPress={() => update($, aba, () => a.id)} />
              <Text> </Text>
            </Box>
          ))}
        </Box>
        {msg && <Text color={msg.startsWith('✓') ? 'success' : 'error'} wrap="wrap">{msg}</Text>}
        <Text> </Text>
      </Box>
    )

    // ── Aba: jornada ──
    if (qual === 'jornada') {
      const j = p.jornada
      const montado = j.etapas.slice(0, 3).every(x => x.estado === 'feita')
      const comBotao = (x: Etapa) => x.acao.tipo !== 'nenhuma' && (x.estado === 'atual' || (montado && x.n >= 4))
      return (
        <Box flexDirection="column">
          {cabecalho}
          <Text bold>{j.atual === null ? '✅ Tudo em dia: nada esperando você nem os agentes.' : `Etapa ${j.atual} de 5`}</Text>
          <Text> </Text>
          {j.etapas.map(x => (
            <Box key={`etapa-${x.n}`} flexDirection="column" marginBottom={1}>
              <Text bold={x.estado === 'atual'} dimColor={x.estado === 'adiante'} wrap="truncate-end">
                {MARCA[x.estado]} {x.n}. {x.nome}
              </Text>
              <Box flexDirection="column" paddingLeft={5}>
                <Text color={x.estado === 'atual' ? 'warning' : undefined} dimColor={x.estado !== 'atual'} wrap="wrap">{x.resumo}</Text>
                {x.estado === 'atual' && <Text dimColor wrap="wrap">{x.explicacao}</Text>}
                {comBotao(x) && x.acao.tipo === 'ausente' && (
                  <Text color="warning" wrap="wrap">⚠ O comando /{x.acao.comando} não está instalado neste projeto.</Text>
                )}
                {comBotao(x) && x.acao.tipo !== 'nenhuma' && (
                  <Box>
                    <Button key={`acao-${x.n}`} label={x.acao.rotulo} onPress={() => agir($, x.acao)} />
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          <Text dimColor wrap="wrap">Os botões só escrevem no prompt: quem envia é você.</Text>
        </Box>
      )
    }

    // ── Aba: fila humana ──
    if (qual === 'humana') {
      const fh = p.humana
      if (fh === null) return <Box flexDirection="column">{cabecalho}<Text dimColor>Este projeto não tem {HUMAN}: ele chega com o loop (etapa 3).</Text></Box>
      const sel = await read($, itemAberto)
      const pasta = p.pasta

      const linhaItem = (it: Item) => {
        const id = idItem(it)
        const atrasado = vencido(it.prazo, p.hoje)
        const prazo = it.prazo ? (atrasado ? `VENCIDO ${it.prazo.slice(5)}` : `📅 ${it.prazo.slice(5)}`) : 'sem prazo'
        const prefixo = `${sel === it.ancora ? '▾' : '▸'} ${it.prioridade ? PRIO[it.prioridade] : '·'} `
        const cabe = largura - prefixo.length - prazo.length - (it.tipo?.length ?? 0) - 6

        return (
          <Box key={`b-${id}`} flexDirection="column">
            <Button key={id} plain onPress={() => update($, itemAberto, a => (a === it.ancora ? null : it.ancora))}>
              {prefixo}
              <Text color={atrasado ? 'error' : undefined} dimColor={!atrasado}>{prazo}</Text>
              {it.tipo ? ` [${it.tipo}] ` : ' '}
              {cortar(it.titulo, cabe)}
            </Button>
            {sel === it.ancora && (
              <Box flexDirection="column" paddingLeft={4} marginBottom={1}>
                {it.oQueDecidir && <Text wrap="wrap"><Text bold>O que decidir: </Text>{it.oQueDecidir}</Text>}
                {!it.oQueDecidir && it.motivo && <Text wrap="wrap"><Text bold>Motivo: </Text>{it.motivo}</Text>}
                {it.opcoes && <Text wrap="wrap"><Text bold>Opções: </Text>{it.opcoes}</Text>}
                <Text wrap="wrap"><Text bold>Recomendação: </Text>{it.recomendacao ?? '—'}</Text>
                <Box>
                  <Text dimColor>{HUMAN}:{it.linha + 1} </Text>
                  <Button key={`discutir-${id}`} label="Discutir" hotkey="d" onPress={() => preencher($, textoDiscussao(it), '✓ Item no prompt: escreva sua posição e envie.')} />
                </Box>
                {Input && <Input
                  key={`resp-${id}`}
                  label="Solução: "
                  placeholder="→ opção A, ou como resolver (Enter grava no human.md)"
                  submitLabel="gravar"
                  autoFocus
                  onSubmit={(texto: string) => responder($, pasta, fh, it, texto)}
                />}
              </Box>
            )}
          </Box>
        )
      }

      const pend = ordenarHumana(pendentes(fh))
      const resp = respondidos(fh)
      return (
        <Box flexDirection="column">
          {cabecalho}
          {fh.erro && <Text color="warning" wrap="wrap">⚠ {HUMAN} sem leitura: {fh.erro}</Text>}
          <Text bold>⏳ Esperando você: {pend.length}</Text>
          {pend.length === 0 && !fh.erro && <Text dimColor>Nada pendente.</Text>}
          {pend.map(linhaItem)}
          {resp.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold>✍️ Respondidos, esperando o agente: {resp.length}</Text>
              {resp.map(it => (
                <Text key={`r-${idItem(it)}`} dimColor wrap="truncate-end">
                  {'  '}{it.titulo} → {it.solucao}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      )
    }

    // ── Aba: tarefas ──
    const f = p.tarefas
    if (f === null) {
      return <Box flexDirection="column">{cabecalho}<Text dimColor>Este projeto não tem {TASKS}/bugs.md, backlog.md nem features.md: elas chegam com o loop (etapa 3).</Text></Box>
    }
    const qualFiltro = await read($, filtro)
    const marcadas = await read($, selecionadas)
    const sel = await read($, tarefaAberta)
    const doFiltro = f.tarefas.filter(t => qualFiltro === 'todas' || t.fonte === qualFiltro)
    const pend = doFiltro.filter(t => !t.emProgresso)
    const andamento = doFiltro.filter(t => t.emProgresso)
    const marcadasVis = f.tarefas.filter(t => marcadas.includes(t.ancora))
    const origem = f.asof
      ? `ordem: PRIORIDADE.md de ${f.asof}${f.asof < p.hoje ? ` (há ${idadeDias(f.asof, p.hoje)}d)` : ''}` +
        (f.foraDaOrdem > 0 ? ` · ${f.foraDaOrdem} fora dela, no fim` : '')
      : 'sem PRIORIDADE.md: ordem por score, severidade e idade'

    const linhaTarefa = (t: Tarefa, n: number) => {
      const k = chaveTarefa(t)
      const marcada = marcadas.includes(t.ancora)
      const atrasada = vencido(t.prazo, p.hoje)
      const prazo = t.prazo ? (atrasada ? ` VENCIDO ${t.prazo.slice(5)}` : ` 🎯 ${t.prazo.slice(5)}`) : ''
      const prefixo = `${String(n).padStart(2)}. ${t.severidade ? PRIO[t.severidade] : '·'} ${ROTULO[t.fonte]} `
      const sufixo = `${prazo} · ${t.modelo}`

      return (
        <Box key={`b-${k}`} flexDirection="column">
          <Box>
            <Button
              key={`marca-${k}`}
              plain
              onPress={() => update($, selecionadas, s => (s.includes(t.ancora) ? s.filter(a => a !== t.ancora) : [...s, t.ancora]))}
            >
              {marcada ? '[x]' : '[ ]'}
            </Button>
            <Text> </Text>
            <Button key={k} plain onPress={() => update($, tarefaAberta, a => (a === t.ancora ? null : t.ancora))}>
              {prefixo}
              {cortar(t.titulo, largura - prefixo.length - sufixo.length - 10)}
              <Text color={atrasada ? 'error' : undefined} dimColor={!atrasada}>{sufixo}</Text>
            </Button>
          </Box>
          {sel === t.ancora && (
            <Box flexDirection="column" paddingLeft={6} marginBottom={1}>
              {t.detalhes.slice(0, 6).map((d, i) => (
                <Text key={`d-${k}-${i}`} wrap="wrap" dimColor>
                  {d.length > 400 ? `${d.slice(0, 399)}…` : d}
                </Text>
              ))}
              <Box>
                <Text dimColor>
                  {TASKS}/{t.fonte}.md:{t.linha + 1} · {agenteDe(t)} · {t.modelo}
                  {t.modeloExplicito ? '' : ' (padrão)'}
                  {t.score !== null ? ` · prio ${t.score}` : ''}{' '}
                </Text>
                <Button key={`so-${k}`} label="Despachar este" onPress={() => despachar($, [t], f.asof)} />
              </Box>
            </Box>
          )}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        {cabecalho}
        <Text dimColor wrap="truncate-end">{origem}</Text>
        <Box>
          {FILTROS.map(x => (
            <Box key={`fw-${x}`}>
              <Button key={`filtro-${x}`} label={x === qualFiltro ? `‹${x}›` : x} onPress={() => update($, filtro, () => x)} />
              <Text> </Text>
            </Box>
          ))}
        </Box>
        {f.erros.map(er => <Text key={`e-${er}`} color="warning" wrap="wrap">⚠ {er}</Text>)}
        <Text> </Text>
        <Text bold>⏳ Pendentes: {pend.length}</Text>
        {pend.length === 0 && <Text dimColor>Nada pendente.</Text>}
        {pend.map((t, i) => linhaTarefa(t, i + 1))}
        {andamento.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>🔄 Em andamento: {andamento.length}</Text>
            {andamento.map(t => (
              <Text key={`a-${chaveTarefa(t)}`} dimColor wrap="truncate-end">
                {'   '}{ROTULO[t.fonte]} {t.titulo}
              </Text>
            ))}
          </Box>
        )}
        <Text> </Text>
        <Box>
          <Button key="despachar" label={`Despachar ${marcadasVis.length} marcado(s)`} hotkey="d" onPress={() => despachar($, marcadasVis, f.asof)} />
          <Text> </Text>
          <Button key="topo" label={`Despachar os ${Math.min(lote, pend.length)} primeiros`} hotkey="t" onPress={() => despachar($, pend.slice(0, lote), f.asof)} />
        </Box>
      </Box>
    )
  })
}
