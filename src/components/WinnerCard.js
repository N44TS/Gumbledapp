import React from "react";

function WinnerCard({ isClaiming, claimReward, winnerPosition }) {
  // convert to a number that avoids BigInt issues
  const positionNumber = Number(winnerPosition);

  // convert position to ordinal text
  const ordinal = (n) => {
    const ordinals = ["1st", "2nd", "3rd"];
    return ordinals[n - 1] || `${n}th`;
  };

  return (
    <div
      className={isClaiming ? "winning-animation-spin" : "winning-animation"}
    >
      <div className="winning-message">
        You Won!
        <p>{ordinal(positionNumber)} place 🏆</p>
        <button
          onClick={claimReward}
          className="claim-button"
          disabled={isClaiming}
        >
          {isClaiming ? "Please wait..." : "Claim Prize"}
        </button>
      </div>
    </div>
  );
}

export default WinnerCard;
