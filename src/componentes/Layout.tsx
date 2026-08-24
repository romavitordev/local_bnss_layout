import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/Auth";

type Link = { para: string; rotulo: string; exato?: boolean };

const LINKS: Link[] = [
  { para: "/painel", rotulo: "Painel", exato: true },
  { para: "/carteira", rotulo: "Carteira" },
  { para: "/territorios", rotulo: "Territórios" },
  { para: "/pressao", rotulo: "Pressão" },
];

// Só aparece para admin — o servidor recusa de qualquer forma, mas mostrar um
// item que dá 403 é ruído.
const LINKS_ADMIN: Link[] = [{ para: "/admin", rotulo: "Interno" }];

export default function Layout() {
  const { conta, sair } = useAuth();
  const navegar = useNavigate();

  async function encerrar() {
    await sair();
    navegar("/entrar");
  }

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-conteudo">
          <div className="marca">
            <span className="marca-nome">Leads</span>
            <span className="marca-sub">carteira de reservas</span>
          </div>

          <nav className="menu">
            {[...LINKS, ...(conta?.papel === "admin" ? LINKS_ADMIN : [])].map((l) => (
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
            <span className="usuario-nome">{conta?.nome}</span>
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
