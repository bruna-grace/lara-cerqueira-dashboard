/**
 * Worker do dashboard da Lara Cerqueira.
 *
 *  - Serve o dashboard (public/index.html, static assets)
 *  - GET /api/aba?planilha=metricas&aba=Instagram → a `table` do gviz daquela aba
 *
 * O navegador NUNCA fala com o Google — só o Worker (ver google.js). Os IDs das
 * planilhas não aparecem no HTML e, com o segredo GOOGLE_SA_JSON (conta de
 * serviço com acesso de LEITOR), as planilhas podem ficar privadas.
 * Sem o segredo, lê pelo link público, como o GitHub Pages fazia.
 *
 * A escrita continua com a collect_weekly.py (OAuth da Bruna), fora daqui.
 */

import { consultarPlanilha } from './google.js';

/* Só estas abas são servidas — nada de ler aba arbitrária pela URL */
const PLANILHAS = {
  metricas: {
    id:   '1CFAtdLYQOw6ANV3ivIvEsZfcHhztPQ0-XBr3jIfl700',
    abas: ['Instagram', 'Facebook', 'Destaques', 'Impulsionar'],
  },
  lancamentos: {
    id:   '1Jhgi6-V1gbA_r5mKtMEn1rqxKOlia7_6',
    abas: ['Lançamentos'],
  },
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === '/api/aba' && req.method === 'GET') {
      const p   = PLANILHAS[url.searchParams.get('planilha') || 'metricas'];
      const aba = url.searchParams.get('aba');
      if (!p || !p.abas.includes(aba)) return json({ erro: 'aba não permitida' }, 400);
      try {
        const table = await consultarPlanilha(env, { planilha: p.id, aba });
        return json({ table });
      } catch (e) {
        return json({ erro: e.message }, 502);
      }
    }

    return env.ASSETS.fetch(req);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
