/**
 * Tema claro e escuro.
 *
 * O CSS já tinha os estados desde sempre — `:root` escuro, uma media query
 * para o claro, e `:root[data-theme="light"]` para a escolha explícita — mas
 * **ninguém escrevia o `data-theme`**. Na prática o tema seguia o sistema
 * operacional e não havia como mudá-lo dentro do produto: um seletor esperando
 * por um valor que nunca chegava.
 *
 * ## Dois estados no botão, três situações no sistema
 *
 * O botão alterna entre **claro** e **escuro**, e só. Mas existe uma terceira
 * situação, que não é um estado do botão: **ninguém escolheu ainda.**
 *
 * Enquanto isso durar, nada é escrito no `data-theme` e a media query continua
 * decidindo — quem tem agendamento noturno no celular vê o site acompanhar. O
 * botão mostra o que está valendo naquele instante, então ele nunca mente; o
 * que ele não faz é gastar um clique oferecendo "voltar para o automático".
 *
 * A primeira vez que alguém clica, a escolha passa a valer e é guardada. Daí em
 * diante o sistema não manda mais — que é exatamente o que a pessoa pediu ao
 * clicar.
 */
export type Tema = "claro" | "escuro";

/** Compartilhada com o script do `index.html`. Mudar aqui exige mudar lá. */
export const CHAVE_TEMA = "leads:tema";

const TEMAS: Tema[] = ["claro", "escuro"];

/** O que o aparelho pede, para quando ainda não houve escolha. */
export function temaDoSistema(): Tema {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "escuro"
      : "claro";
  } catch {
    // `matchMedia` não existe em ambiente sem janela (renderização em teste).
    // O produto nasceu escuro; é o padrão certo para cair.
    return "escuro";
  }
}

/**
 * A escolha guardada, ou `null` se ninguém escolheu.
 *
 * `null` é diferente de "claro": é o que mantém a media query no comando.
 */
export function lerTema(): Tema | null {
  try {
    const guardado = localStorage.getItem(CHAVE_TEMA);
    return TEMAS.includes(guardado as Tema) ? (guardado as Tema) : null;
  } catch {
    // Modo privado de alguns navegadores lança ao tocar em `localStorage`.
    // Tema é preferência, não funcionalidade: cair no automático é melhor do
    // que derrubar a aplicação por causa dele.
    return null;
  }
}

/** Quanto dura o cruzamento entre os dois temas. Ver `suavizarTroca`. */
export const DURACAO_TROCA = 260;

/**
 * Liga as transições de cor por um instante, só durante a troca.
 *
 * A troca acontece porque um punhado de variáveis CSS muda de valor de uma vez,
 * e variável CSS não anima sozinha — o resultado é a página inteira pulando de
 * um tema para o outro num quadro só.
 *
 * A saída é uma classe temporária que declara transição de cor em tudo. Ela é
 * pesada de propósito e por isso **só existe durante o clique**: deixá-la
 * permanente faria cada abertura de menu e cada `:hover` arrastar cor, e —
 * pior — a primeira pintura da página animaria do branco para o tema, que é o
 * clarão que o script do `index.html` existe para evitar.
 *
 * Nada mais é animado: posição, tamanho e opacidade ficam de fora. Numa troca
 * de tema o que muda é cor; animar geometria junto produziria um solavanco em
 * vez de um cruzamento.
 */
function suavizarTroca(): void {
  const raiz = document.documentElement;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch {
    return;
  }
  raiz.classList.add("trocando-tema");
  window.setTimeout(() => raiz.classList.remove("trocando-tema"), DURACAO_TROCA);
}

/**
 * Aplica uma escolha explícita, ou devolve o comando ao sistema com `null`.
 *
 * `suave` é falso por padrão porque a montagem do componente também chama esta
 * função: animar ali faria a página entrar cruzando consigo mesma a cada
 * carregamento. Só o clique pede a suavização.
 */
export function aplicarTema(tema: Tema | null, suave = false): void {
  const raiz = document.documentElement;
  if (suave) suavizarTroca();

  if (tema === null) {
    // Remover o atributo, e não escrever um valor neutro: é a AUSÊNCIA dele
    // que devolve a decisão para a media query. Um valor desconhecido faria os
    // seletores `[data-theme="light"]` e `[data-theme="dark"]` falharem os
    // dois, e o resultado seria sempre escuro.
    raiz.removeAttribute("data-theme");
    raiz.style.colorScheme = "light dark";
    return;
  }

  raiz.setAttribute("data-theme", tema === "claro" ? "light" : "dark");
  // Alinha o que o navegador desenha por conta própria — barra de rolagem,
  // seletor de data, campo de senha. Sem isto o formulário aparece claro dentro
  // de uma página escura, e parece defeito de renderização.
  raiz.style.colorScheme = tema === "claro" ? "light" : "dark";
}

/** Grava a escolha. Só é chamada por um clique, nunca na montagem. */
export function guardarTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Sem armazenamento, a escolha vale só para esta aba.
  }
}

export const OPOSTO: Record<Tema, Tema> = { claro: "escuro", escuro: "claro" };

export const ROTULO_TEMA: Record<Tema, string> = {
  claro: "Tema claro",
  escuro: "Tema escuro",
};
