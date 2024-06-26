import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import abi from "./utils/abi.json";
import "./App.css";
import {
  fetchPredictions,
  fetchLatestPredictionsModeTestnet,
} from "./ModeTestnetEndpoint";
import CountdownTimer from "./components/CountdownTimer";
import LatestPredictionsTable from "./components/LiveLatestPredictions";
import AdminPanel from "./components/AdminPanel";
import WinnerCard from "./components/WinnerCard";
import { Pyth } from "./Pyth";

//when changing contract address DONT FORGET to chnge in modetestnetendpoint file
const contractAddress = "0xD747cE0eFfca846Bf03B7ABEB66788c92DB48E7a";
const theQuestion = `Predict the BTC halving day price (in whole $USD)`; //easy to change the question up here

//FOR TESTING PURPOSES: MAINnet contract address to test around in staging env
// const contractAddress = "0xC239421EC67e13e2A90aDb3a0819899dbEe46f90";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [numberOfPredictions, setNumberOfPredictions] = useState(0);
  const [winningNumber, setWinningNumber] = useState("");
  const [sfsFeeAmount, setSfsFeeAmount] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [showWinningAnimation, setShowWinningAnimation] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showRegistrationStatus, setShowRegistrationStatus] = useState(false);
  const [isContractRegistered, setIsContractRegistered] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [sfsTokenId, setSfsTokenId] = useState(null);
  const [isModeNetwork, setIsModeNetwork] = useState(false);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [votingOptions, setVotingOptions] = useState([
    "Prediction 1",
    "Prediction 2",
    "Submit Your Own",
  ]);
  const [sfsBalance, setSfsBalance] = useState(null);
  const [contractBalance, setContractBalance] = useState(null);
  const [winnerPosition, setWinnerPosition] = useState(null);

  // // Temporary variable for development (set to 'true' to simulate being a winner)
  // const [isTempWinner, setIsTempWinner] = useState(true); // Change to true to test winner view

  // EVM connection stuff
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(
            contractAddress,
            abi,
            signer
          );

          setContract(contractInstance);
          const userAccount = await signer.getAddress();
          setAccount(userAccount);
          console.log(
            "Hey babes, come here often?... looks around the console...passes you a red wine..."
          );

          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setIsModeNetwork(chainId === "0x868b"); // "0x397" is Mode testnet network (chain ID 919)
          // "0x868b" is Mode mainnet network (chain ID 34443)
        } catch (error) {
          console.error(
            "Error during Ethereum provider initialization:",
            error
          );
        }
      } else {
        console.log(
          "Ethereum provider not found. You can view the data but cannot interact. Please login to Metamask"
        );
      }
    };

    init();
  }, []); // Empty dependency array so this runs only once and doesnt kill my cpu

  //are they an admin or a winner?
  useEffect(() => {
    const checkIfWinner = async () => {
      if (contract && account) {
        try {
          const position = await contract.winnerPosition(account);
          const isWinnerNow = position > 0;
          setIsWinner(isWinnerNow);
          setShowWinningAnimation(isWinnerNow); // Trigger the animation if the user is a winner
          setWinnerPosition(position);
        } catch (error) {
          console.error("Error checking winner status:", error);
        }
      }
    };

    const checkAdminAndWinnerStatus = async () => {
      if (contract && account) {
        try {
          const adminAddress = await contract.admin();
          const isAdminNow =
            adminAddress.toLowerCase() === account.toLowerCase();
          setIsAdmin(isAdminNow);
          console.log(isAdminNow);

          // Check if the logged-in user is a winner
          await checkIfWinner();
        } catch (error) {
          console.error("Error in admin and winner status check:", error);
        }
      }
    };

    checkAdminAndWinnerStatus();
  }, [contract, account]); // Dependencies // Re-run when contract or account changes

  //Functions
  const submitPrediction = useCallback(async () => {
    // Ensure the user is on the correct network and the prediction is valid before submitting
    if (!isModeNetwork) {
      alert(
        "Please change your network to Mode Mainnet to submit predictions."
      );
      return;
    }

    if (!prediction || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await contract.submitPrediction(prediction);
      console.log(`Prediction ${prediction} submitted`);
      setIsSubmitting(false);
      // Allow for immediate subsequent submissions
      setHasSubmitted(false);
      window.alert(`Prediction ${prediction} submitted. Good luck!`);

      // Reset the input field and button after successful submission
      setPrediction(""); // Clear the input field

      // Increment the prediction count locally JUST FOR NOW cos useeffect kills my cpu
      setNumberOfPredictions((prevCount) => Number(prevCount) + 1);
    } catch (error) {
      console.error("Error submitting prediction:", error);
      alert(`Transaction failed: ${error.message}`);
      setIsSubmitting(false);

      // Check if the error message contains "Admin cannot submit predictions" and show admin they cant submit
      if (error.message.includes("Admin cannot submit predictions")) {
        window.alert("🚫Admin cannot submit predictions, go away!🚫");
      }
    }
  }, [prediction, isSubmitting, contract]);

  // Fetch the total number of predictions and convert it to a string to show on ALL networks cos of modetestnetendpoint
  // fetch latest predictions for the live table
  useEffect(() => {
    const fetchData = async () => {
      const predictionsCount = await fetchPredictions();
      setNumberOfPredictions(predictionsCount);

      const latestPredictionsData = await fetchLatestPredictionsModeTestnet();
      setLatestPredictions(latestPredictionsData);
    };

    fetchData();
  }, []);

  // set up a listener for the RewardClaimed event so winner can see how much they won
  const listenForRewardClaimed = () => {
    // Listen for the event.
    contract.on("RewardClaimed", (winner, amount) => {
      const formattedAmount = ethers.formatEther(amount);
      alert(`Reward Claimed: ${formattedAmount} ETH`);
      setShowWinningAnimation(false); // Hide the winning animation after claiming
      // Stop listening to this event once it's caught
      contract.off("RewardClaimed");
    });
  };

  //WINNER POSITON - make sure has a position before claiming
  // const position = contract.winnerPosition(account);
  // console.log(`Winner Position: ${position}`);

  // async function checkWinnerAndClaim() {
  //   const position = await contract.winnerPosition(account);
  //   console.log(`Winner Position: ${position}`);
  //   if (position > 0) {
  //       // If the position is valid, then call claimReward
  //       await claimReward();
  //   } else {
  //       console.log("Not eligible or already claimed");
  //   }
  // }

  //function for winner to be able to get their prize
  const claimReward = async () => {
    setIsClaiming(true);
    try {
      // Set up the listener before sending the transaction
      listenForRewardClaimed();

      const txResponse = await contract.claimReward();
      await txResponse.wait(); // Wait for transaction confirmation, not sure if i need this actually
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("An error occurred while claiming the reward.");
    } finally {
      setIsClaiming(false);
      setIsWinner(false);
    }
  };

  //function only admin can see, to move the sfs fees to the contract - nft must be owned by contract to work
  const claimSFSFees = async () => {
    const amount = parseFloat(sfsFeeAmount); // Convert string to a floating-point number
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid SFS fee amount.");
      return; // Exit the function if the amount is not a valid number or less than or equal to zero
    }
    try {
      await contract.claimSFSFees(sfsFeeAmount);
      console.log(`SFS fees claimed: ${sfsFeeAmount}`);
    } catch (error) {
      console.error(
        "Error claiming SFS fees - make sure nft owned by contract:",
        error
      );
    }
  };

  //MORE ADMIN FUNCTIONS
  const fetchSfsTokenId = async () => {
    try {
      const tokenId = await contract.sfsTokenId();
      console.log("tokenId from contract:", tokenId); // Log tokenId
      setSfsTokenId(tokenId);
    } catch (error) {
      console.error("Error fetching SFS Token ID:", error);
    }
  };

  const checkContractRegistration = async () => {
    try {
      await fetchSfsTokenId(); // Fetch the token ID
      const isRegistered = await contract.checkRegistration();
      setIsContractRegistered(isRegistered);
      setShowRegistrationStatus(true);
    } catch (error) {
      console.error("Error checking contract registration:", error);
    }
  };

  const fetchSfsBalance = async () => {
    if (!contract) return;
    try {
      const balanceWei = await contract.checkSFSBalance();
      const balanceEth = ethers.formatEther(balanceWei);
      const formattedBalance = parseFloat(balanceEth).toFixed(6); // Rounds to 6 decimal places
      setSfsBalance(formattedBalance); // ETH instead of Wei
    } catch (error) {
      console.error("Error fetching SFS balance:", error);
    }
  };

  useEffect(() => {
    fetchSfsBalance();
  }, [contract]);

  const fetchContractBalance = async () => {
    if (!contract) return;
    try {
      const contractBalance = await contract.checkContractBalance();
      setContractBalance(contractBalance.toString());
    } catch (error) {
      console.error("Error fetching contract balance:", error);
    }
  };

  const transferNftBackToAdmin = async () => {
    if (!contract || !sfsTokenId) return;
    try {
      await contract.returnNftToAdmin(sfsTokenId);
      console.log(`NFT with token ID ${sfsTokenId} returned to admin`);
    } catch (error) {
      console.error("Error transferring NFT back to admin:", error);
    }
  };

  const resetGame = async () => {
    if (!contract) {
      console.error("Contract not initialized.");
      return;
    }
    try {
      // Check if the current user is the admin
      const adminAddress = await contract.admin();
      const userAddress = account; // Use the 'account' state variable
      if (userAddress !== adminAddress) {
        console.error("Only the admin can reset the game.");
        return;
      }
      // Send the transaction to reset the game
      const tx = await contract.resetGame();
      await tx.wait(); // Wait for the transaction to be mined
      console.log("Game reset successfully!");
      alert("The game has been reset!");
    } catch (error) {
      console.error("Error resetting the game:", error);
    }
  };

  ////////////RETURN//////////////
  return (
    <div className="app-container">
      {/* Admin panel */}
      <AdminPanel
        //so many props
        isAdmin={isAdmin}
        contract={contract}
        showRegistrationStatus={showRegistrationStatus}
        isContractRegistered={isContractRegistered}
        sfsTokenId={sfsTokenId}
        checkContractRegistration={checkContractRegistration}
        sfsBalance={sfsBalance}
        fetchSfsBalance={fetchSfsBalance}
        winningNumber={winningNumber}
        setWinningNumber={setWinningNumber}
        sfsFeeAmount={sfsFeeAmount}
        setSfsFeeAmount={setSfsFeeAmount}
        claimSFSFees={claimSFSFees}
        fetchContractBalance={fetchContractBalance}
        contractBalance={contractBalance}
        transferNftBackToAdmin={transferNftBackToAdmin}
        resetGame={resetGame}
      />

      {/* Winner card */}
      {isWinner && (
        <WinnerCard
          isClaiming={isClaiming}
          claimReward={claimReward}
          winnerPosition={winnerPosition}
        />
      )}

      {/*//////////MAIN CONTENT////////*/}

      <div className="marquee">
        <marquee>
          <span>Currently in Beta</span>
        </marquee>
        <p>
          Found a bug?
          <a
            href="https://m6dx8sgttqf.typeform.com/to/MRL1xyZN"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fcd116" }}
          >
            {" "}
            Let me know
          </a>
        </p>
      </div>

      {/*//////////BALANCE MARQUEE PAUSED FOR NOW////////*/}
      {/* <div className="marquee">
        <marquee>
          prize fund value:{" "}
          <span>
            {sfsBalance
              ? `${sfsBalance} ETH`
              : "connect to Mode Mainet to view..."}
          </span>
        </marquee>
      </div> */}
      {/*//////////BALANCE MARQUEE PAUSED FOR NOW////////*/}

      <div className="wallet-address">
        {account && (
          <p>
            Address: {account.substring(0, 4)}...
            {account.substring(account.length - 5)}
          </p>
        )}
        {isModeNetwork ? (
          <p>Connected to: MODE MAINNET</p>
        ) : (
          <p>Please change your network to Mode Mainet!</p>
        )}
      </div>

      <div className="gamble-box">
        <header className="app-header">
          <h1 className="app-title">Gumbledapp</h1>

          <div className="countdown-timer">
            <CountdownTimer />
            <p>Predictions Count: {numberOfPredictions}</p>
          </div>
        </header>

        <main className="main-content">
          <div className="prediction-section">
            <h2 className="section-title">This Months Gumble</h2>
            <div className="prediction-input-wrapper">
              <input
                type="number"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                className="prediction-input"
                placeholder={theQuestion} // Set the placeholder to the value of theQuestion cos its easier to change
              />
              <button
                onClick={submitPrediction}
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner" role="img" aria-label="spinner">
                    Submitting... 🐸
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </main>
        <div className="testnet-coins-tab">
          <a
            href="https://docs.mode.network/mode-mainnet/bridge/bridge-to-mode"
            target="_blank"
            rel="noopener noreferrer"
          >
            Need Mode ETH?
          </a>
        </div>
      </div>
      <div className="rules-section">
        <div className="rules">
          <h3 className="rules-title">
            <span
              style={{
                color: "#FF2E63",
                fontSize: "1.2em",
                textShadow: "0 0 10px #FF2E63",
              }}
            >
              Rules:
            </span>{" "}
            the closest prediction to the price when the countdowntimer runs
            down wins a share of the contract fees(via SFS)! The more people
            interact with this contract, the more Eth to be won!
          </h3>
          You can submit as many times as you like, *free, just costs gas.
          <br></br>
          <br></br>
          Submissions close 24 hours before countdown timer ends. Winners have
          36hrs to claim.
        </div>
      </div>
      <div className="prediction-box-container">
        <LatestPredictionsTable
          predictions={latestPredictions}
          numberOfPredictions={numberOfPredictions}
        />
        {/* // i'll figure out voting functionality after hackathon cos there's no time */}
        {/* <div className="prediction-box voting-box">
          <h4>Coming soon...</h4>
          <h3>Vote for the Next Prediction</h3>
          <ul>
            {votingOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
}

export default App;
