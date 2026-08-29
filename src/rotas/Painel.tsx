import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ErroApi, type Ocupacao, type Uso } from "../api/cliente";
import Tabela from "../componentes/Tabela";

export default function Painel() {
  const [uso, setUso] = useState<Uso | null>(null);
  const [pressao, setPressao] = useState<Ocupacao[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [alocando, setAlocando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [u, p] = await Promise.all([api.uso(), api.pressao()]);
      setUso(u);
      setPressao(p);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar o painel.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function encherCarteira() {
    setAlocando(true);
    setAviso(null);
    try {
      const resultado = await api.alocar();
      // Carteira parcialmente cheia é resposta legítima — o motivo vira
      // mensagem ao usuário em vez de erro silencioso.
      if (resultado.criadas === 0) {
        setAviso(
          resultado.motivo_parcial
            ? `Nenhuma reserva nova: ${resultado.motivo_parcial}.`
            : "Nenhuma reserva nova disponível agora.",
        );
      } else {
        setAviso(
          `${resultado.criadas} empresa(s) reservada(s).` +
            (resultado.motivo_parcial ? ` Parou porque: ${resultado.motivo_parcial}.` : ""),
        );
      }
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao reservar.");
    } finally {
      setAlocando(false);
    }
  }

  const semTerritorio = pressao.length === 0;
  const pct = uso && uso.carteira_max > 0
    ? Math.round((uso.carteira_ocupada / uso.carteira_max) * 100)
    : 0;

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Painel</h1>
          <p className="ajuda">Quanto da sua carteira está em uso e onde há espaço.</p>
        </div>
        <button
          type="button"
          className="btn primario"
          onClick={encherCarteira}
          disabled={alocando || semTerritorio}
        >
          {alocando ? "Reservando…" : "Encher carteira"}
        </button>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      {semTerritorio && (
        <p className="alerta info">
          Você ainda não escolheu nenhuma cidade.{" "}
          <Link to="/territorios">Defina seu território</Link> para começar a receber empresas.
        </p>
      )}

      {uso && (
        <>
          <div className="indicadores">
            <article className="indicador">
              <span className="rotulo">Carteira em uso</span>
              <strong className="valor">
                {uso.carteira_ocupada}
                <small> / {uso.carteira_max}</small>
              </strong>
              <div className="barra" role="presentation">
                <div className="barra-preenchida" style={{ width: `${pct}%` }} />
              </div>
              <span className="nota">{pct}% da carteira</span>
            </article>

            <article className="indicador">
              <span className="rotulo">Vagas livres</span>
              <strong className="valor">{uso.carteira_livre}</strong>
              <span className="nota">prontas para reservar</span>
            </article>

            <article className="indicador">
              <span className="rotulo">Em negociação</span>
              <strong className="valor">{uso.em_negociacao}</strong>
              <span className="nota">não expiram nem voltam ao pool</span>
            </article>

            <article className="indicador">
              <span className="rotulo">Trabalhadas em 30 dias</span>
              <strong className="valor">{uso.trabalhadas_no_mes}</strong>
              <span className="nota">liberadas de volta ao inventário</span>
            </article>
          </div>

          <h2 className="titulo-secao">Seus territórios</h2>
          {pressao.length === 0 ? (
            <p className="vazio">Nenhum território configurado.</p>
          ) : (
            <Tabela>
              <table>
                <thead>
                  <tr>
                    <th>Cidade</th>
                    <th className="num">Você ainda pode pegar</th>
                    <th className="num">Ocupação</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {pressao.map((o) => (
                    <tr key={`${o.cidade}-${o.oferta_id}`}>
                      <td>{o.cidade}</td>
                      <td className="num">{o.seu_espaco.toLocaleString("pt-BR")}</td>
                      <td className="num">{o.ocupacao_pct}%</td>
                      <td>
                        <span className={o.lotada ? "etiqueta lotada" : "etiqueta livre"}>
                          {o.lotada ? "Lotada" : "Com espaço"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Tabela>
          )}
        </>
      )}
    </section>
  );
}
