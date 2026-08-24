/**
 * Aviso de que esta é a vitrine do layout, sem backend.
 *
 * O produto real tem API em FastAPI: autenticação de verdade, motor de
 * alocação, carteira, territórios e exportação. Aqui as telas são as
 * mesmas, mas alimentadas por dados de exemplo que vivem no navegador —
 * o login aceita qualquer credencial e nada é gravado.
 *
 * Sem este aviso, quem entrasse com um e-mail inventado e visse a carteira
 * cheia concluiria uma de duas coisas erradas: que o sistema é inseguro,
 * ou que aqueles são dados de clientes reais. Dizer que é vitrine separa
 * a amostra do produto.
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
      Vitrine do layout — dados de exemplo, sem backend. O login aceita qualquer
      credencial.{' '}
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
