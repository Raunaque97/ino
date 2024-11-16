import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Client, useClientStore } from "./client";
import { PendingTransaction } from "@proto-kit/sequencer";
import { PublicKey } from "o1js";
import { NFTKey, NFTEntity } from "chain";
import { UInt64 } from "@proto-kit/library";
import { mockNFTs } from "./mock";
export type NFTData = {
  owner: string;
  id: number;
};
export interface NFTState {
  loading: boolean;
  nfts: {
    [key: string]: NFTData;
  };
  loadNFTs: (client: Client, address: string) => Promise<void>;
  transfer: (
    client: Client,
    sender: string,
    to: string,
    nftKey: NFTKey,
  ) => Promise<PendingTransaction>;
}

export const useNFTStore = create<NFTState, [["zustand/immer", never]]>(
  immer((set) => ({
    loading: false,
    nfts: mockNFTs,

    async loadNFTs(client: Client, address: string) {
      set((state) => {
        state.loading = true;
      });

      const nfts = await client.query.runtime.NFTs.nftRecords.get(
        NFTKey.from(PublicKey.fromBase58(address), UInt64.from(0)),
      );

      set((state) => {
        state.loading = false;
        if (nfts) {
          state.nfts[address] = {
            owner: nfts.owner.toBase58(),
            id: Number(nfts.id.toBigInt()),
          };
        }
      });
    },

    async transfer(client: Client, sender: string, to: string, nftKey: NFTKey) {
      const nfts = client.runtime.resolve("NFTs");
      const senderPubKey = PublicKey.fromBase58(sender);
      const toPubKey = PublicKey.fromBase58(to);

      const tx = await client.transaction(senderPubKey, async () => {
        await nfts.transferSigned(toPubKey, nftKey);
      });

      await tx.sign();
      await tx.send();

      if (!(tx.transaction instanceof PendingTransaction)) {
        throw new Error("Transaction is not a PendingTransaction");
      }

      return tx.transaction;
    },
  })),
);
