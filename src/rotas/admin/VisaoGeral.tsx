import { useCallback, useEffect, useState } from "react";
import Grafico from "../../componentes/Grafico";
import {
  api, ErroApi, type Distribuicao, type Metricas, type SaudeInventario,
  type Series,
} from "../../api/cliente";

function reais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

const PERIODOS = [
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

export default function VisaoGeral() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [distribuicao, setDistribuicao] = useState<Distribuicao | null>(null);
  const [saude, setSaude] = useState<SaudeInventario | null>(null);
  const [dias, setDias] = useState(30);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [m, s, d, i] = await Promise.all([
        api.adminMetricas(),
        api.series(dias),
        api.distribuicao(),
        api.saudeDoInventario(),
      ]);
      setMetricas(m);
      setSeries(s);
      setDistribuicao(d);
      setSaude(i);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar o console.");
    }
  }, [dias]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Visão geral</h1>
          <p className="ajuda">
            Como a plataforma está indo. Todos os números aqui são agregados — o
            console responde <em>quantos</em>, nunca <em>quem</em>.
          </p>
        </div>
        <div className="filtros" style={{ margin: 0 }}>
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              className={dias === p.dias ? "chip ativo" : "chip"}
              onClick={() => setDias(p.dias)}
            >
              {p.rotulo}
            </button>
          ))}
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
            <span className="rotulo">Reservas vivas</span>
            <strong className="valor">
              {metricas.reservas_vivas.toLocaleString("pt-BR")}
            </strong>
            <span className="nota">segurando carteira agora</span>
          </article>
          <article className="indicador">
            <span className="rotulo">Fechados em 30 dias</span>
            <strong className="valor">{metricas.negocios_fechados_30d}</strong>
            <span className="nota">o número que prova o produto</span>
          </article>
        </div>
      )}

      {series && (
        <>
          <h2 className="titulo-secao">Movimento</h2>
          <div className="graficos">
            <Grafico titulo="Contas novas" pontos={series.contas_novas} cor="#6d4aff" />
            <Grafico
              titulo="Interessados"
              pontos={series.interessados}
              cor="#2d8bff"
              nota="Capturados na landing, ainda sem conta."
            />
            <Grafico titulo="Reservas criadas" pontos={series.reservas_criadas} cor="#00d4c8" />
            <Grafico
              titulo="Leads trabalhados"
              pontos={series.leads_trabalhados}
              cor="#00d4c8"
              nota="Devolvidos ao pool depois do contato."
            />
            <Grafico titulo="Negócios fechados" pontos={series.negocios_fechados} cor="#a6ff4d" />
            <Grafico
              titulo="Empresas descobertas"
              pontos={series.empresas_descobertas}
              cor="#a6ff4d"
              nota="Entraram no inventário pelo crawl."
            />
          </div>
        </>
      )}

      {distribuicao && (
        <>
          <h2 className="titulo-secao">Distribuição</h2>
          <div className="duas-colunas">
            <div className="tabela-rolavel">
              <table>
                <caption>Contas por plano</caption>
                <thead>
                  <tr>
                    <th>Plano</th>
                    <th className="num">Contas</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuicao.planos.map((p) => (
                    <tr key={p.nome}>
                      <td>{p.nome}</td>
                      <td className="num">{p.contas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tabela-rolavel">
              <table>
                <caption>Reservas por situação</caption>
                <thead>
                  <tr>
                    <th>Situação</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuicao.reservas_por_status.map((r) => (
                    <tr key={r.status}>
                      <td>
                        <span className={`etiqueta st-${r.status}`}>{r.status}</span>
                      </td>
                      <td className="num">{r.total.toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="indicadores" style={{ marginTop: 16 }}>
            <article className="indicador">
              <span className="rotulo">Funil da landing</span>
              <strong className="valor">
                {distribuicao.funil.taxa}
                <small>%</small>
              </strong>
              <span className="nota">
                {distribuicao.funil.converteram} de {distribuicao.funil.interessados}{" "}
                interessados viraram conta
              </span>
            </article>

            {saude && (
              <>
                <article className="indicador">
                  <span className="rotulo">Inventário</span>
                  <strong className="valor">
                    {saude.empresas.toLocaleString("pt-BR")}
                  </strong>
                  <span className="nota">
                    {saude.reservadas.toLocaleString("pt-BR")} reservadas agora
                  </span>
                </article>
                <article className="indicador">
                  <span className="rotulo">Frescor</span>
                  <strong className="valor">
                    {saude.pct_desatualizado}
                    <small>%</small>
                  </strong>
                  <div className="barra" role="presentation">
                    <div
                      className={
                        saude.pct_desatualizado > 40
                          ? "barra-preenchida cheia"
                          : "barra-preenchida"
                      }
                      style={{ width: `${Math.min(100, saude.pct_desatualizado)}%` }}
                    />
                  </div>
                  <span className="nota">
                    não vistas há mais de 30 dias — número morto custa o tempo do
                    vendedor do cliente
                  </span>
                </article>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
