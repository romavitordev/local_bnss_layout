import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ErroApi, type Cobertura, type Plano } from "../api/cliente";

function reais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** A tabela que sustenta o argumento inteiro: repetir a mesma oferta queima. */
const SATURACAO = [
  { situacao: "1 vendedor com a proposta", resposta: "3,00%", valor: 100, bom: true },
  { situacao: "20 vendedores, mesma proposta", resposta: "0,39%", valor: 13, bom: false },
];

const PASSOS = [
  {
    titulo: "Escolha onde atuar",
    texto:
      "Cidades e ramos, quantos quiser. Território é filtro, não é cobrado — o que " +
      "define o plano é quanto você consegue trabalhar.",
  },
  {
    titulo: "Receba a carteira",
    texto:
      "Empresas reservadas só para você, priorizando as que apareceram esta semana. " +
      "Enquanto estiverem na sua carteira, ninguém mais recebe.",
  },
  {
    titulo: "Trabalhe e devolva",
    texto:
      "Marque o resultado de cada contato. O que você descartar volta ao pool com " +
      "carência, e a vaga é reposta na hora.",
  },
];

export default function Landing() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [cobertura, setCobertura] = useState<Cobertura | null>(null);
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // A landing precisa abrir mesmo se a API estiver fora: preço e cobertura
    // são reforço, não o argumento.
    api.planosPublicos().then(setPlanos).catch(() => setPlanos([]));
    api.cobertura().then(setCobertura).catch(() => setCobertura(null));
  }, []);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const r = await api.registrarInteresse(email, cidade);
      setAviso(r.mensagem);
      setEmail("");
      setCidade("");
    } catch (e) {
      setErro(
        e instanceof ErroApi ? e.message : "Não foi possível registrar agora. Tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="lp">
      <header className="lp-topo">
        <div className="lp-largura lp-topo-conteudo">
          <div className="marca">
            <span className="marca-nome">Leads</span>
            <span className="marca-sub">carteira de reservas</span>
          </div>
          <nav className="lp-menu">
            <a href="#como">Como funciona</a>
            <a href="#exclusividade">Exclusividade</a>
            <a href="#precos">Preços</a>
            <Link to="/entrar" className="btn">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------------------------------------------------------- hero */}
      <section className="lp-hero">
        <div className="lp-largura">
          <p className="lp-eyebrow">Prospecção para quem vende presença digital</p>
          <h1>
            Empresas sem site, <em>reservadas só para você</em>.
          </h1>
          <p className="lp-dek">
            Encontramos negócios brasileiros que ainda não têm site — só rede social ou
            nada. Você recebe uma carteira exclusiva: enquanto uma empresa estiver com
            você, nenhum concorrente nosso recebe o mesmo contato.
          </p>

          <form className="lp-captura" onSubmit={enviar}>
            <input
              type="email"
              required
              aria-label="Seu e-mail"
              placeholder="seu@email.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              aria-label="Cidade onde você atua"
              placeholder="Cidade onde atua (opcional)"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <button type="submit" className="btn primario" disabled={enviando}>
              {enviando ? "Enviando…" : "Quero saber quando abrir vaga"}
            </button>
          </form>

          {aviso && <p className="alerta info lp-estreito">{aviso}</p>}
          {erro && <p className="alerta erro lp-estreito">{erro}</p>}

          <p className="lp-nota">
            Ou <Link to="/criar-conta">crie sua conta</Link> e comece o teste agora — sem
            cartão.
          </p>

          {cobertura && cobertura.empresas > 0 && (
            <p className="lp-prova">
              <strong>
                {cobertura.empresas.toLocaleString("pt-BR")}+ empresas
              </strong>{" "}
              mapeadas em {cobertura.cidades}{" "}
              {cobertura.cidades === 1 ? "cidade" : "cidades"}, atualizadas toda semana.
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------- problema */}
      <section className="lp-secao">
        <div className="lp-largura lp-estreito">
          <h2>O problema não é achar empresas. É que a lista queima.</h2>
          <p>
            Qualquer um consegue extrair uma lista de negócios sem site. O que ninguém
            resolve é o que acontece depois: a mesma lista é vendida para dezenas de
            agências, todas ligam com a mesma proposta, e em duas semanas aquele dono de
            restaurante desliga no primeiro "olá".
          </p>
          <p>
            Uma base parada também apodrece — <strong>cerca de 26% ao ano</strong>, entre
            empresas que fecham, trocam de telefone ou simplesmente contratam um site.
            Ligar para número morto consome o recurso mais caro que você tem: o tempo do
            seu vendedor.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------- exclusividade */}
      <section className="lp-secao lp-destaque" id="exclusividade">
        <div className="lp-largura lp-estreito">
          <h2>Por isso a exclusividade não é enfeite</h2>
          <p>
            O que destrói um lead não é receber ligação — é receber a{" "}
            <strong>mesma proposta</strong> vinte vezes.
          </p>

          <div className="tabela-rolavel lp-tabela">
            <table>
              <thead>
                <tr>
                  <th>Quem liga</th>
                  <th className="num">Taxa de resposta</th>
                  <th className="num">Valor do contato</th>
                </tr>
              </thead>
              <tbody>
                {SATURACAO.map((l) => (
                  <tr key={l.situacao}>
                    <td>{l.situacao}</td>
                    <td className="num">{l.resposta}</td>
                    <td className={`num ${l.bom ? "bom" : "ruim"}`}>{l.valor}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Por isso cada empresa fica travada para um cliente de cada vez. E por isso
            limitamos quanto uma única conta pode reservar numa cidade: se um cliente
            grande tomasse tudo, sobrava um mercado morto para todo mundo — inclusive
            para ele.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ como */}
      <section className="lp-secao" id="como">
        <div className="lp-largura">
          <h2 className="lp-centro">Como funciona</h2>
          <ol className="lp-passos">
            {PASSOS.map((p, i) => (
              <li key={p.titulo}>
                <span className="lp-numero">{i + 1}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- preços */}
      <section className="lp-secao lp-destaque" id="precos">
        <div className="lp-largura">
          <h2 className="lp-centro">Preços</h2>
          <p className="lp-centro lp-sub">
            O que escala o plano é o tamanho da carteira — quantas empresas você consegue
            trabalhar ao mesmo tempo. Cidades e ramos são ilimitados em todos.
          </p>

          {planos.length === 0 ? (
            <p className="vazio">Tabela de preços indisponível no momento.</p>
          ) : (
            <div className="plans">
              {planos.map((p, i) => (
                <article key={p.id} className={i === 1 ? "plan hi" : "plan"}>
                  <span className="nm">{p.nome}</span>
                  <span className="pr">
                    {reais(p.preco_centavos)}
                    <small>/mês</small>
                  </span>
                  <dl>
                    <div>
                      <dt>Carteira</dt>
                      <dd>{p.carteira_max.toLocaleString("pt-BR")}</dd>
                    </div>
                    <div>
                      <dt>Tipos de oferta</dt>
                      <dd>{p.ofertas_incluidas}</dd>
                    </div>
                    <div>
                      <dt>Cidades</dt>
                      <dd>ilimitadas</dd>
                    </div>
                  </dl>
                  <Link to="/criar-conta" className="btn primario lp-plano-btn">
                    Começar teste
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="lp-secao lp-fechamento">
        <div className="lp-largura lp-estreito lp-centro">
          <h2>Comece pelo teste, sem cartão</h2>
          <p>
            Escolha suas cidades, receba a primeira carteira e veja os contatos antes de
            decidir qualquer coisa.
          </p>
          <Link to="/criar-conta" className="btn primario lp-cta">
            Criar conta gratuita
          </Link>
          <p className="lp-nota">
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </div>
      </section>

      <footer className="lp-rodape">
        <div className="lp-largura">
          <p>
            Os contatos vêm de perfis públicos de empresas. Tratamos os dados conforme a
            LGPD e removemos qualquer registro a pedido do titular.
          </p>
        </div>
      </footer>
    </div>
  );
}
