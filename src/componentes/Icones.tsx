/**
 * Ícones da barra de navegação inferior.
 *
 * SVG inline em vez de uma biblioteca de ícones porque são cinco desenhos e
 * o projeto já monta SVG à mão em `Grafico.tsx`. Puxar `lucide-react` por
 * cinco glifos custaria mais bytes do que o arquivo inteiro.
 *
 * Todos partem do mesmo viewBox de 24 e do mesmo traço, senão ficam com
 * pesos visuais diferentes lado a lado — o defeito mais comum de ícone
 * desenhado avulso. `currentColor` deixa o estado ativo/inativo ser decidido
 * pelo CSS, e não por prop.
 */
type Props = { ativo?: boolean };

function base(ativo?: boolean) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    // O traço engorda quando ativo: é o mesmo recurso do peso de fonte, e
    // sobrevive a quem não distingue as cores do estado.
    strokeWidth: ativo ? 2.2 : 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

/** Painel — medidor, porque a tela responde "quanto da carteira está em uso". */
export function IconePainel({ ativo }: Props) {
  return (
    <svg {...base(ativo)}>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4-5" />
    </svg>
  );
}

/** Carteira — as fichas empilhadas de empresas reservadas. */
export function IconeCarteira({ ativo }: Props) {
  return (
    <svg {...base(ativo)}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M7 3h10" />
      <path d="M3 11h18" />
    </svg>
  );
}

/** Territórios — alfinete no mapa. */
export function IconeTerritorios({ ativo }: Props) {
  return (
    <svg {...base(ativo)}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

/** Pressão — barras de ocupação por cidade. */
export function IconePressao({ ativo }: Props) {
  return (
    <svg {...base(ativo)}>
      <path d="M4 20V13" />
      <path d="M10 20V5" />
      <path d="M16 20V9" />
      <path d="M21 20H3" />
    </svg>
  );
}

/** Conta — o menu que guarda perfil, plano, assinatura e a saída. */
export function IconeConta({ ativo }: Props) {
  return (
    <svg {...base(ativo)}>
      <circle cx="12" cy="8.5" r="3.7" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
