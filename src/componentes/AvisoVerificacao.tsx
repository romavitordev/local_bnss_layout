import { useState } from "react";
import { api, ErroApi } from "../api/cliente";
import { useAuth } from "../contexto/Auth";

/**
 * Aviso de e-mail pendente.
 *
 * Fica no topo do painel, e não numa tela bloqueante, porque a confirmação só
 * trava a **alocação** — o resto do produto funciona. Uma barreira de tela
 * cheia impediria a pessoa de configurar território e escolher oferta
 * enquanto o e-mail não chega, que é justamente o trabalho que ela pode
 * adiantar nesse meio-tempo.
 *
 * Diz por que a confirmação existe. "Confirme seu e-mail" sem motivo lê como
 * burocracia; explicar que cada reserva tira um contato do alcance dos outros
 * transforma a exigência em algo que o próprio cliente quer que exista, já
 * que é ela que protege a exclusividade dele.
 */
export default function AvisoVerificacao() {
  const { conta } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (!conta || conta.email_verificado) return null;

  async function reenviar() {
    setEnviando(true);
    setErro(null);
    setAviso(null);
    try {
      const r = await api.reenviarVerificacao();
      setAviso(
        `Link novo enviado para ${r.enviado_para}. Ele vale por ${r.validade_horas} horas.`,
      );
    } catch (e) {
      setErro(
        e instanceof ErroApi
          ? e.status === 429
            ? "Você já pediu vários links agora há pouco. Espere alguns minutos."
            : e.message
          : "Não foi possível reenviar.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="alerta erro aviso-verificacao">
      <div>
        <strong>Confirme seu e-mail para reservar empresas.</strong> Enviamos um
        link para <code>{conta.email}</code>. Cada reserva tira um contato do
        alcance dos outros clientes — é essa confirmação que impede contas
        descartáveis de trancarem inventário.
        {aviso && <div className="ajuda">{aviso}</div>}
        {erro && <div className="ajuda">{erro}</div>}
      </div>
      <button
        type="button"
        className="btn pequeno"
        disabled={enviando}
        onClick={() => void reenviar()}
      >
        {enviando ? "Enviando…" : "Reenviar link"}
      </button>
    </div>
  );
}
