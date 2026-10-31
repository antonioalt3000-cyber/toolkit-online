};

/** Numeric order, so a future "2.10" cannot sort before "2.2" as a string would. */
const WCAG_VERSION_ORDER: Record<WcagVersion, number> = { "2.1": 1, "2.2": 2 };

/**
 * The criteria belonging to one WCAG version, in specification order.
 *
 * A criterion added later is not in an earlier version, and one marked obsolete
 * is gone from that version onwards.
 */
export function wcagCriteriaFor(version: WcagVersion): [string, WcagCriterion][] {
  const target = WCAG_VERSION_ORDER[version];
  return Object.entries(WCAG_CRITERIA).filter(([, info]) => {
    if (info.addedIn && WCAG_VERSION_ORDER[info.addedIn] > target) return false;
    if (info.obsoleteIn && WCAG_VERSION_ORDER[info.obsoleteIn] <= target) return false;
    return true;
  });
}
