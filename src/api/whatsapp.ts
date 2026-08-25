/**
 * Montagem do link de WhatsApp.
 *
 * `wa.me` decide sozinho entre app e web conforme o dispositivo, o que é o
 * comportamento certo: no celular abre o aplicativo, no desktop abre o
 * WhatsApp Web. Forçar `web.whatsapp.com` quebraria o uso no celular, que é
 * onde a prospecção acontece de verdade.
 */

import type { Empresa } from "./cliente";

export const MODELO_PADRAO =
  "Olá! Vi que a {nome} não tem site próprio. " +
  "Trabalho com criação de sites para negócios em {cidade} e queria te " +
  "mostrar rapidinho como ficaria. Posso mandar um exemplo?";

/** Só dígitos, com o 55 do país na frente — formato exigido pelo wa.me. */
export function numeroInternacional(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  // Se já vier com o país, não duplica. Números brasileiros têm 10 ou 11
  // dígitos; com o 55 na frente, 12 ou 13.
  if (digitos.length >= 12 && digitos.startsWith("55")) return digitos;
  return `55${digitos}`;
}

export function preencherModelo(modelo: string, empresa: Empresa): string {
  return modelo
    .replaceAll("{nome}", empresa.nome)
    .replaceAll("{cidade}", empresa.cidade)
    .replaceAll("{categoria}", empresa.categoria || empresa.vertical);
}

/** Link pronto, ou null se o telefone não servir para WhatsApp. */
export function linkWhatsapp(empresa: Empresa, modelo?: string | null): string | null {
  const numero = numeroInternacional(empresa.telefone_exibicao);
  if (!numero) return null;

  const texto = preencherModelo(modelo || MODELO_PADRAO, empresa);
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
