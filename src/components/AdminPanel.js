import React from "react";
import { Pyth } from "../Pyth";

const AdminPanel = ({
  isAdmin,
  contract,
  showRegistrationStatus,
  isContractRegistered,
  sfsTokenId,
  checkContractRegistration,
  sfsBalance,
  fetchSfsBalance,
  winningNumber,
  setWinningNumber,
  sfsFeeAmount,
  setSfsFeeAmount,
  claimSFSFees,
  fetchContractBalance,
  contractBalance,
  transferNftBackToAdmin,
  resetGame,
}) => {
  if (!isAdmin) return null;

  return (
    <section className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="admin-item">
        <label>Contract Registered?:</label>
        {!showRegistrationStatus && (
          <button onClick={checkContractRegistration}>Click to Check</button>
        )}
        {showRegistrationStatus && (
          <p>
            {isContractRegistered ? `Yes! TokenID:#${sfsTokenId}` : "No :( wtf"}
          </p>
        )}
      </div>
      <div className="admin-item">
        <label>SFS NFT Balance: </label>
        <button onClick={fetchSfsBalance}>Check Balance</button>
        {sfsBalance && <p> {sfsBalance} ETH</p>}
      </div>
      <div className="admin-item">
        <label>Set Winning Number:</label>
        {isAdmin && <Pyth contract={contract} isAdmin={isAdmin} />}
      </div>
      <div className="admin-item">
        <label>Claim SFS Fees IN WEI!:</label>
        <input
          type="number"
          value={sfsFeeAmount}
          onChange={(e) => setSfsFeeAmount(e.target.value)}
        />
        <button onClick={claimSFSFees}>Send Fees to Contract</button>
      </div>
      <div className="admin-item">
        <label>This contract balance:</label>
        <button onClick={fetchContractBalance}>Check Contract Balance</button>
        {contractBalance && <p> {contractBalance} WEI</p>}
      </div>
      <div className="admin-item">
        <button onClick={transferNftBackToAdmin}>Return NFT to Admin</button>
      </div>
      <div className="admin-item">
        <button onClick={resetGame}>RESET GAME</button>
      </div>
    </section>
  );
};

export default AdminPanel;
