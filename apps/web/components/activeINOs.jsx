"use client";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Clock, Wallet } from "lucide-react";

function ActiveINOs() {
  const mockINOs = [
    {
      id: 1,
      name: "Crypto Punks 2.0",
      description:
        "A collection of unique digital characters living on the blockchain",
      currentBid: "500 TEST",
      timeRemaining: "2d 5h",
      image: "https://placeholder.com/400",
      totalBids: 145,
    },
    {
      id: 2,
      name: "Meta Legends",
      description: "Legendary NFT collection with unique traits and attributes",
      currentBid: "750 TEST",
      timeRemaining: "1d 12h",
      image: "https://placeholder.com/400",
      totalBids: 89,
    },
    {
      id: 3,
      name: "Digital Dreams",
      description: "Surreal digital art collection by renowned artists",
      currentBid: "300 TEST",
      timeRemaining: "3d 8h",
      image: "https://placeholder.com/400",
      totalBids: 67,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockINOs.map((ino) => (
        <Card
          key={ino.id}
          className="overflow-hidden border-gray-800 bg-gray-900/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
        >
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={ino.image}
              alt={ino.name}
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-110"
            />
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white">{ino.name}</h3>
            <p className="mt-2 text-sm text-gray-400">{ino.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <div className="flex items-center text-gray-400">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span className="text-sm">Current Bid</span>
                </div>
                <p className="mt-1 font-bold text-blue-400">{ino.currentBid}</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <div className="flex items-center text-gray-400">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="text-sm">Time Remaining</span>
                </div>
                <p className="mt-1 font-bold text-purple-400">
                  {ino.timeRemaining}
                </p>
              </div>
            </div>
            <Button className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-600 hover:to-purple-600 hover:shadow-purple-500/25">
              Place Bid
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ActiveINOs;
