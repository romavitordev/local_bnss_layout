import { useCallback, useEffect, useState } from "react";
import { api, ErroApi, type InteressadoAdmin } from "../../api/cliente";
import Tabela from "../../componentes/Tabela";

export default function Interessados() {
  const [lista, setLista] = useState<InteressadoAdmin[]>([]);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLista(await api.interessados());
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function excluir(registro: InteressadoAdmin) {
    // Irreversível de propósito: quem pede para sumir tem direito a sumir.
    // Por isso a confirmação explícita antes.
    if (!window.confirm(`Apagar ${registro.email} em definitivo?`)) return;
    setOcupado(registro.id);
    try {
      await api.excluirInteressado(registro.id);
      setAviso("Registro apagado.");
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao apagar.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Interessados</h1>
          <p className="ajuda">
            Capturados na landing, ainda sem conta. São dados pessoais: guarde só
            enquanto houver finalidade e apague a pedido do titular.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      {lista.length === 0 ? (
        <p className="vazio">Ninguém se cadastrou pela landing ainda.</p>
      ) : (
        <Tabela>
          <table>
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Cidade</th>
                <th>Origem</th>
                <th>Quando</th>
                <th>Situação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lista.map((i) => (
                <tr key={i.id}>
                  <td>{i.email}</td>
                  <td>{i.cidade_interesse ?? "—"}</td>
                  <td>
                    <code>{i.origem}</code>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(i.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    {i.virou_conta_em ? (
                      <span className="etiqueta livre">virou conta</span>
                    ) : i.descadastrado_em ? (
                      <span className="etiqueta lotada">descadastrado</span>
                    ) : (
                      <span className="etiqueta st-ativa">na lista</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn pequeno"
                      disabled={ocupado === i.id}
                      onClick={() => excluir(i)}
                      title="Direito de eliminação (LGPD art. 18)"
                    >
                      Apagar
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
