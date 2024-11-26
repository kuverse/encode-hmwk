import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useAccount } from "wagmi";

const MintDelegate = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const { address } = useAccount();
  const [minterRole, setMinterRole] = useState(false);
  const [votingPower, setVotingPower] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [winningIcecream, setWinningIcecream] = useState("");

  const mintTokens = async () => {
    try {
      setLoading(true);
      setResult("");
      const response = await fetch(`http://localhost:3001/mint-tokens?address=${address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      if (data.result) {
        setResult(`${data.result}`);
      } else {
        setResult("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error minting tokens:", error);
      setResult("Failed to mint tokens.");
    } finally {
      setLoading(false);
    }
  };

  const selfDelegate = async () => {
    try {
      setLoading2(true);
      setResult("");
      const response = await fetch(`http://localhost:3001/self-delegate?address=${address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      if (data.result) {
        setResult(`Delegated hash: ${data.result}`);
      } else {
        setResult("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error delegating address:", error);
      setResult("Failed to delegate address.");
    } finally {
      setLoading2(false);
    }
  };

  useEffect(() => {
    const checkMinterRole = async () => {
      if (!address) return;
      try {
        setLoading(true);
        // Dynamically build the API URL with the address query parameter
        const response = await fetch(`http://localhost:3001/check-minter-role?address=${address}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setMinterRole(data.result ?? false);
      } catch (error) {
        console.error("Error checking minter role:", error);
        setMinterRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkMinterRole();
  }, [address]);

  useEffect(() => {
    const getVotingPower = async () => {
      if (!address) return;
      try {
        setLoading(true);
        // Dynamically build the API URL with the address query parameter
        const response = await fetch(`http://localhost:3001/get-voting-power?address=${address}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.result) {
          const cleanedVotingPower = data.result.replace(/,/g, "");
          setVotingPower(cleanedVotingPower);
        } else {
          setVotingPower("0");
        }
      } catch (error) {
        console.error("Error fetching voting power:", error);
        setVotingPower("0");
      } finally {
        setLoading(false);
      }
    };
    getVotingPower();
  }, [address]);

  useEffect(() => {
    const tokenBalance = async () => {
      if (!address) return;
      try {
        setLoading(true);
        // Dynamically build the API URL with the address query parameter
        const response = await fetch(`http://localhost:3001/token-balance/${address}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.result) {
          const cleanedVotingPower = data.result.replace(/,/g, "");
          setTokenBalance(cleanedVotingPower);
        } else {
          setTokenBalance("0");
        }
      } catch (error) {
        console.error("Error fetching voting power:", error);
        setTokenBalance("0");
      } finally {
        setLoading(false);
      }
    };
    tokenBalance();
  }, [address]);

  useEffect(() => {
    const getVotingPower = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/winning-name`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.result) {
          const cleanedVotingPower = data.result.replace(/,/g, "");
          setWinningIcecream(cleanedVotingPower);
        } else {
          setWinningIcecream("0");
        }
      } catch (error) {
        console.error("Error fetching voting power:", error);
        setWinningIcecream("0");
      } finally {
        setLoading(false);
      }
    };
    getVotingPower();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-row p-2 flex-row gap-4">
        <div className="card w-1/2 p-4 flex flex-col mb-4 bg-green-600 shadow-md rounded-lg items-center justify-center mx-auto">
          <h2 className="text-m font-semibold  text-center">Winning Icecream:</h2>
          <h3 className="text-m font-semibold  text-center">{winningIcecream}</h3>
        </div>
        <div className="card w-1/2 p-4 flex flex-col mb-4 bg-slate-500 shadow-md rounded-lg items-center justify-center mx-auto">
          <h2 className="text-m font-semibold  text-center">Token Balance:</h2>
          <h3 className="text-m font-semibold  text-center">{address ? tokenBalance : ""}</h3>
        </div>
      </div>
      {address && (
        <>
          <div className="flex gap-4">
            <div className="card w-1/2 p-4 flex flex-col bg-slate-800 shadow-md rounded-lg items-center">
              <h2 className="text-lg font-semibold mb-2">Mint 100 Tokens</h2>
              <h3 className="flex items-center gap-2 mb-5">
                Minter Role {minterRole ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />}
              </h3>{" "}
              <button
                onClick={mintTokens}
                disabled={!address || loading}
                className="bg-blue-500 text-white py-2 px-4 h-16 rounded hover:bg-blue-600 disabled:bg-gray-400 w-64"
              >
                {loading ? "Minting..." : "Mint Tokens"}
              </button>
            </div>

            {/* Self Delegate Card */}
            <div className="card w-1/2 p-4 flex flex-col bg-slate-800 shadow-md rounded-lg items-center">
              <h2 className="text-lg font-semibold mb-2">Increase Voting Power</h2>
              <h3 className="mb-5">
                Voting Power:{" "}
                {Intl.NumberFormat("en-US", {
                  maximumFractionDigits: 2,
                }).format(parseFloat(votingPower) / 1e18)}{" "}
                MTK
              </h3>
              <button
                onClick={() => selfDelegate()}
                disabled={!address || loading2}
                className="bg-green-500 text-white py-2 px-4 h-16 rounded hover:bg-green-600 disabled:bg-gray-400 w-64"
              >
                {loading2 ? "Delegating..." : "Self Delegate"}
              </button>
            </div>
          </div>
        </>
      )}
      {result && <pre className="mt-4 text-green-500 whitespace-pre-wrap">{result}</pre>}
    </div>
  );
};

export default MintDelegate;
