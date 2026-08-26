import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ErroApi, type Cobertura, type Plano } from "../api/cliente";
import Marca from "../componentes/Marca";
import { DADOS_VITRINE, MARCA } from "../marca";
import "../landing.css";

/**
 * As seções navegáveis, na ordem em que aparecem.
 *
 * Uma lista, e não três `<a>` escritos à mão, porque a navbar agora precisa
 * saber qual está visível para marcá-la — e três cópias do mesmo `href`
 * divergem do `id` da seção na primeira renomeação.
 */
const SECOES = [
  // A ORDEM AQUI É A DA PÁGINA, e isso não é detalhe.
  //
  // A navbar listava "Como funciona" primeiro, mas na página a seção de
  // exclusividade vem antes. Quem clicava no primeiro item pulava o segundo e
  // depois rolava para trás para achá-lo — a navegação contradizia o
  // documento que ela navega. Conferido por medição, não por leitura.
  { id: "exclusividade", rotulo: "Exclusividade" },
  { id: "como", rotulo: "Como funciona" },
  { id: "precos", rotulo: "Preços" },
] as const;

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

  /**
   * Rolagem suave até uma seção, ou ao topo quando `id` é nulo.
   *
   * `preventDefault` no clique e rolagem por script, em vez de deixar o
   * navegador pular pelo `href`: o salto instantâneo perde a noção de onde a
   * página estava, e quem chegou no meio de um argumento não sabe se subiu ou
   * desceu. O `scroll-margin-top` no CSS impede que a navbar fixa cubra o
   * título da seção de destino.
   *
   * Respeita `prefers-reduced-motion`. Movimento não é enfeite para quem tem
   * distúrbio vestibular — é sintoma.
   */
  const rolarPara = useCallback((id: string | null) => {
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const comportamento: ScrollBehavior = suave ? "smooth" : "auto";
    if (id === null) {
      window.scrollTo({ top: 0, behavior: comportamento });
      // Limpa o `#secao` da barra de endereço ao voltar ao topo, senão
      // recarregar a página joga de volta para a seção antiga.
      history.replaceState(null, "", window.location.pathname);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: comportamento, block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  /** Qual seção está em vista, para marcar o item correspondente na navbar. */
  const [secaoVisivel, setSecaoVisivel] = useState<string | null>(null);

  useEffect(() => {
    const alvos = SECOES.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (alvos.length === 0) return;

    // Estado de TODAS as seções, e não só das que mudaram.
    //
    // `IntersectionObserver` entrega apenas as entradas que MUDARAM. A versão
    // anterior filtrava as que estavam intersectando dentro dessa lista e
    // escolhia a mais alta — o que falha no caso mais comum: rolar de uma
    // seção para a seguinte gera só o evento de SAÍDA da anterior, porque a
    // seguinte já estava intersectando e não mudou. A lista filtrada ficava
    // vazia, o handler não fazia nada, e a marca continuava na seção que
    // acabou de sair da tela. Medido: "Como funciona" marcava "Exclusividade".
    const visiveis = new Map<string, boolean>();

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) visiveis.set(e.target.id, e.isIntersecting);

        // A mais alta entre TODAS as visíveis. Sem esse desempate, duas
        // seções na faixa ao mesmo tempo fazem a marca piscar entre elas.
        const atual = SECOES.map((s) => s.id)
          .filter((id) => visiveis.get(id))
          .map((id) => ({ id, topo: document.getElementById(id)!.getBoundingClientRect().top }))
          .sort((a, b) => a.topo - b.topo)[0];

        setSecaoVisivel(atual ? atual.id : null);
      },
      // Faixa de 30% da altura, centrada. A primeira versão usava 5%
      // (-45%/-50%) e uma seção que passasse rápido por ela não marcava nada.
      { rootMargin: "-35% 0px -35% 0px" },
    );
    alvos.forEach((el) => observador.observe(el!));
    return () => observador.disconnect();
  }, []);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [cobertura, setCobertura] = useState<Cobertura | null>(null);
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // A navbar é transparente sobre o hero e ganha fundo ao rolar.
  //
  // Listener de scroll passivo, não IntersectionObserver: o IO depende do
  // compositor e não dispara em ambientes onde a página não pinta quadros
  // (painel oculto, teste headless). O custo aqui é uma comparação numérica
  // por evento, que é irrelevante — e o comportamento é verificável.
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

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
      <header className={rolou ? "lp-topo rolou" : "lp-topo"}>
        <div className="lp-largura lp-topo-conteudo">
          <Marca variante="landing" aoClicar={() => rolarPara(null)}
                 destino={`${MARCA.nomeCompleto} — voltar ao topo`} />
          <nav className="lp-menu">
            {SECOES.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={secaoVisivel === sec.id ? "ativo" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  rolarPara(sec.id);
                }}
              >
                {sec.rotulo}
              </a>
            ))}
            <Link to="/entrar" className="lp-entrar">
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

          {/* Sem `tabela-rolavel`: são três colunas curtas e elas cabem em
              320px se puderem quebrar linha. Aquela classe existe para as
              tabelas largas do aplicativo e trazia junto uma largura mínima
              de 560px — que aqui só produzia barra de rolagem escondendo a
              última coluna, que é justamente a conclusão do argumento. */}
          <div className="lp-tabela">
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
          {/* `lp-nota-apos-cta` porque a `lp-nota` comum nasce colada no que
              vem antes. Aqui o que vem antes é o botão principal, e 8px entre
              a ação e o texto alternativo faz os dois lerem como um bloco só —
              o olho não separa "clique aqui" de "ou entre por aqui". */}
          <p className="lp-nota lp-nota-apos-cta">
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </div>
      </section>

      <footer className="lp-rodape">
        <div className="lp-largura">
          <div className="lp-rodape-grade">
            {/* Coluna da marca: mark + nome + filete + descritor + o que
                fazemos + a linha de conformidade. É a coluna que responde
                "quem é isso?" para quem chegou pelo rodapé. */}
            <div className="lp-rodape-marca">
              <Marca variante="rodape" />
              <p className="lp-rodape-tagline">{MARCA.tagline}</p>
              <p className="lp-rodape-sobre">
                Empresas brasileiras com problemas de presença digital,
                reservadas com exclusividade para quem vende a solução.
              </p>
              {DADOS_VITRINE && (
                /* Cadastro sob a marca, em linha — é onde o Marcelo Imóveis
                   põe o CRECI. A versão anterior era uma caixa tracejada no
                   meio do rodapé: um retângulo com borda pontilhada não é
                   "informação de exemplo", é um bloco estranho que rouba a
                   atenção do que importa. Dado cadastral é rodapé de rodapé —
                   quem procura, encontra; quem não procura, não tropeça. */
                <p className="lp-rodape-cadastro">
                  {DADOS_VITRINE.razaoSocial}
                  <br />
                  CNPJ {DADOS_VITRINE.cnpj} · {DADOS_VITRINE.endereco}
                </p>
              )}
            </div>

            <nav aria-label="Navegação do rodapé">
              <h4>Produto</h4>
              <ul>
                {/* Mesma ordem da página e da navbar. Três listas em ordens
                    diferentes é como se perde a confiança num rodapé. */}
                {SECOES.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      onClick={(e) => { e.preventDefault(); rolarPara(sec.id); }}
                    >
                      {sec.rotulo}
                    </a>
                  </li>
                ))}
                <li><Link to="/criar-conta">Criar conta gratuita</Link></li>
                <li><Link to="/entrar">Entrar</Link></li>
              </ul>
            </nav>

            <div>
              <h4>Atendimento</h4>
              <ul className="lp-rodape-contato">
                <li>
                  <a href={`mailto:${MARCA.email}`}>
                    <IconeEnvelope /> {MARCA.email}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${MARCA.emailPrivacidade}`}>
                    <IconeEscudo /> Excluir meus dados
                  </a>
                </li>
                {DADOS_VITRINE && (
                  <li>
                    <a href={`mailto:${DADOS_VITRINE.encarregado}`}>
                      <IconeEscudo /> Encarregado (LGPD)
                    </a>
                  </li>
                )}
              </ul>
              <p className="lp-rodape-horario">
                {MARCA.atendimento}
                <br />
                Resposta em até 1 dia útil.
              </p>
            </div>

            <div>
              <h4>Antes de assinar</h4>
              <p className="lp-rodape-sobre">
                O teste não pede cartão. Você escolhe as cidades, recebe a
                primeira carteira e vê os contatos antes de decidir.
              </p>
              <Link to="/criar-conta" className="lp-rodape-cta">
                Começar o teste
              </Link>
            </div>
          </div>

          <div className="lp-rodape-fim">
            <p>
              © {new Date().getFullYear()} {MARCA.nomeCompleto}. Todos os
              direitos reservados.
            </p>
            <div className="lp-rodape-legal">
              <a href={`mailto:${MARCA.emailPrivacidade}`}>Termos e privacidade</a>
              <span className="lp-rodape-lgpd">
                Os contatos vêm de perfis públicos de empresas. Tratamos os
                dados conforme a LGPD e removemos qualquer registro a pedido do
                titular.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Ícones do rodapé.
 *
 * SVG inline em vez de biblioteca: são dois desenhos, e o projeto já monta SVG
 * à mão. Mesmo viewBox e mesmo traço nos dois — pesos diferentes lado a lado
 * é o defeito mais comum de ícone avulso.
 */
function IconeEnvelope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconeEscudo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.8l7.5 3v6c0 4.6-3.1 8.3-7.5 9.4-4.4-1.1-7.5-4.8-7.5-9.4v-6z" />
      <path d="M9.2 12.2l2 2 3.6-3.9" />
    </svg>
  );
}
