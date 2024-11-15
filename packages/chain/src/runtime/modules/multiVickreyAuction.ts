/**
 * MultiVickreyAuction: An open, multi-item Vickrey-style auction mechanism to IPO an NFT collection.
 * All nfts are sold at the same price.
 * Bidders submit bids for n identical items. The n highest bidders win,
 * but they pay the (n+1)th highest bid price. This incentivizes bidders to bid their true valuations.
 * Then nfts are distributed randomly to the winners.
 */

import {
  runtimeMethod,
  runtimeModule,
  RuntimeModule,
  state,
} from "@proto-kit/module";
import { assert, StateMap } from "@proto-kit/protocol";
import {
  Bool,
  Encoding,
  Field,
  Poseidon,
  Provable,
  PublicKey,
  Struct,
} from "o1js";
import { inject } from "tsyringe";
import { NFTs } from "./nfts";
import { Balances } from "./balances";
import { BASE_TOKEN_ID } from "..";
import { Balance, BalancesKey, UInt64 } from "@proto-kit/library";

export class MultiVickreyAuctionData extends Struct({
  creator: PublicKey,
  startTime: UInt64,
  biddingEndTime: UInt64,
  nftCount: UInt64, // number of nfts to auction
  cutOffPointer: UInt64, // a pointer that points to the n+1th highest bid in the sorted list
}) {}

export class DLLKey extends Struct({
  collection: PublicKey,
  index: UInt64,
}) {}

export class DLLValue extends Struct({
  prev: UInt64,
  next: UInt64,
  bid: UInt64,
  bidder: PublicKey,
}) {}

export class MintMapKey extends Struct({
  collection: PublicKey,
  index: UInt64,
}) {}

@runtimeModule()
export class MultiVickreyAuction extends RuntimeModule<{}> {
  public static readonly ADDRESS = PublicKey.from({
    x: Poseidon.hash(Encoding.stringToFields("MultiVickreyAuction")),
    isOdd: Bool(false),
  });

  // mapping from collectionAddress => auctionData, a collection can only have one auction at a time
  @state() public records = StateMap.from<PublicKey, MultiVickreyAuctionData>(
    PublicKey,
    MultiVickreyAuctionData
  );

  // sortedList for each auction, the values form a doubly linked list
  @state() public sortedListElements = StateMap.from<DLLKey, DLLValue>(
    DLLKey,
    DLLValue
  );

  // mapping from collectionAddress => sortedList length
  @state() public counters = StateMap.from<PublicKey, UInt64>(
    PublicKey,
    UInt64
  );
  @state() public mintMap = StateMap.from<MintMapKey, UInt64>(
    MintMapKey,
    UInt64
  );

  sortedListStorage = new Map<
    string,
    { bid: number; idx: number; bidder: string }[]
  >();

  public constructor(
    @inject("NFTs") public nfts: NFTs,
    @inject("Balances") public balances: Balances
  ) {
    super();
  }

  @runtimeMethod()
  public async startAuction(
    collection: PublicKey,
    biddingDuration: UInt64,
    nftCount: UInt64
  ) {
    const auctionData = new MultiVickreyAuctionData({
      creator: this.transaction.sender.value,
      startTime: new UInt64(this.network.block.height),
      biddingEndTime: new UInt64(this.network.block.height).add(
        biddingDuration
      ),
      nftCount,
      cutOffPointer: UInt64.from(0),
    });
    await this.records.set(collection, auctionData);
    // initialize the sorted list
    await this.sortedListElements.set(
      new DLLKey({ collection, index: UInt64.from(0) }),
      {
        prev: UInt64.from(0),
        next: UInt64.from(0),
        bid: UInt64.from(0),
        bidder: this.transaction.sender.value,
      }
    );
    Provable.asProver(() => {
      this.sortedListStorage.set(collection.toBase58(), [
        { bid: 0, idx: 0, bidder: this.transaction.sender.value.toBase58() },
      ]);
    });
    // TODO: transfer nfts to auction ??
  }

  @runtimeMethod()
  public async bid(collection: PublicKey, bid: Balance) {
    const auctionData = await this.records.get(collection);
    assert(auctionData.isSome, "Auction does not exist");
    assert(
      this.network.block.height.lessThanOrEqual(
        auctionData.value.biddingEndTime.toO1UInt64()
      ),
      "Auction has ended"
    );

    await this.insertIntoSortedList(
      collection,
      bid,
      this.transaction.sender.value
    );

    // Provable.asProver(async () => {
    //   if (this.network.block.height.toBigInt() === 0n) {
    //     return;
    //   }
    //   console.log(
    //     `balance ${(
    //       await this.balances.balances.get(
    //         new BalancesKey({
    //           address: this.transaction.sender.value,
    //           tokenId: BASE_TOKEN_ID,
    //         })
    //       )
    //     ).value.toBigInt()}`,
    //     `sender ${this.transaction.sender.value.toBase58()}`,
    //     `bid ${bid.toBigInt().toString()}`
    //   );
    // });
    // transfer funds from bidder
    await this.balances.transfer(
      BASE_TOKEN_ID,
      this.transaction.sender.value,
      MultiVickreyAuction.ADDRESS,
      bid
    );
    // update the cutOffPointer
    const { value: cutOff } = await this.sortedListElements.get(
      new DLLKey({ collection, index: auctionData.value.cutOffPointer })
    );
    const totalBids = await this.counters.get(collection);
    const shouldMove = totalBids.value
      .greaterThan(auctionData.value.nftCount)
      .and(cutOff.bid.lessThan(bid));
    const newCutOffPointer = Provable.if(
      shouldMove,
      UInt64,
      cutOff.prev,
      auctionData.value.cutOffPointer
    );
    await this.records.set(collection, {
      ...auctionData.value,
      cutOffPointer: new UInt64(newCutOffPointer),
    });
    // Provable.asProver(() => {
    //   if (this.network.block.height.toBigInt() === 0n) {
    //     return;
    //   }
    //   console.log(
    //     `oldCutOffPointer ${auctionData.value.cutOffPointer.toBigInt().toString()}`,
    //     `newCutOffPointer ${newCutOffPointer.value.toBigInt().toString()}`,
    //     `prev ${cutOff.prev.toBigInt().toString()}`,
    //     `next ${cutOff.next.toBigInt().toString()}`
    //   );
    // });
  }

  @runtimeMethod()
  public async claimMint(collection: PublicKey) {
    const { value: auctionData, isSome } = await this.records.get(collection);
    assert(isSome, "Auction does not exist");
    assert(
      auctionData.biddingEndTime.lessThanOrEqual(
        new UInt64(this.network.block.height)
      ),
      "Auction has not ended"
    );
    const { value: sender } = this.transaction.sender;
    // find DLLkey from sender Addr
    const dllKey = Provable.witness(DLLKey, () => {
      const bids = this.sortedListStorage.get(collection.toBase58()) || [];
      for (let i = 0; i < bids.length; i++) {
        if (
          bids[i].bidder.toLocaleLowerCase() ===
          sender.toBase58().toLocaleLowerCase()
        ) {
          return new DLLKey({
            collection,
            index: UInt64.from(bids[i].idx),
          });
        }
      }
      return new DLLKey({
        collection: PublicKey.from({ x: 0n, isOdd: Bool(false) }),
        index: UInt64.from(0),
      });
    });
    const { value: dllValue } = await this.sortedListElements.get(dllKey);

    // Provable.asProver(() => {
    //   if (this.network.block.height.toBigInt() === 0n) {
    //     return;
    //   }
    // console.log(
    //   `
    //   dllKey: ${dllKey.collection.toBase58()}, ${dllKey.index.toBigInt()},
    //   dllValue:
    //     bid: ${dllValue.bid.toBigInt().toString()},
    //     bidder: ${dllValue.bidder.toBase58()}`
    // );
    // });

    // assert sender Addr
    assert(
      dllValue.bidder.equals(sender),
      "Bidder is not the same as the one in the list"
    );
    // assert winner
    const { value: cutOff } = await this.sortedListElements.get(
      new DLLKey({ collection, index: auctionData.cutOffPointer })
    );
    assert(cutOff.bid.lessThanOrEqual(dllValue.bid), "Bidder is not a winner");
    // mint a random nft to the bidder
    const { rest: r } = Provable.witness(UInt64, () => {
      return UInt64.from(Math.floor(Math.random() * 2 ** 64));
    }).divMod(
      new UInt64(
        Provable.if(
          auctionData.nftCount.equals(0),
          UInt64,
          UInt64.from(1),
          auctionData.nftCount
        )
      )
    );
    const { value: mintMapValue, isSome: mintedOnce } = await this.mintMap.get(
      new MintMapKey({ collection, index: r })
    );
    const idToMint = Provable.if(mintedOnce, UInt64, mintMapValue, r);
    await this.nfts.mint(
      collection,
      UInt64.Unsafe.fromField(idToMint.value),
      dllValue.bidder
    );

    await this.mintMap.set(
      new MintMapKey({ collection, index: r }),
      auctionData.nftCount.sub(1)
    );
    // update nftCount
    await this.records.set(collection, {
      ...auctionData,
      nftCount: auctionData.nftCount.sub(1),
    });
    // transfer remaining balance
    await this.balances.transfer(
      BASE_TOKEN_ID,
      MultiVickreyAuction.ADDRESS,
      sender,
      dllValue.bid.sub(cutOff.bid)
    );
    Provable.asProver(() => {
      if (this.network.block.height.toBigInt() === 0n) {
        return;
      }
      // console.log(
      //   `
      //   cutOff.bid: ${cutOff.bid.toBigInt()},
      //   cutOff.bidder: ${cutOff.bidder.toBase58()},
      //   dllValue.bid: ${dllValue.bid.toBigInt()},
      //   dllValue.bidder: ${dllValue.bidder.toBase58()},
      //   refund: ${dllValue.bid.sub(cutOff.bid).toBigInt()}, cutoff ${cutOff.bid.toBigInt()}, bid ${dllValue.bid.toBigInt()}`
      // );
    });
  }

  private async insertIntoSortedList(
    collection: PublicKey,
    bid: UInt64,
    bidder: PublicKey
  ) {
    const { value: counter } = await this.counters.get(collection);
    const index = counter.add(1);

    const dllKey = new DLLKey({ collection, index });
    // TODO: find the correct prev
    const prev = Provable.witness(UInt64, () => {
      if (this.network.block.height.toBigInt() === 0n) {
        return UInt64.from(0);
      }
      return this.getIndexOfSortedList(collection, bid, bidder);
    });
    // assert ordering of values in the list
    const { value: prevValue } = await this.sortedListElements.get(
      new DLLKey({ collection, index: prev })
    );
    // const next = prevValue.next;
    const { value: nextValue } = await this.sortedListElements.get(
      new DLLKey({ collection, index: prevValue.next })
    );
    // prevValue.bid is 0 when inseting at the head of the list
    assert(
      prevValue.bid.greaterThanOrEqual(bid).or(prevValue.bid.equals(0)),
      "!(prev bid >= bid)"
    );
    assert(bid.greaterThan(nextValue.bid), "!(bid > next)");

    // update the pointers
    await this.sortedListElements.set(
      dllKey,
      new DLLValue({
        prev,
        next: prevValue.next,
        bid,
        bidder,
      })
    );
    await this.sortedListElements.set(new DLLKey({ collection, index: prev }), {
      ...prevValue,
      next: index,
    });
    // nextValue might change
    const { value: nextValue1 } = await this.sortedListElements.get(
      new DLLKey({ collection, index: prevValue.next })
    );
    await this.sortedListElements.set(
      new DLLKey({ collection, index: prevValue.next }),
      {
        ...nextValue1,
        prev: index,
      }
    );
    await this.counters.set(collection, index);
  }

  private getIndexOfSortedList(
    collection: PublicKey,
    bid: UInt64,
    bidder: PublicKey
  ): UInt64 {
    const arr = this.sortedListStorage.get(collection.toBase58()) || [];
    let i = 0;
    while (i < arr.length && arr[i].bid >= Number(bid.toBigInt())) {
      i++;
    }
    const returnIdx = arr.at(i - 1)?.idx; // idx before insert
    arr.splice(i, 0, {
      bid: Number(bid.toBigInt()),
      idx: arr.length,
      bidder: bidder.toBase58(),
    });
    this.sortedListStorage.set(collection.toBase58(), arr);
    // console.log(
    //   "sortedListStorage af insert at",
    //   i,
    //   arr.map((a) => ` (bid: ${a.bid}, idx: ${a.idx}) `).concat("")
    // );
    // console.log("return", returnIdx);
    return UInt64.from(returnIdx || 0);
  }
}
