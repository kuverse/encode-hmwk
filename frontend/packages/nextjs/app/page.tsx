/* eslint-disable prettier/prettier */
"use client";

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import IcecreamDemocracy from "../components/IceScreamDemocracy";
import MintDelegate from "~~/components/MintDelegate";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
        <span className="text-center block text-5xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
        Ice Cream Democracy
        </span>
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <WalletInfo></WalletInfo>
      <IcecreamDemocracy></IcecreamDemocracy>
      <MintDelegate></MintDelegate>

    </>
  );
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  if (address)
    return (
      <div>
        <ApiData></ApiData>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div className="flex items-center justify-center mt-2">
      <div className="bg-white p-2 rounded-lg shadow-md text-center">
        <h3 className="text-xs font-semibold text-gray-500">
          Wallet disconnected. Connect wallet to continue.
        </h3>
      </div>
    </div>
    
    );
}


function ApiData() {
  return (
  
        <TokenAddressFromApi></TokenAddressFromApi>

  );
}


function TokenAddressFromApi() {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nameRes, addressRes, supplyRes] = await Promise.all([
          fetch("http://localhost:3001/token-name").then((res) => res.json()),
          fetch("http://localhost:3001/contract-address").then((res) => res.json()),
          fetch("http://localhost:3001/total-supply").then((res) => res.json()),
        ]);

        setTokenName(nameRes.result);
        setContractAddress(addressRes.result);
        setTotalSupply(supplyRes.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p>Loading token data from API...</p>;
  if (!contractAddress || !tokenName || !totalSupply )
    return <p>No token data available.</p>;

  return (
    <div className="flex flex-col gap-4 mt-2">
  {/* First Bubble */}
  <div className="card w-120 bg-primary text-primary-content shadow-lg rounded-lg p-1">
    <div className="card-body flex flex-col items-center p-1">
      <div className="text-center">
        <h3 className="text-l mt-3">Governance Token Address:</h3>
        <p className="text-xl">{contractAddress || "N/A"}</p>
      </div>
    </div>
  </div>

  {/* Row with Two Smaller Bubbles */}
  <div className="flex gap-2 justify-center">
    {/* Second Bubble */}
    <div className="card w-1/2 bg-accent text-secondary-content shadow-md rounded-md p-1">
      <div className="card-body flex flex-col items-center p-1">
        <h2 className="card-title text-xs font-semibold text-center">Token Name</h2>
        <div className="text-center">
          <h3 className="text-m">{tokenName || "N/A"}</h3>
        </div>
      </div>
    </div>

    {/* Third Bubble */}
    <div className="card w-1/2 bg-accent text-accent-content shadow-md rounded-md p-1">
      <div className="card-body flex flex-col items-center p-1">
        <h2 className="card-title text-xs font-semibold text-center">Total Supply</h2>
        <div className="text-center">
          <h3 className="text-m">{totalSupply || "N/A"}</h3>
        </div>
      </div>
    </div>
  </div>
</div>


  );
}
export default Home;