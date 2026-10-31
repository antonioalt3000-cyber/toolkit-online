/**
 * Every WCAG success criterion, derived from the W3C Recommendations themselves
 * (WCAG 2.1 and WCAG 2.2) rather than retyped by hand.
 *
 * Why the COMPLETE list and not a selection: this table is the body of the VPAT
 * document a customer hands to a procurement office. That document declares
 * "Standard: WCAG <version> Level AA", and in a VPAT an omitted criterion does
 * not read as "not checked" - it reads as though the conformance target never
 * contained it.
 *
 * The earlier list held 53 criteria and, against a declared WCAG 2.1 Level AA
 * target of 50, omitted NINE of them - 1.2.3, 1.2.4, 1.3.3, 1.3.5, 1.4.13,
 * 2.1.4, 2.2.1, 2.3.1, 2.5.3 - while including 2.5.8, which exists only in
 * WCAG 2.2. Both halves are wrong in the same direction: the reader cannot tell
 * an unevaluated criterion from an absent one.
 *
 * `addedIn` and `obsoleteIn` carry the only two differences between the
 * versions: 2.2 introduces nine criteria and marks 4.1.1 Parsing obsolete and
 * removed. Read them through wcagCriteriaFor() - never filter by hand.
 */
export type WcagLevel = "A" | "AA" | "AAA";
export type WcagVersion = "2.1" | "2.2";
export type WcagPrinciple = "Perceivable" | "Operable" | "Understandable" | "Robust";

export interface WcagCriterion {
  name: string;
  level: WcagLevel;
  principle: WcagPrinciple;
  /** Set only on the nine criteria WCAG 2.2 introduced. */
  addedIn?: WcagVersion;
  /** Set only on 4.1.1 Parsing, obsolete and removed in WCAG 2.2. */
  obsoleteIn?: WcagVersion;
}

export const WCAG_CRITERIA: Record<string, WcagCriterion> = {
