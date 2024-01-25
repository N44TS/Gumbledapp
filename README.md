# 🐸  Gumbledapp – Mode Degen Hackathon Submission

A decentralized prediction-based game built on the Mode network, made to leverage the Sequencer Fee Sharing (SFS) mechanism. Gumbledapp allows users to make predictions on specific events, submitting predictions and competing for a chance to win a share of the sequencer fees collected by the contract. 

For this hackathon I tried to utilise SFS creatively, looking for ways the concept could be used in a fun way. This dApp offers an engaging and potentially rewarding way for users to engage with the SFS mechanism and test their prediction skills.

Live Demo: [Gumbledapp Testnet](https://sfssharer.vercel.app/)

For the best experience view on web, the application is currently not optimized for mobile devices.

## Table of Contents

- [🐸  Gumbledapp – Mode Degen Hackathon Submission](#--gumbledapp--mode-degen-hackathon-submission)
  - [Table of Contents](#table-of-contents)
  - [Features Summary](#features-summary)
  - [Usage](#usage)
  - [Prerequisites](#prerequisites)
  - [License](#license)
  - [Credits](#credits)
  - [FAQs](#faqs)
  - [Conclusion](#conclusion)
  - [In-depth with the "Claim SFS Fee" Function](#in-depth-with-the-claim-sfs-fee-function)


## Features Summary

- **Decentralized Predictions**: Users can submit predictions for a specified event or outcome (e.g., the floor price of an NFT collection by a specific date) by interacting with the smart contract, paying only gas fees.

- **Funding Source / Sequencer Fee Sharing**: The prize money comes directly from the fees collected by the contract itself. The contract is registered in the Fee Sharing Contract, which means that with every interaction, it earns a share of the network's Sequencer fees. These fees accumulate over time, as users submit their predictions and interact with the contract, making the prize pool more attractive as more users participate.

- **Contract Balance**: The fees eventually end up in the smart contract's balance after executing the "Claim SFS Fee" function. This function is responsible for withdrawing accumulated fees from the Fee Sharing System (SFS) and transferring them to Gumbledapps smart contract. [Read more about it here](#in-depth-with-the-claim-sfs-fee-function)

- **Prize Allocation**: The smart contract is responsible for determining winners and distributing prizes. Winners are determined based on who predicts a number closest to a specific value. This means that winning is not based on random choice but also skill and prediction accuracy.

- **Prize Distribution**: The DApp automatically distributes prizes to the top three participants with predictions closest to the actual outcome. The prizes consist of a share (currently 50%, 30%, 20%) of the fees collected from the Sequencer Fee Sharing (SFS) mechanism over the past two weeks. Currently, the admin has the responsibility to manually claim these fees to the contract (see admin panel below for more info)

- **Claiming Rewards**: The contract automatically identifies the winners and communicates with the frontend to enable them to claim their share of the fees with just a click of a button.

  **Admin Panel**: 
- Provides the capability to check whether the contract is registered with SFS. 
- Allows for setting the result (oracle integration planned as the next step)
- Reset the game button; this function clears the predictions array and resets the winningNumber. It also clears the winnerPosition mapping for all addresses that have made predictions
- Claim SFS fees. Note that the admin must click a button that pays out directly to the contract (see above). Its hard coded in the contract that only the contract address is payable from this function, there is no way for the admin to personally receive the fees.

- **Countdown Timer**: The DApp features a countdown timer that adds an element of excitement and anticipation to the game.

- **Submission Counter**: Keep track of the number of predictions submitted.

- **Wallet and Network Info**: Display wallet and network information.

- **Live latest predictions board**: a bit of fun, see what other people are thinking and predicting, adds some competitivness. 


## Usage
*Please make sure you are connected to the Mode testnet in order to submit.* 

1. Navigate to the prediction section and enter your prediction for the specified event.

2. Click the "Submit" button to submit your prediction. This will open MetaMask for transaction approval. Pay a small gas fee to interact with the contract and save your prediction.

3. If your prediction is among the top three closest to the actual outcome, you'll be notified as a winner. Simply click the "Claim Reward" button to receive your prize.

4. Admin Panel: Accessible only by the contract creator.

## Prerequisites

Before getting started with Gumbledapp, make sure you have the following prerequisites:

- MetaMask installed in your browser.
- An Ethereum wallet with some Sequila Ether bridged to Mode on the Mode testnet for interacting with the DApp. Refer to the documentation [here](https://www.mode.network/) for more instructions and how to do it.

## License

This project is licensed under the MIT License.

## Credits
Gumbledapp was created by me, @N44TS. Hello. 


## FAQs

**How are predictions processed?**

Predictions are processed by Gumbledapp's smart contract. The contract calculates the difference between each prediction and the actual outcome. The three closest predictions receive rewards from the prize pool.

**Can I submit multiple predictions?**

Yes, you can submit multiple predictions for the same event. Each prediction is treated as a separate entry.

**How often are rewards distributed?**

Rewards are distributed automatically to winners when a new winning number is set by the admin. Typically, rewards are distributed shortly after the event's outcome is known and after the SFS rewards have been confirmed and transferred to the contract.

## Conclusion

Gumbledapp represents a creative application of the SFS mechanism, eventually creating a unique system where the game and the smart contract work seamlessly together, forming a self-sustaining cycle of interactions. It offers users a unique and engaging experience. 

Gumbledapp provides an exciting way to interact with the Mode network, so have fun, make predictions, win rewards!


## In-depth with the "Claim SFS Fee" Function

The "Claim SFS Fee" function in the contract serves as a mechanism for withdrawing accumulated fees from the Fee Sharing System (SFS). Here's how it works:

**Trigger Fee Withdrawal**: When this function is called, it triggers a request to the Fee Sharing Contract to withdraw a specified amount of fees. These fees represent the portion that has been accumulated as a result of transactions involving this smart contract.

**Interaction with the Fee Sharing Contract**: The Gumbledapp contract communicates with the Fee Sharing Contract by calling its withdraw function. This interaction is facilitated through the interface IFeeSharing, which the Gumbledapps contract uses to interact with the Fee Sharing Contract.

**Specifying Amount and Recipient**: In the function call, it's specified the amount of fees to be withdrawn and the recipient's address. The recipient is hard-coded to be the smart contract itself (address(this)), meaning that the withdrawn fees are transferred to the smart contract's balance immediately.

**Role of Admin**: Only the admin wallet address can call this function. This is to prevent unauthorized withdrawals from the Fee Sharing System.

**Post-Withdrawal Actions**: After the fees are successfully withdrawn to the contract, they remain in the contract's balance. The contract manages these funds, including distributing them to winners.
