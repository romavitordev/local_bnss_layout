# Leads — vitrine do layout

Vitrine **estática** da página pública do [Motor de Reservas](https://github.com/romavitordev/local-business-scraper),
publicada no GitHub Pages. React + TypeScript + Vite, com React Router.

**No ar:** https://romavitordev.github.io/local_bnss_layout/

> Só a landing mora aqui. O produto completo tem backend em FastAPI —
> autenticação, motor de alocação, carteira, territórios e exportação — e
> vive no repositório acima.
>
> As telas do aplicativo (login, painel, carteira, territórios, pressão e
> admin) **não foram publicadas**: todas dependem da API, e num host
> estático virariam telas mortas — login que não entra, painel que não
> carrega. Mostrar tela quebrada é pior para o portfólio do que não
> mostrar. Um aviso fixo no rodapé diz ao visitante que o recorte é
> escolhido.

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

## O que difere do front original

| | |
|---|---|
| rotas | só `/` e o 404; as telas autenticadas ficaram fora |
| preços e cobertura | fixos no componente, copiados do `seed.py` do backend |
| formulário de interesse | confirma localmente e diz que nada é enviado |
| `base` | `/local_bnss_layout/` — o Pages de projeto serve em subcaminho |
| `basename` do router | vem do `BASE_URL`, senão a navegação cai fora do subcaminho |
| proxy `/api` | removido; não há backend para onde apontar |
| `404.html` | cópia do `index.html`, para link profundo não cair em 404 |

Os preços são fixos porque vinham de `/api/publico/planos`. Sem a API, a
seção cairia no estado vazio — e uma vitrine que esconde justamente a
tabela de preços não mostra o produto. Os valores são os reais do seed,
não números de enfeite.

O `404.html` existe porque o GitHub Pages serve arquivo estático: sem ele,
abrir qualquer caminho direto na barra de endereço devolve a página de erro
do Pages em vez da aplicação.
