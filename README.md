# Leads — vitrine do layout

Vitrine **estática** do front do [Motor de Reservas](https://github.com/romavitordev/local-business-scraper),
publicada no GitHub Pages. React + TypeScript + Vite, com React Router.

**No ar:** https://romavitordev.github.io/layout_leads/

> Só o front mora aqui. O produto completo tem backend em FastAPI —
> autenticação, motor de alocação, carteira, territórios e exportação —
> e vive no repositório acima.
>
> Como não há API, as telas que dependem de dado não completam. Um aviso
> fixo no rodapé diz isso ao visitante, para que a limitação seja lida
> como escolha e não como defeito.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## O que difere do front original

| | |
|---|---|
| `base` | `/layout_leads/` — o Pages de projeto serve em subcaminho |
| `basename` do router | vem do `BASE_URL`, senão a navegação cai fora do subcaminho |
| proxy `/api` | removido; não há backend para onde apontar |
| `404.html` | cópia do `index.html`, para link profundo não cair em 404 |

O `404.html` existe porque o GitHub Pages serve arquivo estático: sem
ele, abrir `/layout_leads/entrar` direto na barra de endereço devolve a
página de erro do Pages em vez do app.
