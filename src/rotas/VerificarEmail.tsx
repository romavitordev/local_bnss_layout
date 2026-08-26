import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ErroApi } from "../api/cliente";
import { useAuth } from "../contexto/Auth";
import Marca from "../componentes/Marca";

/**
 * Onde o link do e-mail cai.
 *
 * Não é rota protegida de propósito: quem clica pode estar em outro aparelho,
 * ou sem sessão aberta. O token é a credencial — é para isso que ele é
 * aleatório de 32 bytes e guardado como hash no servidor.
 *
 * Confirma sozinha, ao montar. Uma tela que abre com um botão "confirmar"
 * pede à pessoa que repita um clique que ela já deu no e-mail, e a maioria
 * fecha a aba achando que já era.
 */
export default function VerificarEmail() {
  const [params] = useSearchParams();
  const { conta, recarregar } = useAuth();
  const [estado, setEstado] = useState<"confirmando" | "ok" | "erro">("confirmando");
  const [erro, setErro] = useState<string | null>(null);

  const token = params.get("token") ?? "";

  useEffect(() => {
    let cancelado = false;
    void (async () => {
      if (!token) {
        setErro("O link veio sem o código de confirmação.");
        setEstado("erro");
        return;
      }
      try {
        await api.verificarEmail(token);
        if (cancelado) return;
        // Atualiza a sessão aberta, se houver: sem isto o aviso de "confirme
        // seu e-mail" continuaria no painel até a próxima recarga.
        await recarregar().catch(() => undefined);
        setEstado("ok");
      } catch (e) {
        if (cancelado) return;
        setErro(e instanceof ErroApi ? e.message : "Não foi possível confirmar.");
        setEstado("erro");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token, recarregar]);

  return (
    <div className="tela-acesso">
      <div className="cartao-acesso">
        <Marca variante="acesso" />

        {estado === "confirmando" && <p className="carregando">Confirmando…</p>}

        {estado === "ok" && (
          <>
            <h1>E-mail confirmado</h1>
            <p className="alerta info">
              Pronto. Sua conta já pode reservar empresas.
            </p>
            <Link className="btn primario" to={conta ? "/painel" : "/entrar"}>
              {conta ? "Ir para o painel" : "Entrar"}
            </Link>
          </>
        )}

        {estado === "erro" && (
          <>
            <h1>Não deu para confirmar</h1>
            <p className="alerta erro">{erro}</p>
            <p className="ajuda">
              {conta
                ? "Peça um link novo pelo aviso no topo do painel."
                : "Entre na sua conta e peça um link novo pelo aviso no topo do painel."}
            </p>
            <Link className="btn" to={conta ? "/painel" : "/entrar"}>
              {conta ? "Ir para o painel" : "Entrar"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
