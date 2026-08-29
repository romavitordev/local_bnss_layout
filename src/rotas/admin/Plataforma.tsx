import { useCallback, useEffect, useState } from "react";
import {
  api, ErroApi, type EventoAuditoria, type Parametro,
} from "../../api/cliente";
import Tabela from "../../componentes/Tabela";

/**
 * Ajuste dos parâmetros do motor.
 *
 * Cada campo mostra a consequência de levar o valor ao extremo. Não é excesso
 * de zelo: mexer em R1 ou R2 não quebra nada na hora — a trava simplesmente
 * deixa de existir, e ninguém percebe até uma cidade estar monopolizada.
 */
export default function Plataforma() {
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [p, a] = await Promise.all([api.parametros(), api.auditoria(40)]);
      setParametros(p);
      setEventos(a);
      setRascunho(Object.fromEntries(p.map((x) => [x.chave, String(x.valor)])));
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvar(p: Parametro) {
    const valor = Number(rascunho[p.chave]);
    if (Number.isNaN(valor)) {
      setErro(`${p.rotulo}: informe um número.`);
      return;
    }
    setOcupado(p.chave);
    setAviso(null);
    setErro(null);
    try {
      await api.definirParametro(p.chave, valor);
      setAviso(`${p.rotulo} atualizado. Vale a partir da próxima alocação.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao salvar.");
    } finally {
      setOcupado(null);
    }
  }

  async function restaurar(p: Parametro) {
    setOcupado(p.chave);
    try {
      await api.restaurarParametro(p.chave);
      setAviso(`${p.rotulo} voltou ao padrão.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao restaurar.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Plataforma</h1>
          <p className="ajuda">
            Os parâmetros do motor de alocação. Valem na próxima alocação, sem deploy.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      <div className="alerta info">
        Estes números são <strong>chute fundamentado</strong> até termos clientes
        reais. É por isso que ficam aqui e não no código — mas mexer neles altera o
        comportamento de todas as contas ao mesmo tempo.
      </div>

      <div className="parametros">
        {parametros.map((p) => (
          <article key={p.chave} className="parametro">
            <div className="parametro-topo">
              <h3>{p.rotulo}</h3>
              {p.personalizado && <span className="etiqueta lotada">ajustado</span>}
            </div>
            <p className="parametro-descricao">{p.descricao}</p>

            <div className="parametro-controle">
              <input
                type="number"
                step={p.tipo === "percentual" ? "0.01" : "1"}
                min={p.minimo}
                max={p.maximo}
                value={rascunho[p.chave] ?? ""}
                onChange={(e) =>
                  setRascunho((r) => ({ ...r, [p.chave]: e.target.value }))
                }
                aria-label={p.rotulo}
              />
              <button
                type="button"
                className="btn primario pequeno"
                disabled={ocupado === p.chave || String(p.valor) === rascunho[p.chave]}
                onClick={() => salvar(p)}
              >
                Salvar
              </button>
              {p.personalizado && (
                <button
                  type="button"
                  className="btn pequeno"
                  disabled={ocupado === p.chave}
                  onClick={() => restaurar(p)}
                >
                  Restaurar
                </button>
              )}
            </div>

            <dl className="parametro-meta">
              <div>
                <dt>Faixa</dt>
                <dd>
                  {p.minimo} – {p.maximo}
                </dd>
              </div>
              <div>
                <dt>Padrão</dt>
                <dd>{p.padrao}</dd>
              </div>
            </dl>

            <p className="parametro-risco">
              <strong>No extremo:</strong> {p.consequencia}
            </p>
          </article>
        ))}
      </div>

      <h2 className="titulo-secao">Auditoria</h2>
      <p className="ajuda">
        Quem mexeu no quê. É o registro que responde por qualquer mudança de
        comportamento da plataforma.
      </p>

      {eventos.length === 0 ? (
        <p className="vazio">Nenhum evento registrado.</p>
      ) : (
        <Tabela>
          <table>
            <thead>
              <tr>
                <th>Quando</th>
                <th>Ação</th>
                <th>Detalhe</th>
                <th className="num">Conta</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(e.criado_em).toLocaleString("pt-BR")}
                  </td>
                  <td>
                    <code>{e.acao}</code>
                  </td>
                  <td>{e.detalhe || "—"}</td>
                  <td className="num">{e.conta_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tabela>
      )}
    </section>
  );
}
