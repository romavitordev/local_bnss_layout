import type { PontoSerie } from "../api/cliente";

/**
 * Gráfico de área para série diária, em SVG inline.
 *
 * Sem biblioteca de gráfico: são seis séries de uma dimensão, e uma dependência
 * de 50 kB para desenhar seis polígonos não se paga. O que importa aqui é a
 * forma da curva — se está subindo, se caiu — não a leitura ponto a ponto, que
 * o rodapé já dá.
 */
type Props = {
  titulo: string;
  pontos: PontoSerie[];
  cor: string;
  nota?: string;
};

const LARGURA = 320;
const ALTURA = 74;

export default function Grafico({ titulo, pontos, cor, nota }: Props) {
  const valores = pontos.map((p) => p.valor);
  const total = valores.reduce((a, b) => a + b, 0);
  const maximo = Math.max(...valores, 1);

  // Escala pelo máximo da própria série. Comparar séries entre si exigiria
  // eixo comum, e aqui cada cartão responde uma pergunta separada.
  const coordenadas = pontos.map((p, i) => {
    const x = pontos.length > 1 ? (i / (pontos.length - 1)) * LARGURA : LARGURA / 2;
    const y = ALTURA - (p.valor / maximo) * (ALTURA - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linha = coordenadas.length ? `M${coordenadas.join(" L")}` : "";
  const area = coordenadas.length
    ? `${linha} L${LARGURA},${ALTURA} L0,${ALTURA} Z`
    : "";

  const ultimo = pontos.at(-1);
  const idIntervalo = `grad-${titulo.replace(/\W/g, "")}`;

  return (
    <article className="grafico">
      <header>
        <span className="grafico-titulo">{titulo}</span>
        <strong className="grafico-total">{total.toLocaleString("pt-BR")}</strong>
      </header>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${titulo}: ${total} no período, ${ultimo?.valor ?? 0} no último dia`}
      >
        <defs>
          <linearGradient id={idIntervalo} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={cor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#${idIntervalo})`} />}
        {linha && (
          <path d={linha} fill="none" stroke={cor} strokeWidth="1.6"
                strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      <footer>
        <span>{pontos.length} dias</span>
        <span>
          último dia: <b>{ultimo?.valor ?? 0}</b>
        </span>
      </footer>
      {nota && <p className="grafico-nota">{nota}</p>}
    </article>
  );
}
