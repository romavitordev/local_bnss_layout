import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ErroApi, type AssinaturaDetalhe, type Uso } from "../api/cliente";
import { reais } from "../api/dinheiro";

/**
 * Cancelamento.
 *
 * Tem página própria, e não um modal escondido atrás de três cliques, por
 * duas razões. A legal: no Brasil, cancelar precisa ser tão fácil quanto
 * contratar — dificultar é prática abusiva, não retenção. A de produto:
 * cancelamento difícil não segura cliente, segura ressentimento, e o cliente
 * sai do mesmo jeito pelo chargeback, que custa mais caro que a mensalidade.
 *
 * O que a tela faz é dizer a verdade sobre as consequências antes do clique.
 * A mais importante é contraintuitiva e vale por si: **o acesso não cai na
 * hora.** Vale até o fim do ciclo já pago.
 */
export default function AssinaturaCancelar() {
  const navegar = useNavigate();
  const [detalhe, setDetalhe] = useState<AssinaturaDetalhe | null>(null);
  const [uso, setUso] = useState<Uso | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [d, u] = await Promise.all([api.assinaturaDetalhe(), api.uso()]);
        setDetalhe(d);
        setUso(u);
      } catch (e) {
        setErro(e instanceof ErroApi ? e.message : "Falha ao carregar.");
      }
    })();
  }, []);

  async function cancelar() {
    setEnviando(true);
    setErro(null);
    try {
      await api.cancelarAssinatura();
      navegar("/assinatura", { replace: true });
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao cancelar.");
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

  if (detalhe.cancelada_em) {
    return (
      <section>
        <header className="cabecalho-pagina">
          <h1>Assinatura já cancelada</h1>
        </header>
        <p className="alerta info">
          Não haverá nova cobrança. Você tem acesso até{" "}
          {detalhe.renovacao_em
            ? new Date(detalhe.renovacao_em).toLocaleDateString("pt-BR")
            : "o fim do ciclo"}
          .
        </p>
        <Link className="btn" to="/assinatura">
          Voltar
        </Link>
      </section>
    );
  }

  const fim = detalhe.renovacao_em
    ? new Date(detalhe.renovacao_em).toLocaleDateString("pt-BR")
    : "o fim do ciclo pago";

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Cancelar assinatura</h1>
          <p className="ajuda">
            Plano {detalhe.plano_nome} — {reais(detalhe.total_mensal)}/mês.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}

      <div className="duas-colunas">
        <div className="cartao-form">
          <h2 className="titulo-secao">O que acontece</h2>
          <ul className="checkout-consequencias">
            <li>
              <strong>Você continua com acesso até {fim}.</strong> O ciclo já foi
              pago, e o cancelamento só impede a próxima cobrança.
            </li>
            <li>
              Até lá, sua carteira funciona normalmente: dá para trabalhar os
              contatos, marcar resultado e exportar.
            </li>
            {uso && uso.carteira_ocupada > 0 && (
              <li>
                Você tem <strong>{uso.carteira_ocupada.toLocaleString("pt-BR")}</strong>{" "}
                reserva(s) na carteira. Depois de {fim}, elas voltam ao pool e
                ficam disponíveis para outros clientes —{" "}
                <strong>exporte antes se quiser guardar</strong>.
              </li>
            )}
            <li>
              Seus territórios e ofertas ficam salvos. Voltando depois, é só
              assinar de novo.
            </li>
            <li>
              Nenhum valor é devolvido pelo período já pago — e nada é cobrado a
              mais.
            </li>
          </ul>

          {uso && uso.carteira_ocupada > 0 && (
            <div className="checkout-acoes">
              <Link className="btn" to="/carteira">
                Exportar minha carteira antes
              </Link>
            </div>
          )}
        </div>

        <div className="cartao-form">
          <h2 className="titulo-secao">Antes de sair</h2>
          <p>
            Se o problema for preço, um plano menor mantém o acesso e a carteira
            que você já construiu.
          </p>
          <div className="checkout-acoes">
            <Link className="btn primario" to="/plano">
              Ver planos menores
            </Link>
          </div>

          <hr className="separador" />

          <label className="cancelar-confirma">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => setConfirmado(e.target.checked)}
            />
            <span>
              Entendi que meu acesso vai até {fim} e que as reservas voltam ao
              pool depois disso.
            </span>
          </label>

          <div className="checkout-acoes">
            <button
              type="button"
              className="btn"
              disabled={!confirmado || enviando}
              onClick={cancelar}
            >
              {enviando ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
            <Link className="btn-texto" to="/assinatura">
              Voltar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
