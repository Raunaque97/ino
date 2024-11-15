import { Balance, TokenId, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";

export const modules = VanillaRuntimeModules.with({
  Balances,
});

export const config: ModulesConfig<typeof modules> = {
  Balances: {},
};

export default {
  modules,
  config,
};

export const BASE_TOKEN_ID = TokenId.from(0);
