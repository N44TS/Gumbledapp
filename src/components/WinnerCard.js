import React from "react";

function WinnerCard({ isClaiming, claimReward }) {
  return (
    <div
      className={isClaiming ? "winning-animation-spin" : "winning-animation"}
    >
      <div className="winning-message">
        You Won!
        <p>3rd place</p>
        <button
          onClick={claimReward}
          className="claim-button"
          disabled={isClaiming}
        >
          {isClaiming ? "please wait..." : "Get my money"}
        </button>
      </div>
    </div>
  );
}

export default WinnerCard;
