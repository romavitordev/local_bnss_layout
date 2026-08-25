import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ErroApi, type Conta, type UsoDoPlano } from "../api/cliente";
import { MODELO_PADRAO, preencherModelo } from "../api/whatsapp";

/** Empresa fictícia só para o cliente ver como a mensagem fica antes de usar. */
const EXEMPLO = {
  id: 0,
  nome: "Padaria Estrela",
  telefone_exibicao: "(19) 99999-1234",
  cidade: "Campinas",
  uf: "SP",
  categoria: "padaria",
  vertical: "alimentacao",
  website: null,
  tem_site: false,
  nota: 4.2,
  qtd_avaliacoes: 87,
  tem_whatsapp: false,
  perfil_completo: false,
  primeira_vez_vista: new Date().toISOString(),
};

const VARIAVEIS = [
  { chave: "{nome}", descricao: "Nome da empresa" },
  { chave: "{cidade}", descricao: "Cidade da empresa" },
  { chave: "{categoria}", descricao: "Ramo da empresa" },
];

export default function Perfil() {
  const [conta, setConta] = useState<Conta | null>(null);
  const [uso, setUso] = useState<UsoDoPlano | null>(null);
  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [c, u] = await Promise.all([api.perfil(), api.usoDoPlano()]);
      setConta(c);
      setNome(c.nome);
      setModelo(c.modelo_mensagem ?? "");
      setUso(u);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar o perfil.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setAviso(null);
    setErro(null);
    try {
      const atualizada = await api.atualizarPerfil({
        nome,
        modelo_mensagem: modelo,
      });
      setConta(atualizada);
      setAviso("Perfil salvo.");
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const previa = preencherModelo(modelo.trim() || MODELO_PADRAO, EXEMPLO);

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>Perfil</h1>
          <p className="ajuda">Seus dados e a mensagem que abre no WhatsApp.</p>
        </div>
      </header>

      {erro && <p className="alerta erro">{erro}</p>}
      {aviso && <p className="alerta info">{aviso}</p>}

      <form onSubmit={salvar} className="cartao-form">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          required
          minLength={2}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label htmlFor="email">E-mail</label>
        <input id="email" value={conta?.email ?? ""} readOnly disabled />
        <span className="ajuda">
          O e-mail é a sua identificação de acesso e não pode ser alterado por aqui.
        </span>

        <label htmlFor="modelo">Mensagem do WhatsApp</label>
        <textarea
          id="modelo"
          rows={4}
          maxLength={1000}
          placeholder={MODELO_PADRAO}
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
        />
        <span className="ajuda">
          Deixe em branco para usar a mensagem padrão. Estas variáveis são trocadas
          pelos dados de cada empresa na hora de abrir a conversa:
        </span>

        <ul className="chips" style={{ marginTop: 8 }}>
          {VARIAVEIS.map((v) => (
            <li key={v.chave} className="chip-removivel" style={{ paddingRight: 14 }}>
              <code>{v.chave}</code>
              <em>{v.descricao}</em>
            </li>
          ))}
        </ul>

        <div className="previa">
          <span className="previa-rotulo">Prévia</span>
          <p>{previa}</p>
        </div>

        <button type="submit" className="btn primario" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </form>

      <h2 className="titulo-secao">Seu plano</h2>
      {uso && (
        <div className="indicadores">
          <article className="indicador">
            <span className="rotulo">Plano atual</span>
            <strong className="valor">{uso.plano_nome}</strong>
            <span className="nota">
              carteira de {uso.carteira_max.toLocaleString("pt-BR")}
            </span>
          </article>
          <article className="indicador">
            <span className="rotulo">Em uso</span>
            <strong className="valor">
              {uso.carteira_ocupada}
              <small> / {uso.carteira_max}</small>
            </strong>
            <span className="nota">empresas reservadas agora</span>
          </article>
          <article className="indicador">
            <span className="rotulo">Tipos de oferta</span>
            <strong className="valor">
              {uso.ofertas_contratadas}
              <small> / {uso.ofertas_incluidas}</small>
            </strong>
            <span className="nota">contratados / incluídos no plano</span>
          </article>
        </div>
      )}
      <p className="ajuda" style={{ marginTop: 14 }}>
        Precisa de mais carteira ou de outro tipo de oferta?{" "}
        <Link to="/plano">Ver planos</Link>.
      </p>
    </section>
  );
}
