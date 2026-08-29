import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Contêiner de tabela que **empilha** em tela estreita em vez de rolar de lado.
 *
 * ## O problema
 *
 * A versão anterior era uma `div` com `overflow-x: auto` e
 * `table { min-width: 560px }`. Num celular de 375px isso significa uma barra
 * de rolagem horizontal dentro da página — e rolagem lateral é a pior forma de
 * mostrar tabela em telefone: metade das colunas fica escondida, o gesto
 * compete com o de rolar a página, e quem lê não tem como saber que existe mais
 * coisa à direita. Numa tabela de cobrança, a coluna escondida costuma ser
 * justamente o valor.
 *
 * Aqui, abaixo de 720px cada linha vira um bloco com pares `rótulo: valor`. Não
 * há largura mínima, então a tabela acompanha a tela — que é o comportamento
 * que se espera de qualquer outro conteúdo da página.
 *
 * ## Por que os rótulos são copiados por JavaScript
 *
 * O padrão consagrado para isto é `td::before { content: attr(data-rotulo) }`,
 * que exige um `data-rotulo` em **cada célula de cada tabela**. São 13 tabelas
 * no produto: seriam dezenas de rótulos repetidos, cada um deles uma segunda
 * cópia do texto que já está no `<th>` logo acima — e cópias divergem. Renomear
 * uma coluna e esquecer as células deixaria a tabela mentindo só no celular,
 * que é onde ninguém olha ao revisar.
 *
 * O `<thead>` já é a fonte da verdade. Este componente lê dali e carimba as
 * células, depois de cada renderização. É barato (dezenas de nós), roda em
 * `useLayoutEffect` para acontecer antes da pintura, e a tabela continua sendo
 * uma `<table>` de verdade — leitor de tela e busca do navegador seguem
 * funcionando.
 */
type Props = {
  children: ReactNode;
  /**
   * Mantém o formato de tabela mesmo no celular.
   *
   * Para as de duas colunas curtas — "plano / contas", "situação / total" —,
   * que já cabem em 375px. Empilhá-las trocaria duas colunas legíveis por duas
   * linhas com um rótulo repetido em cada uma: mais alto, mais verboso, e sem
   * ganho nenhum de legibilidade.
   */
  naoEmpilhar?: boolean;
  className?: string;
};

export default function Tabela({ children, naoEmpilhar = false, className }: Props) {
  const caixa = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (naoEmpilhar) return;
    const tabela = caixa.current?.querySelector("table");
    if (!tabela) return;

    const titulos = Array.from(tabela.querySelectorAll("thead th")).map(
      (th) => th.textContent?.trim() ?? "",
    );
    if (titulos.length === 0) return;

    for (const linha of tabela.querySelectorAll("tbody tr")) {
      Array.from(linha.children).forEach((celula, i) => {
        const rotulo = titulos[i];
        // Só carimba o que mudou: escrever um atributo idêntico de volta
        // invalidaria estilo à toa a cada renderização.
        if (rotulo && celula.getAttribute("data-rotulo") !== rotulo) {
          celula.setAttribute("data-rotulo", rotulo);
        }
      });
    }
    // Sem lista de dependências, de propósito: precisa rodar depois de QUALQUER
    // renderização, porque as linhas mudam quando os dados chegam da API — e
    // aí as células novas nasceriam sem rótulo.
  });

  return (
    <div
      ref={caixa}
      className={["tabela", naoEmpilhar ? "tabela-nao-empilha" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
