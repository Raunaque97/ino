"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNFTStore } from "@/lib/stores/nfts";
import { UInt64 } from "@proto-kit/library";
import { client, NFTs } from "chain";
import { Field, PrivateKey } from "o1js";
import { useForm } from "react-hook-form";

export const auctions = [
  {
    collection: {
      Name: "Mina Rocks",
      pvtKey: "EKES991mh7ovm3dvkgW8YfX6VtGk27kbbwMG5FRQGYFkLqkNd5SM",
      publicKey: "B62qmp1VwpB9oFgu7zhAqx28dw7DU85pM1vC4vcsxW1PdYu3tAwp51v",
    },
    nftCount: 10,
    duration: 12 * 60,
  },
  {
    collection: {
      Name: "Pudgy Penguins",
      pvtKey: "EKFbcmznkFvZxydgCatk7CcoTg69Hx9fqwbNCJ1HwxtUE3nUdSwi",
      publicKey: "B62qifSYcgeUDPz89qHVuJB12ApMrgJ4gBR1byf7N97esE2DeAJKn9G",
    },
    nftCount: 2,
    duration: 12 * 10,
  },
];

export default function Create() {
  const script = async () => {
    const nfts = client.runtime.resolve("NFTs");
    const auction = client.runtime.resolve("MultiVickreyAuction");
    // create collections
    for (let i = 0; i < auctions.length; i++) {
      const collection = PrivateKey.fromBase58(auctions[i].collection.pvtKey);
      // const collection = PrivateKey.random();
      const collectionAddr = collection.toPublicKey();

      let txn = await client.transaction(collectionAddr, async () => {
        await nfts.createCollection(Field(123));
      });
      txn.transaction = txn.transaction?.sign(collection);
      await txn?.send();
      console.log(`created new collection address: ${collectionAddr.toBase58()} 
              private key: ${collection.toBase58()}`);
    }
    // sleep for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // start Auctions
    for (let i = 0; i < auctions.length; i++) {
      const collection = PrivateKey.fromBase58(auctions[i].collection.pvtKey);
      // const collection = PrivateKey.random();
      const collectionAddr = collection.toPublicKey();
      const txn = await client.transaction(collectionAddr, async () => {
        await auction.startAuction(
          collectionAddr,
          UInt64.from(auctions[i].duration),
          UInt64.from(auctions[i].nftCount),
        );
      });
      txn.transaction = txn.transaction?.sign(collection);
      await txn?.send();
      console.log(
        `created Auction for collection: ${collectionAddr.toBase58()}`,
      );
    }
  };
  const form = useForm();
  return (
    <div className="fixed grid h-full w-full place-content-center">
      <Card className="w-full p-4">
        <div className="mb-2">
          <h2 className="text-xl font-bold">Create Collection</h2>
          <p className="mt-1 text-sm text-zinc-500">
            This is only for dev mode
          </p>
        </div>
        <Form {...form}>
          <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={script}
          >
            {"Create Test NFT Collections"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
