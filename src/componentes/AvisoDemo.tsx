/**
 * Aviso de que esta é a vitrine estática, sem backend.
 *
 * O produto real tem API em FastAPI: autenticação, carteira, territórios
 * e exportação. Este repositório publica só a página pública, no GitHub
 * Pages — as telas do aplicativo não estão aqui, porque sem backend elas
 * seriam telas mortas.
 *
 * Sem este aviso, quem procurasse o login concluiria que falta metade do
 * produto. Dizer que é vitrine é a diferença entre um recorte declarado e
 * uma ausência que parece descuido.
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
      Vitrine do layout — só a página pública. Login, carteira e painel vivem no produto completo.{' '}
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
