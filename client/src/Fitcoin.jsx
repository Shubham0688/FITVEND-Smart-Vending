import React, { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SESSION_DURATION = 10;
const REWARD_PER_SESSION = 10;
const DAILY_REWARD_LIMIT = 10;

const REDEEM_OPTIONS = Array.from(
  { length: 10 },
  (_, index) => (index + 1) * 10
);

function Fitcoin() {
  const [user, setUser] = useState("Guest");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [dailyRewardCount, setDailyRewardCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [coupon, setCoupon] = useState("");

  // LOAD WALLET
  const loadWallet = async () => {
    try {
      const response = await fetch(
        API + "/fitcoin/" + encodeURIComponent(user.trim())
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load wallet.");
      }

      setBalance(data.balance ?? 0);
      setTransactions(data.transactions ?? []);
      setDailyRewardCount(data.dailyRewardCount ?? 0);

    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (!sessionId || secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(previous => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId, secondsLeft]);

  // START SESSION
  const startSession = async () => {
    setLoading(true);
    setMessage("");
    setCoupon("");

    try {
      const response = await fetch(API + "/fitcoin/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: user.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start session.");
      }

      setSessionId(data.sessionId);
      setSecondsLeft(SESSION_DURATION);
      setMessage(data.message);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
      await loadWallet();
    }
  };

  // COMPLETE SESSION
  const completeSession = async () => {
    setLoading(true);
    setMessage("");
    setCoupon("");

    try {
      const response = await fetch(API + "/fitcoin/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: user.trim(),
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not complete session.");
      }

      setSessionId("");
      setSecondsLeft(0);
      setBalance(data.balance);

      setMessage(
        data.message + " You earned " + data.earned + " FITCOINS!"
      );

      await loadWallet();

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // REDEEM COINS
  const redeemCoins = async (coins) => {
    setLoading(true);
    setMessage("");
    setCoupon("");

    try {
      const response = await fetch(API + "/fitcoin/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: user.trim(),
          coins: coins
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Redemption failed.");
      }

      setBalance(data.balance);
      setCoupon(data.coupon);
      setMessage(data.message);

      await loadWallet();

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section page fitcoin-page">

      <div className="eyebrow">
        FITVEND REWARDS PROGRAM
      </div>

      <h2>
        Welcome to <em>FITCOIN.</em>
      </h2>

      <p>
        Complete your planned workout session and earn reward coins.
      </p>

      {/* MEMBER PROFILE */}

      <div className="profile-card">

        <label>
          Member name

          <input
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="Enter member name"
            disabled={!!sessionId || loading}
          />
        </label>

        <button
          type="button"
          className="primary"
          onClick={loadWallet}
          disabled={loading || !user.trim() || !!sessionId}
        >
          Refresh Wallet
        </button>

      </div>

      {/* WALLET STATISTICS */}

      <div className="admin-grid">

        <div className="admin-stat">
          <span>🪙</span>
          <small>Available FITCOINS</small>
          <b>{balance}</b>
        </div>

        <div className="admin-stat">
          <span>🏆</span>
          <small>Reward per completed session</small>
          <b>{REWARD_PER_SESSION}</b>
        </div>

        <div className="admin-stat">
          <span>📅</span>
          <small>Daily reward limit</small>
          <b>{dailyRewardCount}/{DAILY_REWARD_LIMIT}</b>
        </div>

      </div>

      {/* WORKOUT REWARDS */}

      <div className="profile-card">

        <h3>Workout Rewards</h3>

        <p>
          Complete the 10-second demo countdown to earn
          10 FITCOINS.
        </p>

        {!sessionId ? (

          <button
            type="button"
            className="primary"
            onClick={startSession}
            disabled={
              loading ||
              !user.trim() ||
              dailyRewardCount >= DAILY_REWARD_LIMIT
            }
          >
            {loading
              ? "Please wait..."
              : dailyRewardCount >= DAILY_REWARD_LIMIT
              ? "Daily Limit Reached"
              : "Start Session"}
          </button>

        ) : (

          <>
            <h2 className="fitcoin-timer">
              {secondsLeft > 0
                ? secondsLeft + "s"
                : "Completed!"}
            </h2>

            <p>
              {secondsLeft > 0
                ? "Your demo session is in progress..."
                : "You can now claim your FITCOINS!"}
            </p>

            <button
              type="button"
              className="primary"
              onClick={completeSession}
              disabled={loading || secondsLeft > 0}
            >
              {loading
                ? "Please wait..."
                : secondsLeft > 0
                ? "Complete in " + secondsLeft + "s"
                : "Complete Session"}
            </button>
          </>

        )}

      </div>

      {/* REDEEM COINS */}

      <div className="profile-card">

        <h3>Redeem FITCOINS</h3>

        <p>
          Use your earned coins to generate a demo coupon.
        </p>

        <div className="filters">

          {REDEEM_OPTIONS.map(coins => (

            <button
              type="button"
              key={coins}
              onClick={() => redeemCoins(coins)}
              disabled={
                loading ||
                balance < coins ||
                !!sessionId ||
                !user.trim()
              }
            >
              Redeem {coins}
            </button>

          ))}

        </div>

        {coupon && (

          <div className="result">

            <h3>Your Demo Coupon</h3>

            <h2>{coupon}</h2>

            <p>
              This coupon is for demonstration only.
            </p>

          </div>

        )}

      </div>

      {/* STATUS MESSAGE */}

      {message && (

        <div className="result" role="status">
          {message}
        </div>

      )}

      {/* TRANSACTION HISTORY */}

      <div className="profile-card">

        <h3>Transaction History</h3>

        {transactions.length === 0 ? (

          <p>No transactions yet.</p>

        ) : (

          transactions.map((item, index) => (

            <div className="order" key={index}>

              <div>

                <b>
                  {item.type === "EARN"
                    ? "Coins Earned"
                    : "Coins Redeemed"}
                </b>

                <small>
                  {item.description}
                  <br />
                  {new Date(item.date).toLocaleString()}
                </small>

              </div>

              <strong>
                {item.type === "EARN" ? "+" : "-"}
                {item.coins} 🪙
              </strong>

            </div>

          ))

        )}

      </div>

    </section>
  );
}

export default Fitcoin;