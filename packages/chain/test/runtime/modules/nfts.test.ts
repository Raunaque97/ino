import { TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, UInt32 } from "o1js";
import { NFTs } from "../../../src/runtime/modules/nfts";
import { log } from "@proto-kit/common";
import { UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("nfts", () => {
  let appChain = TestingAppChain.fromRuntime({
    NFTs,
  });
  let nfts: NFTs;
  let alicePrivateKey: PrivateKey;
  let alice: any;
  let bobPrivateKey: PrivateKey;
  let bob: any;
  let minterPrivateKey: PrivateKey;
  let minter: any;

  beforeEach(async () => {
    appChain.configurePartial({
      Runtime: {
        Balances: {},
        NFTs: {},
      },
    });

    await appChain.start();

    alicePrivateKey = PrivateKey.random();
    alice = alicePrivateKey.toPublicKey();
    bobPrivateKey = PrivateKey.random();
    bob = bobPrivateKey.toPublicKey();
    minterPrivateKey = PrivateKey.random();
    minter = minterPrivateKey.toPublicKey();

    nfts = appChain.runtime.resolve("NFTs");
  });

  async function mintNFT(owner: any, id: UInt64) {
    appChain.setSigner(minterPrivateKey);
    const tx = await appChain.transaction(minter, async () => {
      await nfts.mintSigned(owner, id);
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    return {
      collection: minter,
      id,
    };
  }

  it("should able to mint & transfer", async () => {
    const nftKey = await mintNFT(alice, UInt64.from(1));

    // Check NFT ownership
    const nft = await appChain.query.runtime.NFTs.nftRecords.get(nftKey);
    expect(nft?.owner.toBase58()).toBe(alice.toBase58());

    // Transfer NFT
    appChain.setSigner(alicePrivateKey);
    const tx2 = await appChain.transaction(alice, async () => {
      await nfts.transferSigned(bob, nftKey);
    });
    await tx2.sign();
    await tx2.send();

    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // Verify new ownership
    const transferredNft =
      await appChain.query.runtime.NFTs.nftRecords.get(nftKey);
    expect(transferredNft?.owner.toBase58()).toBe(bob.toBase58());
  }, 1_000_000);

  it("should not be able to transfer if not owner", async () => {
    const nftKey = await mintNFT(alice, UInt64.from(1234));

    appChain.setSigner(bobPrivateKey);
    const tx = await appChain.transaction(bob, async () => {
      await nfts.transferSigned(bob, nftKey);
    });
    await tx.sign();
    await tx.send();

    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toBe("Not owner of NFT");
  });
});
