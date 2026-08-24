# Leads — vitrine do layout

Vitrine **estática** do front do [Motor de Reservas](https://github.com/romavitordev/local-business-scraper),
publicada no GitHub Pages. React + TypeScript + Vite, com React Router.

**No ar:** https://romavitordev.github.io/local_bnss_layout/

> Todas as telas estão aqui — landing, login, cadastro, painel, carteira,
> territórios, pressão e o administrativo — mas rodando sobre dados de
> exemplo que vivem no navegador. O login aceita qualquer credencial e
> nada é gravado.
>
> O produto de verdade tem backend em FastAPI: autenticação, motor de
> alocação, cooldown, exportação e o crawl que alimenta o inventário. Ele
> vive no repositório acima.

## Rodar

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

## Como a vitrine difere do produto

A diferença inteira mora em **um arquivo**: `src/api/cliente.ts`.

No produto, ele fala HTTP com a API. Aqui expõe a mesma superfície —
mesmos tipos, mesmos métodos, mesmas promessas — servida de memória. Todo
o resto (`rotas/`, `componentes/`, `contexto/`) é idêntico ao original.

A escolha é essa de propósito. Se cada tela tivesse o próprio dado
chumbado, a vitrine viraria um fork que envelhece sozinho; com um ponto
único de divergência, dá para trazer melhorias do produto sem reconciliar
oito arquivos.

O estado é mutável enquanto a aba estiver aberta: alocar leads, marcar
resultado, contratar oferta e mexer em território mudam de verdade o que a
tela mostra. Uma vitrine onde nenhum botão responde não mostra o produto —
mostra um print.

| | |
|---|---|
| dados | em memória, determinísticos; 3.055 empresas em 5 cidades |
| login | aceita qualquer e-mail e senha; a conta demo é `admin`, para o painel interno ficar visível |
| exportar CSV | montado no navegador a partir da carteira |
| exportar XLSX | recusado com explicação — o arquivo real é montado pelo backend |
| `base` | `/local_bnss_layout/` — o Pages de projeto serve em subcaminho |
| `basename` do router | vem do `BASE_URL`, senão a navegação cai fora do subcaminho |
| proxy `/api` | removido; não há backend para onde apontar |
| `404.html` | cópia do `index.html`, para link profundo não cair em 404 |

O `404.html` existe porque o GitHub Pages serve arquivo estático: sem ele,
abrir `/local_bnss_layout/carteira` direto na barra de endereço devolve a
página de erro do Pages em vez da aplicação.

## Correções que valem voltar pro produto

Duas coisas encontradas aqui são defeitos do original, não da cópia:

- **Os cartões de preço não têm CSS.** `.plans`, `.plan`, `.hi`, `.nm` e
  `.pr` não existem na folha de estilo — conferido nos dois repositórios,
  onde o arquivo é idêntico. Sempre que a API devolve planos, a seção
  renderiza como texto empilhado. O estilo foi escrito aqui.
- **A tabela da landing rolava sem precisar.** Ela herdava
  `min-width: 560px` e `white-space: nowrap`, regras que existem para as
  tabelas largas do aplicativo. Numa tabela de três colunas curtas dentro
  de um container de 68ch, isso escondia a coluna da direita — que é
  justamente a conclusão do argumento.
