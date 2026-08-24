import { useCallback, useEffect, useState } from "react";
import {
  api, ErroApi, type ContaAdmin, type Metricas, type PressaoAdmin,
} from "../api/cliente";

function reais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function Admin() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [contas, setContas] = useState<ContaAdmin[]>([]);
  const [pressao, setPressao] = useState<PressaoAdmin[]>([]);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [m, c, p] = await Promise.all([
        api.adminMetricas(),
        api.adminContas(busca),
        api.adminPressao(),
      ]);
      setMetricas(m);
      setContas(c);
      setPressao(p);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar o painel.");
    }
  }, [busca]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Painel interno</h1>
          <p className="ajuda">
            Visão do sistema inteiro. É o único lugar onde os números absolutos do
            inventário aparecem — fora daqui, o cliente vê apenas percentual.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}

      {metricas && (
        <div className="indicadores">
          <article className="indicador">
            <span className="rotulo">MRR</span>
            <strong className="valor">{reais(metricas.mrr_centavos)}</strong>
            <span className="nota">assinaturas ativas</span>
          </article>
          <article className="indicador">
            <span className="rotulo">Contas</span>
            <strong className="valor">
              {metricas.contas_ativas_30d}
              <small> / {metricas.contas_total}</small>
            </strong>
            <span className="nota">ativas em 30 dias / total</span>
          </article>
          <article className="indicador">
            <span className="rotulo">Inventário</span>
            <strong className="valor">
              {metricas.empresas_inventario.toLocaleString("pt-BR")}
            </strong>
            <span className="nota">
              +{metricas.empresas_novas_30d.toLocaleString("pt-BR")} nos últimos 30 dias
            </span>
          </article>
          <article className="indicador">
            <span className="rotulo">Reservas vivas</span>
            <strong className="valor">
              {metricas.reservas_vivas.toLocaleString("pt-BR")}
            </strong>
            <span className="nota">segurando carteira</span>
          </article>
          <article className="indicador">
            <span className="rotulo">Trabalhados em 30 dias</span>
            <strong className="valor">
              {metricas.leads_trabalhados_30d.toLocaleString("pt-BR")}
            </strong>
            <span className="nota">leads liberados de volta</span>
          </article>
          <article className="indicador">
            <span className="rotulo">Fechados em 30 dias</span>
            <strong className="valor">{metricas.negocios_fechados_30d}</strong>
            <span className="nota">o número que prova o produto</span>
          </article>
        </div>
      )}

      <h2 className="titulo-secao">Contas</h2>
      <div className="filtros">
        <input
          className="busca"
          type="search"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ marginLeft: 0 }}
        />
      </div>

      {contas.length === 0 ? (
        <p className="vazio">Nenhuma conta encontrada.</p>
      ) : (
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Conta</th>
                <th>Plano</th>
                <th>Situação</th>
                <th className="num">Carteira</th>
                <th className="num">Territórios</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nome}</strong>
                    <br />
                    <span className="ajuda">{c.email}</span>
                    {c.papel === "admin" && <span className="etiqueta livre"> admin</span>}
                  </td>
                  <td>{c.plano ?? "—"}</td>
                  <td>
                    <span
                      className={
                        c.status_assinatura === "ativa" ? "etiqueta livre" : "etiqueta lotada"
                      }
                    >
                      {c.status_assinatura ?? "sem plano"}
                    </span>
                  </td>
                  <td className="num">
                    {c.carteira_ocupada.toLocaleString("pt-BR")} /{" "}
                    {c.carteira_max.toLocaleString("pt-BR")}
                  </td>
                  <td className="num">{c.territorios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="titulo-secao">Ocupação por cidade</h2>
      <p className="ajuda">
        Onde abrir vaga, onde o crawl precisa de reforço e onde a escassez já virou
        argumento de venda.
      </p>

      {pressao.length === 0 ? (
        <p className="vazio">Nenhuma cidade com inventário ainda.</p>
      ) : (
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Cidade</th>
                <th>Oferta</th>
                <th className="num">Inventário</th>
                <th className="num">Alocável (70%)</th>
                <th className="num">Alocado</th>
                <th className="num">Ocupação</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {pressao.map((p) => (
                <tr key={`${p.cidade}-${p.oferta_id}`}>
                  <td>{p.cidade}</td>
                  <td>{p.oferta}</td>
                  <td className="num">{p.total.toLocaleString("pt-BR")}</td>
                  <td className="num">{p.alocavel.toLocaleString("pt-BR")}</td>
                  <td className="num">{p.alocado.toLocaleString("pt-BR")}</td>
                  <td className="num">{p.ocupacao_pct}%</td>
                  <td>
                    <span className={p.lotada ? "etiqueta lotada" : "etiqueta livre"}>
                      {p.lotada ? "Lotada" : "Com espaço"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
