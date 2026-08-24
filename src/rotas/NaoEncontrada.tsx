import { Link } from "react-router-dom";

export default function NaoEncontrada() {
  return (
    <div className="tela-acesso">
      <div className="cartao-acesso">
        <h1>Pagina nao encontrada</h1>
        <p className="ajuda">O endereco que voce abriu nao existe.</p>
        <Link className="btn primario" to="/painel">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
