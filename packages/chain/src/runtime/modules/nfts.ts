import { UInt64 } from "@proto-kit/library";
import {
  runtimeMethod,
  runtimeModule,
  RuntimeModule,
  state,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { Bool, Field, Provable, PublicKey, Struct } from "o1js";

export class NFTKey extends Struct({
  collection: PublicKey,
  id: UInt64,
}) {
  public static from(collection: PublicKey, id: UInt64) {
    return new NFTKey({ collection, id });
  }
}

export class NFTEntity extends Struct({
  owner: PublicKey,
  id: UInt64,
}) {}

export class CollectionData extends Struct({
  hash: Field,
}) {}

@runtimeModule()
export class NFTs extends RuntimeModule<{}> {
  @state() public nftRecords = StateMap.from<NFTKey, NFTEntity>(
    NFTKey,
    NFTEntity
  );

  @state() public collectionRecords = StateMap.from<PublicKey, CollectionData>(
    PublicKey,
    CollectionData
  );

  public async mint(collection: PublicKey, id: UInt64, to: PublicKey) {
    const key = NFTKey.from(collection, id);
    Provable.asProver(() => {
      console.log(
        `mintKey: ${key.collection.toBase58()}, ${key.id.toBigInt()}, owner: ${to.toBase58()}}`
      );
    });
    await this.nftRecords.set(key, new NFTEntity({ owner: to, id }));
  }

  @runtimeMethod()
  public async mintSigned(to: PublicKey, id: UInt64) {
    await this.mint(this.transaction.sender.value, id, to);
  }

  @runtimeMethod()
  public async transferSigned(to: PublicKey, nftKey: NFTKey) {
    const { value: nft, isSome } = await this.nftRecords.get(nftKey);
    assert(isSome, "nft does not exists");
    // check if sender is the current owner
    assert(nft.owner.equals(this.transaction.sender.value), "Not owner of NFT");

    Provable.asProver(() => {
      console.log(
        `owner: ${nft.owner.toBase58()} sender: ${this.transaction.sender.value.toBase58()}`
      );
    });

    await this.transfer(to, nftKey);
  }

  @runtimeMethod()
  public async createCollection(hash: Field) {
    await this.collectionRecords.set(
      this.transaction.sender.value,
      new CollectionData({ hash })
    );
  }

  public async transfer(to: PublicKey, key: NFTKey) {
    const { value: nft } = await this.nftRecords.get(key);
    // update the owner to the 'to' address
    await this.nftRecords.set(key, new NFTEntity({ ...nft, owner: to }));
  }

  public async assertNFTOwner(key: NFTKey, address: PublicKey) {
    const { value: nft, isSome } = await this.nftRecords.get(key);
    assert(isSome, "nft does not exists");
    assert(nft.owner.equals(address), "Not owner of NFT");
  }
}
