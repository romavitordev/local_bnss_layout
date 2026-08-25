import { useCallback, useEffect, useState } from "react";
import { api, ErroApi, type Reserva } from "../api/cliente";
import { telefoneSeguro, urlSegura } from "../api/url";
import { linkWhatsapp } from "../api/whatsapp";

const RESULTADOS = [
  { valor: "negociando", rotulo: "Negociando", ajuda: "mantém o lead com você" },
  { valor: "contactado", rotulo: "Contactado", ajuda: "libera com cooldown" },
  { valor: "descartado", rotulo: "Descartar", ajuda: "libera com cooldown" },
  { valor: "fechado", rotulo: "Fechou!", ajuda: "sai da oferta em definitivo" },
];

const FILTROS = [
  { valor: "", rotulo: "Na carteira" },
  { valor: "ativa", rotulo: "A trabalhar" },
  { valor: "negociando", rotulo: "Negociando" },
  { valor: "contactado", rotulo: "Contactadas" },
  { valor: "fechado", rotulo: "Fechadas" },
];

function diasAte(iso: string | null): string {
  if (!iso) return "—";
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (dias < 0) return "vencida";
  return `${dias} d`;
}

export default function Carteira() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filtro, setFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupada, setOcupada] = useState<number | null>(null);
  // O modelo vem do perfil da conta; sem ele, o utilitario usa o padrao.
  const [modelo, setModelo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setReservas(await api.carteira({ status: filtro, q: busca }));
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar a carteira.");
    } finally {
      setCarregando(false);
    }
  }, [filtro, busca]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    api.perfil()
      .then((c) => setModelo(c.modelo_mensagem ?? null))
      .catch(() => setModelo(null));
  }, []);

  const [baixando, setBaixando] = useState(false);

  async function baixar(formato: "csv" | "xlsx") {
    setBaixando(true);
    try {
      await api.exportar(formato);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao exportar.");
    } finally {
      setBaixando(false);
    }
  }

  async function marcar(reserva: Reserva, resultado: string) {
    setOcupada(reserva.id);
    try {
      await api.registrarResultado(reserva.id, resultado);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao registrar o resultado.");
    } finally {
      setOcupada(null);
    }
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Carteira</h1>
          <p className="ajuda">
            Empresas reservadas só para você. Marque o resultado para liberar a vaga.
          </p>
        </div>
        <div className="lead-acoes">
          <button type="button" className="btn" disabled={baixando}
                  onClick={() => void baixar("xlsx")}>
            {baixando ? "Gerando…" : "Exportar Excel"}
          </button>
          <button type="button" className="btn" disabled={baixando}
                  onClick={() => void baixar("csv")}>
            CSV
          </button>
        </div>
      </header>

      <div className="filtros">
        {FILTROS.map((f) => (
          <button
            key={f.valor || "carteira"}
            type="button"
            className={filtro === f.valor ? "chip ativo" : "chip"}
            onClick={() => setFiltro(f.valor)}
          >
            {f.rotulo}
          </button>
        ))}
        <input
          className="busca"
          type="search"
          placeholder="Buscar por nome…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {erro && <p className="alerta erro">{erro}</p>}

      {carregando ? (
        <p className="vazio">Carregando…</p>
      ) : reservas.length === 0 ? (
        <p className="vazio">
          Nenhuma empresa aqui. Use <strong>Encher carteira</strong> no painel.
        </p>
      ) : (
        <ul className="lista-leads">
          {reservas.map((r) => (
            <li key={r.id} className="lead">
              <div className="lead-info">
                <div className="lead-titulo">
                  <strong>{r.empresa.nome}</strong>
                  <span className={`etiqueta st-${r.status}`}>{r.status}</span>
                </div>
                <div className="lead-meta">
                  {(() => {
                    const tel = telefoneSeguro(r.empresa.telefone_exibicao);
                    return tel ? (
                      <a href={tel} className="telefone">
                        {r.empresa.telefone_exibicao}
                      </a>
                    ) : (
                      <span className="telefone">{r.empresa.telefone_exibicao}</span>
                    );
                  })()}
                  {(() => {
                    // Abre a conversa com a mensagem ja escrita. O wa.me
                    // decide sozinho entre app e web conforme o dispositivo.
                    const zap = linkWhatsapp(r.empresa, modelo);
                    return zap ? (
                      <a
                        href={zap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="zap"
                        title="Abrir conversa no WhatsApp com a mensagem pronta"
                      >
                        WhatsApp
                      </a>
                    ) : null;
                  })()}
                  <span>
                    {r.empresa.cidade}/{r.empresa.uf}
                  </span>
                  <span>{r.empresa.categoria || r.empresa.vertical}</span>
                  <span className="oferta">{r.oferta.nome}</span>
                  {r.empresa.nota !== null && (
                    <span>
                      ★ {r.empresa.nota} ({r.empresa.qtd_avaliacoes})
                    </span>
                  )}
                  {/* O website vem do provedor externo: so vira href se o
                      esquema for http(s). "javascript:" aqui seria XSS. */}
                  {(() => {
                    const site = urlSegura(r.empresa.website);
                    return site ? (
                      <a href={site} target="_blank" rel="noopener noreferrer">
                        perfil
                      </a>
                    ) : null;
                  })()}
                  <span className="expira">expira em {diasAte(r.expira_em)}</span>
                </div>
              </div>

              <div className="lead-acoes">
                {RESULTADOS.map((acao) => (
                  <button
                    key={acao.valor}
                    type="button"
                    title={acao.ajuda}
                    className={`btn pequeno ${acao.valor === "fechado" ? "sucesso" : ""}`}
                    disabled={ocupada === r.id || r.status === acao.valor}
                    onClick={() => marcar(r, acao.valor)}
                  >
                    {acao.rotulo}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
