# Leads — vitrine do layout

Vitrine **estática** do front do [Motor de Reservas](https://github.com/romavitordev/local-business-scraper),
publicada no GitHub Pages. React + TypeScript + Vite, com React Router.

**No ar:** https://romavitordev.github.io/local_bnss_layout/

> Todas as telas estão aqui — landing, login, cadastro, painel, carteira,
> territórios, pressão, perfil, plano e as cinco do console interno — mas
> rodando sobre dados de exemplo que vivem no navegador. O login aceita
> qualquer credencial e nada é gravado.
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

## Dois painéis atrás do mesmo login

O papel da conta decide para onde o login leva, e são produtos diferentes:

- **`/painel` — cliente.** Onde o trabalho acontece: alocar leads, abrir o
  WhatsApp do contato, registrar resultado, gerir territórios, ver a
  pressão do inventário, escolher plano e ofertas.
- **`/admin` — console.** Onde a plataforma é operada: visão geral com
  séries, contas, saúde do inventário, os parâmetros do motor (R1–R6) e a
  lista de interessados.

O console mostra **quantos, nunca quem**. Nenhuma tela sua abre a carteira
de trabalho de um cliente, e no produto não existe rota que a entregue —
o console não precisa dela para operar, e conceder esse acesso criaria uma
superfície a justificar em cada auditoria.

A conta de exemplo da vitrine é `admin` justamente para que os dois lados
fiquem visitáveis. No produto, um cliente comum nunca chega ao console:
além do desvio no roteador, o papel é conferido no servidor a cada
requisição — o roteador aqui é conforto, não segurança.

Os parâmetros do motor são editáveis na vitrine e o valor persiste
enquanto a aba estiver aberta, com a mesma validação de faixa do produto.
O que não acontece é a consequência: no original, mexer em R2 muda a
próxima alocação de verdade.

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
| WhatsApp | o link `wa.me` é real e abre mesmo; o número é de exemplo |
| troca de plano | acontece de verdade e a carteira do painel muda junto |
| parâmetros do motor | editáveis e validados, mas sem alocação para afetar |
| `base` | `/local_bnss_layout/` — o Pages de projeto serve em subcaminho |
| `basename` do router | vem do `BASE_URL`, senão a navegação cai fora do subcaminho |
| proxy `/api` | removido; não há backend para onde apontar |
| `404.html` | cópia do `index.html`, para link profundo não cair em 404 |

O `404.html` existe porque o GitHub Pages serve arquivo estático: sem ele,
abrir `/local_bnss_layout/carteira` direto na barra de endereço devolve a
página de erro do Pages em vez da aplicação.

## Correções que nasceram aqui

Duas coisas encontradas nesta vitrine eram defeitos do original, não da
cópia. **As duas já voltaram para o produto** — ficam registradas porque
mostram para que serve manter a vitrine viva em vez de tirar prints:

- **Os cartões de preço não tinham CSS.** `.plans`, `.plan`, `.hi`, `.nm` e
  `.pr` não existiam na folha de estilo, então a seção de planos renderizava
  como texto empilhado sempre que a API respondia. O estilo foi escrito aqui
  e hoje está nos dois repositórios.
- **A tabela da landing rolava sem precisar.** Herdava `min-width: 560px` e
  `white-space: nowrap`, regras que existem para as tabelas largas do
  aplicativo; numa tabela de três colunas curtas isso escondia a coluna da
  direita — justamente a conclusão do argumento. A landing foi depois
  reescrita com folha própria (`landing.css`), sem herdar nada do app.
