import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { useAuctionStore } from "@/lib/stores/auctions";
import { useBalancesStore, useObserveBalance } from "@/lib/stores/balances";
import { useChainStore, usePollBlockHeight } from "@/lib/stores/chain";
import { useClientStore } from "@/lib/stores/client";
import { useNFTStore } from "@/lib/stores/nfts";
import { useNotifyTransactions, useWalletStore } from "@/lib/stores/wallet";
import { ReactNode, useEffect, useMemo } from "react";

export default function AsyncLayout({ children }: { children: ReactNode }) {
  const wallet = useWalletStore();
  const client = useClientStore();
  const chain = useChainStore();
  const balances = useBalancesStore();
  const auctions = useAuctionStore();
  const nfts = useNFTStore();
  usePollBlockHeight();
  useObserveBalance();
  useNotifyTransactions();

  useEffect(() => {
    client.start();
    // TODO: use references to query the whole data
    // auctions.loadAuction(client,);
    // nfts.loadNFTs();
  }, []);

  useEffect(() => {
    wallet.initializeWallet();
    wallet.observeWalletChange();
  }, []);

  const loading = useMemo(
    () => client.loading || balances.loading,
    [client.loading, balances.loading],
  );

  return (
    <>
      <Header
        loading={client.loading}
        balance={balances.balances[wallet.wallet ?? ""]}
        balanceLoading={loading}
        wallet={wallet.wallet}
        onConnectWallet={wallet.connectWallet}
        blockHeight={chain.block?.height ?? "-"}
      />
      {children}
      <Toaster />
    </>
  );
}
