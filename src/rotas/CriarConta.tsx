import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ErroApi } from "../api/cliente";
import { useAuth } from "../contexto/Auth";

const SENHA_MINIMA = 8;

export default function CriarConta() {
  const { registrar } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (senha.length < SENHA_MINIMA) {
      setErro(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    setEnviando(true);
    try {
      await registrar(nome, email, senha);
    } catch (e) {
      setErro(
        e instanceof ErroApi ? e.message : "Não foi possível criar a conta. Tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-acesso">
      <form className="cartao-acesso" onSubmit={enviar}>
        <div className="marca marca-grande">
          <span className="marca-nome">Leads</span>
          <span className="marca-sub">carteira de reservas</span>
        </div>

        <h1>Criar conta</h1>
        <p className="ajuda">
          O teste começa com 100 reservas, sem cartão. Escolha as cidades depois de entrar.
        </p>

        {erro && <p className="alerta erro">{erro}</p>}

        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          required
          minLength={2}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={SENHA_MINIMA}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <span className="ajuda">Mínimo de {SENHA_MINIMA} caracteres.</span>

        <button type="submit" className="btn primario" disabled={enviando}>
          {enviando ? "Criando…" : "Criar conta"}
        </button>

        <p className="rodape-acesso">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
