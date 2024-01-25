import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./utils/abi.json";
import "./App.css";
import CountdownTimer from "./CountdownTimer";
import {
  fetchPredictions,
  fetchLatestPredictionsModeTestnet,
} from "./ModeTestnetEndpoint";
import LatestPredictionsTable from "./LiveLatestPredictions";

const contractAddress = "0xD228cE3E08937f7D0A1869e4C694FBf3Bf78f66f"; //usually would be in .env but here for hackathon so can be checked on chain
const theQuestion = `Predict MILADY MAKER floor price (whole $USD) `; //easy to change the questoin up here

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [numberOfPredictions, setNumberOfPredictions] = useState(0);
  const [winningNumber, setWinningNumber] = useState("");
  const [sfsFeeAmount, setSfsFeeAmount] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [showRegistrationStatus, setShowRegistrationStatus] = useState(false);
  const [isContractRegistered, setIsContractRegistered] = useState(null);
  const [showWinningAnimation, setShowWinningAnimation] = useState(false);
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

  // // Temporary variable for development (set to 'true' to simulate being a winner)
  // const [isTempWinner, setIsTempWinner] = useState(true); // Change to true to test winner view

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

          const adminAddress = await contractInstance.admin();
          setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase());
          console.log("Are you admin?:", isAdmin);

          // Check if the logged-in user is a winner
          checkIfWinner(userAccount);

          // Check the chain ID to see if it's the Mode network
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setIsModeNetwork(chainId === "0x397"); // "0x397" corresponds to the Mode network (chain ID 919)
        } catch (error) {
          console.error(
            "Error during Ethereum provider initialization:",
            error
          );
        }
      } else {
        console.log(
          "Ethereum provider not found. You can view the data but cannot interact. PLs login to Metamask"
        );
        // fetchData();
      }
    };

    init();
    checkIfWinner();
  }, [account, contract]);

  const checkIfWinner = async () => {
    if (contract && account) {
      try {
        const position = await contract.winnerPosition(account);
        const isWinnerNow = position > 0;
        setIsWinner(isWinnerNow);
        setShowWinningAnimation(isWinnerNow); // Trigger the animation if the user is a winner
      } catch (error) {
        console.error("Error checking winner status:", error);
      }
    }
  };

  const checkIfAdmin = async (userAccount) => {
    try {
      const adminAddress = await contract.admin(); // Use contract directly
      setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase());
      console.log("Is Admin:", isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const submitPrediction = async () => {
    if (!prediction || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await contract.submitPrediction(prediction);
      console.log(`Prediction ${prediction} submitted`);
      setIsSubmitting(false);
      // Allow for immediate subsequent submissions
      setHasSubmitted(false);

      setShowWinningAnimation(true);
      window.alert(`Prediction ${prediction} submitted. Good luck!`);

      // Reset the input field and button after successful submission
      setPrediction(""); // Clear the input field

      // Increment the prediction count locally JUST FOR NOW cos useeffect kills my cpu
      setNumberOfPredictions((prevCount) => Number(prevCount) + 1);
    } catch (error) {
      console.error("Error submitting prediction:", error);
      setIsSubmitting(false);

      // Check if the error message contains "Admin cannot submit predictions" and show admin they cant submit
      if (error.message.includes("Admin cannot submit predictions")) {
        window.alert("🚫Admin cannot submit predictions, go away!🚫");
      }
    }
  };

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

  //function for winner to be able to get their prize
  const claimReward = async () => {
    try {
      await contract.claimReward();
      console.log("Reward claimed");
      setShowWinningAnimation(false); // Hide the winning animation after claiming
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  //function only admin can see, to set the winning number
  const setWinningNum = async () => {
    if (!winningNumber) return;
    try {
      await contract.setWinningNumber(winningNumber);
      console.log(`Winning number set to ${winningNumber}`);

      // Reset the winning number state after successful transaction
      setWinningNumber("");
    } catch (error) {
      console.error("Error setting winning number:", error);
    }
  };

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
      console.error("Error claiming SFS fees:", error);
    }
  };

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
      await fetchSfsTokenId(); // Call the function to fetch the token ID
      const [isRegistered, balanceBlock] =
        await contract.checkRegistrationAndBalanceBlock();
      console.log("tokenId from contract:", sfsTokenId); // Log tokenId
      setIsContractRegistered(isRegistered);
      setShowRegistrationStatus(true);
    } catch (error) {
      console.error("Error checking contract registration:", error);
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

  ////////////////////////////////
  ////////BRING IN THE RETURN////////////////
  ////////////////////////////////
  return (
    <div className="app-container">
      {/* Admin panel stuff */}
      {isAdmin && (
        <section className="admin-panel">
          <h2>Admin Panel</h2>
          <div className="admin-item">
            <label>Contract Registered?:</label>
            {!showRegistrationStatus && (
              <button onClick={checkContractRegistration}>
                Click to Check
              </button>
            )}
            {showRegistrationStatus && (
              <p>
                {isContractRegistered
                  ? `Yes! Woohoo! TokenID:#${sfsTokenId}`
                  : "No :( wtf"}
              </p>
            )}
          </div>
          <div className="admin-item">
            <label>Set Winning Number:</label>
            <input
              type="number"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value)}
            />
            <button onClick={setWinningNum}>Submit Winning Number</button>
          </div>
          <div className="admin-item">
            <label>Claim SFS Fees:</label>
            <input
              type="number"
              value={sfsFeeAmount}
              onChange={(e) => setSfsFeeAmount(e.target.value)}
            />
            <button onClick={claimSFSFees}>Send Fees to Contract</button>
          </div>

          <div className="admin-item">
            <button onClick={resetGame}>RESET GAME</button>
          </div>
        </section>
      )}

      {isWinner && (
        <div className="winning-animation">
          <div className="winning-message">
            You Won!
            <p>yes, srsly....</p>
            <button onClick={claimReward} className="claim-button">
              get my money
            </button>
          </div>
        </div>
      )}

      {/* 
      ///////////////////////////// 
      ////////MAIN CONTENT///////////
     ///////////////////////////// */}
      <div className="wallet-address">
        {account && (
          <p>
            Address: {account.substring(0, 4)}...
            {account.substring(account.length - 5)}
          </p>
        )}
        {isModeNetwork ? (
          <p>Connected to: MODE TESTNET</p>
        ) : (
          <p>Please change your network to Mode Testnet!</p>
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
            <h2 className="section-title">This Weeks Gumble</h2>
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
            closest to actual price when the countdowntimer runs down wins a
            share of the contract fees(via SFS)! The more people interact with
            this contract, the more Eth to be won!
          </h3>
          You can submit as many times as you like, *just costs gas.
        </div>
      </div>
      <div className="prediction-box-container">
        <LatestPredictionsTable predictions={latestPredictions} />
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
