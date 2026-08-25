/**
 * CLIENTE LOCAL — a única peça que difere do produto.
 *
 * No repositório do produto este arquivo fala HTTP com a API em FastAPI.
 * Aqui ele expõe exatamente a mesma superfície — mesmos tipos, mesmos
 * métodos, mesmas promessas — servida de dados em memória.
 *
 * A escolha é essa de propósito: com um único ponto de divergência, todas
 * as telas (`rotas/`, `componentes/`, `contexto/`) ficam idênticas às do
 * produto e continuam valendo como amostra do layout. Se cada tela tivesse
 * o próprio dado chumbado, esta vitrine viraria um fork que envelhece
 * sozinho.
 *
 * O estado é mutável e vive enquanto a aba estiver aberta: alocar, marcar
 * resultado, contratar oferta e mexer em território mudam de verdade o que
 * a interface mostra. Uma vitrine onde nenhum botão responde não mostra o
 * produto — mostra um print.
 */

const CHAVE_ACESSO = "leads.access";
const CHAVE_REFRESH = "leads.refresh";

export type Tokens = {
  access_token: string;
  refresh_token: string;
  expira_em_minutos: number;
};

export type Plano = {
  id: number;
  codigo: string;
  nome: string;
  preco_centavos: number;
  carteira_max: number;
  ofertas_incluidas: number;
};

export type Conta = {
  id: number;
  nome: string;
  email: string;
  papel: string;
  criado_em: string;
  modelo_mensagem?: string | null;
};

export type UsoDoPlano = {
  plano_codigo: string;
  plano_nome: string;
  carteira_max: number;
  carteira_ocupada: number;
  ofertas_incluidas: number;
  ofertas_contratadas: number;
};

export type PontoSerie = { dia: string; valor: number };

export type Series = {
  dias: number;
  contas_novas: PontoSerie[];
  reservas_criadas: PontoSerie[];
  leads_trabalhados: PontoSerie[];
  negocios_fechados: PontoSerie[];
  empresas_descobertas: PontoSerie[];
  interessados: PontoSerie[];
};

export type Distribuicao = {
  planos: { nome: string; contas: number }[];
  reservas_por_status: { status: string; total: number }[];
  funil: { interessados: number; converteram: number; taxa: number };
};

export type SaudeInventario = {
  empresas: number;
  reservadas: number;
  desatualizadas_30d: number;
  pct_desatualizado: number;
  visto_mais_antigo: string | null;
  visto_mais_recente: string | null;
};

export type Parametro = {
  chave: string;
  rotulo: string;
  descricao: string;
  tipo: "percentual" | "inteiro";
  minimo: number;
  maximo: number;
  consequencia: string;
  valor: number;
  padrao: number;
  personalizado: boolean;
  atualizado_em: string | null;
};

export type EventoAuditoria = {
  id: number;
  conta_id: number | null;
  acao: string;
  detalhe: string;
  criado_em: string;
};

export type InteressadoAdmin = {
  id: number;
  email: string;
  nome: string | null;
  origem: string;
  cidade_interesse: string | null;
  criado_em: string;
  virou_conta_em: string | null;
  descadastrado_em: string | null;
};

export type Exclusao = {
  id: number;
  nome: string;
  email: string;
  excluir_em: string;
  vencida: boolean;
};

export type Empresa = {
  id: number;
  nome: string;
  telefone_exibicao: string;
  cidade: string;
  uf: string;
  categoria: string;
  vertical: string;
  website: string | null;
  tem_site: boolean;
  nota: number | null;
  qtd_avaliacoes: number;
  tem_whatsapp: boolean;
  perfil_completo: boolean;
  primeira_vez_vista: string;
};

export type Oferta = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  ativa: boolean;
};

export type Reserva = {
  id: number;
  status: string;
  cidade: string;
  reservada_em: string;
  expira_em: string | null;
  empresa: Empresa;
  oferta: Oferta;
};

export type Uso = {
  carteira_max: number;
  carteira_ocupada: number;
  carteira_livre: number;
  em_negociacao: number;
  trabalhadas_no_mes: number;
};

export type Territorio = {
  id: number;
  cidade: string;
  vertical: string | null;
  prioridade: number;
};

export type Ocupacao = {
  cidade: string;
  oferta_id: number;
  ocupacao_pct: number;
  lotada: boolean;
  /** Quantas reservas ESTA conta ainda consegue tirar desta cidade.
   *  O inventario absoluto nao vem para o cliente — e ativo do negocio. */
  seu_espaco: number;
};

export type Alocacao = {
  criadas: number;
  solicitadas: number;
  motivo_parcial: string | null;
  reservas: Reserva[];
};

export type Metricas = {
  contas_total: number;
  contas_ativas_30d: number;
  empresas_inventario: number;
  empresas_novas_30d: number;
  reservas_vivas: number;
  leads_trabalhados_30d: number;
  negocios_fechados_30d: number;
  mrr_centavos: number;
};

export type ContaAdmin = {
  id: number;
  nome: string;
  email: string;
  papel: string;
  criado_em: string;
  plano: string | null;
  status_assinatura: string | null;
  carteira_max: number;
  carteira_ocupada: number;
  territorios: number;
};

export type PressaoAdmin = {
  cidade: string;
  oferta_id: number;
  oferta: string;
  total: number;
  alocado: number;
  alocavel: number;
  ocupacao_pct: number;
  lotada: boolean;
};

export type Cobertura = { empresas: number; cidades: number };

export class ErroApi extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
  }
}

/* O contrato de token continua: o ProvedorAuth restaura a sessão a partir
   do localStorage, e sem isso um F5 derrubaria o visitante da demonstração
   para a tela de login. */
export const tokens = {
  ler: () => ({
    acesso: localStorage.getItem(CHAVE_ACESSO),
    refresh: localStorage.getItem(CHAVE_REFRESH),
  }),
  gravar: (t: Tokens) => {
    localStorage.setItem(CHAVE_ACESSO, t.access_token);
    localStorage.setItem(CHAVE_REFRESH, t.refresh_token);
  },
  limpar: () => {
    localStorage.removeItem(CHAVE_ACESSO);
    localStorage.removeItem(CHAVE_REFRESH);
  },
};

/* -------------------------------------------------------------- dados */

/**
 * Sorteio determinístico. `Math.random` daria números diferentes a cada
 * carregamento, e a vitrine mudaria de números entre um print e outro —
 * o que atrapalha na hora de comparar telas.
 */
function sorteio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Cidade, UF e DDD. O DDD e por cidade, nao por estado: Campinas e 19,
 *  Sorocaba 15 e Bauru 14, todas em SP. Telefone com DDD errado e a
 *  primeira coisa que um vendedor nota numa lista. */
const CIDADES: Array<[string, string, number]> = [
  ["Campinas", "SP", 19],
  ["Sorocaba", "SP", 15],
  ["Bauru", "SP", 14],
  ["Curitiba", "PR", 41],
  ["Santa Maria", "RS", 55],
];

const CATEGORIAS: Record<string, string[]> = {
  alimentacao: ["restaurante", "hamburgueria", "cafeteria", "padaria", "pizzaria"],
  servicos: ["pet shop", "assistencia tecnica", "salao de beleza", "academia"],
  varejo: ["loja de roupas", "otica", "papelaria", "floricultura"],
};

/** Espelha o CATALOGO do backend (`dominio/ofertas.py`). */
const OFERTAS: Oferta[] = [
  {
    id: 1,
    codigo: "sem_site",
    nome: "Sem site próprio",
    descricao: "Empresa sem site real — só rede social, marketplace ou nada.",
    ativa: true,
  },
  {
    id: 2,
    codigo: "site_fraco",
    nome: "Site fraco ou desatualizado",
    descricao: "Tem site, mas a presença digital é malcuidada. Gancho de redesign.",
    ativa: true,
  },
  {
    id: 3,
    codigo: "nota_baixa",
    nome: "Reputação fraca",
    descricao: "Nota abaixo de 3,5 ou menos de 10 avaliações.",
    ativa: true,
  },
  {
    id: 4,
    codigo: "sem_whatsapp",
    nome: "Sem WhatsApp Business",
    descricao: "Não tem canal de atendimento por WhatsApp configurado.",
    ativa: true,
  },
  {
    id: 5,
    codigo: "perfil_incompleto",
    nome: "Perfil do Maps incompleto",
    descricao: "Sem fotos, horário ou dados básicos no perfil do Google.",
    ativa: true,
  },
];

/** Espelha PLANOS do `seed.py`. O "teste" não entra na landing: é o
 *  destino do cadastro, não uma opção a comparar. */
const PLANOS: Plano[] = [
  { id: 2, codigo: "inicio", nome: "Início", preco_centavos: 9700, carteira_max: 500, ofertas_incluidas: 1 },
  { id: 3, codigo: "solo", nome: "Solo", preco_centavos: 19700, carteira_max: 1500, ofertas_incluidas: 1 },
  { id: 4, codigo: "equipe", nome: "Equipe", preco_centavos: 49700, carteira_max: 4500, ofertas_incluidas: 2 },
  { id: 5, codigo: "operacao", nome: "Operação", preco_centavos: 89700, carteira_max: 9000, ofertas_incluidas: 3 },
];

const PRIMEIROS_NOMES: Record<string, string[]> = {
  restaurante: ["Sabor da", "Cantina", "Casa do", "Recanto"],
  hamburgueria: ["Brasa", "Burger", "Ponto do", "Chapa"],
  cafeteria: ["Café", "Grão", "Torra", "Expresso"],
  padaria: ["Pão", "Forno", "Delícias da", "Trigo"],
  pizzaria: ["Forno a Lenha", "Pizzaria", "Massa", "Bella"],
  "pet shop": ["Mundo Pet", "Patas", "Amigo", "Focinho"],
  "assistencia tecnica": ["TecFix", "Conserta", "Reparo", "Chip"],
  "salao de beleza": ["Studio", "Espaço", "Salão", "Belle"],
  academia: ["Corpo", "Força", "Movimento", "Energia"],
  "loja de roupas": ["Moda", "Estilo", "Boutique", "Trend"],
  otica: ["Ótica", "Visão", "Olhar", "Lentes"],
  papelaria: ["Papel", "Escreve", "Arte", "Caderno"],
  floricultura: ["Flor de", "Jardim", "Buquê", "Orquídea"],
};

const SEGUNDOS_NOMES = [
  "Minas", "Aurora", "Vale", "Central", "Boa Vista", "Primavera",
  "São João", "Bela Vista", "Ipê", "Real", "Norte", "Vila Nova",
  "Paraíso", "Jardim", "Horizonte", "Alvorada", "Bom Retiro", "Santa Rita",
  "Cruzeiro", "Lagoa", "Serra", "Guarani", "Mirante", "Portal",
];

/** Terceiro token, usado só para desempatar nomes repetidos. */
const BAIRROS = [
  "Centro", "Jardim América", "Vila Progresso", "Santa Cruz", "Alto da Boa Vista",
  "Parque Industrial", "Vila Rica", "São Bento", "Nova Esperança", "Cidade Jardim",
  "Jardim Europa", "Vila Operária",
];

/**
 * Quantas empresas por cidade e categoria.
 *
 * Foi calibrado, nao chutado: 5 cidades x 13 categorias x 47 da 3.055, que
 * a rota de cobertura arredonda para 3.000. Com o punhado que existia antes
 * (uma por categoria, 65 no total), `65 - 65 % 100` dava ZERO e a landing
 * escondia a prova de cobertura inteira — o bloco tem guarda de `> 0`. Um
 * inventario de brinquedo tambem nao sustenta um painel que fala de pressao
 * de mercado.
 */
const POR_CATEGORIA = 47;

function gerarEmpresas(): Empresa[] {
  const aleatorio = sorteio(20260824);
  const lista: Empresa[] = [];
  let id = 1;

  // Nome ja usado nesta cidade+categoria. Duas "Cantina Aurora" no mesmo
  // ramo da mesma cidade seriam lidas como bug de duplicata, nao como duas
  // empresas — entao o desempate acrescenta o bairro.
  const usados = new Set<string>();

  for (const [cidade, uf, ddd] of CIDADES) {
    for (const [vertical, categorias] of Object.entries(CATEGORIAS)) {
      for (const categoria of categorias) {
        const primeiros = PRIMEIROS_NOMES[categoria] ?? ["Casa"];

        for (let n = 0; n < POR_CATEGORIA; n++) {
          const primeiro = primeiros[Math.floor(aleatorio() * primeiros.length)];
          const segundo = SEGUNDOS_NOMES[Math.floor(aleatorio() * SEGUNDOS_NOMES.length)];

          let nome = `${primeiro} ${segundo}`;
          let tentativa = 0;
          while (usados.has(`${cidade}|${categoria}|${nome}`)) {
            nome = `${primeiro} ${segundo} ${BAIRROS[tentativa % BAIRROS.length]}`;
            tentativa++;
            if (tentativa > BAIRROS.length) {
              nome = `${primeiro} ${segundo} ${tentativa}`;
            }
          }
          usados.add(`${cidade}|${categoria}|${nome}`);

          const temSite = aleatorio() < 0.28;
          const avaliacoes = Math.floor(aleatorio() * 90);
          const diasAtras = Math.floor(aleatorio() * 120);

          lista.push({
            id: id++,
            nome,
            telefone_exibicao: `(${ddd}) 9${Math.floor(aleatorio() * 9000) + 1000}-${
              Math.floor(aleatorio() * 9000) + 1000
            }`,
            cidade,
            uf,
            categoria,
            vertical,
            website: temSite ? `https://www.${categoria.replace(/\s/g, "")}${id}.com.br` : null,
            tem_site: temSite,
            nota: avaliacoes === 0 ? null : Math.round((2.6 + aleatorio() * 2.3) * 10) / 10,
            qtd_avaliacoes: avaliacoes,
            tem_whatsapp: aleatorio() < 0.55,
            perfil_completo: aleatorio() < 0.4,
            primeira_vez_vista: new Date(Date.now() - diasAtras * 86_400_000).toISOString(),
          });
        }
      }
    }
  }
  return lista;
}

const EMPRESAS = gerarEmpresas();

const CONTA: Conta = {
  id: 1,
  nome: "Conta de demonstração",
  email: "demo@leads.com.br",
  // Admin de propósito: é o único jeito de a vitrine mostrar o painel
  // administrativo, que faz parte do layout que se quer exibir.
  papel: "admin",
  criado_em: new Date(Date.now() - 214 * 86_400_000).toISOString(),
};

// Mutável: a tela de plano troca de verdade nesta vitrine, e a carteira do
// painel muda junto. Um seletor de plano que não muda nada é um print.
let planoAtual = PLANOS[1]; // Solo — 1.500 de carteira

/* ------------------------------------------------------- estado vivo */

let proximoIdReserva = 1;
let proximoIdTerritorio = 1;

function novaReserva(empresa: Empresa, oferta: Oferta, status: string, diasAtras: number): Reserva {
  const reservadaEm = new Date(Date.now() - diasAtras * 86_400_000);
  const viva = status === "ativa" || status === "negociando";
  return {
    id: proximoIdReserva++,
    status,
    cidade: empresa.cidade,
    reservada_em: reservadaEm.toISOString(),
    expira_em: viva
      ? new Date(reservadaEm.getTime() + 21 * 86_400_000).toISOString()
      : null,
    empresa,
    oferta,
  };
}

function semearReservas(): Reserva[] {
  const aleatorio = sorteio(70125);
  const distribuicao = [
    ...Array(9).fill("ativa"),
    ...Array(4).fill("negociando"),
    ...Array(3).fill("contactado"),
    ...Array(2).fill("fechado"),
    "descartado",
  ];
  return distribuicao.map((status, i) => {
    const empresa = EMPRESAS[Math.floor(aleatorio() * EMPRESAS.length)];
    const oferta = empresa.tem_site ? OFERTAS[1] : OFERTAS[0];
    return novaReserva(empresa, oferta, status, i + 1);
  });
}

let reservas: Reserva[] = semearReservas();

let territorios: Territorio[] = [
  { id: proximoIdTerritorio++, cidade: "Sorocaba", vertical: null, prioridade: 0 },
  { id: proximoIdTerritorio++, cidade: "Campinas", vertical: "alimentacao", prioridade: 1 },
  { id: proximoIdTerritorio++, cidade: "Curitiba", vertical: "servicos", prioridade: 2 },
];

let contratadas: Oferta[] = [OFERTAS[0]];

/** Cada chamada devolve uma promessa com um respiro curto: sem isso os
 *  estados de "Carregando…" nunca apareceriam, e eles fazem parte do
 *  layout que esta vitrine existe para mostrar. */
function responder<T>(valor: T, ms = 180): Promise<T> {
  return new Promise((resolver) => setTimeout(() => resolver(valor), ms));
}

function vivas(): Reserva[] {
  return reservas.filter((r) => r.status === "ativa" || r.status === "negociando");
}

/* ------------------------------------------------------------- api */

// =============================================================================
// ESTADO DO CONSOLE
// Mesma ideia do resto do arquivo: dados que mudam de verdade enquanto a aba
// estiver aberta. Um console onde nenhum botão responde não mostra o produto.
// =============================================================================
function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Série com forma plausível: cresce, oscila e tem dias vazios. */
function serie(dias: number, base: number, crescimento: number, semente: number): PontoSerie[] {
  const rnd = sorteio(semente);
  return Array.from({ length: dias }, (_, i) => {
    const tendencia = base + (i / dias) * crescimento;
    const ruido = rnd() * tendencia * 0.7;
    const valor = Math.max(0, Math.round(tendencia * 0.5 + ruido));
    return { dia: diasAtras(dias - 1 - i), valor };
  });
}

let interessados: InteressadoAdmin[] = [
  {
    id: 1, email: "contato@agenciamarcos.com.br", nome: "Marcos",
    origem: "landing", cidade_interesse: "Campinas",
    criado_em: diasAtras(2), virou_conta_em: null, descadastrado_em: null,
  },
  {
    id: 2, email: "ola@estudiolume.com.br", nome: null,
    origem: "landing", cidade_interesse: "Curitiba",
    criado_em: diasAtras(6), virou_conta_em: diasAtras(4), descadastrado_em: null,
  },
  {
    id: 3, email: "comercial@webfacil.com.br", nome: "Paula",
    origem: "campanha-instagram", cidade_interesse: "Sorocaba",
    criado_em: diasAtras(11), virou_conta_em: null, descadastrado_em: null,
  },
  {
    id: 4, email: "eu@freelancer.dev", nome: null,
    origem: "landing", cidade_interesse: null,
    criado_em: diasAtras(19), virou_conta_em: null, descadastrado_em: diasAtras(9),
  },
];

const CONTAS_ADMIN: ContaAdmin[] = [
  {
    id: 1, nome: CONTA.nome, email: CONTA.email, papel: "admin",
    criado_em: diasAtras(140), plano: "Solo", status_assinatura: "ativa",
    carteira_max: 1500, carteira_ocupada: 0, territorios: 3,
  },
  {
    id: 2, nome: "Estúdio Lume", email: "ola@estudiolume.com.br", papel: "usuario",
    criado_em: diasAtras(4), plano: "Início", status_assinatura: "ativa",
    carteira_max: 500, carteira_ocupada: 318, territorios: 1,
  },
  {
    id: 3, nome: "Agência Norte", email: "contato@agencianorte.com.br", papel: "usuario",
    criado_em: diasAtras(27), plano: "Equipe", status_assinatura: "ativa",
    carteira_max: 4500, carteira_ocupada: 2740, territorios: 6,
  },
  {
    id: 4, nome: "Bruno Freela", email: "bruno@freela.com.br", papel: "usuario",
    criado_em: diasAtras(9), plano: "Teste", status_assinatura: "teste",
    carteira_max: 100, carteira_ocupada: 41, territorios: 1,
  },
];

const PADROES: Record<string, number> = {
  r1_piso_disponibilidade: 0.7,
  r2_teto_concentracao: 0.25,
  r3_cooldown_mesma_oferta_dias: 180,
  r3_cooldown_qualquer_oferta_dias: 30,
  max_ofertas_simultaneas: 2,
  expiracao_reserva_dias: 45,
};

const CATALOGO_PARAMETROS: Omit<Parametro, "valor" | "personalizado" | "atualizado_em">[] = [
  {
    chave: "r1_piso_disponibilidade", rotulo: "R1 — piso de disponibilidade",
    descricao: "Fração máxima do inventário de uma cidade que pode estar alocada.",
    tipo: "percentual", minimo: 0.1, maximo: 0.95, padrao: 0.7,
    consequencia:
      "Em 0,95 quase não sobra vaga para quem chegar depois; a cidade fica " +
      "efetivamente fechada a novos clientes.",
  },
  {
    chave: "r2_teto_concentracao", rotulo: "R2 — teto de concentração",
    descricao: "Fração máxima do inventário de uma cidade que um único cliente segura.",
    tipo: "percentual", minimo: 0.05, maximo: 1, padrao: 0.25,
    consequencia:
      "Em 1,00 um cliente grande toma a cidade inteira — que é o monopólio " +
      "que a regra existe para impedir.",
  },
  {
    chave: "r3_cooldown_mesma_oferta_dias", rotulo: "R3 — carência da mesma oferta",
    descricao: "Dias que uma empresa fica fora de circulação para a mesma proposta.",
    tipo: "inteiro", minimo: 30, maximo: 730, padrao: 180,
    consequencia:
      "Muito baixo, o mesmo negócio recebe a mesma proposta de vários " +
      "clientes em sequência — é assim que a lista queima.",
  },
  {
    chave: "r3_cooldown_qualquer_oferta_dias", rotulo: "R3 — carência entre ofertas",
    descricao: "Dias de descanso da empresa entre abordagens de qualquer tipo.",
    tipo: "inteiro", minimo: 7, maximo: 365, padrao: 30,
    consequencia:
      "Perto de zero, o mesmo dono recebe ligações de todas as ofertas na " +
      "mesma semana.",
  },
  {
    chave: "max_ofertas_simultaneas", rotulo: "Ofertas simultâneas por empresa",
    descricao: "Quantos tipos de proposta podem estar ativos sobre a mesma empresa.",
    tipo: "inteiro", minimo: 1, maximo: 4, padrao: 2,
    consequencia:
      "Acima de 2 o valor do contato cai sem ganho proporcional: poucas " +
      "empresas satisfazem quatro filtros ao mesmo tempo.",
  },
  {
    chave: "expiracao_reserva_dias", rotulo: "Expiração da reserva",
    descricao: "Dias até uma reserva não trabalhada voltar ao pool.",
    tipo: "inteiro", minimo: 7, maximo: 180, padrao: 45,
    consequencia:
      "Muito alto, um plano grande reserva a cidade e nunca liga para " +
      "ninguém — o acaparamento que R1 e R2 tentam impedir.",
  },
];

let ajustados: Record<string, { valor: number; em: string }> = {};
let eventos: EventoAuditoria[] = [
  { id: 3, conta_id: 1, acao: "login", detalhe: "", criado_em: new Date().toISOString() },
  { id: 2, conta_id: 1, acao: "exportacao", detalhe: "xlsx · 128 reserva(s)", criado_em: diasAtras(1) },
  { id: 1, conta_id: 1, acao: "registro", detalhe: CONTA.email, criado_em: diasAtras(140) },
];
let proximoEvento = 4;

function auditar(acao: string, detalhe: string): void {
  eventos = [
    { id: proximoEvento++, conta_id: 1, acao, detalhe, criado_em: new Date().toISOString() },
    ...eventos,
  ];
}

function montarParametros(): Parametro[] {
  return CATALOGO_PARAMETROS.map((d) => {
    const ajuste = ajustados[d.chave];
    return {
      ...d,
      valor: ajuste ? ajuste.valor : PADROES[d.chave],
      personalizado: Boolean(ajuste),
      atualizado_em: ajuste ? ajuste.em : null,
    };
  });
}


export const api = {
  // -------------------------------------------------------------- conta
  perfil: () => responder(CONTA),

  atualizarPerfil: (dados: { nome?: string; modelo_mensagem?: string }) => {
    if (dados.nome) CONTA.nome = dados.nome;
    if (dados.modelo_mensagem !== undefined) {
      CONTA.modelo_mensagem = dados.modelo_mensagem.trim() || null;
    }
    return responder({ ...CONTA });
  },

  usoDoPlano: () =>
    responder<UsoDoPlano>({
      plano_codigo: planoAtual.codigo,
      plano_nome: planoAtual.nome,
      carteira_max: planoAtual.carteira_max,
      carteira_ocupada: vivas().length,
      ofertas_incluidas: planoAtual.ofertas_incluidas,
      ofertas_contratadas: contratadas.length,
    }),

  planosDaConta: () => responder(PLANOS),

  trocarPlano: (plano_codigo: string) => {
    const alvo = PLANOS.find((p) => p.codigo === plano_codigo);
    if (!alvo) throw new ErroApi(404, "Plano não encontrado");
    if (alvo.codigo === planoAtual.codigo) throw new ErroApi(409, "Este já é o seu plano");
    if (contratadas.length > alvo.ofertas_incluidas) {
      throw new ErroApi(
        409,
        `Você tem ${contratadas.length} tipos de oferta contratados e o plano ` +
          `${alvo.nome} inclui ${alvo.ofertas_incluidas}. Remova as excedentes antes.`,
      );
    }
    auditar("troca_plano", `${planoAtual.nome} -> ${alvo.nome}`);
    planoAtual = alvo;
    return responder({ plano: alvo });
  },

  removerOferta: (ofertaId: number) => {
    if (contratadas.length <= 1) {
      throw new ErroApi(
        409,
        "É preciso manter ao menos um tipo de oferta — sem nenhum, a carteira " +
          "não tem o que receber.",
      );
    }
    contratadas = contratadas.filter((o) => o.id !== ofertaId);
    return responder<void>(undefined);
  },

  // --------------------------------------------------------- plataforma
  series: (dias = 30) =>
    responder<Series>({
      dias,
      contas_novas: serie(dias, 0.4, 1.6, 11),
      interessados: serie(dias, 1.2, 3.4, 22),
      reservas_criadas: serie(dias, 18, 44, 33),
      leads_trabalhados: serie(dias, 12, 30, 44),
      negocios_fechados: serie(dias, 0.3, 1.4, 55),
      empresas_descobertas: serie(dias, 24, 60, 66),
    }),

  distribuicao: () =>
    responder<Distribuicao>({
      planos: [
        { nome: "Teste", contas: 1 },
        { nome: "Início", contas: 1 },
        { nome: "Solo", contas: 1 },
        { nome: "Equipe", contas: 1 },
      ],
      reservas_por_status: ["ativa", "negociando", "contactado", "descartado", "fechado"]
        .map((status) => ({
          status,
          total: reservas.filter((r) => r.status === status).length,
        }))
        .filter((x) => x.total > 0),
      funil: {
        interessados: interessados.length,
        converteram: interessados.filter((i) => i.virou_conta_em).length,
        taxa: interessados.length
          ? Math.round(
              (interessados.filter((i) => i.virou_conta_em).length / interessados.length) * 1000,
            ) / 10
          : 0,
      },
    }),

  saudeDoInventario: () => {
    const desatualizadas = Math.round(EMPRESAS.length * 0.18);
    return responder<SaudeInventario>({
      empresas: EMPRESAS.length,
      reservadas: vivas().length,
      desatualizadas_30d: desatualizadas,
      pct_desatualizado: 18,
      visto_mais_antigo: diasAtras(62),
      visto_mais_recente: diasAtras(0),
    });
  },

  parametros: () => responder(montarParametros()),

  definirParametro: (chave: string, valor: number) => {
    const definicao = CATALOGO_PARAMETROS.find((d) => d.chave === chave);
    if (!definicao) throw new ErroApi(404, "Parâmetro desconhecido");
    if (valor < definicao.minimo || valor > definicao.maximo) {
      throw new ErroApi(
        400,
        `${definicao.rotulo} aceita entre ${definicao.minimo} e ${definicao.maximo}; ` +
          `recebeu ${valor}.`,
      );
    }
    if (definicao.tipo === "inteiro" && !Number.isInteger(valor)) {
      throw new ErroApi(400, `${definicao.rotulo} precisa ser um número inteiro.`);
    }
    ajustados = { ...ajustados, [chave]: { valor, em: new Date().toISOString() } };
    auditar("alterar_parametro", `${chave} = ${valor}`);
    return responder({ chave, valor });
  },

  restaurarParametro: (chave: string) => {
    const { [chave]: _fora, ...resto } = ajustados;
    ajustados = resto;
    return responder<void>(undefined);
  },

  auditoria: (limite = 100) => responder(eventos.slice(0, limite)),

  interessados: () => responder(interessados),

  excluirInteressado: (id: number) => {
    const alvo = interessados.find((i) => i.id === id);
    interessados = interessados.filter((i) => i.id !== id);
    if (alvo) auditar("excluir_interessado", `registro ${id} apagado a pedido do titular`);
    return responder<void>(undefined);
  },

  /** Na vitrine não há pedidos pendentes: a fila vazia é o estado saudável. */
  exclusoes: () => responder<Exclusao[]>([]),

  alterarPapel: (contaId: number, papel: string) => {
    const alvo = CONTAS_ADMIN.find((c) => c.id === contaId);
    if (!alvo) throw new ErroApi(404, "Conta não encontrada");
    if (alvo.id === 1 && papel !== "admin") {
      throw new ErroApi(
        409,
        "Você não pode rebaixar a própria conta — ficaria sem acesso ao console.",
      );
    }
    alvo.papel = papel;
    auditar("alterar_papel", `conta ${alvo.id} (${alvo.email}): -> ${papel}`);
    return responder({ id: alvo.id, papel });
  },

  // ----------------------------------------------------------- landing
  registrarInteresse: (email: string, cidade_interesse?: string) =>
    responder({
      mensagem:
        `Vitrine do layout: nada foi enviado. No produto, ${email} entraria na fila ` +
        `de interesse${cidade_interesse ? ` de ${cidade_interesse}` : ""}.`,
    }),

  planosPublicos: () => responder(PLANOS),

  /** Números arredondados, como a rota real faz de propósito: a ordem de
   *  grandeza é argumento de venda, o total exato é ativo do negócio. */
  cobertura: () =>
    responder({
      empresas: EMPRESAS.length - (EMPRESAS.length % 100),
      cidades: CIDADES.length,
    }),

  registrar: (_nome: string, _email: string, _senha: string) =>
    responder<Tokens>({
      access_token: "vitrine",
      refresh_token: "vitrine",
      expira_em_minutos: 15,
    }),

  /** Aceita qualquer credencial: exigir a senha certa numa vitrine só
   *  tranca o visitante do lado de fora do layout que ele veio ver. */
  entrar: (_email: string, _senha: string) =>
    responder<Tokens>({
      access_token: "vitrine",
      refresh_token: "vitrine",
      expira_em_minutos: 15,
    }),

  eu: () => responder(CONTA),

  sair: () => responder<void>(undefined, 80),

  uso: () =>
    responder<Uso>({
      carteira_max: planoAtual.carteira_max,
      carteira_ocupada: vivas().length,
      carteira_livre: planoAtual.carteira_max - vivas().length,
      em_negociacao: reservas.filter((r) => r.status === "negociando").length,
      trabalhadas_no_mes: reservas.filter(
        (r) => r.status !== "ativa" && r.status !== "negociando",
      ).length,
    }),

  carteira: (filtros: { status?: string; cidade?: string; q?: string } = {}) => {
    let lista = reservas;
    if (filtros.status) {
      lista = lista.filter((r) => r.status === filtros.status);
    } else {
      // Sem filtro, "na carteira" são as vivas — igual ao padrão do backend.
      lista = vivas();
    }
    if (filtros.cidade) lista = lista.filter((r) => r.cidade === filtros.cidade);
    if (filtros.q) {
      const q = filtros.q.toLowerCase();
      lista = lista.filter(
        (r) =>
          r.empresa.nome.toLowerCase().includes(q) ||
          r.empresa.categoria.toLowerCase().includes(q) ||
          r.cidade.toLowerCase().includes(q),
      );
    }
    return responder([...lista]);
  },

  alocar: (quantidade?: number) => {
    const solicitadas = quantidade ?? 5;
    const jaNaCarteira = new Set(reservas.map((r) => r.empresa.id));
    const cidadesDoTerritorio = new Set(territorios.map((t) => t.cidade));

    const candidatas = EMPRESAS.filter(
      (e) => !jaNaCarteira.has(e.id) && cidadesDoTerritorio.has(e.cidade),
    );
    const escolhidas = candidatas.slice(0, solicitadas);
    const novas = escolhidas.map((e) =>
      novaReserva(e, contratadas[0] ?? OFERTAS[0], "ativa", 0),
    );
    reservas = [...novas, ...reservas];

    return responder<Alocacao>({
      criadas: novas.length,
      solicitadas,
      motivo_parcial:
        novas.length < solicitadas
          ? "Acabaram as empresas elegíveis nos seus territórios."
          : null,
      reservas: novas,
    });
  },

  registrarResultado: (reservaId: number, resultado: string) => {
    const reserva = reservas.find((r) => r.id === reservaId);
    if (!reserva) throw new ErroApi(404, "Reserva não encontrada.");
    reserva.status = resultado;
    // Só o que segue na carteira mantém prazo; o resto liberou a vaga.
    reserva.expira_em =
      resultado === "ativa" || resultado === "negociando" ? reserva.expira_em : null;
    return responder({ ...reserva }, 120);
  },

  pressao: () => {
    const aleatorio = sorteio(4411);
    const lista: Ocupacao[] = [];
    for (const territorio of territorios) {
      for (const oferta of contratadas) {
        const pct = Math.round(aleatorio() * 100);
        lista.push({
          cidade: territorio.cidade,
          oferta_id: oferta.id,
          ocupacao_pct: pct,
          lotada: pct >= 90,
          seu_espaco: pct >= 90 ? 0 : Math.floor((100 - pct) * 1.4),
        });
      }
    }
    return responder(lista);
  },

  territorios: () => responder([...territorios]),

  adicionarTerritorio: (cidade: string, vertical?: string) => {
    const novo: Territorio = {
      id: proximoIdTerritorio++,
      cidade,
      vertical: vertical || null,
      prioridade: territorios.length,
    };
    territorios = [...territorios, novo];
    return responder(novo, 120);
  },

  removerTerritorio: (id: number) => {
    territorios = territorios.filter((t) => t.id !== id);
    return responder<void>(undefined, 120);
  },

  /**
   * Monta o CSV no próprio navegador, a partir do que está na carteira.
   *
   * O XLSX é recusado com a explicação: o arquivo real é montado pelo
   * backend, e entregar um CSV com extensão .xlsx daria um arquivo que o
   * Excel abre torto. Recusar dizendo o porquê é mais honesto do que
   * fingir que baixou.
   */
  exportar: async (formato: "csv" | "xlsx") => {
    if (formato === "xlsx") {
      throw new ErroApi(
        501,
        "Nesta vitrine só o CSV é gerado — o XLSX é montado pelo backend.",
      );
    }

    const colunas = ["empresa", "telefone", "cidade", "uf", "categoria", "status", "oferta"];
    const linhas = vivas().map((r) =>
      [
        r.empresa.nome,
        r.empresa.telefone_exibicao,
        r.cidade,
        r.empresa.uf,
        r.empresa.categoria,
        r.status,
        r.oferta.nome,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );

    // BOM na frente para o Excel abrir os acentos corretamente.
    const blob = new Blob(["﻿" + [colunas.join(","), ...linhas].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "carteira.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  adminMetricas: () =>
    responder<Metricas>({
      contas_total: 34,
      contas_ativas_30d: 21,
      empresas_inventario: EMPRESAS.length,
      empresas_novas_30d: Math.round(EMPRESAS.length * 0.14),
      reservas_vivas: vivas().length,
      leads_trabalhados_30d: 186,
      negocios_fechados_30d: 12,
      mrr_centavos: 486_300,
    }),

  adminContas: (q?: string) =>
    responder(
      q
        ? CONTAS_ADMIN.filter(
            (c) =>
              c.nome.toLowerCase().includes(q.toLowerCase()) ||
              c.email.toLowerCase().includes(q.toLowerCase()),
          )
        : CONTAS_ADMIN,
    ),

  adminPressao: () => {
    const aleatorio = sorteio(9081);
    const lista: PressaoAdmin[] = [];
    for (const [cidade] of CIDADES) {
      for (const oferta of OFERTAS.slice(0, 3)) {
        const total = 380 + Math.floor(aleatorio() * 900);
        const alocado = Math.floor(total * (0.25 + aleatorio() * 0.7));
        const pct = Math.round((alocado / total) * 100);
        lista.push({
          cidade,
          oferta_id: oferta.id,
          oferta: oferta.nome,
          total,
          alocado,
          alocavel: total - alocado,
          ocupacao_pct: pct,
          lotada: pct >= 90,
        });
      }
    }
    return responder(lista);
  },

  ofertas: () => responder(OFERTAS),

  ofertasContratadas: () => responder([...contratadas]),

  contratarOferta: (ofertaId: number) => {
    const oferta = OFERTAS.find((o) => o.id === ofertaId);
    if (!oferta) throw new ErroApi(404, "Oferta desconhecida.");
    if (contratadas.length >= planoAtual.ofertas_incluidas) {
      throw new ErroApi(
        403,
        `O plano ${planoAtual.nome} inclui ${planoAtual.ofertas_incluidas} tipo de oferta.`,
      );
    }
    if (!contratadas.some((o) => o.id === ofertaId)) contratadas = [...contratadas, oferta];
    return responder(oferta, 120);
  },
};
