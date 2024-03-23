// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// interface IFeeSharing {
//     function assign(uint256 _tokenId) external;

//     function withdraw(
//         uint256 _tokenId,
//         address payable _recipient,
//         uint256 _amount
//     ) external returns (uint256);

//     function getTokenId(address _smartContract) external view returns (uint256);

//     function isRegistered(address _smartContract) external view returns (bool);

//     function balances(uint256 tokenId) external view returns (uint256);
// }

// contract GumbledappV1 {
//     //modifiers to make sure admin can't submit a prediction or get a prize but can do other stuff
//     modifier onlyNotAdmin() {
//         require(msg.sender != admin, "Admin cannot submit predictions");
//         _;
//     }

//        modifier onlyAdmin() {
//         require(msg.sender == admin, "Only the admin can perform this action.");
//         _;
//     }

//     IFeeSharing public immutable feeSharingContract;
//     address payable public immutable admin;
//     uint256 public immutable sfsTokenId;

//     uint256 public winningNumberSetBalance; // contract balance snapshot as soon as winning number set
//     mapping(uint32 => mapping(uint32 => bool)) public hasBeenPredictedByVersion; // mapping to track if number has been already predicted in this game version
//     uint32 public gameVersion = 1; 
//     uint32 public gameEndTime = 0;

//     struct Prediction {
//     address predictor;
//     uint256 predictedNumber;
//     }

//     Prediction[] public predictions;
//     //  winningAddresses array here
//     address[3] public winningAddresses;
//     uint256 public winningNumber;
//     mapping(address => uint256) public winnerPosition;
     
//     event PredictionSubmitted(
//         address indexed predictor,
//         uint256 predictedNumber
//     );

//     event WinnersDetermined(
//         address indexed firstPlace,
//         address indexed secondPlace,
//         address indexed thirdPlace
//     );
    
//     event WinningNumberSet(uint32 winningNumber);
//     event RewardClaimed(address indexed winner, uint256 amount);

//     constructor(address _feeSharingContractAddress, uint256 _sfsTokenId) {
//         admin = payable(msg.sender);
//         feeSharingContract = IFeeSharing(_feeSharingContractAddress);
//         sfsTokenId = _sfsTokenId;
//         // Assign an existing tokenId to this contract
//         feeSharingContract.assign(sfsTokenId);
//     }

//     // PREDICTIONS STUFF
//     function submitPrediction(uint32 _predictedNumber) external onlyNotAdmin {
//         require(gameEndTime == 0 || block.timestamp < gameEndTime, "Submissions closed.");
//         require(!hasBeenPredictedByVersion[gameVersion][_predictedNumber], "Number already predicted in this cycle");
//         predictions.push(Prediction(msg.sender, _predictedNumber));
//         hasBeenPredictedByVersion[gameVersion][_predictedNumber] = true;
//         emit PredictionSubmitted(msg.sender, _predictedNumber);
//     }

//     function getTotalPredictions() external view returns (uint256) {
//         return predictions.length;
//     }

//     //WINNER STUFF
//     function setWinningNumber(uint32 _winningNumber) external onlyAdmin {
//     // Update the contractbalance at the time of setting the winning number
//     winningNumberSetBalance = address(this).balance;

//     // Deduct and transfer the admin fee as soon as the winning number is set
//     uint256 adminFee = winningNumberSetBalance * 20 / 100; // 20% fee of the winningNumberSetBalance
//     (bool adminSent, ) = payable(admin).call{value: adminFee}("");
//     require(adminSent, "Failed to send admin fee");

//     winningNumber = _winningNumber;
//     determineWinners();
//     emit WinningNumberSet(_winningNumber);
//     }

//     /// find the winners algo
//    function determineWinners() private {
//     require(predictions.length > 0, "No predictions made.");

//     // Step 1: Collect the closest prediction for each unique address
//     address[] memory uniqueAddresses = new address[](predictions.length);
//     uint256[] memory closestPredictions = new uint256[](predictions.length);
//     uint256 uniqueCount = 0;

//     for (uint256 i = 0; i < predictions.length; i++) {
//         bool addressFound = false;
//         for (uint256 j = 0; j < uniqueCount; j++) {
//             if (predictions[i].predictor == uniqueAddresses[j]) {
//                 addressFound = true;
//                 uint256 currentDiff = absDifference(closestPredictions[j], winningNumber);
//                 uint256 newDiff = absDifference(predictions[i].predictedNumber, winningNumber);
//                 if (newDiff < currentDiff) {
//                     closestPredictions[j] = predictions[i].predictedNumber;
//                 }
//                 break;
//             }
//         }
//         if (!addressFound) {
//             uniqueAddresses[uniqueCount] = predictions[i].predictor;
//             closestPredictions[uniqueCount] = predictions[i].predictedNumber;
//             uniqueCount++;
//         }
//     }

//     // Step 2: Identify top 3 unique predictions
//     uint256[3] memory topDiffs = [type(uint256).max, type(uint256).max, type(uint256).max];
//     address[3] memory topAddresses;

//     for (uint256 i = 0; i < uniqueCount; i++) {
//         uint256 diff = absDifference(closestPredictions[i], winningNumber);
//         for (uint256 j = 0; j < 3; j++) {
//             if (diff < topDiffs[j]) {
//                 for (uint256 k = 2; k > j; k--) {
//                     topDiffs[k] = topDiffs[k - 1];
//                     topAddresses[k] = topAddresses[k - 1];
//                 }
//                 topDiffs[j] = diff;
//                 topAddresses[j] = uniqueAddresses[i];
//                 break;
//             }
//         }
//     }

//      // Update the state with the winners and their positions
//     for (uint256 i = 0; i < 3; i++) {
//         winningAddresses[i] = topAddresses[i]; // Update winning addresses
//         // Ensure only valid addresses are updated
//         if (winningAddresses[i] != address(0)) {
//             winnerPosition[winningAddresses[i]] = i + 1; // Update positions, 1-indexed
//         }
//     }

//     emit WinnersDetermined(winningAddresses[0], winningAddresses[1], winningAddresses[2]);
// }

//     function absDifference(uint256 a, uint256 b) private pure returns (uint256) {
//         return a > b ? a - b : b - a;
//     }
  
//     function claimReward() external payable {
//     uint256 position = winnerPosition[msg.sender];
//     require(position > 0, "Not a winner or already claimed"); // Ensure caller is a winner and hasn't claimed
    
//     // Use the stored balance (winningNumberSetBalance) to calculate reward so based off non-flexi number
//     uint256 prizePool = winningNumberSetBalance;
//     uint256 reward;

//     if (position == 1) {
//         reward = (prizePool * 50) / 100; // 50% for 1st place
//     } else if (position == 2) {
//         reward = (prizePool * 15) / 100; // 15% for 2nd place
//     } else if (position == 3) {
//         reward = (prizePool * 15) / 100; // 15% for 3rd place
//     } else {
//         // if the position doesn't match 1, 2, or 3, no further execution occurs
//         revert("Invalid position or already claimed");
//     }

//     (bool rewardSent, ) = payable(msg.sender).call{value: reward}("");
//     require(rewardSent, "Failed to send winning share");
//     winnerPosition[msg.sender] = 0; // Resets winner position after claiming so cannot claim again
//     emit RewardClaimed(msg.sender, reward);
//     }

//     // other bits not to do with rewards or winning
//     function checkRegistration()
//         external
//         view
//         returns (bool)
//     {
//         bool isRegistered = feeSharingContract.isRegistered(address(this));
//         return (isRegistered);
//     }

//     // check the balance of the sfs nft
//     function checkSFSBalance() external view returns (uint256) {
//     return feeSharingContract.balances(sfsTokenId);
// }

//     // need to make this contract owner of the sfs nft, to recive it from admin wallet need this
//     function onERC721Received(address operator, address/* from */, uint256 tokenId, bytes memory /* data */) public pure returns (bytes4) {}

//     // return nft to admin wallet
//     function returnNftToAdmin(uint256 tokenId) external onlyAdmin {
//     address _feeSharingContractAddress = address(feeSharingContract); // NFT contract address from Mode
//     IERC721 nftContract = IERC721(_feeSharingContractAddress);
//     nftContract.transferFrom(address(this), admin, tokenId); // Transfer NFT back to admin
// }

//     // Ensure the contract can receive ETH
//     receive() external payable {}
//     fallback() external payable {}

//     //SFS FEE CLAIMING - contract must hold the nft
//     event ClaimSFSFeesAttempt(address indexed admin, uint256 tokenId, uint256 amount);

//     function claimSFSFees(uint256 amount) external onlyAdmin {
//     emit ClaimSFSFeesAttempt(admin, sfsTokenId, amount);
//     feeSharingContract.withdraw(sfsTokenId, payable(address(this)), amount);
// }

//     //check the Ether balance of this contract
//     function checkContractBalance() external view returns (uint256) {
//     return address(this).balance;
// }

// ///cut off submissions 24hours before game cycle ends for fairness
// // needs to be set manually as 24 hours before - unixtimestamp.com
// function setGameEndTime(uint32 _gameEndTime) external onlyAdmin {
//     require(_gameEndTime > block.timestamp, "End time must be in the future.");
//     gameEndTime = _gameEndTime;
// }

//     //RESET PREDICTIONS
//     function resetGame() external onlyAdmin {
//     // Reset winner positions for all addresses // Reset hasBeenPredicted mapping for the current game version
//     for (uint256 i = 0; i < predictions.length; i++) {
//     delete winnerPosition[predictions[i].predictor];
//     // hasBeenPredictedByVersion[uint32(gameVersion)][uint32(predictions[i].predictedNumber)] = false; // MAY OR MAY NOT BE NEEDED< TEST!
//     }
//      // Clear the predictions array
//     delete predictions;
//     // Increment the game version
//     gameVersion++; 
//     // Reset the winning number
//     winningNumber = 0;
//     winningNumberSetBalance = 0;
//     //reset the gameendtime back to zero so submissions can restart
//     gameEndTime = 0; // Or set to a future timestamp if wnt winners claim window
//     }
// }