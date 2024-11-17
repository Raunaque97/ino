import { AuctionData } from "./auctions";
import { NFTData } from "./nfts";

// mock auction data with multiple collections
export const mockAuctions: { [collection: string]: AuctionData } = {
  "mina rocks": {
    creator: "B62qo1TsEcTJuNRW68K7ca4PQsre8k2LfkDU68PwxBanD1RxC1ixPec",
    startTime: 10,
    biddingEndTime: 500,
    nftCount: 50,
    cutOffPointer: 35,
  },
  "pugdy penguins": {
    creator: "B62qo1TsEcTJuNRW68K7ca4PQsre8k2LPec68PwxfkDxC1ixUBanD1R",
    startTime: 2,
    biddingEndTime: 15,
    nftCount: 100,
    cutOffPointer: 65,
  },
};

// mock NFT data with multiple collections
export const mockNFTs: { [collection: string]: NFTData } = {
  "minya cat 1": {
    owner: "B62qo1TsEcTJuNRW68K7ca4PQsre8k2LfkDUBanD1RxC1ixPec68Pwx",
    id: 1234,
  },
  "minya cat 2": {
    owner: "B62qo1TsEcTJuNRW68C1ixPec68PwxK7ca4PQsre8k2LfkDUBanD1Rx",
    id: 1235,
  },
};
