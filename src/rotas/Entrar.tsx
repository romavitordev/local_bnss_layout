import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ErroApi } from "../api/cliente";
import { useAuth } from "../contexto/Auth";
import Marca from "../componentes/Marca";
import { DEMO } from "../marca";

export default function Entrar() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Cópia local para o TypeScript estreitar dentro do JSX e do callback:
  // um `const` de módulo não é estreitado através de fronteira de closure.
  const demo = DEMO;

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
        <Marca variante="acesso" />

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

        {demo && (
          /* Conta de demonstração.
             Só aparece fora de produção — a checagem é do `import.meta.env`,
             que o Vite resolve na compilação, então em produção este bloco
             nem chega ao pacote. Deixar credencial de demonstração numa tela
             de login pública é dar uma conta a quem passar por ali. */
          <div className="demo-credenciais">
            <p className="demo-titulo">Conta de demonstração</p>
            <dl>
              <div>
                <dt>E-mail</dt>
                <dd><code>{demo.email}</code></dd>
              </div>
              <div>
                <dt>Senha</dt>
                <dd><code>{demo.senha}</code></dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn pequeno"
              onClick={() => {
                setEmail(demo.email);
                setSenha(demo.senha);
              }}
            >
              Preencher
            </button>
          </div>
        )}

        <p className="rodape-acesso">
          Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
