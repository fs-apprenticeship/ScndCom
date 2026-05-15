import { faker } from "@faker-js/faker";

import { defineAccountFactory } from "@/generated/fabbrica";

export const AccountFactory = defineAccountFactory({
  defaultData: async () => ({
    clerkUserId: `user_${faker.string.uuid()}`,
    id: faker.string.uuid(),
  }),
});
