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

// contract SFSFractioniser {
//     //modifier to make sure admin can't submit a prediction or get a prize!
//     modifier onlyNotAdmin() {
//         require(msg.sender != admin, "Admin cannot submit predictions");
//         _;
//     }

//     IFeeSharing public feeSharingContract;
//     uint256 public sfsTokenId;
//     address payable public admin;

//     // mapping to track if number has been already predicted
//     mapping(uint256 => bool) public hasBeenPredicted;

//     struct Prediction {
//     address predictor;
//     uint256 predictedNumber;
//     }

//     Prediction[] public predictions;
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

//     event WinningNumberSet(uint256 winningNumber);
//     event RewardClaimed(address indexed winner, uint256 amount);

//     constructor(address _feeSharingContractAddress, uint256 _sfsTokenId) {
//         admin = payable(msg.sender);
//         feeSharingContract = IFeeSharing(_feeSharingContractAddress);
//         sfsTokenId = _sfsTokenId;
//         // Assign an existing tokenId to this contract
//         feeSharingContract.assign(sfsTokenId);
//     }

//     // PREDICTIONS STUFF
//     function submitPrediction(uint256 _predictedNumber) external onlyNotAdmin {
//         require(!hasBeenPredicted[_predictedNumber], "Number already predicted");
//         predictions.push(Prediction(msg.sender, _predictedNumber));
//         hasBeenPredicted[_predictedNumber] = true;
//         emit PredictionSubmitted(msg.sender, _predictedNumber);
//     }

//     function getTotalPredictions() external view returns (uint256) {
//         return predictions.length;
//     }

//     //WINNER STUFF
//     function setWinningNumber(uint256 _winningNumber) external {
//     require(msg.sender == admin, "Only admin can set the winning number");
//     winningNumber = _winningNumber;
//     determineWinners();
//     emit WinningNumberSet(_winningNumber);
//     }

//     function determineWinners() private {
//         require(predictions.length >= 3, "Not enough predictions");
//         // Simple algorithm to find the top 3 closest predictions
//         uint256[3] memory closest;
//         uint256[3] memory closestDiff = [
//             type(uint256).max,
//             type(uint256).max,
//             type(uint256).max
//         ];

//         for (uint i = 0; i < predictions.length; i++) {
//             uint256 diff = abs(predictions[i].predictedNumber, winningNumber);

//             for (uint j = 0; j < 3; j++) {
//                 if (diff < closestDiff[j]) {
//                     for (uint k = 2; k > j; k--) {
//                         closest[k] = closest[k - 1];
//                         closestDiff[k] = closestDiff[k - 1];
//                     }
//                     closest[j] = i;
//                     closestDiff[j] = diff;
//                     break;
//                 }
//             }
//         }

//         for (uint i = 0; i < 3; i++) {
//             winnerPosition[predictions[closest[i]].predictor] = i + 1;
//         }

//         emit WinnersDetermined(
//             predictions[closest[0]].predictor,
//             predictions[closest[1]].predictor,
//             predictions[closest[2]].predictor
//         );
//     }

//     function abs(uint256 a, uint256 b) private pure returns (uint256) {
//     return a >= b ? a - b : b - a;
//     }

//     function claimReward() external payable {
//     uint256 position = winnerPosition[msg.sender];
//     require(position > 0, "Not a winner or already claimed"); // Ensure caller is a winner and hasn't claimed
    
//     uint256 totalReward = address(this).balance;
//     uint256 adminFee = totalReward / 10; // Calculate 10% for admin
//     uint256 prizePool = totalReward - adminFee; // Remaining 90% for prize distribution
//     uint256 reward;

//     if (position == 1) {
//         reward = (prizePool * 50) / 100; // 50% for 1st place
//     } else if (position == 2) {
//         reward = (prizePool * 25) / 100; // 25% for 2nd place
//     } else if (position == 3) {
//         reward = (prizePool * 15) / 100; // 15% for 3rd place
//     } else {
//         // if the position doesn't match 1, 2, or 3, no further execution occurs
//         revert("Invalid position or already claimed");
//     }

//     (bool rewardSent, ) = payable(msg.sender).call{value: reward}("");
//     require(rewardSent, "Failed to send winning share");
//     winnerPosition[msg.sender] = 0; // Reset winner position after claiming
//     emit RewardClaimed(msg.sender, reward);
//     }

//     bool public adminFeeClaimed = false; // Track if the admin fee has been claimed

//     function claimAdminFee() external {
//     require(msg.sender == admin, "Only the admin can claim the fee");
//     require(!adminFeeClaimed, "Admin fee already claimed");
    
//     uint256 adminFee = address(this).balance / 10; // Calculate admin fee as 10% of current balance
//     adminFeeClaimed = true; // Mark the admin fee as claimed

//     (bool adminSent, ) = payable(admin).call{value: adminFee}("");
//     require(adminSent, "Failed to send admin fee");
//     emit AdminFeeTransferred(admin, adminFee);
// }
//     // Event to log the transfer of 10% to admin for TESTING!! - can remove when fixed 
//     event AdminFeeTransferred(address indexed admin, uint256 amount);

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
//     function returnNftToAdmin(uint256 tokenId) external {
//     require(msg.sender == admin, "Only admin can retrieve the NFT");
//     address _feeSharingContractAddress = address(feeSharingContract); // NFT contract address from Mode
//     IERC721 nftContract = IERC721(_feeSharingContractAddress);
//     nftContract.transferFrom(address(this), admin, tokenId); // Transfer NFT back to admin
// }

//     // Ensure the contract can receive ETH
//     receive() external payable {}
//     fallback() external payable {}

//     //SFS FEE CLAIMING 
//     event ClaimSFSFeesAttempt(address indexed admin, uint256 tokenId, uint256 amount);

//     function claimSFSFees(uint256 amount) external {
//     require(msg.sender == admin, "Only admin can claim SFS fees");
//     emit ClaimSFSFeesAttempt(admin, sfsTokenId, amount);
//     feeSharingContract.withdraw(sfsTokenId, payable(address(this)), amount);
// }

//     //check the Ether balance of this contract
//     function checkContractBalance() public view returns (uint256) {
//     return address(this).balance;
// }

//     //RESET PREDICTIONS
//     function resetGame() public {
//     require(msg.sender == admin, "Only admin can reset the game");
//     // Clear the predictions array
//     delete predictions;
//     // Reset the winning number
//     winningNumber = 0;
//     // Reset winner positions for all addresses
//     for (uint256 i = 0; i < predictions.length; i++) {
//     delete winnerPosition[predictions[i].predictor];
//     }
//     // Reset hasBeenPredicted mapping
//     for (uint256 i = 0; i < predictions.length; i++) {
//     delete hasBeenPredicted[predictions[i].predictedNumber];
//     }
//     // Reset admin winning claim
//     adminFeeClaimed = false; // Reset admin fee claim flag
//     }

// }