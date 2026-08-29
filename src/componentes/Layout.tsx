import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/Auth";
import Marca from "./Marca";
import { MARCA } from "../marca";
import AvisoVerificacao from "./AvisoVerificacao";
import MenuConta from "./MenuConta";
import {
  IconeCarteira, IconePainel, IconePressao, IconeTerritorios,
} from "./Icones";
import BotaoTema from "./BotaoTema";

/**
 * Casca do painel do cliente.
 *
 * A navegação tem duas formas, e não uma que encolhe:
 *
 * - **≥ 900px** — links em linha na barra do topo, como sempre foram.
 * - **< 900px** — os links de trabalho descem para uma **barra inferior
 *   fixa**, e o topo fica só com a marca e o botão de conta.
 *
 * A troca acontece porque a versão anterior era uma única barra com
 * `flex-wrap`, e envolver não é adaptar: em 1024px o menu já ocupava três
 * linhas dentro de um contêiner de 66px fixos — os links vazavam por cima da
 * borda. Em 375px a barra comia 192px de 812 (23% da tela), "Conta de
 * Demonstração" quebrava em duas linhas e o botão **Sair ficava fora da
 * viewport**, inalcançável.
 *
 * A barra inferior é o padrão certo aqui e não é escolha estética: este
 * painel é usado **em campo, com o telefone na mão** — o fluxo do produto é
 * abrir o WhatsApp do contato e ligar. Polegar alcança a base da tela; o topo
 * de um aparelho grande, não.
 */
type Link = { para: string; rotulo: string; exato?: boolean; Icone: typeof IconePainel };

const LINKS: Link[] = [
  { para: "/painel", rotulo: "Painel", exato: true, Icone: IconePainel },
  { para: "/carteira", rotulo: "Carteira", Icone: IconeCarteira },
  { para: "/territorios", rotulo: "Territórios", Icone: IconeTerritorios },
  { para: "/pressao", rotulo: "Pressão", Icone: IconePressao },
];

// Só aparece para admin — o servidor recusa de qualquer forma, mas mostrar um
// item que dá 403 é ruído.
// O admin também é cliente e pode usar o painel; daqui ele volta ao console.
const LINKS_ADMIN = [{ para: "/admin", rotulo: "Console da plataforma" }];

const LINKS_CONTA = [
  { para: "/perfil", rotulo: "Perfil" },
  { para: "/plano", rotulo: "Plano e ofertas" },
  // Separado de "Plano" de propósito: lá se escolhe o que ter, aqui se
  // administra o que já se tem — renovação, cobranças, cancelamento.
  { para: "/assinatura", rotulo: "Assinatura" },
];

export default function Layout() {
  const { conta, sair } = useAuth();
  const navegar = useNavigate();

  async function encerrar() {
    await sair();
    navegar("/entrar");
  }

  const linksDeConta = [
    ...LINKS_CONTA,
    ...(conta?.papel === "admin" ? LINKS_ADMIN : []),
  ];

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-conteudo">
          <Marca
            variante="painel"
            aoClicar={() => navegar("/painel")}
            destino={`${MARCA.nomeCompleto} — ir para o início`}
          />

          {/* Links de trabalho: só no desktop. No celular eles vivem na barra
              inferior, e repetir os dois seria dois lugares para o mesmo
              destino — o visitante escolhe o errado e aprende que o produto
              é confuso. */}
          <nav className="menu menu-desktop" aria-label="Principal">
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
            {linksDeConta.map((l) => (
              <NavLink
                key={l.para}
                to={l.para}
                className={({ isActive }) => (isActive ? "menu-link ativo" : "menu-link")}
              >
                {l.para === "/plano" ? "Plano" : l.para === "/admin" ? "Console" : l.rotulo}
              </NavLink>
            ))}
            <span className="usuario-nome" title={conta?.email}>
              {conta?.nome}
            </span>
            <button type="button" className="btn-texto" onClick={() => void encerrar()}>
              Sair
            </button>
          </div>

          {/* No celular os links de conta viram este menu. É o mesmo conteúdo
              em duas formas, nunca as duas ao mesmo tempo. */}
          <BotaoTema />
          <MenuConta
            nome={conta?.nome}
            email={conta?.email}
            itens={linksDeConta}
            aoSair={() => void encerrar()}
          />
        </div>
      </header>

      <main className="conteudo">
        <AvisoVerificacao />
        <Outlet />
      </main>

      {/* Barra inferior — só no celular. `aria-label` distinto do menu do topo
          para quem navega por landmarks não encontrar duas "Principal". */}
      <nav className="barra-inferior" aria-label="Navegação inferior">
        {LINKS.map(({ para, rotulo, exato, Icone }) => (
          <NavLink
            key={para}
            to={para}
            end={exato}
            className={({ isActive }) =>
              isActive ? "barra-inferior-item ativo" : "barra-inferior-item"
            }
          >
            {({ isActive }) => (
              <>
                <span className="barra-inferior-icone">
                  <Icone ativo={isActive} />
                </span>
                {rotulo}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
