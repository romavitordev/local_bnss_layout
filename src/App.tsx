import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import LayoutAdmin from "./componentes/LayoutAdmin";
import AvisoDemo from "./componentes/AvisoDemo";
import { ProvedorAuth, useAuth } from "./contexto/Auth";
import Assinar from "./rotas/Assinar";
import Assinatura from "./rotas/Assinatura";
import AssinaturaCancelar from "./rotas/AssinaturaCancelar";
import AssinaturaRegularizar from "./rotas/AssinaturaRegularizar";
import AssinaturaRetorno from "./rotas/AssinaturaRetorno";
import Carteira from "./rotas/Carteira";
import CriarConta from "./rotas/CriarConta";
import Entrar from "./rotas/Entrar";
import Landing from "./rotas/Landing";
import NaoEncontrada from "./rotas/NaoEncontrada";
import Painel from "./rotas/Painel";
import Perfil from "./rotas/Perfil";
import Plano from "./rotas/Plano";
import Pressao from "./rotas/Pressao";
import Territorios from "./rotas/Territorios";
import VerificarEmail from "./rotas/VerificarEmail";
import Cobranca from "./rotas/admin/Cobranca";
import Contas from "./rotas/admin/Contas";
import Interessados from "./rotas/admin/Interessados";
import Inventario from "./rotas/admin/Inventario";
import Plataforma from "./rotas/admin/Plataforma";
import VisaoGeral from "./rotas/admin/VisaoGeral";

/** Só deixa passar quem está autenticado; o resto vai para o login. */
function RotaProtegida() {
  const { conta, carregando } = useAuth();
  if (carregando) return <div className="carregando">Carregando…</div>;
  if (!conta) return <Navigate to="/entrar" replace />;
  return <Outlet />;
}

/**
 * Quem já entrou não precisa ver login nem cadastro.
 *
 * O destino depende do papel: admin cai no console da plataforma, cliente cai
 * no painel de trabalho — são dois produtos atrás do mesmo login.
 *
 * Na vitrine a conta de exemplo é admin, para que os dois lados fiquem
 * visitáveis. No produto, um cliente comum nunca chega ao console.
 */
function RotaPublica() {
  const { conta, carregando } = useAuth();
  if (carregando) return <div className="carregando">Carregando…</div>;
  if (conta) {
    return <Navigate to={conta.papel === "admin" ? "/admin" : "/painel"} replace />;
  }
  return <Outlet />;
}

/** O papel também é verificado no servidor a cada requisição; aqui é só UX. */
function RotaDeAdmin() {
  const { conta, carregando } = useAuth();
  if (carregando) return <div className="carregando">Carregando…</div>;
  if (conta?.papel !== "admin") return <Navigate to="/painel" replace />;
  return <Outlet />;
}

export default function App() {
  // `basename` vem do BASE_URL do Vite, que é o mesmo `/local_bnss_layout/`
  // do build. Sem ele, o roteador acha que está na raiz do domínio e toda
  // navegação interna cai fora do subcaminho — a página some.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProvedorAuth>
        <Routes>
          {/* A landing é aberta a todos, inclusive a quem já está logado:
              é a página institucional do produto, não um passo do cadastro. */}
          <Route path="/" element={<Landing />} />

          {/* Fora de RotaPublica: quem clica no link do e-mail pode estar em
              outro aparelho OU já logado, e nos dois casos precisa cair aqui.
              Dentro de RotaPublica, quem já tem sessão seria desviado para o
              painel sem nunca confirmar nada. */}
          <Route path="/verificar-email" element={<VerificarEmail />} />

          <Route element={<RotaPublica />}>
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/criar-conta" element={<CriarConta />} />
          </Route>

          <Route element={<RotaProtegida />}>
            {/* Painel do cliente: comprar, ver e trabalhar os contatos. */}
            <Route element={<Layout />}>
              <Route path="/painel" element={<Painel />} />
              <Route path="/carteira" element={<Carteira />} />
              <Route path="/territorios" element={<Territorios />} />
              <Route path="/pressao" element={<Pressao />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/plano" element={<Plano />} />

              {/* Cobrança. `/assinar` é o único lugar do produto onde dinheiro
                  é confirmado — os cinco carrinhos (primeira assinatura,
                  upgrade, downgrade, oferta adicional, exclusividade) passam
                  todos por ele, com o orçamento montado no servidor. */}
              <Route path="/assinar" element={<Assinar />} />
              <Route path="/assinatura" element={<Assinatura />} />
              <Route path="/assinatura/retorno" element={<AssinaturaRetorno />} />
              <Route path="/assinatura/regularizar" element={<AssinaturaRegularizar />} />
              <Route path="/assinatura/cancelar" element={<AssinaturaCancelar />} />
            </Route>

            {/* Console da plataforma: operar o produto, não usá-lo. */}
            <Route element={<RotaDeAdmin />}>
              <Route element={<LayoutAdmin />}>
                <Route path="/admin" element={<VisaoGeral />} />
                <Route path="/admin/contas" element={<Contas />} />
                <Route path="/admin/inventario" element={<Inventario />} />
                <Route path="/admin/plataforma" element={<Plataforma />} />
                <Route path="/admin/cobranca" element={<Cobranca />} />
                <Route path="/admin/interessados" element={<Interessados />} />
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
