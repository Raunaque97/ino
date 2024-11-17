"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { useWalletStore } from "@/lib/stores/wallet";
import { ActiveINOs, CreateINO, MyNFTs } from "@/components/inos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export default function Home() {
  const wallet = useWalletStore();
  const drip = useFaucet();

  return (
    <Tabs className="container py-16" defaultValue="faucet">
      <TabsList>
        <TabsTrigger value="faucet">Faucet</TabsTrigger>
        <TabsTrigger value="bid">Active INOs</TabsTrigger>
        <TabsTrigger value="my">My NFTs</TabsTrigger>
      </TabsList>
      <div className="w-fit">
        <TabsContent value="faucet">
          <Faucet
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onDrip={drip}
            loading={false}
          />
        </TabsContent>
        <TabsContent value="bid">
          <ActiveINOs />
        </TabsContent>
        <TabsContent value="create">
          <CreateINO />
        </TabsContent>
        <TabsContent value="my">
          <MyNFTs />
        </TabsContent>
      </div>
    </Tabs>
  );
}
