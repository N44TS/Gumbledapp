import React from "react";

const LatestPredictionsTable = ({ predictions }) => {
  return (
    <div className="prediction-box latest-predictions">
      <h3>Live Latest Predictions</h3>
      <ul>
        {predictions.map((prediction, index) => (
          <li key={index}>
            Address:{" "}
            {`${prediction.predictor.substring(
              0,
              5
            )}...${prediction.predictor.substring(
              prediction.predictor.length - 4
            )}`}
            -- Predicted Number: {prediction.predictedNumber.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestPredictionsTable;
