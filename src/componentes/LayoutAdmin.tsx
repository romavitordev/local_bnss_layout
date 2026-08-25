import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/Auth";

/**
 * Casca do console da plataforma.
 *
 * É um shell separado do painel do cliente de propósito: são dois produtos
 * diferentes atrás do mesmo login. Aqui se opera a plataforma; lá se prospecta.
 * Misturar os dois deixaria o admin caçando controles no meio da carteira e o
 * cliente vendo botões que não pode usar.
 */
const LINKS = [
  { para: "/admin", rotulo: "Visão geral", exato: true },
  { para: "/admin/contas", rotulo: "Contas" },
  { para: "/admin/inventario", rotulo: "Inventário" },
  { para: "/admin/plataforma", rotulo: "Plataforma" },
  { para: "/admin/interessados", rotulo: "Interessados" },
];

export default function LayoutAdmin() {
  const { conta, sair } = useAuth();
  const navegar = useNavigate();

  async function encerrar() {
    await sair();
    navegar("/entrar");
  }

  return (
    <div className="app console">
      <header className="topo">
        <div className="topo-conteudo">
          <div className="marca">
            <span className="marca-nome">Leads</span>
            <span className="marca-sub">console da plataforma</span>
          </div>

          <nav className="menu">
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

          <div className="usuario">
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
        </div>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
