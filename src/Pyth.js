import React, { useState } from "react";
import { ethers } from "ethers";
import PythAbi from "./utils/pythAbi.json";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

export const Pyth = ({ contract, isAdmin }) => {
  // const contractAddress = "0x5b52675E9Db145a454e880999CC7d070f3c149C0"; //mycontracts address

  const pythContractAddress = "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729"; // Pyth mode MAINNET contract address

  const updatePrice = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pythContract = new ethers.Contract(
        pythContractAddress,
        PythAbi,
        signer
      );

      // Establish a connection to the Pyth Hermes API
      const connection = new EvmPriceServiceConnection(
        "https://hermes.pyth.network"
      );

      // Specify the price feed IDs you're interested in, this is btc/usd
      const priceIds = [
        "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      ];

      // Fetch the latest price feed update data
      const updateData = await connection.getPriceFeedsUpdateData(priceIds);
      console.log("Update data fetched:", updateData);

      // Fetch the update fee using the updateData
      const fee = await pythContract.getUpdateFee(updateData);
      console.log("Update fee required:", ethers.formatEther(fee), "ETH");

      // Send the transaction with the update data and fee
      const tx = await pythContract.updatePriceFeeds(updateData, {
        value: fee,
      });
      await tx.wait(); // Wait for the transaction to be mined
      console.log("Price feed updated");
      alert("Price feed updated");

      const priceId =
        "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"; //btc to usd price id

      // Call to get the latest price that we just hopefully updated
      const fetchedPriceData = await pythContract.getPrice(priceId);
      console.log("Updated Price Data:", fetchedPriceData);

      // Format price for human readability and suitability as a winning number
      const winningNumber = (
        Number(fetchedPriceData.price) *
        Math.pow(10, Number(fetchedPriceData.expo))
      ).toFixed(0);
      console.log(`Formatted Winning Number: ${winningNumber}`);

      // Now set the winning number using the formatted value
      try {
        await contract.setWinningNumber(winningNumber);
        console.log(`Winning number successfully set to ${winningNumber}`);
        alert(`Winning number successfully set to ${winningNumber}`);
      } catch (error) {
        console.error("Error setting winning number:", error);
      }
    } catch (error) {
      console.error("Failed to fetch price:", error);
    }
  };

  if (!isAdmin) return null;
  return (
    <div>
      <button onClick={updatePrice}>
        Set Winning Number (2 txns pythfee + setnumber){" "}
      </button>
    </div>
  );
};
