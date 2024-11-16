import { AuctionData } from "./auctions";
import { NFTData } from "./nfts";

// mock auction data with multiple collections
export const mockAuctions: { [collection: string]: AuctionData } = {
  "bored apes": {
    creator: "B62qo1TsEcTJuNRW68K7ca4PQsre8k2LfkDU68PwxBanD1RxC1ixPec",
    startTime: 10,
    biddingEndTime: 500,
    nftCount: 50,
    cutOffPointer: 35,
  },
  cryptopunks: {
    creator: "B62qo1TsEcTJuNRW68K7ca4PQsre8k2LPec68PwxfkDxC1ixUBanD1R",
    startTime: 2,
    biddingEndTime: 15,
    nftCount: 100,
    cutOffPointer: 65,
  },
  doodles: {
    creator: "B62qoNRW68K7ca4PQsre8k2LfkDUBanD1RxC1ixPec68Pwx1TsEcTJu",
    startTime: 10,
    biddingEndTime: 20,
    nftCount: 75,
    cutOffPointer: 0,
  },
};

// mock NFT data with multiple collections
export const mockNFTs: { [collection: string]: NFTData } = {
  "bored ape 1": {
    owner: "B62qo1TsEcTJuNRW68K7ca4PQsre8k2LfkDUBanD1RxC1ixPec68Pwx",
    id: 1234,
  },
  "bored ape 2": {
    owner: "B62qo1TsEcTJuNRW68C1ixPec68PwxK7ca4PQsre8k2LfkDUBanD1Rx",
    id: 1235,
  },
  "cryptopunk 1": {
    owner: "B62qo1TsEcTJ4PQsre8k2LfkDUBanuNRW68K7caD1RxC1ixPec68Pwx",
    id: 5678,
  },
  "cryptopunk 2": {
    owner: "B62qo1T4PQsre8k2LfkDUBanD1RxC1sEcTJuNRW68K7caixPec68Pwx",
    id: 5679,
  },
  "doodle 1": {
    owner: "B62qo1TsEcnD1RxC1ixPec68PwxRW68K7ca4PQsrTJuNLfkDUBae8k2",
    id: 9012,
  },
  "doodle 2": {
    owner: "B62qo1TsEnD1RxC1ixPec68PwxcTJuNRW68K7ca4PQsre8k2LfkDUBa",
    id: 9013,
  },
};
