import { AuctionData } from "./auctions";
import { NFTData } from "./nfts";

// mock auction data with multiple collections
export const mockAuctions: { [collection: string]: AuctionData } = {
  "bored-apes": {
    creator: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // Started 7 days ago
    biddingEndTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // Ends in 3 days
    nftCount: 50,
    cutOffPointer: 35,
  },
  cryptopunks: {
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // Started 2 days ago
    biddingEndTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // Ends in 5 days
    nftCount: 100,
    cutOffPointer: 65,
  },
  doodles: {
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    startTime: Date.now() + 24 * 60 * 60 * 1000, // Starts in 1 day
    biddingEndTime: Date.now() + 10 * 24 * 60 * 60 * 1000, // Ends in 10 days
    nftCount: 75,
    cutOffPointer: 0,
  },
};

// mock NFT data with multiple collections
export const mockNFTs: { [collection: string]: NFTData } = {
  "bored-ape-1": {
    owner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    id: 1234,
  },
  "bored-ape-2": {
    owner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    id: 1235,
  },
  "cryptopunk-1": {
    owner: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    id: 5678,
  },
  "cryptopunk-2": {
    owner: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    id: 5679,
  },
  "doodle-1": {
    owner: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    id: 9012,
  },
  "doodle-2": {
    owner: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    id: 9013,
  },
};
