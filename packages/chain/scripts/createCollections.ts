import { Balance, BalancesKey, TokenId, UInt64 } from "@proto-kit/library";
import { client } from "../src/environments/client.config";
import { Field, PrivateKey, PublicKey } from "o1js";
import * as dotenv from "dotenv";

// running script from `root/packages/chain`
dotenv.config({ path: "./scripts/.env" });

client.configurePartial({
  GraphqlClient: {
    url: process.env.NEXT_PUBLIC_PROTOKIT_GRAPHQL_URL,
  },
});
await client.start();

/***************************
 * Create Collections
 ***************************/

const nfts = client.runtime.resolve("NFTs");

const collection1 = PrivateKey.fromBase58(
  process.env.COLLECTION_PVT_KEY_1 as string
);
const collection2 = PrivateKey.fromBase58(
  process.env.COLLECTION_PVT_KEY_2 as string
);

for (let collection of [collection1, collection2]) {
  let tx = await client.transaction(collection.toPublicKey(), async () => {
    await nfts.createCollection(Field(123));
  });
  tx.transaction = tx.transaction?.sign(collection);
  await tx.send();
  // sleep
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log(`created Collection ${collection.toPublicKey().toBase58()}`);
}
