import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Build estático para o GitHub Pages.
 *
 * Difere do front original em dois pontos, e os dois vêm de onde ele vai
 * morar — um subcaminho, sem servidor:
 *
 *   `base`   o Pages de projeto serve em /local_bnss_layout. Sem isso o HTML
 *            pede /assets/... na raiz e a página sobe sem CSS nem JS.
 *
 *   sem proxy  não há backend aqui. O `/api` do original apontava pro
 *              FastAPI local; nesta cópia ele não existe, e as telas que
 *              dependem de dado avisam em vez de tentar.
 */
export default defineConfig({
  plugins: [react()],
  base: '/local_bnss_layout/',
  build: { outDir: 'dist' },
})
