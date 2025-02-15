import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Client, useClientStore } from "./client";
import { PendingTransaction } from "@proto-kit/sequencer";
import { Balance, UInt64 } from "@proto-kit/library";
import { PublicKey } from "o1js";
import { mockAuctions } from "./mock";
import { useWalletStore } from "./wallet";

export type AuctionData = {
  creator: string;
  biddingEndTime: number;
  nftCount: number;
  startTime: number;
  cutOffPointer: number;
};
export interface AuctionState {
  loading: boolean;
  auctions: {
    [collection: string]: AuctionData;
  };
  loadAuction: (client: Client, collection: string) => Promise<void>;
  startAuction: (
    client: Client,
    collection: string,
    duration: number,
    nftCount: number,
  ) => Promise<PendingTransaction>;
  placeBid: (
    client: Client,
    collection: string,
    bid: number,
  ) => Promise<PendingTransaction>;
  claimNFT: (client: Client, collection: string) => Promise<PendingTransaction>;
}

export const useAuctionStore = create<AuctionState, [["zustand/immer", never]]>(
  immer((set) => ({
    loading: false,
    auctions: mockAuctions,

    async loadAuction(client: Client, collection: string) {
      set((state) => {
        state.loading = true;
      });

      const auction =
        await client.query.runtime.MultiVickreyAuction.records.get(
          PublicKey.fromBase58(collection),
        );

      set((state) => {
        state.loading = false;
        if (auction) {
          state.auctions[collection] = {
            creator: auction.creator.toBase58(),
            biddingEndTime: Number(auction.biddingEndTime.toBigInt()),
            startTime: Number(auction.startTime.toBigInt()),
            nftCount: Number(auction.nftCount.toBigInt()),
            cutOffPointer: Number(auction.cutOffPointer.toBigInt()),
          };
        }
      });
    },

    async startAuction(
      client: Client,
      collection: string,
      duration: number,
      nftCount: number,
    ) {
      const auction = client.runtime.resolve("MultiVickreyAuction");
      const collectionPubKey = PublicKey.fromBase58(collection);

      const tx = await client.transaction(collectionPubKey, async () => {
        await auction.startAuction(
          collectionPubKey,
          UInt64.from(duration),
          UInt64.from(nftCount),
        );
      });

      await tx.sign();
      await tx.send();

      if (!(tx.transaction instanceof PendingTransaction)) {
        throw new Error("Transaction is not a PendingTransaction");
      }

      const wallet = useWalletStore();
      wallet.addPendingTransaction(tx.transaction as PendingTransaction);
      return tx.transaction;
    },

    async placeBid(client: Client, collection: string, bidAmount: number) {
      const auction = client.runtime.resolve("MultiVickreyAuction");
      const collectionPubKey = PublicKey.fromBase58(collection);

      const tx = await client.transaction(collectionPubKey, async () => {
        await auction.bid(collectionPubKey, Balance.from(bidAmount));
      });

      await tx.sign();
      await tx.send();

      if (!(tx.transaction instanceof PendingTransaction)) {
        throw new Error("Transaction is not a PendingTransaction");
      }

      const wallet = useWalletStore();
      wallet.addPendingTransaction(tx.transaction as PendingTransaction);
      return tx.transaction;
    },

    async claimNFT(client: Client, collection: string) {
      const auction = client.runtime.resolve("MultiVickreyAuction");
      const collectionPubKey = PublicKey.fromBase58(collection);

      const tx = await client.transaction(collectionPubKey, async () => {
        await auction.claimMint(collectionPubKey);
      });

      await tx.sign();
      await tx.send();

      if (!(tx.transaction instanceof PendingTransaction)) {
        throw new Error("Transaction is not a PendingTransaction");
      }
      const wallet = useWalletStore();
      wallet.addPendingTransaction(tx.transaction as PendingTransaction);
      return tx.transaction;
    },
  })),
);
