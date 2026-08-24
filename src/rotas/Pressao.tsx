import { useEffect, useState } from "react";
import { api, ErroApi, type Ocupacao } from "../api/cliente";

export default function Pressao() {
  const [dados, setDados] = useState<Ocupacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api
      .pressao()
      .then(setDados)
      .catch((e) =>
        setErro(e instanceof ErroApi ? e.message : "Falha ao carregar a ocupacao."),
      );
  }, []);

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Painel de pressao</h1>
          <p className="ajuda">
            Quanto de cada cidade ja esta tomado e quanto voce ainda consegue reservar.
            Nunca passamos de 70% alocado: os 30% restantes ficam livres para quem
            chegar depois.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}

      {dados.length === 0 ? (
        <p className="vazio">Nenhum territorio configurado ainda.</p>
      ) : (
        <div className="grade-pressao">
          {dados.map((o) => {
            const pctAlocavel = o.ocupacao_pct;
            return (
              <article key={`${o.cidade}-${o.oferta_id}`} className="cartao-pressao">
                <div className="cartao-pressao-topo">
                  <h3>{o.cidade}</h3>
                  <span className={o.lotada ? "etiqueta lotada" : "etiqueta livre"}>
                    {o.lotada ? "Lotada" : "Com espaco"}
                  </span>
                </div>

                <div className="barra" role="presentation">
                  <div
                    className={o.lotada ? "barra-preenchida cheia" : "barra-preenchida"}
                    style={{ width: `${Math.min(100, pctAlocavel)}%` }}
                  />
                </div>

                <dl className="dados-pressao">
                  <div>
                    <dt>Ocupacao</dt>
                    <dd>{o.ocupacao_pct}%</dd>
                  </div>
                  <div>
                    <dt>Voce ainda pode pegar</dt>
                    <dd>{o.seu_espaco.toLocaleString("pt-BR")}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
