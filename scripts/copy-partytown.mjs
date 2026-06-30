// Copies the Partytown library into public/partytown so the worker can be
// served same-origin. NOTE: the default Partytown path `/~partytown/` is NOT
// served by Next.js (public/ folders starting with `~` 404), so we use a
// tilde-free path and pass lib="/partytown/" to the <Partytown> component.
// Run automatically via the `prebuild` npm hook (and committed as a fallback).
// Uses the programmatic API because the package's `partytown copylib` bin has
// a broken self-require path.
import { copyLibFiles } from '@qwik.dev/partytown/utils';

await copyLibFiles('public/partytown');
console.log('[partytown] lib copied to public/partytown');
