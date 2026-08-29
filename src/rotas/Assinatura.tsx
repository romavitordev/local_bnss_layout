import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  api, ErroApi, type AssinaturaDetalhe, type Fatura,
} from "../api/cliente";
import { reais } from "../api/dinheiro";
import Tabela from "../componentes/Tabela";

/**
 * Central de cobrança: onde a assinatura é administrada, não escolhida.
 *
 * A separação de `/plano` é deliberada. Lá se decide *o que ter* — é uma tela
 * de catálogo, com comparação e argumento. Aqui se administra *o que já se
 * tem*: quando renova, quanto sai, o que foi cobrado, como sair. Misturar as
 * duas produz uma tela que tenta vender para quem só quer conferir um valor.
 */
const ROTULOS: Record<string, string> = {
  teste: "Em teste",
  ativa: "Ativa",
  inadimplente: "Pagamento pendente",
  cancelada: "Cancelada",
};

export default function Assinatura() {
  const [params] = useSearchParams();
  const [detalhe, setDetalhe] = useState<AssinaturaDetalhe | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(
    params.get("ok") ? "Mudança aplicada." : null,
  );
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [d, f] = await Promise.all([api.assinaturaDetalhe(), api.faturas()]);
      setDetalhe(d);
      setFaturas(f);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar a assinatura.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function reativar() {
    setOcupado(true);
    setErro(null);
    try {
      await api.reativarAssinatura();
      setAviso("Assinatura reativada. A renovação volta ao normal.");
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao reativar.");
    } finally {
      setOcupado(false);
    }
  }

  if (!detalhe) {
    return erro ? (
      <p className="alerta erro">{erro}</p>
    ) : (
      <div className="carregando">Carregando…</div>
    );
  }

  const emTeste = detalhe.status === "teste";

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Assinatura</h1>
          <p className="ajuda">
            Seu plano, o que é cobrado e o histórico das cobranças.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      {detalhe.status === "inadimplente" && (
        <div className="alerta erro">
          <strong>A última cobrança não passou.</strong> Sua carteira atual
          continua no lugar, mas novas alocações estão suspensas até a
          regularização.{" "}
          <Link to="/assinatura/regularizar">Regularizar agora</Link>
        </div>
      )}

      {detalhe.cancelada_em && (
        <div className="alerta erro">
          <strong>Assinatura cancelada.</strong> Você continua com acesso até{" "}
          {detalhe.renovacao_em
            ? new Date(detalhe.renovacao_em).toLocaleDateString("pt-BR")
            : "o fim do ciclo pago"}
          , e depois disso não haverá nova cobrança.{" "}
          <button
            type="button"
            className="btn-texto"
            disabled={ocupado}
            onClick={reativar}
          >
            Reativar
          </button>
        </div>
      )}

      <div className="duas-colunas">
        <div className="cartao-form">
          <h2 className="titulo-secao">Plano atual</h2>

          <dl className="cobranca-dados">
            <div>
              <dt>Plano</dt>
              <dd>
                <strong>{detalhe.plano_nome}</strong>
              </dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <span
                  className={
                    detalhe.status === "ativa"
                      ? "etiqueta livre"
                      : detalhe.status === "teste"
                        ? "etiqueta st-ativa"
                        : "etiqueta lotada"
                  }
                >
                  {ROTULOS[detalhe.status] ?? detalhe.status}
                </span>
              </dd>
            </div>
            <div>
              <dt>Carteira</dt>
              <dd>{detalhe.carteira_max.toLocaleString("pt-BR")} reservas</dd>
            </div>
            <div>
              <dt>Plano</dt>
              <dd>{reais(detalhe.preco_centavos)}/mês</dd>
            </div>
            {detalhe.ofertas_extras > 0 && (
              <div>
                <dt>
                  {detalhe.ofertas_extras} oferta(s) além das {detalhe.ofertas_incluidas}{" "}
                  incluídas
                </dt>
                <dd>{reais(detalhe.custo_ofertas_extras)}/mês</dd>
              </div>
            )}
            <div className="cobranca-total">
              <dt>Total mensal</dt>
              <dd>
                <strong>{reais(detalhe.total_mensal)}</strong>
              </dd>
            </div>
            <div>
              <dt>{detalhe.cancelada_em ? "Acesso até" : "Próxima cobrança"}</dt>
              <dd>
                {detalhe.renovacao_em
                  ? new Date(detalhe.renovacao_em).toLocaleDateString("pt-BR")
                  : "—"}
                {detalhe.dias_para_renovar !== null && !detalhe.cancelada_em && (
                  <span className="ajuda"> ({detalhe.dias_para_renovar} dias)</span>
                )}
              </dd>
            </div>
          </dl>

          <div className="checkout-acoes">
            <Link className="btn primario" to="/plano">
              {emTeste ? "Assinar um plano" : "Mudar de plano"}
            </Link>
            {!emTeste && !detalhe.cancelada_em && (
              <Link className="btn-texto" to="/assinatura/cancelar">
                Cancelar assinatura
              </Link>
            )}
          </div>

          {emTeste && (
            <p className="ajuda">
              Você está no plano de teste: {detalhe.carteira_max} reservas, sem
              cartão. Assinar libera a carteira cheia e a exportação.
            </p>
          )}
        </div>

        <div className="cartao-form">
          <h2 className="titulo-secao">Histórico de cobranças</h2>
          {faturas.length === 0 ? (
            <p className="vazio">Nenhuma cobrança ainda.</p>
          ) : (
            <Tabela>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th className="num">Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {faturas.map((f) => (
                    <tr key={f.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(f.pago_em ?? f.criado_em).toLocaleDateString("pt-BR")}
                      </td>
                      <td>
                        {f.url_comprovante ? (
                          <a href={f.url_comprovante} target="_blank" rel="noreferrer">
                            {f.descricao}
                          </a>
                        ) : (
                          f.descricao
                        )}
                      </td>
                      <td className="num">{reais(f.valor_centavos)}</td>
                      <td>
                        <span
                          className={
                            f.status === "paga" ? "etiqueta livre" : "etiqueta lotada"
                          }
                        >
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Tabela>
          )}
          <p className="ajuda">
            O comprovante é emitido pelo provedor de pagamento. Documento fiscal
            é assunto separado e ainda não está no ar.
          </p>
        </div>
      </div>
    </section>
  );
}
