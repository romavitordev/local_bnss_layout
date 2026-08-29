import { useEffect, useState } from "react";
import { api, ErroApi, type VisaoCobranca } from "../../api/cliente";
import { reais } from "../../api/dinheiro";
import Tabela from "../../componentes/Tabela";

/**
 * O dinheiro, do lado de dentro.
 *
 * Vale o mesmo princípio do resto do console: **quanto, nunca de quem** — com
 * uma exceção deliberada. A lista de cobranças recusadas identifica a conta,
 * porque sem saber quem contactar ela não serve para nada, e recuperar
 * pagamento recusado é a única razão de essa lista existir. Falha de cartão
 * costuma ser limite ou validade vencida, não desistência: é a receita mais
 * barata de recuperar que um SaaS tem.
 */
const ROTULOS: Record<string, string> = {
  teste: "em teste",
  ativa: "ativas",
  inadimplente: "inadimplentes",
  cancelada: "canceladas",
};

export default function Cobranca() {
  const [dados, setDados] = useState<VisaoCobranca | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setDados(await api.adminCobranca());
      } catch (e) {
        setErro(e instanceof ErroApi ? e.message : "Falha ao carregar.");
      }
    })();
  }, []);

  if (!dados) {
    return erro ? (
      <p className="alerta erro">{erro}</p>
    ) : (
      <div className="carregando">Carregando…</div>
    );
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Cobrança</h1>
          <p className="ajuda">
            Receita recorrente e o que precisa de ação. Os valores são estimados a
            partir dos planos ativos — a verdade contábil é o extrato do gateway.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}

      <div className="indicadores">
        <article className="indicador">
          <span className="rotulo">MRR</span>
          <span className="valor">{reais(dados.mrr)}</span>
          <span className="nota">receita recorrente mensal</span>
        </article>
        <article className="indicador">
          <span className="rotulo">ARR</span>
          <span className="valor">{reais(dados.arr)}</span>
          <span className="nota">MRR × 12</span>
        </article>
        <article className="indicador">
          <span className="rotulo">Pagantes</span>
          <span className="valor">{dados.pagantes}</span>
          <span className="nota">contas com plano pago ativo</span>
        </article>
        <article className="indicador">
          <span className="rotulo">Ticket médio</span>
          <span className="valor">{reais(dados.ticket_medio)}</span>
          <span className="nota">por conta pagante</span>
        </article>
        <article className="indicador">
          <span className="rotulo">Recebido (30d)</span>
          <span className="valor">{reais(dados.recebido_30d)}</span>
          <span className="nota">faturas pagas no período</span>
        </article>
        <article className="indicador">
          <span className="rotulo">Cancelamentos (30d)</span>
          <span className="valor">{dados.cancelamentos_30d}</span>
          <span className="nota">assinaturas encerradas</span>
        </article>
      </div>

      {dados.falhas.length > 0 && (
        <>
          <h2 className="titulo-secao">Cobranças recusadas — a recuperar</h2>
          <div className="alerta erro">
            {dados.falhas.length} cobrança(s) não passaram nos últimos 30 dias.
            Cartão vencido e limite estourado são a maioria e se resolvem com um
            contato.
          </div>
          <Tabela>
            <table>
              <thead>
                <tr>
                  <th>Conta</th>
                  <th>Cobrança</th>
                  <th className="num">Valor</th>
                  <th>Quando</th>
                </tr>
              </thead>
              <tbody>
                {dados.falhas.map((f, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{f.nome}</strong>
                      <br />
                      <span className="ajuda">{f.email}</span>
                    </td>
                    <td>{f.descricao}</td>
                    <td className="num">{reais(f.valor_centavos)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(f.quando).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tabela>
        </>
      )}

      <div className="duas-colunas">
        <div className="cartao-form">
          <h2 className="titulo-secao">Receita por plano</h2>
          {dados.por_plano.length === 0 ? (
            <p className="vazio">Nenhum plano pago ativo ainda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Plano</th>
                  <th className="num">Contas</th>
                  <th className="num">MRR</th>
                </tr>
              </thead>
              <tbody>
                {dados.por_plano.map((p) => (
                  <tr key={p.nome}>
                    <td>{p.nome}</td>
                    <td className="num">{p.contas}</td>
                    <td className="num">{reais(p.mrr)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Ofertas adicionais</th>
                  <th className="num">—</th>
                  <th className="num">{reais(dados.mrr_ofertas_extras)}</th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="cartao-form">
          <h2 className="titulo-secao">Contas por situação</h2>
          <dl className="cobranca-dados">
            {Object.entries(dados.contas_por_status).map(([status, total]) => (
              <div key={status}>
                <dt>{ROTULOS[status] ?? status}</dt>
                <dd>
                  <strong>{total}</strong>
                </dd>
              </div>
            ))}
          </dl>
          <p className="ajuda">
            Contas em teste ainda não pagam e não entram no MRR. A conversão
            delas é o número que mais move a receita no começo.
          </p>
        </div>
      </div>
    </section>
  );
}
