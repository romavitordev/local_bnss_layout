/**
 * Aviso de que esta é a vitrine estática, sem backend.
 *
 * O produto real tem API em FastAPI: autenticação, carteira, territórios
 * e exportação. Aqui só existe o front, publicado no GitHub Pages — as
 * chamadas a `/api` batem em 404.
 *
 * Sem este aviso, quem tentasse entrar veria erro de rede e concluiria
 * que o produto está quebrado. Dizer que é vitrine é a diferença entre
 * uma limitação declarada e um defeito aparente.
 */
export default function AvisoDemo() {
  return (
    <div
      role="note"
      style={{
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: 9999,
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 1.5,
        color: '#cfe9df',
        background: 'rgba(10, 22, 19, .94)',
        borderTop: '1px solid rgba(120, 220, 180, .22)',
        backdropFilter: 'blur(8px)',
      }}
    >
      Vitrine estática do layout — o backend (API, login e carteira) não roda aqui.{' '}
      <a
        href="https://github.com/romavitordev/local-business-scraper"
        target="_blank"
        rel="noreferrer noopener"
        style={{ color: '#7fe3bb', textUnderlineOffset: 3 }}
      >
        Ver o projeto completo
      </a>
    </div>
  )
}
