"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { AuctionData, useAuctionStore } from "@/lib/stores/auctions";
import { client } from "chain";
import { NFTData, useNFTStore } from "@/lib/stores/nfts";

export function BidINOs() {
  const auctions = useAuctionStore();
  const data = useAuctionStore((state) => state.auctions);
  const BidINO = (collection: string, data: AuctionData) => {
    const form = useForm();
    return (
      <Card className="w-full p-4">
        <Form {...form}>
          <div className="pt-3">
            <FormField
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
            />
          </div>

          <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={() => {
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
      {Object.entries(data).map(([collection, auction]) =>
        BidINO(collection, auction),
      )}
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
        <h2 className="text-xl font-bold">Create INOs</h2>
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
                  <Input type="number" />
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
                  <Input type="number" />
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
                  <Input type="number" />
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

export function ClaimNFTs() {
  const auctions = useAuctionStore();
  const nfts = useNFTStore();
  const data = nfts.nfts;
  const ClaimNFT = (collection: string, data: NFTData) => {
    const form = useForm();
    return (
      <Card className="w-full p-4">
        <Form {...form}>
          <div className="pt-3">
            <FormField
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
            />
          </div>

          <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={() => {
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
        <h2 className="text-xl font-bold">Claim NFTs</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {Object.entries(data).length} NFTs to claim
        </p>
      </div>
      {Object.entries(data).map(([collection, nft]) =>
        ClaimNFT(collection, nft),
      )}
    </Card>
  );
}
