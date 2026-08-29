import { useEffect, useState } from "react";
import {
  ROTULO_TEMA, aplicarTema, lerTema, proximoTema, type Tema,
} from "../tema";

/**
 * Alterna o tema: sistema → claro → escuro → sistema.
 *
 * Um botão que cicla, e não um menu, porque são três estados e o custo de errar
 * é um clique. Menu suspenso para três opções é peso de interação que a decisão
 * não merece.
 *
 * O ícone mostra o estado ATUAL — monitor, sol, lua —, e o `title` diz o que
 * vem a seguir. Ícone que mostra o próximo estado é a confusão clássica desse
 * controle: quem vê uma lua não sabe se está no escuro ou se vai para o escuro.
 */
export default function BotaoTema({ compacto = false }: { compacto?: boolean }) {
  const [tema, setTema] = useState<Tema>(() => lerTema());

  // Aplica na montagem também: o script do `index.html` já pintou a tela, mas o
  // `color-scheme` e a coerência do estado passam a ser deste componente.
  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const seguinte = proximoTema(tema);

  return (
    <button
      type="button"
      className={compacto ? "botao-tema compacto" : "botao-tema"}
      onClick={() => setTema(seguinte)}
      title={`${ROTULO_TEMA[tema]}. Clique para: ${ROTULO_TEMA[seguinte].toLowerCase()}`}
      // O `title` não é lido de forma confiável por leitor de tela, e o botão
      // não tem texto visível: sem isto ele seria anunciado como "botão".
      aria-label={`${ROTULO_TEMA[tema]}. Alternar para ${ROTULO_TEMA[seguinte].toLowerCase()}`}
    >
      <Icone tema={tema} />
    </button>
  );
}

function Icone({ tema }: { tema: Tema }) {
  const comum = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (tema === "claro") {
    return (
      <svg {...comum}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (tema === "escuro") {
    return (
      <svg {...comum}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  }
  // Sistema: um monitor, que diz "quem decide é o aparelho".
  return (
    <svg {...comum}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
