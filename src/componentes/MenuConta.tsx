import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { IconeConta } from "./Icones";

/**
 * Menu de conta, com o teclado funcionando de verdade (U4).
 *
 * Estava duplicado entre `Layout` e `LayoutAdmin` — mesma estrutura, mesmos
 * três `useEffect`, e as duas cópias já tinham começado a divergir nos
 * rótulos. Virou componente porque o comportamento de teclado que falta
 * acrescentaria ainda mais código idêntico aos dois lugares.
 *
 * ## O que muda com o teclado
 *
 * Antes: os itens eram alcançáveis por Tab e o menu fechava com Esc. É o
 * mínimo, e não é o padrão — um menu com `role="menu"` promete às tecnologias
 * assistivas que as **setas** navegam entre os itens, e Tab sai do menu
 * inteiro. Prometer `role="menu"` e responder só a Tab é pior que não declarar
 * papel nenhum: quem usa leitor de tela recebe a instrução "use as setas" e as
 * setas não fazem nada.
 *
 * Agora: ↓/↑ percorrem em ciclo, Home/End vão às pontas, Esc fecha e devolve o
 * foco ao botão — sem isso o foco cai no início da página e a pessoa recomeça
 * a navegação do zero.
 */
export type ItemMenu = { para: string; rotulo: string };

type Props = {
  nome?: string;
  email?: string;
  itens: ItemMenu[];
  aoSair: () => void;
};

export default function MenuConta({ nome, email, itens, aoSair }: Props) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const local = useLocation();
  useNavigate(); // mantém o componente ligado ao roteador

  // Navegar fecha o menu: senão ele fica por cima da página que a pessoa
  // acabou de pedir.
  useEffect(() => {
    setAberto(false);
  }, [local.pathname]);

  useEffect(() => {
    if (!aberto) return;

    function noDocumento(e: MouseEvent) {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", noDocumento);
    return () => document.removeEventListener("mousedown", noDocumento);
  }, [aberto]);

  /** Os itens focáveis, na ordem em que aparecem. */
  function focaveis(): HTMLElement[] {
    return Array.from(
      raiz.current?.querySelectorAll<HTMLElement>(".menu-conta-item") ?? [],
    );
  }

  function focar(indice: number) {
    const lista = focaveis();
    if (lista.length === 0) return;
    // Ciclo em vez de parar nas pontas: numa lista curta, chegar ao fim e não
    // conseguir voltar ao topo faz a pessoa achar que o menu travou.
    const alvo = (indice + lista.length) % lista.length;
    lista[alvo]?.focus();
  }

  function noTeclado(e: React.KeyboardEvent) {
    if (!aberto) {
      // Seta para baixo com o menu fechado abre e já foca o primeiro item —
      // é o que o padrão de menu espera, e poupa um Enter.
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setAberto(true);
          requestAnimationFrame(() => focar(0));
        }
      }
      return;
    }

    const lista = focaveis();
    const atual = lista.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setAberto(false);
        // Devolve o foco ao botão. Sem isto ele volta ao início do documento
        // e quem navega por teclado recomeça a página inteira.
        botao.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        focar(atual + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focar(atual - 1);
        break;
      case "Home":
        e.preventDefault();
        focar(0);
        break;
      case "End":
        e.preventDefault();
        focar(lista.length - 1);
        break;
      case "Tab":
        // Tab sai do menu inteiro, e não passeia dentro dele: é o que
        // distingue um menu de um grupo de links soltos.
        setAberto(false);
        break;
    }
  }

  return (
    <div className="usuario" ref={raiz} onKeyDown={noTeclado}>
      <button
        ref={botao}
        type="button"
        className={aberto ? "botao-conta aberto" : "botao-conta"}
        aria-expanded={aberto}
        aria-haspopup="menu"
        onClick={() => setAberto((v) => !v)}
      >
        <IconeConta ativo={aberto} />
        <span className="sr-apenas">Conta e configurações</span>
      </button>

      {aberto && (
        <div className="menu-conta" role="menu">
          <div className="menu-conta-topo">
            <strong>{nome}</strong>
            <span>{email}</span>
          </div>
          {itens.map((i) => (
            <NavLink
              key={i.para}
              to={i.para}
              role="menuitem"
              className={({ isActive }) =>
                isActive ? "menu-conta-item ativo" : "menu-conta-item"
              }
            >
              {i.rotulo}
            </NavLink>
          ))}
          <button
            type="button"
            role="menuitem"
            className="menu-conta-item sair"
            onClick={aoSair}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
