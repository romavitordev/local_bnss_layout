import { useCallback, useEffect, useState } from "react";
import {
  api, ErroApi, type Oferta, type Plano as TipoPlano, type UsoDoPlano,
} from "../api/cliente";

function reais(centavos: number): string {
  return centavos === 0
    ? "Grátis"
    : (centavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      });
}

export default function Plano() {
  const [planos, setPlanos] = useState<TipoPlano[]>([]);
  const [uso, setUso] = useState<UsoDoPlano | null>(null);
  const [catalogo, setCatalogo] = useState<Oferta[]>([]);
  const [contratadas, setContratadas] = useState<Oferta[]>([]);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [p, u, c, ct] = await Promise.all([
        api.planosDaConta(),
        api.usoDoPlano(),
        api.ofertas(),
        api.ofertasContratadas(),
      ]);
      setPlanos(p);
      setUso(u);
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

  async function trocar(codigo: string, nome: string) {
    setOcupado(codigo);
    setAviso(null);
    setErro(null);
    try {
      await api.trocarPlano(codigo);
      setAviso(`Plano alterado para ${nome}.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao trocar de plano.");
    } finally {
      setOcupado(null);
    }
  }

  async function alternarOferta(oferta: Oferta, contratada: boolean) {
    setOcupado(`oferta-${oferta.id}`);
    setAviso(null);
    setErro(null);
    try {
      if (contratada) {
        await api.removerOferta(oferta.id);
        setAviso(`"${oferta.nome}" removida.`);
      } else {
        await api.contratarOferta(oferta.id);
        setAviso(`"${oferta.nome}" contratada.`);
      }
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao alterar a oferta.");
    } finally {
      setOcupado(null);
    }
  }

  const contratadasIds = new Set(contratadas.map((o) => o.id));
  const semVagaDeOferta =
    uso !== null && uso.ofertas_contratadas >= uso.ofertas_incluidas;

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
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      <div className="alerta info">
        A troca é imediata e ainda não passa por cobrança — o gateway de pagamento
        entra depois. Reduzir o plano <strong>não cancela</strong> as reservas que
        você já tem: elas continuam até serem trabalhadas ou expirarem.
      </div>

      <h2 className="titulo-secao">Planos</h2>
      <div className="plans">
        {planos.map((p) => {
          const atual = uso?.plano_codigo === p.codigo;
          const menor = uso !== null && p.carteira_max < uso.carteira_max;
          return (
            <article key={p.id} className={atual ? "plan hi" : "plan"}>
              <span className="nm">{p.nome}</span>
              <span className="pr">
                {reais(p.preco_centavos)}
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
              ) : (
                <button
                  type="button"
                  className={menor ? "btn" : "btn primario"}
                  style={{ marginTop: 14 }}
                  disabled={ocupado === p.codigo}
                  onClick={() => trocar(p.codigo, p.nome)}
                >
                  {ocupado === p.codigo ? "Alterando…" : menor ? "Reduzir" : "Assinar"}
                </button>
              )}
            </article>
          );
        })}
      </div>

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
          </>
        )}
      </p>

      <div className="grade-ofertas">
        {catalogo.map((o) => {
          const contratada = contratadasIds.has(o.id);
          const bloqueada = !contratada && semVagaDeOferta;
          return (
            <article key={o.id} className={contratada ? "cartao-oferta ativa" : "cartao-oferta"}>
              <h3>{o.nome}</h3>
              <p>{o.descricao}</p>
              <button
                type="button"
                className={contratada ? "btn pequeno" : "btn pequeno sucesso"}
                disabled={ocupado === `oferta-${o.id}` || bloqueada}
                title={
                  bloqueada
                    ? "Seu plano não inclui mais tipos de oferta. Faça upgrade para adicionar."
                    : undefined
                }
                onClick={() => alternarOferta(o, contratada)}
              >
                {ocupado === `oferta-${o.id}`
                  ? "…"
                  : contratada
                    ? "Remover"
                    : bloqueada
                      ? "Requer upgrade"
                      : "Contratar"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
