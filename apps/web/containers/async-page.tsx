"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { useWalletStore } from "@/lib/stores/wallet";
import { BidINOs, CreateINO, ClaimNFTs } from "@/components/inos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export default function Home() {
  const wallet = useWalletStore();
  const drip = useFaucet();

  return (
    <Tabs className="container pt-16" defaultValue="faucet">
      <TabsList>
        <TabsTrigger value="faucet">Faucet</TabsTrigger>
        <TabsTrigger value="bid">Bid INOs</TabsTrigger>
        <TabsTrigger value="create">Create INO</TabsTrigger>
        <TabsTrigger value="claim">Claim NFTs</TabsTrigger>
      </TabsList>
      <div className="w-1/2">
        <TabsContent value="faucet">
          <Faucet
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onDrip={drip}
            loading={false}
          />
        </TabsContent>
        <TabsContent value="bid">
          <BidINOs />
        </TabsContent>
        <TabsContent value="create">
          <CreateINO />
        </TabsContent>
        <TabsContent value="claim">
          <ClaimNFTs />
        </TabsContent>
      </div>
    </Tabs>
  );
}
