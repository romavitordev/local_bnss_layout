/**
 * Cliente HTTP da API.
 *
 * Renova o access token automaticamente quando ele expira (15 min) usando o
 * refresh token — sem isso o usuário seria deslogado no meio do trabalho, que
 * é justamente quando ele está com a carteira aberta.
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

async function extrairErro(resposta: Response): Promise<string> {
  try {
    const corpo = await resposta.json();
    if (typeof corpo.detail === "string") return corpo.detail;
    if (Array.isArray(corpo.detail)) {
      return corpo.detail.map((d: { msg?: string }) => d.msg ?? "").join("; ");
    }
  } catch {
    /* resposta sem corpo JSON */
  }
  return `Erro ${resposta.status}`;
}

async function renovar(): Promise<boolean> {
  const { refresh } = tokens.ler();
  if (!refresh) return false;

  const resposta = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!resposta.ok) {
    tokens.limpar();
    return false;
  }
  tokens.gravar(await resposta.json());
  return true;
}

async function requisitar<T>(
  caminho: string,
  opcoes: RequestInit = {},
  jaTentouRenovar = false,
): Promise<T> {
  const { acesso } = tokens.ler();
  const cabecalhos: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opcoes.headers as Record<string, string>) ?? {}),
  };
  if (acesso) cabecalhos.Authorization = `Bearer ${acesso}`;

  const resposta = await fetch(`/api${caminho}`, { ...opcoes, headers: cabecalhos });

  // 401 com refresh disponível: renova uma vez e repete a chamada.
  if (resposta.status === 401 && !jaTentouRenovar && (await renovar())) {
    return requisitar<T>(caminho, opcoes, true);
  }
  if (!resposta.ok) throw new ErroApi(resposta.status, await extrairErro(resposta));
  if (resposta.status === 204) return undefined as T;
  return resposta.json();
}

export const api = {
  // ----------------------------------------------------------- landing
  // Rotas publicas: nao levam token e sao chamadas por quem ainda nao tem conta.
  registrarInteresse: (email: string, cidade_interesse?: string) =>
    requisitar<{ mensagem: string }>("/publico/interesse", {
      method: "POST",
      body: JSON.stringify({
        email,
        cidade_interesse: cidade_interesse || null,
        origem: "landing",
      }),
    }),

  planosPublicos: () => requisitar<Plano[]>("/publico/planos"),
  cobertura: () => requisitar<Cobertura>("/publico/cobertura"),

  registrar: (nome: string, email: string, senha: string) =>
    requisitar<Tokens>("/auth/registro", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha }),
    }),

  entrar: (email: string, senha: string) =>
    requisitar<Tokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  eu: () => requisitar<Conta>("/auth/eu"),

  /** Revoga a sessao no servidor. Limpar o localStorage sozinho nao basta:
   *  um token copiado antes continuaria valendo ate expirar. */
  sair: () => requisitar<void>("/auth/logout", { method: "POST" }),

  uso: () => requisitar<Uso>("/carteira/uso"),

  carteira: (filtros: { status?: string; cidade?: string; q?: string } = {}) => {
    const busca = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor) busca.set(chave, valor);
    }
    const qs = busca.toString();
    return requisitar<Reserva[]>(`/carteira${qs ? `?${qs}` : ""}`);
  },

  alocar: (quantidade?: number) =>
    requisitar<Alocacao>("/carteira/alocar", {
      method: "POST",
      body: JSON.stringify({ quantidade: quantidade ?? null }),
    }),

  registrarResultado: (reservaId: number, resultado: string) =>
    requisitar<Reserva>(`/carteira/${reservaId}/resultado`, {
      method: "POST",
      body: JSON.stringify({ resultado }),
    }),

  pressao: () => requisitar<Ocupacao[]>("/carteira/pressao"),

  territorios: () => requisitar<Territorio[]>("/territorios"),

  adicionarTerritorio: (cidade: string, vertical?: string) =>
    requisitar<Territorio>("/territorios", {
      method: "POST",
      body: JSON.stringify({ cidade, vertical: vertical || null, prioridade: 0 }),
    }),

  removerTerritorio: (id: number) =>
    requisitar<void>(`/territorios/${id}`, { method: "DELETE" }),

  /** Baixa a carteira como arquivo. Nao passa por `requisitar` porque a
   *  resposta e binaria, nao JSON — e precisa do token no cabecalho. */
  exportar: async (formato: "csv" | "xlsx") => {
    const { acesso } = tokens.ler();
    const resposta = await fetch(`/api/carteira/exportar?formato=${formato}`, {
      headers: acesso ? { Authorization: `Bearer ${acesso}` } : {},
    });
    if (!resposta.ok) throw new ErroApi(resposta.status, await extrairErro(resposta));

    const blob = await resposta.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carteira.${formato}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  adminMetricas: () => requisitar<Metricas>("/admin/metricas"),
  adminContas: (q?: string) =>
    requisitar<ContaAdmin[]>(`/admin/contas${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  adminPressao: () => requisitar<PressaoAdmin[]>("/admin/pressao"),

  ofertas: () => requisitar<Oferta[]>("/ofertas"),
  ofertasContratadas: () => requisitar<Oferta[]>("/ofertas/contratadas"),
  contratarOferta: (ofertaId: number) =>
    requisitar<Oferta>("/ofertas/contratadas", {
      method: "POST",
      body: JSON.stringify({ oferta_id: ofertaId }),
    }),
};
