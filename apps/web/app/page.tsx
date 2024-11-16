"use client";

import { useState } from "react";
import Header from "@/components/header";
import { useWalletStore } from "@/lib/stores/wallet";
import ActiveINOs from "@/components/activeINOs";

export default function Home() {
  const [activeTab, setActiveTab] = useState("active");
  const { connectWallet, wallet } = useWalletStore();
  const [userBalance, setUserBalance] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        onConnectWallet={connectWallet}
        balance={userBalance}
        blockHeight={blockHeight}
      />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          {activeTab === "active" && <ActiveINOs />}
          {activeTab === "create" && (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
              <h2 className="text-xl font-bold text-white">Coming Soon</h2>
              <p className="mt-2 text-gray-400">
                Create your own INO collection
              </p>
            </div>
          )}
          {activeTab === "mybids" && (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
              <h2 className="text-xl font-bold text-white">My Bids</h2>
              <p className="mt-2 text-gray-400">Track your active bids</p>
            </div>
          )}
          {activeTab === "mycollections" && (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
              <h2 className="text-xl font-bold text-white">My Collections</h2>
              <p className="mt-2 text-gray-400">View your NFT collections</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
