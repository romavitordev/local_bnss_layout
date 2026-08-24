import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ErroApi, type Oferta, type Territorio } from "../api/cliente";

export default function Territorios() {
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [catalogo, setCatalogo] = useState<Oferta[]>([]);
  const [contratadas, setContratadas] = useState<Oferta[]>([]);
  const [cidade, setCidade] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [t, c, ct] = await Promise.all([
        api.territorios(),
        api.ofertas(),
        api.ofertasContratadas(),
      ]);
      setTerritorios(t);
      setCatalogo(c);
      setContratadas(ct);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function adicionar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setAviso(null);
    try {
      await api.adicionarTerritorio(cidade.trim());
      setCidade("");
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao adicionar a cidade.");
    }
  }

  async function remover(id: number) {
    try {
      await api.removerTerritorio(id);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao remover.");
    }
  }

  async function contratar(oferta: Oferta) {
    setErro(null);
    setAviso(null);
    try {
      await api.contratarOferta(oferta.id);
      setAviso(`Oferta "${oferta.nome}" contratada.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao contratar a oferta.");
    }
  }

  const contratadasIds = new Set(contratadas.map((o) => o.id));

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Territórios e ofertas</h1>
          <p className="ajuda">
            Cidade é filtro de seleção — adicionar não custa nada e não muda o preço. O que
            escala o plano é o tamanho da carteira.
          </p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      <h2 className="titulo-secao">Cidades</h2>
      <form className="linha-formulario" onSubmit={adicionar}>
        <input
          aria-label="Cidade"
          placeholder="Ex.: Campinas"
          required
          minLength={2}
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
        <button type="submit" className="btn primario">
          Adicionar
        </button>
      </form>

      {territorios.length === 0 ? (
        <p className="vazio">Nenhuma cidade ainda.</p>
      ) : (
        <ul className="chips">
          {territorios.map((t) => (
            <li key={t.id} className="chip-removivel">
              <span>{t.cidade}</span>
              {t.vertical && <em>{t.vertical}</em>}
              <button
                type="button"
                aria-label={`Remover ${t.cidade}`}
                onClick={() => remover(t.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="titulo-secao">Ofertas</h2>
      <p className="ajuda">
        Cada oferta é um tipo de proposta. A mesma empresa pode receber até duas ofertas
        diferentes — o que queima um lead é a repetição da mesma proposta, não o contato.
      </p>

      <div className="grade-ofertas">
        {catalogo.map((o) => {
          const contratada = contratadasIds.has(o.id);
          return (
            <article key={o.id} className={contratada ? "cartao-oferta ativa" : "cartao-oferta"}>
              <h3>{o.nome}</h3>
              <p>{o.descricao}</p>
              {contratada ? (
                <span className="etiqueta livre">Contratada</span>
              ) : (
                <button type="button" className="btn pequeno" onClick={() => contratar(o)}>
                  Contratar (+R$ 97/mês)
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
