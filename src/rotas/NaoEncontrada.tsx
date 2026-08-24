import { Link } from "react-router-dom";

export default function NaoEncontrada() {
  // Voltava ao painel, que não existe nesta vitrine — o botão levaria a
  // outro 404. Aqui o único destino possível é a própria landing.
  return (
    <div className="tela-acesso">
      <div className="cartao-acesso">
        <h1>Pagina nao encontrada</h1>
        <p className="ajuda">O endereco que voce abriu nao existe.</p>
        <Link className="btn primario" to="/">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
