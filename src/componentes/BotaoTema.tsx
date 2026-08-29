import { useEffect, useRef, useState } from "react";
import {
  OPOSTO, ROTULO_TEMA, aplicarTema, guardarTema, lerTema, temaDoSistema,
  type Tema,
} from "../tema";

/**
 * Alterna entre claro e escuro. Sol e lua, nada além.
 *
 * O ícone mostra o estado ATUAL — sol quando está claro, lua quando está
 * escuro. Ícone que mostra o próximo estado é a confusão clássica desse
 * controle: quem vê uma lua não sabe se está no escuro ou se vai para o
 * escuro. O rótulo acessível diz as duas coisas, nessa ordem.
 *
 * ## O estado que não é um botão
 *
 * `escolha` começa `null` — ninguém decidiu ainda. Enquanto for `null`, nada é
 * escrito no `data-theme` e a media query continua no comando, então o site
 * acompanha o aparelho. O botão mostra o que está valendo, e por isso escuta a
 * media query: se o telefone virar para o escuro às 19h com a página aberta, o
 * ícone acompanha em vez de passar a mentir.
 *
 * O primeiro clique encerra isso. A partir dele a escolha é da pessoa, é
 * guardada, e o sistema deixa de mandar — que é exatamente o que ela pediu.
 */
export default function BotaoTema({ compacto = false }: { compacto?: boolean }) {
  const [escolha, setEscolha] = useState<Tema | null>(() => lerTema());
  const [doSistema, setDoSistema] = useState<Tema>(() => temaDoSistema());
  // `useRef` e não estado: só serve para distinguir a primeira execução do
  // efeito das seguintes, e mudá-lo não deve provocar renderização.
  const montado = useRef(false);

  useEffect(() => {
    // Suave só a partir da segunda vez. Na montagem a página está entrando, e
    // animar ali a faria cruzar consigo mesma a cada carregamento.
    aplicarTema(escolha, montado.current);
    montado.current = true;
  }, [escolha]);

  useEffect(() => {
    if (escolha !== null) return;
    let consulta: MediaQueryList;
    try {
      consulta = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return;
    }
    const aoMudar = () => setDoSistema(temaDoSistema());
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, [escolha]);

  const atual = escolha ?? doSistema;
  const seguinte = OPOSTO[atual];

  return (
    <button
      type="button"
      className={compacto ? "botao-tema compacto" : "botao-tema"}
      onClick={() => {
        guardarTema(seguinte);
        setEscolha(seguinte);
      }}
      title={`${ROTULO_TEMA[atual]}. Clique para o ${ROTULO_TEMA[seguinte].toLowerCase()}`}
      // O `title` não é lido de forma confiável por leitor de tela, e o botão
      // não tem texto visível: sem isto ele seria anunciado como "botão".
      aria-label={`${ROTULO_TEMA[atual]}. Alternar para ${ROTULO_TEMA[seguinte].toLowerCase()}`}
    >
      {atual === "claro" ? <Sol /> : <Lua />}
    </button>
  );
}

const TRACO = {
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

function Sol() {
  return (
    <svg {...TRACO}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function Lua() {
  return (
    <svg {...TRACO}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
