import { Balance, TokenId, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { NFTs } from "./modules/nfts";
import { MultiVickreyAuction } from "./modules/multiVickreyAuction";

export const modules = VanillaRuntimeModules.with({
  Balances,
  NFTs,
  MultiVickreyAuction,
});

export const config: ModulesConfig<typeof modules> = {
  Balances: {},
  NFTs: {},
  MultiVickreyAuction: {},
};

export default {
  modules,
  config,
};

export const BASE_TOKEN_ID = TokenId.from(0);

export * from "./modules/multiVickreyAuction";
export * from "./modules/nfts";
