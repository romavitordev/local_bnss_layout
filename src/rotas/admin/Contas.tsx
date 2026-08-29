import { useCallback, useEffect, useState } from "react";
import { api, ErroApi, type ContaAdmin, type Exclusao } from "../../api/cliente";
import Tabela from "../../componentes/Tabela";

/**
 * Gestão de contas.
 *
 * O que aparece aqui é dado de CONTA — nome, e-mail, plano, quanto usa. A
 * carteira de trabalho do cliente não aparece, e não existe rota que a
 * entregue: o console não precisa dela para operar, e conceder esse acesso
 * criaria uma superfície a justificar em cada auditoria.
 */
export default function Contas() {
  const [contas, setContas] = useState<ContaAdmin[]>([]);
  const [exclusoes, setExclusoes] = useState<Exclusao[]>([]);
  const [busca, setBusca] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([api.adminContas(busca), api.exclusoes()]);
      setContas(c);
      setExclusoes(e);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar as contas.");
    }
  }, [busca]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function alterarPapel(conta: ContaAdmin) {
    const novo = conta.papel === "admin" ? "usuario" : "admin";
    setOcupado(conta.id);
    setAviso(null);
    setErro(null);
    try {
      await api.alterarPapel(conta.id, novo);
      setAviso(`${conta.email} agora é ${novo}. As sessões abertas foram encerradas.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao alterar o papel.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Contas</h1>
          <p className="ajuda">
            Dados de conta e uso. A carteira de trabalho de cada cliente não aparece
            aqui — o console não precisa dela para operar.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      {exclusoes.length > 0 && (
        <div className="alerta erro">
          <strong>{exclusoes.length} pedido(s) de exclusão na fila.</strong> Honrar o
          pedido é obrigação legal, com prazo.
          <ul style={{ margin: "8px 0 0" }}>
            {exclusoes.map((e) => (
              <li key={e.id}>
                {e.email} — prazo {new Date(e.excluir_em).toLocaleDateString("pt-BR")}
                {e.vencida && <strong> (vencido)</strong>}
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <Tabela>
          <table>
            <thead>
              <tr>
                <th>Conta</th>
                <th>Plano</th>
                <th>Situação</th>
                <th className="num">Carteira</th>
                <th className="num">Territórios</th>
                <th>Papel</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nome}</strong>
                    <br />
                    <span className="ajuda">{c.email}</span>
                  </td>
                  <td>{c.plano ?? "—"}</td>
                  <td>
                    <span
                      className={
                        c.status_assinatura === "ativa"
                          ? "etiqueta livre"
                          : "etiqueta lotada"
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
                  <td>
                    <button
                      type="button"
                      className="btn pequeno"
                      disabled={ocupado === c.id}
                      onClick={() => alterarPapel(c)}
                      title={
                        c.papel === "admin"
                          ? "Rebaixar para usuário comum"
                          : "Promover a administrador"
                      }
                    >
                      {c.papel === "admin" ? "admin ▾" : "usuário ▾"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tabela>
      )}
    </section>
  );
}
