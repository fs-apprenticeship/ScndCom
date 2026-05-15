import { fileURLToPath } from "node:url";

import getClient from "../src/lib/prisma/get-client";
import { baseFixture } from "./seed-fixtures/base";
import { seedAccounts } from "./seed-helpers/accounts";
import { maybeLoadModule } from "./seed-helpers/maybe-load-module";
import { type Fixture } from "./seed-helpers/types";

const prisma = getClient();

async function main() {
  await seedFromFixture(baseFixture);

  const localModule = await maybeLoadModule("./seed-fixtures/local.ts");
  const localFixture = localModule?.localFixture;

  if (localFixture) {
    await seedFromFixture(localFixture);
  }
}

async function seedFromFixture(fixture: Fixture) {
  if (fixture.accounts) {
    await seedAccounts(prisma, fixture.accounts);
  }

  if (fixture.afterSeed) {
    await fixture.afterSeed(prisma);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exitCode = 1;
    });
}
