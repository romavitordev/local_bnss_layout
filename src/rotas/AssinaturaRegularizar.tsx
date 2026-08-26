import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ErroApi, type AssinaturaDetalhe, type Fatura } from "../api/cliente";
import { reais } from "../api/dinheiro";

/**
 * Inadimplência: a tela de quem já pagou antes e desta vez não passou.
 *
 * A tentação aqui é bloquear tudo e exigir o cartão. Não fazemos isso, e a
 * razão é de produto: a carteira do cliente contém reservas que ele **já
 * pagou** e ainda vai trabalhar. Derrubar o acesso a elas transforma uma falha
 * de cartão — que costuma ser limite estourado ou cartão vencido, não má fé —
 * em perda de trabalho. Quem perde trabalho não regulariza; cancela.
 *
 * O que suspendemos é a **alocação de novas** reservas. É o suficiente para a
 * cobrança ter consequência, sem destruir o que foi comprado.
 */
export default function AssinaturaRegularizar() {
  const navegar = useNavigate();
  const [detalhe, setDetalhe] = useState<AssinaturaDetalhe | null>(null);
  const [falha, setFalha] = useState<Fatura | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [d, faturas] = await Promise.all([api.assinaturaDetalhe(), api.faturas()]);
        setDetalhe(d);
        setFalha(faturas.find((f) => f.status === "falhou") ?? null);
      } catch (e) {
        setErro(e instanceof ErroApi ? e.message : "Falha ao carregar.");
      }
    })();
  }, []);

  async function tentarDeNovo() {
    if (!detalhe) return;
    setEnviando(true);
    setErro(null);
    try {
      // Recontratar o mesmo plano é o caminho de regularização: gera um pedido
      // novo e um checkout novo. Quando o gateway real entrar, isto vira o
      // portal de atualização de cartão dele.
      const checkout = await api.abrirCheckout("plano", detalhe.plano_codigo);
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
      navegar("/assinatura?ok=1", { replace: true });
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Não foi possível iniciar o pagamento.");
      setEnviando(false);
    }
  }

  if (!detalhe) {
    return erro ? (
      <p className="alerta erro">{erro}</p>
    ) : (
      <div className="carregando">Carregando…</div>
    );
  }

  if (detalhe.status !== "inadimplente") {
    return (
      <section>
        <header className="cabecalho-pagina">
          <h1>Nada a regularizar</h1>
        </header>
        <p className="alerta info">Sua assinatura está em dia.</p>
        <Link className="btn" to="/assinatura">
          Ver a assinatura
        </Link>
      </section>
    );
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Regularizar pagamento</h1>
          <p className="ajuda">
            A cobrança do plano {detalhe.plano_nome} não foi aprovada pelo
            provedor.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}

      <div className="duas-colunas">
        <div className="cartao-form">
          <h2 className="titulo-secao">O que está acontecendo</h2>
          <ul className="checkout-consequencias">
            <li>
              <strong>Sua carteira continua sua.</strong> As reservas que você já
              tem não foram liberadas e podem ser trabalhadas normalmente — você
              pagou por elas.
            </li>
            <li>
              <strong>Novas alocações estão suspensas</strong> até a cobrança ser
              aprovada.
            </li>
            <li>
              Seus territórios e ofertas continuam configurados. Nada foi apagado.
            </li>
          </ul>
          {falha && (
            <p className="ajuda">
              Última tentativa: {reais(falha.valor_centavos)} em{" "}
              {new Date(falha.criado_em).toLocaleDateString("pt-BR")}.
            </p>
          )}
        </div>

        <div className="cartao-form">
          <h2 className="titulo-secao">Como resolver</h2>
          <p>
            Cobrar de novo é o caminho mais rápido. Se o motivo foi limite ou
            cartão vencido, use outro cartão na tela do provedor.
          </p>
          <dl className="cobranca-dados">
            <div className="cobranca-total">
              <dt>Valor</dt>
              <dd>
                <strong>{reais(detalhe.total_mensal)}</strong>
              </dd>
            </div>
          </dl>
          <div className="checkout-acoes">
            <button
              type="button"
              className="btn primario"
              disabled={enviando}
              onClick={tentarDeNovo}
            >
              {enviando ? "Aguarde…" : "Pagar agora"}
            </button>
            <Link className="btn-texto" to="/plano">
              Trocar para um plano menor
            </Link>
          </div>
          <p className="ajuda">
            Se preferir encerrar, o cancelamento está em{" "}
            <Link to="/assinatura/cancelar">Assinatura → Cancelar</Link>. Nenhuma
            cobrança nova é feita depois disso.
          </p>
        </div>
      </div>
    </section>
  );
}
