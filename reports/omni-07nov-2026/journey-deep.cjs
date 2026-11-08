#!/usr/bin/env node
/**
 * journey-deep.cjs — rimando allo script vero, `A/journey-deep.cjs`.
 *
 *   node reports/omni-07nov-2026/journey-deep.cjs <slug>
 *
 * Perche' un rimando e non una copia (8 nov 2026): lo script del flusso A calcola
 * ogni percorso (lib.cjs, progress.cjs, evidence/) a partire dalla propria
 * cartella. Una copia qui un livello piu' su li sbagliava tutti: il 7 nov il
 * coordinatore l'aveva copiata e documentata come «da rilanciare cosi'», e al
 * primo uso vero si e' fermata a meta', dopo aver gia' coniato un coupon interno.
 * Una sola copia, nel posto per cui e' scritta.
 */
require('./A/journey-deep.cjs');
