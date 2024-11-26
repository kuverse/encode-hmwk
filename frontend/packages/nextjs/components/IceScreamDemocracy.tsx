"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatEther } from "viem";

type Flavor = {
  id: number;
  name: string;
  image: string;
  votes: string;
};

const IcecreamDemocracy = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/get-results")
      .then(res => res.json())
      .then(data => {
        const results = data.result.map((flavor: any, index: number) => ({
          id: index,
          name: flavor.name,
          image: `/images/${index}.webp`,
          votes: flavor.votes,
        }));
        setFlavors(results);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching results:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading flavors...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {flavors.map(flavor => (
          <FlavorCard key={flavor.id} flavor={flavor} />
        ))}
      </div>
    </div>
  );
};

function FlavorCard({ flavor }: { flavor: Flavor }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleVote = async () => {
    setLoading(true); // Show the spinner
    setSuccessMessage(""); // Clear previous success messages

    try {
      const response = await fetch("http://localhost:3001/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposal: flavor.id,
          amount,
        }),
      });

      const result = await response.json();
      if (result) {
        setSuccessMessage(`Submitted ${amount} votes!`);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      setSuccessMessage("Failed to submit vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-40 p-2 flex flex-col bg-slate-800 items-center mt-5">
      <Image src={flavor.image} alt={flavor.name} width={180} height={200} className="object-cover rounded-xl mb-4" />
      <h2 className="font-bold text-lg center">{flavor.name}</h2>
      <h4>Votes: {formatEther(BigInt(flavor.votes.replace(/,/g, "")))} MTK</h4>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="input w-full mt-2"
      />
      <button
        onClick={handleVote}
        className="btn bg-blue-600 hover:bg-blue-400 text-white mt-2 w-full disabled:bg-gray-200 disabled:text-gray-400"
        disabled={!amount || loading}
      >
        {loading ? "Submitting Vote..." : "Vote"}
      </button>

      {loading && <div className="spinner mt-2"></div>}

      {successMessage && <p className="text-m text-green-500 mt-2">{successMessage}</p>}
    </div>
  );
}

export default IcecreamDemocracy;
