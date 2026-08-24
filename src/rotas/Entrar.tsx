import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ErroApi } from "../api/cliente";
import { useAuth } from "../contexto/Auth";

export default function Entrar() {
  const { entrar } = useAuth();
  // Ja preenchido: nesta vitrine qualquer credencial entra, e um formulario
  // vazio deixaria o visitante adivinhando o que digitar pra ver o layout.
  const [email, setEmail] = useState("demo@leads.com.br");
  const [senha, setSenha] = useState("demo12345");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Não foi possível entrar. Tente de novo.");
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

        <h1>Entrar</h1>

        {erro && <p className="alerta erro">{erro}</p>}

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
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit" className="btn primario" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>

        <p className="rodape-acesso">
          Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
        </p>
        <p className="rodape-acesso">
          Vitrine do layout: qualquer e-mail e senha entram.
        </p>
      </form>
    </div>
  );
}
