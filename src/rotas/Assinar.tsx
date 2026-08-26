import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, ErroApi, type Orcamento } from "../api/cliente";
import { reais } from "../api/dinheiro";

/**
 * O checkout — um só, para tudo que se compra.
 *
 * Primeira assinatura, upgrade, downgrade, oferta adicional: são cinco
 * carrinhos e uma transação. Cinco telas de checkout seriam cinco lugares
 * para corrigir o mesmo erro de proporcional, e quatro deles seriam
 * descobertos por um cliente.
 *
 * O que esta tela decide: nada. O orçamento vem pronto do servidor, com os
 * valores e as frases de consequência já escritas. A página renderiza. Preço
 * calculado no navegador é preço editável no inspecionar.
 */
export default function Assinar() {
  const [params] = useSearchParams();
  const navegar = useNavigate();

  const tipo = params.get("tipo") ?? "plano";
  const referencia = params.get("referencia") ?? "";

  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!referencia) {
      setErro("Nada foi selecionado para contratar.");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      setOrcamento(await api.orcamento(tipo, referencia));
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao calcular o valor.");
      setOrcamento(null);
    } finally {
      setCarregando(false);
    }
  }, [tipo, referencia]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function confirmar() {
    setEnviando(true);
    setErro(null);
    try {
      const checkout = await api.abrirCheckout(tipo, referencia);

      // Sem cobrança não há gateway: o efeito já foi aplicado do outro lado.
      if (checkout.aplicado || !checkout.url) {
        navegar("/assinatura?ok=1", { replace: true });
        return;
      }

      // A partir daqui a página é do gateway. Voltamos por `/assinatura/retorno`,
      // que é quem descobre se o pagamento passou — nunca esta tela.
      window.location.href = checkout.url;
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Não foi possível iniciar a compra.");
      setEnviando(false);
    }
  }

  if (carregando) return <div className="carregando">Calculando…</div>;

  if (!orcamento) {
    return (
      <section>
        <header className="cabecalho-pagina">
          <h1>Contratar</h1>
        </header>
        <p className="alerta erro">{erro ?? "Não foi possível montar o pedido."}</p>
        <Link className="btn" to="/plano">
          Voltar aos planos
        </Link>
      </section>
    );
  }

  const gratuito = !orcamento.exige_pagamento;

  return (
    <section className="checkout">
      <header className="cabecalho-pagina">
        <div>
          <h1>Confirmar contratação</h1>
          <p className="ajuda">
            Confira o que muda e quanto sai — hoje e todo mês — antes de seguir.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}

      <div className="checkout-grade">
        <div className="cartao-form">
          <h2 className="titulo-secao">{orcamento.titulo}</h2>

          <table className="checkout-linhas">
            <tbody>
              {orcamento.linhas.map((linha, i) => (
                <tr key={i}>
                  <td>{linha.descricao}</td>
                  <td className="num">
                    {linha.valor_centavos === 0 ? "" : reais(linha.valor_centavos)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Você paga hoje</th>
                <th className="num checkout-total">
                  {gratuito ? "Nada" : reais(orcamento.valor_hoje)}
                </th>
              </tr>
            </tfoot>
          </table>

          {/* Os dois números divergem muito num upgrade no meio do ciclo — R$ 43
              hoje, R$ 497 por mês. Mostrar só o primeiro é a origem clássica do
              estorno por "não foi isso que eu vi". */}
          {orcamento.recorrencia > 0 && (
            <p className="checkout-recorrencia">
              Depois: <strong>{reais(orcamento.recorrencia)}</strong> por mês
              {orcamento.proximo_ciclo_em && (
                <>
                  , a partir de{" "}
                  {new Date(orcamento.proximo_ciclo_em).toLocaleDateString("pt-BR")}
                </>
              )}
              .
            </p>
          )}

          <div className="checkout-acoes">
            <button
              type="button"
              className="btn primario"
              disabled={enviando}
              onClick={confirmar}
            >
              {enviando
                ? "Aguarde…"
                : gratuito
                  ? "Confirmar mudança"
                  : `Pagar ${reais(orcamento.valor_hoje)}`}
            </button>
            <Link className="btn-texto" to="/plano">
              Cancelar
            </Link>
          </div>

          <p className="ajuda">
            {gratuito
              ? "Nada será cobrado agora."
              : "Você será levado ao ambiente do provedor de pagamento. " +
                "Os dados do cartão não passam por nós."}
          </p>
        </div>

        <aside className="cartao-form">
          <h2 className="titulo-secao">O que muda na sua conta</h2>
          <ul className="checkout-consequencias">
            {orcamento.consequencias.map((frase, i) => (
              <li key={i}>{frase}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
