/*
 * NOTE: the recommended setup for vitest-axe did not work as expected, so we
 * had to take the more manual approach below; see:
 * - https://github.com/chaance/vitest-axe?tab=readme-ov-file#setup
 *
 */
import type { AxeMatchers } from "vitest-axe/matchers";

import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);

// See https://github.com/chaance/vitest-axe?tab=readme-ov-file#with-typescript
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
