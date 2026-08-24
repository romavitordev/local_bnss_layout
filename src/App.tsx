import { BrowserRouter, Route, Routes } from "react-router-dom";
import AvisoDemo from "./componentes/AvisoDemo";
import Landing from "./rotas/Landing";
import NaoEncontrada from "./rotas/NaoEncontrada";

/**
 * VITRINE DO LAYOUT — só a landing, como os outros repositórios de layout.
 *
 * O produto tem login, painel, carteira, territórios, pressão e admin, e
 * todos dependem da API em FastAPI. Publicados num host estático, virariam
 * telas mortas: o login não entra, o painel não carrega. Mostrar telas que
 * não funcionam é pior para o portfólio do que não mostrá-las.
 *
 * Então aqui vive apenas a página pública. O aplicativo continua inteiro no
 * repositório do produto, `local-business-scraper`.
 */
export default function App() {
  // `basename` vem do BASE_URL do Vite, que é o mesmo `/local_bnss_layout/`
  // do build. Sem ele, o roteador acha que está na raiz do domínio e toda
  // navegação interna cai fora do subcaminho — a página some.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
      <AvisoDemo />
    </BrowserRouter>
  );
}
