import React, { useState, useEffect } from "react";

function CountdownTimer() {
  const calculateTimeLeft = () => {
    const targetDate = new Date("2024-01-31T17:00:00Z");
    const timeDifference = targetDate - new Date();

    if (timeDifference <= 0) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }

    const padZero = (num) => String(num).padStart(2, "0");
    const days = padZero(Math.floor(timeDifference / (1000 * 60 * 60 * 24)));
    const hours = padZero(
      Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    );
    const minutes = padZero(
      Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
    );
    const seconds = padZero(Math.floor((timeDifference % (1000 * 60)) / 1000));

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>Time left to play:</p>
      <span className="timer-days">{timeLeft.days}</span>d:
      <span className="timer-hours">{timeLeft.hours}</span>h:
      <span className="timer-minutes">{timeLeft.minutes}</span>m:
      <span className="timer-seconds">{timeLeft.seconds}</span>s:
    </div>
  );
}

export default CountdownTimer;
