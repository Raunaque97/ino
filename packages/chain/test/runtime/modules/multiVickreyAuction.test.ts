import "reflect-metadata";
import { TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, PublicKey } from "o1js";
import {
  DLLKey,
  MintMapKey,
  MultiVickreyAuction,
} from "../../../src/runtime/modules/multiVickreyAuction";
import { NFTs } from "../../../src/runtime/modules/nfts";
import { Balances } from "../../../src/runtime/modules/balances";
import { log } from "@proto-kit/common";
import runtime, { BASE_TOKEN_ID } from "../../../src/runtime";
import { Balance, UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("multiVickreyAuction", () => {
  let appChain = TestingAppChain.fromRuntime({
    MultiVickreyAuction,
    NFTs,
    Balances,
  });
  let auction: MultiVickreyAuction;
  let nfts: NFTs;
  let balances: Balances;

  let creatorPrivateKey: PrivateKey;
  let creator: PublicKey;
  let bidderPrivateKeys: PrivateKey[];
  let bidders: PublicKey[];
  let N = 2;

  beforeEach(async () => {
    appChain.configurePartial({
      Runtime: {
        MultiVickreyAuction: {},
        NFTs: {},
        Balances: {},
      },
    });

    await appChain.start();

    creatorPrivateKey = PrivateKey.random();
    creator = creatorPrivateKey.toPublicKey();
    bidderPrivateKeys = [
      PrivateKey.random(),
      PrivateKey.random(),
      PrivateKey.random(),
    ];
    bidders = bidderPrivateKeys.map((key) => key.toPublicKey());

    auction = appChain.runtime.resolve("MultiVickreyAuction");
    nfts = appChain.runtime.resolve("NFTs");
    balances = appChain.runtime.resolve("Balances");

    // Fund bidders
    appChain.setSigner(creatorPrivateKey);
    for (let i = 0; i < bidders.length; i++) {
      const tx = await appChain.transaction(creator, async () => {
        await balances.addBalance(
          BASE_TOKEN_ID,
          bidders[i],
          Balance.from(1000)
        );
      });
      await tx.sign();
      await tx.send();
      await appChain.produceBlock();
    }

    for (let i = 0; i < bidders.length; i++) {
      const balance = await appChain.query.runtime.Balances.balances.get({
        address: bidders[i],
        tokenId: BASE_TOKEN_ID,
      });
      console.log(
        `${bidders[i].toBase58()}: ${balance?.value.toBigInt().toString()}`
      );
    }

    // start auction
    const tx = await appChain.transaction(creator, async () => {
      await auction.startAuction(creator, UInt64.from(4), UInt64.from(N));
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
  });

  it(
    "should accept bids",
    async () => {
      const printSortedList = async () => {
        const auctionQueryModule = appChain.query.runtime.MultiVickreyAuction;
        const values = [];
        for (let i = 0; i < 5; i++) {
          const v = await auctionQueryModule.sortedListElements.get(
            new DLLKey({ collection: creator, index: UInt64.from(i) })
          );
          values.push({
            idx: i,
            bid: v?.bid.toBigInt(),
            next: v?.next.toBigInt(),
            prev: v?.prev.toBigInt(),
          });
        }
        console.log(values);
      };
      const actions = [
        { bid: 500, bidder: 0 },
        { bid: 600, bidder: 1 },
        { bid: 500, bidder: 2 },
      ];
      // place bid
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        appChain.setSigner(bidderPrivateKeys[action.bidder]);
        let tx = await appChain.transaction(
          bidders[action.bidder],
          async () => {
            await auction.bid(creator, UInt64.from(action.bid));
          }
        );
        await tx.sign();
        await tx.send();
        let block = await appChain.produceBlock();
        expect(
          block?.transactions[0].status.toBoolean(),
          `${i}: ` + block?.transactions[0].statusMessage
        ).toBe(true);
        // await printSortedList();
      }
      await printSortedList();

      // claim nfts
      for (let winner of [0, 1]) {
        appChain.setSigner(bidderPrivateKeys[winner]);
        console.log(`sender: ${bidders[winner].toBase58()}`);
        let tx = await appChain.transaction(bidders[winner], async () => {
          await auction.claimMint(creator);
        });
        await tx.sign();
        await tx.send();
        let block = await appChain.produceBlock();
        expect(
          block?.transactions[0].status.toBoolean(),
          block?.transactions[0].statusMessage
        ).toBe(true);
      }

      for (let i = 0; i < N; i++) {
        const nft = await appChain.query.runtime.NFTs.nftRecords.get({
          collection: creator,
          id: UInt64.from(i),
        });
        console.log(`nft owner: ${nft?.owner.toBase58()}`);
      }

      const auctionData =
        await appChain.query.runtime.MultiVickreyAuction.records.get(creator);
      // console.log(`nftCount: ${auctionData?.nftCount.toBigInt()}`);
      expect(auctionData?.nftCount.toBigInt()).toBe(0n);

      const bidderBalances: (Balance | undefined)[] = [];
      for (let i = 0; i < bidders.length; i++) {
        const balance = await appChain.query.runtime.Balances.balances.get({
          address: bidders[i],
          tokenId: BASE_TOKEN_ID,
        });
        bidderBalances.push(balance);
      }
      console.log(bidderBalances.map((b) => b?.value.toBigInt()));
    },
    10000 * 1000
  );
});
