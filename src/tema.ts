/**
 * Tema claro e escuro.
 *
 * O CSS já tinha os três estados desde sempre — `:root` escuro,
 * `@media (prefers-color-scheme: light)` e `:root[data-theme="light"]` — mas
 * **ninguém escrevia o `data-theme`**. Na prática o tema seguia o sistema
 * operacional e não havia como mudá-lo dentro do produto. Era um atributo
 * lido por um seletor que nunca aparecia.
 *
 * ## Três estados, não dois
 *
 * `sistema` é o padrão, e não é a mesma coisa que "escuro". Quem nunca
 * escolheu deve acompanhar o aparelho: alguém com agendamento noturno no
 * celular espera que o site acompanhe. Um botão de dois estados forçaria uma
 * escolha permanente logo na primeira visita, e tirar essa escolha depois
 * exigiria limpar o armazenamento do navegador.
 *
 * ## Por que também existe um script no `index.html`
 *
 * Este módulo só roda depois de o JavaScript da aplicação carregar. Entre a
 * primeira pintura e esse instante, quem escolheu "claro" num sistema escuro vê
 * a tela piscar em preto — o clarão ao contrário, e ele aparece a cada
 * carregamento. O `index.html` aplica o atributo antes de qualquer pintura; as
 * duas cópias precisam usar a MESMA chave, que é a constante abaixo.
 */
export type Tema = "sistema" | "claro" | "escuro";

/** Compartilhada com o script do `index.html`. Mudar aqui exige mudar lá. */
export const CHAVE_TEMA = "leads:tema";

const TEMAS: Tema[] = ["sistema", "claro", "escuro"];

export function lerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CHAVE_TEMA);
    return TEMAS.includes(guardado as Tema) ? (guardado as Tema) : "sistema";
  } catch {
    // Modo privado de alguns navegadores lança ao tocar em `localStorage`.
    // Tema é preferência, não funcionalidade: cair no padrão é melhor do que
    // derrubar a aplicação por causa dele.
    return "sistema";
  }
}

export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement;
  if (tema === "sistema") {
    // Remover o atributo, e não escrever "sistema": é a AUSÊNCIA dele que
    // devolve a decisão para a media query. Um valor desconhecido ali faria os
    // seletores `[data-theme="light"]` e `[data-theme="dark"]` falharem os
    // dois, e o resultado seria sempre escuro.
    raiz.removeAttribute("data-theme");
  } else {
    raiz.setAttribute("data-theme", tema === "claro" ? "light" : "dark");
  }

  // Alinha o que o navegador desenha por conta própria — barra de rolagem,
  // seletor de data, campo de senha. Sem isto o formulário aparece claro
  // dentro de uma página escura, e parece defeito de renderização.
  raiz.style.colorScheme =
    tema === "sistema" ? "light dark" : tema === "claro" ? "light" : "dark";

  try {
    if (tema === "sistema") localStorage.removeItem(CHAVE_TEMA);
    else localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Ver acima: sem armazenamento, a escolha vale só para esta aba.
  }
}

/** O próximo do ciclo: sistema → claro → escuro → sistema. */
export function proximoTema(atual: Tema): Tema {
  return TEMAS[(TEMAS.indexOf(atual) + 1) % TEMAS.length];
}

export const ROTULO_TEMA: Record<Tema, string> = {
  sistema: "Tema do sistema",
  claro: "Tema claro",
  escuro: "Tema escuro",
};
