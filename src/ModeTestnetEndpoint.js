/* global BigInt */

import { ethers } from "ethers";
import abi from "./utils/abi.json";

const modeTestnetRpcUrl = "https://sepolia.mode.network";
const contractAddress = "0x5B0A34037E3CdbABBcB3af712c989Cd65bEEd76F";

// Function to fetch the total number of predictions
export const fetchPredictions = async () => {
  const provider = new ethers.JsonRpcProvider(modeTestnetRpcUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    const totalPredictionsBigNumber = await contract.getTotalPredictions();
    const totalPredictions = totalPredictionsBigNumber.toString();
    return totalPredictions;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return null;
  }
};

// Function to fetch the latest predictions
export const fetchLatestPredictionsModeTestnet = async () => {
  const provider = new ethers.JsonRpcProvider(modeTestnetRpcUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    const totalPredictionsResponse = await contract.getTotalPredictions();
    const totalPredictions = BigInt(totalPredictionsResponse);
    const latestPredictionsArray = [];

    // Calculate the start index, ensuring it's not negative
    const startIndex =
      totalPredictions > BigInt(10) ? totalPredictions - BigInt(10) : BigInt(0); //how many to show in list

    for (let i = startIndex; i < totalPredictions; i++) {
      const prediction = await contract.predictions(i.toString());
      latestPredictionsArray.push(prediction);
    }

    return latestPredictionsArray.reverse();
  } catch (error) {
    console.error("Error fetching latest predictions:", error);
    return [];
  }
};
