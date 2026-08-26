/**
 * A marca, num lugar só.
 *
 * "Leads" é provisório. Antes deste arquivo o nome estava escrito à mão em
 * nove lugares — duas cascas, landing, telas de acesso, `index.html`, o
 * assunto do e-mail de verificação — e trocá-lo significaria caçar string por
 * string, com a garantia de esquecer uma. Nome provisório espalhado vira nome
 * definitivo por inércia.
 *
 * O logotipo ainda não existe. `LOGO` aponta para o arquivo que virá; enquanto
 * ele não estiver em `public/`, `<Marca>` desenha o monograma de reserva — que
 * é uma aproximação declarada, não a marca. Trocar o logotipo passa a ser
 * substituir o arquivo, sem tocar em código.
 */
export const MARCA = {
  /** Nome curto. Usado na navbar e onde o espaço é apertado. */
  nome: "Leads",
  /** Nome completo, para título de aba e rodapé. */
  nomeCompleto: "Leads",
  /** Descritor sob o nome. Muda entre painel e console. */
  descritor: "carteira de reservas",
  descritorConsole: "console da plataforma",

  /** Uma frase sobre o que o produto é. Rodapé e meta description. */
  tagline: "Empresas sem site, reservadas só para você.",

  /**
   * Caminho do logotipo. Ainda não existe — `<Marca>` cai no monograma
   * enquanto o arquivo faltar, para a navbar nunca mostrar ícone quebrado.
   */
  logo: `${import.meta.env.BASE_URL}logo.svg`,

  /** Contato público. Trocar aqui muda rodapé e páginas legais. */
  email: "contato@exemplo.com.br",
  /** Canal de LGPD. Separado do geral de propósito: pedido de eliminação tem
   *  prazo legal e não pode se perder numa caixa de vendas. */
  emailPrivacidade: "privacidade@exemplo.com.br",
  atendimento: "Seg. a sex., 9h às 18h (BRT)",
} as const;

/** Cores da identidade, para SVG que não pode usar variável CSS. */
export const CORES_MARCA = {
  violeta: "#6d4aff",
  ciano: "#00d4c8",
  lima: "#a6ff4d",
} as const;


/**
 * Credenciais da conta de demonstração.
 *
 * `null` em produção — e a checagem é do `import.meta.env.PROD`, que o Vite
 * resolve **na compilação**. O bloco inteiro é removido do pacote, então não
 * é questão de esconder: em produção o texto não existe no arquivo servido.
 *
 * Deixar credencial de demonstração numa tela de login pública é dar uma conta
 * a quem passar por ali. Em desenvolvimento e na vitrine, é o contrário: quem
 * abre para avaliar não deveria precisar procurar a senha no README.
 */
export const DEMO = import.meta.env.PROD
  ? null
  : { email: "demo@leads.com.br", senha: "demo12345" };


/**
 * Dados cadastrais de exemplo para o rodapé da vitrine.
 *
 * `null` em produção, pelo mesmo mecanismo do `DEMO`: `import.meta.env.PROD` é
 * resolvido na compilação e o bloco sai do pacote.
 *
 * Existem porque um rodapé sem razão social, CNPJ e canal de LGPD parece
 * incompleto para quem avalia o produto — e porque publicar dados inventados
 * de uma empresa real seria informação falsa. Aqui eles mostram a FORMA que o
 * rodapé terá quando os verdadeiros entrarem, marcados como exemplo.
 */
export const DADOS_VITRINE = import.meta.env.PROD
  ? null
  : {
      razaoSocial: "Leads Tecnologia LTDA (exemplo)",
      cnpj: "00.000.000/0001-00",
      endereco: "Rua Exemplo, 100 — Sorocaba/SP, 18000-000",
      atendimento: "Seg a sex, 9h às 18h (BRT)",
      email: "contato@exemplo.com.br",
      encarregado: "encarregado@exemplo.com.br",
    };
