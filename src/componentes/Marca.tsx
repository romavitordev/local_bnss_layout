import { useEffect, useRef, useState } from "react";
import { MARCA } from "../marca";

/**
 * A marca.
 *
 * ## O desenho, e de onde ele vem
 *
 * Segue o tratamento do portfólio (`layout_portfoliorb`): **tipográfico e em
 * linha**, não empilhado. Nome em serifa, um único elemento em cor de acento,
 * e o descritor ao lado em mono maiúsculo com entreletra larga — não embaixo.
 *
 * A versão anterior empilhava nome sobre descritor e colocava um monograma
 * SVG na frente. Ficou ruim por três motivos que valem registrar:
 *
 * 1. **Empilhar num bloco de 26px de altura** espreme duas linhas de texto em
 *    espaço para uma. O descritor virava ruído cinza em vez de assinatura.
 * 2. **O monograma competia com o nome.** Dois elementos de peso visual
 *    parecido lado a lado não formam uma marca — formam dois logotipos.
 * 3. **Símbolo inventado ocupa o lugar do verdadeiro.** Enquanto não há
 *    logotipo, a tipografia sozinha parece decisão; um desenho provisório
 *    parece rascunho — e rascunho publicado vira definitivo por inércia.
 *
 * O ponto final em cor é o acento, no lugar do `&` ciano do portfólio: um
 * caractere só, que some quando o nome mudar sem deixar buraco no desenho.
 *
 * ## Quando houver logotipo
 *
 * `MARCA.logo` aponta para `public/logo.svg`. Assim que o arquivo existir, ele
 * entra no lugar do ponto — a checagem já está aqui. Trocar o logotipo é
 * substituir o arquivo, sem tocar em código.
 */
type Props = {
  /** `console` troca o descritor. `rodape` aumenta e mostra o filete. */
  variante?: "painel" | "console" | "landing" | "rodape" | "acesso";
  /** Sem isto o bloco é estático — usado nas telas de acesso. */
  aoClicar?: () => void;
  destino?: string;
};

export default function Marca({ variante = "painel", aoClicar, destino }: Props) {
  const descritor =
    variante === "console" ? MARCA.descritorConsole : MARCA.descritor;
  const noRodape = variante === "rodape";

  const conteudo = (
    <>
      <span className="marca-nome">
        {MARCA.nome}
        <Acento />
      </span>
      {/* O filete separa nome de descritor no rodapé, onde os dois ficam
          empilhados e sem ele encostariam. É o mesmo recurso do filete
          dourado do Marcelo Imóveis. */}
      {noRodape && <span className="marca-filete" aria-hidden="true" />}
      <span className="marca-sub">{descritor}</span>
    </>
  );

  const classe = `marca marca-${variante}`;

  if (!aoClicar) return <div className={classe}>{conteudo}</div>;

  return (
    <button
      type="button"
      className={`${classe} marca-botao`}
      onClick={aoClicar}
      // Diz o DESTINO, não o que é: quem navega por teclado precisa saber
      // para onde o link leva, e "Leads" sozinho não é destino.
      aria-label={destino ?? `${MARCA.nomeCompleto} — ir para o início`}
    >
      {conteudo}
    </button>
  );
}

/**
 * O acento da marca: um ponto em cor, ou o logotipo quando ele existir.
 *
 * A checagem do arquivo não pode ser só `onError` — a imagem pode falhar
 * antes de o React hidratar, e sobraria um buraco. Depois de montar,
 * conferimos pelo próprio elemento: carregada com largura zero é quebrada.
 */
function Acento() {
  const [semArquivo, setSemArquivo] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setSemArquivo(true);
  }, []);

  if (semArquivo) {
    return (
      <span className="marca-ponto" aria-hidden="true">
        .
      </span>
    );
  }

  return (
    <img
      ref={img}
      src={MARCA.logo}
      alt=""
      aria-hidden="true"
      className="marca-logo"
      onError={() => setSemArquivo(true)}
    />
  );
}
