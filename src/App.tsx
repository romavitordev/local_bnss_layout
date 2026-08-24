import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import AvisoDemo from "./componentes/AvisoDemo";
import { ProvedorAuth, useAuth } from "./contexto/Auth";
import Admin from "./rotas/Admin";
import Carteira from "./rotas/Carteira";
import CriarConta from "./rotas/CriarConta";
import Entrar from "./rotas/Entrar";
import Landing from "./rotas/Landing";
import NaoEncontrada from "./rotas/NaoEncontrada";
import Painel from "./rotas/Painel";
import Pressao from "./rotas/Pressao";
import Territorios from "./rotas/Territorios";

/** Só deixa passar quem está autenticado; o resto vai para o login. */
function RotaProtegida() {
  const { conta, carregando } = useAuth();
  if (carregando) return <div className="carregando">Carregando…</div>;
  if (!conta) return <Navigate to="/entrar" replace />;
  return <Outlet />;
}

/** Quem já entrou não precisa ver login nem cadastro. */
function RotaPublica() {
  const { conta, carregando } = useAuth();
  if (carregando) return <div className="carregando">Carregando…</div>;
  if (conta) return <Navigate to="/painel" replace />;
  return <Outlet />;
}

/** O papel tambem e verificado no servidor a cada requisicao; aqui e so UX. */
function RotaDeAdmin() {
  const { conta } = useAuth();
  if (conta?.papel !== "admin") return <Navigate to="/painel" replace />;
  return <Outlet />;
}

export default function App() {
  // `basename` vem do BASE_URL do Vite, que é o mesmo `/local_bnss_layout/`
  // do build. Sem ele, o roteador acha que está na raiz do domínio e
  // toda navegação interna cai fora do subcaminho — a página some.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProvedorAuth>
        <Routes>
          {/* A landing e aberta a todos, inclusive a quem ja esta logado:
              e a pagina institucional do produto, nao um passo do cadastro. */}
          <Route path="/" element={<Landing />} />

          <Route element={<RotaPublica />}>
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/criar-conta" element={<CriarConta />} />
          </Route>

          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route path="/painel" element={<Painel />} />
              <Route path="/carteira" element={<Carteira />} />
              <Route path="/territorios" element={<Territorios />} />
              <Route path="/pressao" element={<Pressao />} />
              <Route element={<RotaDeAdmin />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </ProvedorAuth>
      <AvisoDemo />
    </BrowserRouter>
  );
}
