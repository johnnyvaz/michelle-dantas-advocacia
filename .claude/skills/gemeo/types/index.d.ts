// ── Fila humana: tasks/human.md ──────────────────────────────────────────────

export type Prioridade = 'alta' | 'media' | 'baixa' | null

export type Item = {
  /** Linha do título no arquivo (0-based), na última leitura. */
  linha: number
  /** Texto exato da linha do título: é por ela que a resposta é gravada. */
  ancora: string
  formato: 'checkbox' | 'cabecalho'
  /** `APROVAR`, `DECIDIR`, `EXECUTAR` ou `H-001`. */
  tipo: string | null
  titulo: string
  prazo: string | null
  prioridade: Prioridade
  /** pendente = espera o responsável; respondido = tem Solução, espera o agente. */
  estado: 'pendente' | 'respondido'
  solucao: string | null
  oQueDecidir: string | null
  recomendacao: string | null
  opcoes: string | null
  motivo: string | null
}

export type Leitura = { itens: Item[]; reconhecido: boolean }

export type FilaHumana = {
  arquivo: string
  itens: Item[]
  /** Formato não reconhecido ou falha de leitura: nunca vira "0 pendentes". */
  erro: string | null
}

// ── Filas de trabalho: tasks/{bugs,backlog,features}.md ──────────────────────

export type Fonte = 'bugs' | 'backlog' | 'features'
export type Severidade = 'alta' | 'media' | 'baixa' | null
export type Modelo = 'opus' | 'sonnet' | 'haiku'

export type Tarefa = {
  fonte: Fonte
  /** Linha do item no arquivo (0-based), na última leitura. */
  linha: number
  /** `<fonte>\n<texto exato da linha>`: identifica o item mesmo se linhas entrarem acima. */
  ancora: string
  /** Mesma identidade que `scripts/prioridade.py` dá ao item (`_id_from_body`). */
  id: string
  titulo: string
  emProgresso: boolean
  severidade: Severidade
  area: string | null
  esforco: 'p' | 'm' | 'g'
  /** `#modelo/` da linha ou, sem a tag, a regra padrão de tasks/README.md. */
  modelo: Modelo
  modeloExplicito: boolean
  registrada: string | null
  /** `🎯` do item ou, sem ele, o `**Prazo:**` do bloco. */
  prazo: string | null
  /** `[prio: N calc:prioridade]` gravado pelo motor, se houver. */
  score: number | null
  /** Sub-bullets do item (Contexto, Local, Ação…), já sem a crase de abertura. */
  detalhes: string[]
}

export type Ordem = {
  /** `asof` de tasks/PRIORIDADE.md; null quando o arquivo não existe. */
  asof: string | null
  /** ids na ordem de PRIORIDADE.md. */
  ids: string[]
}

export type FilaTarefas = {
  /** Já ordenadas: PRIORIDADE.md primeiro, depois score/severidade/idade. */
  tarefas: Tarefa[]
  /** Quantas pendentes não estão em PRIORIDADE.md (ordem de reserva). */
  foraDaOrdem: number
  asof: string | null
  erros: string[]
}

export type Filtro = 'todas' | Fonte

// ── Jornada: as 5 etapas do Gêmeo Digital ────────────────────────────────────

/** O que o mod observou no disco. Nenhum número é calculado aqui: o nível vem do COMPLETUDE.md. */
export type Fatos = {
  /** gemeo/00-CANON/canon.yaml existe. */
  gemeo: boolean
  /** Estrelas do "Nível atual" do COMPLETUDE.md (0 = ☆); null sem o arquivo. */
  nivel: number | null
  /** Rótulo do nível como o completude.py escreveu (ex.: "★ mínimo viável"). */
  nivelRotulo: string | null
  /** Data da "Última atualização" do COMPLETUDE.md. */
  completudeEm: string | null
  /** Seções do canon ainda vazias no próximo nível. */
  faltamCanon: string[]
  /** quality-baseline.json existe (o loop instalou o quality gate). */
  baseline: boolean
  /** A pasta tasks/ tem alguma fila. */
  filas: boolean
  /** null = sem tasks/human.md. */
  humanaPendentes: number | null
  humanaRespondidos: number
  /** null = sem bugs/backlog/features. */
  tarefasPendentes: number | null
  /** Comandos que a pessoa pode rodar agora; null = não deu para saber (nada é bloqueado). */
  comandos: string[] | null
}

export type EstadoEtapa = 'feita' | 'atual' | 'adiante'

export type Acao =
  | { tipo: 'prompt'; texto: string; rotulo: string }
  | { tipo: 'aba'; aba: Aba; rotulo: string }
  /** O próximo passo é um comando que não existe neste projeto: o texto pede a correção. */
  | { tipo: 'ausente'; comando: string; texto: string; rotulo: string }
  | { tipo: 'nenhuma' }

export type Etapa = {
  n: 1 | 2 | 3 | 4 | 5
  nome: string
  /** Para que serve, em linguagem de quem não programa. */
  explicacao: string
  estado: EstadoEtapa
  /** Situação agora, em uma linha. */
  resumo: string
  acao: Acao
}

export type Jornada = {
  etapas: Etapa[]
  /** Número da etapa atual; null quando tudo está em dia. */
  atual: number | null
}

export type Aba = 'jornada' | 'humana' | 'tarefas'

export type Painel = {
  lidoEm: number
  hoje: string
  /** Raiz do projeto: a pasta acima do cwd com gemeo/ ou tasks/. */
  pasta: string | null
  nome: string | null
  fatos: Fatos | null
  jornada: Jornada | null
  humana: FilaHumana | null
  tarefas: FilaTarefas | null
}

declare module 'claude-code' {
  interface PluginState {
    gemeo: {
      painel: Painel | null
      aba: Aba
      /** Âncora do item da fila humana aberto: sobrevive a linhas inseridas acima. */
      itemAberto: string | null
      /** Âncora da tarefa expandida. */
      tarefaAberta: string | null
      filtro: Filtro
      /** Âncoras de tarefas marcadas para despacho. */
      selecionadas: string[]
      bandaOculta: boolean
      aviso: string | null
    }
  }
}
