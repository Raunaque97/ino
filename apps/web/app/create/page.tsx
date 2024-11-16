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
import { client, NFTs } from "chain";
import { Field, PrivateKey } from "o1js";
import { useForm } from "react-hook-form";

const collections = [
  {
    Name: "Mina Rocks",
    pvtKey: "EKES991mh7ovm3dvkgW8YfX6VtGk27kbbwMG5FRQGYFkLqkNd5SM", // public key: B62qmp1VwpB9oFgu7zhAqx28dw7DU85pM1vC4vcsxW1PdYu3tAwp51v
  },
  {
    Name: "Pudgy Penguins",
    pvtKey: "EKFbcmznkFvZxydgCatk7CcoTg69Hx9fqwbNCJ1HwxtUE3nUdSwi", // public key: B62qifSYcgeUDPz89qHVuJB12ApMrgJ4gBR1byf7N97esE2DeAJKn9G
  },
];

export default function Create() {
  const script = async () => {
    const nfts = client.runtime.resolve("NFTs");
    for (let i = 0; i < collections.length; i++) {
      const collection = PrivateKey.fromBase58(collections[i].pvtKey);
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
