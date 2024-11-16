"use client";

import { Chain } from "./chain";
import { Button } from "./ui/button";
import truncateMiddle from "truncate-middle";

function Header({
  activeTab,
  setActiveTab,
  wallet,
  onConnectWallet,
  balance,
  blockHeight,
}) {
  const tabs = [
    { id: "active", label: "Active INOs" },
    { id: "mynfts", label: "My NFTs" },
    { id: "create", label: "Create INO" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              Innitial NFTs Offerings (INOs)
            </h1>

            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`rounded-lg px-4 py-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
