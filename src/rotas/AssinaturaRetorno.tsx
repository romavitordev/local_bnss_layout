import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ErroApi, type Pedido } from "../api/cliente";
import { reais } from "../api/dinheiro";

/**
 * Onde o cliente cai ao voltar do gateway.
 *
 * Esta tela existe por causa de uma corrida que, sem ela, quebra a confiança
 * no produto: **o redirecionamento chega antes do webhook.** O cliente clica
 * em "pagar", o gateway o devolve em menos de um segundo, e o evento assinado
 * que confirma o pagamento pode levar mais alguns. Se a tela dissesse "pronto"
 * na hora, mentiria; se dissesse "não pagou", mentiria pior.
 *
 * Então ela pergunta ao servidor pelo pedido, em laço, até ele sair de
 * `pendente`. O que ela nunca faz é aplicar o efeito — quem aplica é o
 * webhook. Aplicar aqui seria dar upgrade a quem digitar a URL à mão.
 */
const INTERVALO_MS = 1500;
const TENTATIVAS_MAX = 20; // ~30s antes de sugerir voltar depois

export default function AssinaturaRetorno() {
  const [params] = useSearchParams();
  const pedidoId = Number(params.get("pedido"));

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [tentativas, setTentativas] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const parar = useRef(false);

  useEffect(() => {
    if (!pedidoId) {
      setErro("Não sabemos qual pedido conferir.");
      return;
    }
    parar.current = false;
    let contador = 0;

    async function consultar() {
      if (parar.current) return;
      try {
        const atual = await api.verPedido(pedidoId);
        if (parar.current) return;
        setPedido(atual);
        if (atual.status !== "pendente") return; // resolvido: para o laço
      } catch (e) {
        if (parar.current) return;
        setErro(e instanceof ErroApi ? e.message : "Falha ao consultar o pedido.");
        return;
      }
      contador += 1;
      setTentativas(contador);
      if (contador < TENTATIVAS_MAX) {
        setTimeout(() => void consultar(), INTERVALO_MS);
      }
    }

    void consultar();
    // Sem isto, sair da página deixa o laço rodando contra um componente
    // desmontado — e cada `setState` depois disso é um aviso no console de
    // quem for depurar outra coisa.
    return () => {
      parar.current = true;
    };
  }, [pedidoId]);

  if (erro) {
    return (
      <section>
        <header className="cabecalho-pagina">
          <h1>Retorno do pagamento</h1>
        </header>
        <p className="alerta erro">{erro}</p>
        <Link className="btn" to="/assinatura">
          Ver minha assinatura
        </Link>
      </section>
    );
  }

  const status = pedido?.status ?? "pendente";
  const esgotou = status === "pendente" && tentativas >= TENTATIVAS_MAX;

  return (
    <section>
      <header className="cabecalho-pagina">
        <div>
          <h1>
            {status === "pago"
              ? "Pagamento confirmado"
              : status === "pendente"
                ? "Confirmando o pagamento…"
                : "Pagamento não concluído"}
          </h1>
          {pedido && (
            <p className="ajuda">
              {pedido.descricao} — {reais(pedido.valor_centavos)}
            </p>
          )}
        </div>
      </header>

      {status === "pago" && (
        <>
          <p className="alerta info">
            Tudo certo. A mudança já vale na sua conta.
          </p>
          <div className="checkout-acoes">
            <Link className="btn primario" to="/painel">
              Ir para o painel
            </Link>
            <Link className="btn" to="/assinatura">
              Ver a assinatura
            </Link>
          </div>
        </>
      )}

      {status === "pendente" && !esgotou && (
        <p className="alerta info">
          Recebemos o retorno do pagamento e estamos aguardando a confirmação do
          provedor. Isso costuma levar alguns segundos — pode deixar esta página
          aberta.
        </p>
      )}

      {esgotou && (
        <>
          {/* O caso mais delicado: o dinheiro pode ter saído. Nunca dizer que
              falhou — dizer o que sabemos e o que fazer. */}
          <p className="alerta erro">
            A confirmação está demorando mais que o normal. Se a cobrança
            apareceu no seu cartão ou extrato, ela será processada assim que o
            provedor nos avisar, e nada precisa ser feito de novo.
          </p>
          <div className="checkout-acoes">
            <Link className="btn" to="/assinatura">
              Ver minha assinatura
            </Link>
          </div>
        </>
      )}

      {(status === "falhou" || status === "expirado" || status === "cancelado") && (
        <>
          <p className="alerta erro">
            {status === "falhou"
              ? "O pagamento foi recusado pelo provedor. Nada foi cobrado e sua conta continua como estava."
              : status === "expirado"
                ? "O prazo do pagamento venceu antes da confirmação. Nada foi cobrado."
                : "A compra foi cancelada. Nada foi cobrado."}
          </p>
          <div className="checkout-acoes">
            <Link className="btn primario" to="/plano">
              Tentar de novo
            </Link>
            <Link className="btn" to="/painel">
              Voltar ao painel
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
