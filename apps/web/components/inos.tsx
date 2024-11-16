"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { AuctionData, useAuctionStore } from "@/lib/stores/auctions";
import { client } from "chain";
import { NFTData, useNFTStore } from "@/lib/stores/nfts";
import Image from "next/image";
import { shorten } from "@/lib/utils";
import { useChainStore } from "@/lib/stores/chain";

export function ActiveINOs() {
  const auctions = useAuctionStore();
  const data = useAuctionStore((state) => state.auctions);
  const block = Number(useChainStore((state) => state.block?.height));
  if (Number.isNaN(block)) return <div>Loading...</div>;
  const ClaimNFT = (collection: string, data: AuctionData) => {
    const form = useForm();
    const endsIn = data.biddingEndTime - Number(block);
    return (
      <Card className="h-full w-full p-4">
        <Form {...form}>
          <div className="pt-3">
            <Image src="/placeholder.webp" alt="" width={200} height={200} />
            <h1 className="text-2xl font-bold">{collection}</h1>
            <div>{shorten(data.creator)}</div>
            <div>ended at: {data.biddingEndTime}</div>
            <div>cutoff: {data.cutOffPointer}</div>
            <FormField
              name="bid"
              defaultValue={data.cutOffPointer}
              render={({ field }) => (
                <FormItem className=" pointer-events-none opacity-0">
                  <FormLabel>
                    Your Bid <span className="text-sm text-zinc-500"></span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      type="number"
                      min={data.cutOffPointer}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={() => {
              auctions.claimNFT(client, collection);
            }}
          >
            Claim NFT
          </Button>
        </Form>
      </Card>
    );
  };
  const BidINO = (collection: string, data: AuctionData) => {
    const form = useForm();
    const endsIn = data.biddingEndTime - Number(block);
    return (
      <Card className="w-full p-4">
        <Form {...form}>
          <div className="pt-3">
            <Image src="/placeholder.webp" alt="" width={200} height={200} />
            <h1 className="text-2xl font-bold">{collection}</h1>
            <div>{shorten(data.creator)}</div>
            <div>ends in : {endsIn}</div>
            <div>minimum bid : {data.cutOffPointer}</div>
            <FormField
              name="bid"
              defaultValue={data.cutOffPointer}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Your Bid <span className="text-sm text-zinc-500"></span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={data.cutOffPointer} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={() => {
              console.log(
                "cas",
                client,
                collection,
                form.getFieldState("bid"),
                form.getValues("bid"),
              );
              auctions.placeBid(client, collection, form.getValues("bid"));
            }}
          >
            Place Bid
          </Button>
        </Form>
      </Card>
    );
  };
  return (
    <Card className="w-full p-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold">Active INOs</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {Object.entries(data).length} Active INOs for bidding
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {Object.entries(data).map(([collection, auction]) => (
          <div key={collection}>
            {block > auction.biddingEndTime
              ? ClaimNFT(collection, auction)
              : BidINO(collection, auction)}
          </div>
        ))}
      </div>
    </Card>
  );
}
export function CreateINO() {
  const auctions = useAuctionStore();
  const form = useForm();
  const loading = useAuctionStore((state) => state.loading);
  return (
    <Card className="w-full p-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold">Create INO</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Start a new INO for bidding
        </p>
      </div>
      <Form {...form}>
        <div className="flex flex-col gap-2 pt-3">
          <FormField
            name="collection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Collection <span className="text-sm text-zinc-500"></span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="text" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Duration{" "}
                  <span className="text-sm text-zinc-500">
                    (in block height)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="nftCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  NFT count <span className="text-sm text-zinc-500"></span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          size={"lg"}
          type="submit"
          className="mt-6 w-full"
          loading={loading}
          onClick={() => {
            const collection = form.getValues("collection");
            const duration = form.getValues("duration");
            const nftCount = form.getValues("nftCount");
            auctions.startAuction(client, collection, duration, nftCount);
          }}
        >
          Create
        </Button>
      </Form>
    </Card>
  );
}

export function MyNFTs() {
  const auctions = useAuctionStore();
  const nfts = useNFTStore();
  const data = nfts.nfts;
  const MyNFT = (collection: string, data: NFTData) => {
    // const form = useForm();
    return (
      <Card className="w-full p-4">
        {/* <Form {...form}> */}
        <div className="pt-3">
          <Image src="/placeholder.webp" alt="" width={200} height={200} />
          <h1 className="text-2xl font-bold">{collection}</h1>
          {/* <div>{shorten(data.owner)}</div> */}
          <div>#{data.id}</div>
          {/* <FormField
              name="bid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Your Bid{" "}
                    <span className="text-sm text-zinc-500">(in MINA)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" />
                  </FormControl>
                </FormItem>
              )}
            /> */}
        </div>

        {/* <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={() => {
              console.log(client, collection, form.getValues("bid"));
              auctions.placeBid(client, collection, form.getValues("bid"));
            }}
          >
            CTA
          </Button>
        </Form> */}
      </Card>
    );
  };
  return (
    <Card className="w-full p-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold">My NFTs</h2>
        <p className="mt-1 text-sm text-zinc-500">
          You have {Object.entries(data).length} NFTs
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {Object.entries(data).map(([collection, nft]) => (
          <div key={collection}>{MyNFT(collection, nft)}</div>
        ))}
      </div>
    </Card>
  );
}
