/**
 * Formatação de dinheiro, num lugar só.
 *
 * Estava duplicada em cada tela que mostrava preço, e as cópias já divergiam:
 * uma arredondava para real inteiro (`maximumFractionDigits: 0`), o que é
 * aceitável numa tabela de planos com valores redondos e passa a ser mentira
 * num proporcional — R$ 43,17 virava "R$ 43".
 *
 * Aqui os centavos sempre aparecem. Onde eles atrapalham a leitura, use
 * `reaisRedondo`, que é explícito sobre o que está escondendo.
 */
export function reais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Para tabelas de preço, onde os valores são redondos por construção. */
export function reaisRedondo(centavos: number): string {
  return centavos === 0
    ? "Grátis"
    : (centavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      });
}
