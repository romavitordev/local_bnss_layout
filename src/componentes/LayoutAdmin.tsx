import { useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/Auth";
import Marca from "./Marca";
import { MARCA } from "../marca";
import MenuConta from "./MenuConta";
import BotaoTema from "./BotaoTema";

/**
 * Casca do console da plataforma.
 *
 * É um shell separado do painel do cliente de propósito: são dois produtos
 * diferentes atrás do mesmo login. Aqui se opera a plataforma; lá se prospecta.
 * Misturar os dois deixaria o admin caçando controles no meio da carteira e o
 * cliente vendo botões que não pode usar.
 *
 * **A navegação estreita é uma tira rolável, e não a barra inferior do painel
 * do cliente.** A diferença é deliberada, por duas razões:
 *
 * 1. São seis destinos. Barra inferior comporta cinco com folga; com seis, a
 *    375px, cada item fica com 62px — rótulo truncado e alvo apertado.
 * 2. O contexto de uso é outro. O painel do cliente é usado **em campo, com o
 *    telefone na mão**, porque o fluxo é abrir o WhatsApp e ligar. O console é
 *    retaguarda: alguém sentado, conferindo números. Otimizar a retaguarda
 *    para o polegar seria resolver um problema que ela não tem.
 */
const LINKS = [
  { para: "/admin", rotulo: "Visão geral", exato: true },
  { para: "/admin/contas", rotulo: "Contas" },
  { para: "/admin/inventario", rotulo: "Inventário" },
  { para: "/admin/cobranca", rotulo: "Cobrança" },
  { para: "/admin/plataforma", rotulo: "Plataforma" },
  { para: "/admin/interessados", rotulo: "Interessados" },
];

export default function LayoutAdmin() {
  const { conta, sair } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const tira = useRef<HTMLElement>(null);

  async function encerrar() {
    await sair();
    navegar("/entrar");
  }

  // Traz o item ativo para dentro da vista da tira. Sem isto, quem abre
  // /admin/interessados direto pela URL vê a tira parada no começo, com o
  // item atual fora da tela — e a página parece não ter navegação nenhuma.
  useEffect(() => {
    const ativo = tira.current?.querySelector(".menu-link.ativo");
    ativo?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [local.pathname]);

  return (
    <div className="app console">
      <header className="topo">
        <div className="topo-conteudo">
          <Marca
            variante="console"
            aoClicar={() => navegar("/admin")}
            destino={`${MARCA.nomeCompleto} — ir para o início`}
          />

          <nav ref={tira} className="menu menu-tira" aria-label="Principal">
            {LINKS.map((l) => (
              <NavLink
                key={l.para}
                to={l.para}
                end={l.exato}
                className={({ isActive }) => (isActive ? "menu-link ativo" : "menu-link")}
              >
                {l.rotulo}
              </NavLink>
            ))}
          </nav>

          <div className="conta-desktop">
            {/* O admin também é cliente: pode entrar no painel de uso. */}
            <NavLink to="/painel" className="menu-link">
              Ir ao painel de cliente
            </NavLink>
            <span className="usuario-nome" title={conta?.email}>
              {conta?.nome}
            </span>
            <button type="button" className="btn-texto" onClick={() => void encerrar()}>
              Sair
            </button>
          </div>

          <BotaoTema />

          <MenuConta
            nome={conta?.nome}
            email={conta?.email}
            itens={[{ para: "/painel", rotulo: "Ir ao painel de cliente" }]}
            aoSair={() => void encerrar()}
          />
        </div>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
