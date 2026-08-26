import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api, ErroApi, type AssinaturaDetalhe, type Oferta,
  type Plano as TipoPlano, type UsoDoPlano,
} from "../api/cliente";
import { reais, reaisRedondo } from "../api/dinheiro";

/**
 * O catálogo: o que existe, o que você tem, e o que muda ao trocar.
 *
 * Esta tela **não cobra nada**. Ela monta o carrinho e leva para `/assinar`,
 * que é o único lugar do produto onde dinheiro é confirmado. A separação evita
 * a armadilha clássica do botão "Assinar" que já debita: aqui o clique leva a
 * uma página que mostra o valor exato, o proporcional e o que muda na conta —
 * e só então cobra.
 *
 * Remover oferta continua acontecendo aqui, sem passar pelo checkout: reduzir
 * o que se paga não precisa de confirmação de pagamento.
 */
export default function Plano() {
  const navegar = useNavigate();
  const [planos, setPlanos] = useState<TipoPlano[]>([]);
  const [uso, setUso] = useState<UsoDoPlano | null>(null);
  const [assinatura, setAssinatura] = useState<AssinaturaDetalhe | null>(null);
  const [catalogo, setCatalogo] = useState<Oferta[]>([]);
  const [contratadas, setContratadas] = useState<Oferta[]>([]);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [p, u, a, c, ct] = await Promise.all([
        api.planosDaConta(),
        api.usoDoPlano(),
        api.assinaturaDetalhe(),
        api.ofertas(),
        api.ofertasContratadas(),
      ]);
      setPlanos(p);
      setUso(u);
      setAssinatura(a);
      setCatalogo(c);
      setContratadas(ct);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar os planos.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function removerOferta(oferta: Oferta) {
    setOcupado(`oferta-${oferta.id}`);
    setAviso(null);
    setErro(null);
    try {
      await api.removerOferta(oferta.id);
      setAviso(
        `"${oferta.nome}" removida. As reservas que você já tem nessa oferta ` +
          "continuam na carteira.",
      );
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao remover a oferta.");
    } finally {
      setOcupado(null);
    }
  }

  const contratadasIds = new Set(contratadas.map((o) => o.id));
  const emTeste = assinatura?.status === "teste";

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Plano e ofertas</h1>
          <p className="ajuda">
            O plano define quantas empresas você mantém reservadas ao mesmo tempo. As
            ofertas definem <em>que tipo de problema</em> você quer atacar.
          </p>
        </div>
        {assinatura && (
          <Link className="btn" to="/assinatura">
            Minha assinatura
          </Link>
        )}
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      {assinatura?.status === "inadimplente" && (
        <div className="alerta erro">
          <strong>Há uma cobrança pendente.</strong> Regularize antes de mudar de
          plano. <Link to="/assinatura/regularizar">Resolver agora</Link>
        </div>
      )}

      {emTeste && (
        <div className="alerta info">
          Você está no plano de teste, com{" "}
          <strong>{uso?.carteira_max ?? 100} reservas</strong>. Assinar libera a
          carteira cheia — e nada é cobrado sem você confirmar o valor na tela
          seguinte.
        </div>
      )}

      <h2 className="titulo-secao">Planos</h2>
      <div className="plans">
        {planos.map((p) => {
          const atual = uso?.plano_codigo === p.codigo;
          const menor = uso !== null && p.carteira_max < uso.carteira_max;
          const gratuito = p.preco_centavos === 0;
          return (
            <article key={p.id} className={atual ? "plan hi" : "plan"}>
              <span className="nm">{p.nome}</span>
              <span className="pr">
                {reaisRedondo(p.preco_centavos)}
                {p.preco_centavos > 0 && <small>/mês</small>}
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
              {atual ? (
                <span className="etiqueta livre" style={{ marginTop: 14 }}>
                  Plano atual
                </span>
              ) : gratuito ? (
                // O plano de teste vem com a conta; ninguém "desce" para ele.
                // Quem quer parar de pagar cancela, que é uma tela com outras
                // consequências a explicar.
                <Link
                  className="btn-texto"
                  style={{ marginTop: 14, display: "inline-block" }}
                  to="/assinatura/cancelar"
                >
                  Quero cancelar
                </Link>
              ) : (
                <button
                  type="button"
                  className={menor ? "btn" : "btn primario"}
                  style={{ marginTop: 14 }}
                  onClick={() =>
                    navegar(`/assinar?tipo=plano&referencia=${encodeURIComponent(p.codigo)}`)
                  }
                >
                  {menor ? "Reduzir" : emTeste ? "Assinar" : "Mudar para este"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p className="ajuda">
        Reduzir o plano <strong>não cancela</strong> as reservas que você já tem:
        elas continuam até serem trabalhadas ou expirarem. O que muda é o teto
        para novas alocações.
      </p>

      <h2 className="titulo-secao">Tipos de oferta</h2>
      <p className="ajuda">
        Cada oferta é uma proposta comercial diferente. A mesma empresa pode receber
        até duas ofertas distintas de clientes diferentes — o que queima um lead é a
        repetição da <em>mesma</em> proposta, não o contato em si.
        {uso && (
          <>
            {" "}
            Seu plano inclui <strong>{uso.ofertas_incluidas}</strong>; você usa{" "}
            <strong>{uso.ofertas_contratadas}</strong>.
            {assinatura && assinatura.ofertas_extras > 0 && (
              <>
                {" "}
                As {assinatura.ofertas_extras} adicionais custam{" "}
                <strong>{reais(assinatura.custo_ofertas_extras)}/mês</strong>.
              </>
            )}
          </>
        )}
      </p>

      <div className="grade-ofertas">
        {catalogo.map((o) => {
          const contratada = contratadasIds.has(o.id);
          const dentroDaCota =
            uso !== null && uso.ofertas_contratadas < uso.ofertas_incluidas;
          return (
            <article
              key={o.id}
              className={contratada ? "cartao-oferta ativa" : "cartao-oferta"}
            >
              <h3>{o.nome}</h3>
              <p>{o.descricao}</p>
              {contratada ? (
                <button
                  type="button"
                  className="btn pequeno"
                  disabled={ocupado === `oferta-${o.id}`}
                  onClick={() => removerOferta(o)}
                >
                  {ocupado === `oferta-${o.id}` ? "…" : "Remover"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn pequeno sucesso"
                  onClick={() => navegar(`/assinar?tipo=oferta&referencia=${o.id}`)}
                  title={
                    dentroDaCota
                      ? "Incluída no seu plano"
                      : `Além do incluído no plano: ${reais(9700)}/mês`
                  }
                >
                  {dentroDaCota ? "Contratar" : `Contratar · ${reaisRedondo(9700)}/mês`}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
