const wallets = new Map();
const sessions = new Map();

const REWARD_PER_SESSION = 10;
const MIN_SESSION_TIME = 10 * 1000;
const DAILY_REWARD_LIMIT = 10;

// Get current date
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Get or create wallet
function getWallet(user) {
  if (!wallets.has(user)) {
    wallets.set(user, {
      balance: 0,
      transactions: [],
      rewardDate: getToday(),
      dailyRewardCount: 0
    });
  }

  return wallets.get(user);
}

// Register FITCOIN APIs
function registerFitcoinRoutes(app) {

  // 1. GET WALLET DETAILS
  app.get("/api/fitcoin/:user", (req, res) => {
    const user = String(req.params.user || "").trim();

    if (!user) {
      return res.status(400).json({
        message: "Member name is required."
      });
    }

    const wallet = getWallet(user);

    res.json({
      user,
      balance: wallet.balance,
      transactions: wallet.transactions,
      dailyRewardCount: wallet.dailyRewardCount,
      dailyRewardLimit: DAILY_REWARD_LIMIT
    });
  });

  // 2. START WORKOUT SESSION
  app.post("/api/fitcoin/start", (req, res) => {
    const user = String(req.body.user || "").trim();

    if (!user) {
      return res.status(400).json({
        message: "Member name is required."
      });
    }

    const wallet = getWallet(user);
    const currentDate = getToday();

    // Reset daily count on a new day
    if (wallet.rewardDate !== currentDate) {
      wallet.rewardDate = currentDate;
      wallet.dailyRewardCount = 0;
    }

    if (wallet.dailyRewardCount >= DAILY_REWARD_LIMIT) {
      return res.status(400).json({
        message: "Daily reward limit reached. Try again tomorrow."
      });
    }

    // Check existing active session
    const existingSession = [...sessions.values()].find(
      session => session.user === user && !session.completed
    );

    if (existingSession) {
      return res.json({
        message: "An active workout session already exists.",
        sessionId: existingSession.sessionId
      });
    }

    const sessionId =
      "FIT-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2, 8);

    sessions.set(sessionId, {
      sessionId,
      user,
      startedAt: Date.now(),
      completed: false
    });

    res.status(201).json({
      message: "Workout session started successfully.",
      sessionId
    });
  });

  // 3. COMPLETE WORKOUT AND EARN COINS
  app.post("/api/fitcoin/complete", (req, res) => {
    const user = String(req.body.user || "").trim();
    const sessionId = String(req.body.sessionId || "").trim();

    if (!user || !sessionId) {
      return res.status(400).json({
        message: "User and session ID are required."
      });
    }

    const session = sessions.get(sessionId);

    if (!session || session.user !== user) {
      return res.status(400).json({
        message: "Invalid workout session."
      });
    }

    if (session.completed) {
      return res.status(400).json({
        message: "Reward already received for this session."
      });
    }

    const elapsedTime = Date.now() - session.startedAt;

    if (elapsedTime < MIN_SESSION_TIME) {
      return res.status(400).json({
        message: "Your workout session is not complete yet."
      });
    }

    const wallet = getWallet(user);
    const currentDate = getToday();

    // Reset daily count on a new day
    if (wallet.rewardDate !== currentDate) {
      wallet.rewardDate = currentDate;
      wallet.dailyRewardCount = 0;
    }

    if (wallet.dailyRewardCount >= DAILY_REWARD_LIMIT) {
      return res.status(400).json({
        message: "Daily reward limit reached. Try again tomorrow."
      });
    }

    // Complete session
    session.completed = true;

    // Add reward
    wallet.balance += REWARD_PER_SESSION;
    wallet.dailyRewardCount += 1;

    // Save transaction
    wallet.transactions.unshift({
      type: "EARN",
      coins: REWARD_PER_SESSION,
      description: "Completed workout session",
      date: new Date()
    });

    res.json({
      message: "Workout completed! FITCOINS added successfully.",
      earned: REWARD_PER_SESSION,
      balance: wallet.balance,
      dailyRewardCount: wallet.dailyRewardCount
    });
  });

  // 4. REDEEM FITCOINS
  app.post("/api/fitcoin/redeem", (req, res) => {
    const user = String(req.body.user || "").trim();
    const coins = Number(req.body.coins);

    if (!user) {
      return res.status(400).json({
        message: "Member name is required."
      });
    }

    // Allow redemption from 10 to 100 in multiples of 10
    const validAmounts = Array.from(
      { length: 10 },
      (_, index) => (index + 1) * 10
    );

    if (!validAmounts.includes(coins)) {
      return res.status(400).json({
        message: "Invalid redemption amount."
      });
    }

    const wallet = getWallet(user);

    if (wallet.balance < coins) {
      return res.status(400).json({
        message: "Insufficient FITCOINS balance."
      });
    }

    // Deduct coins
    wallet.balance -= coins;

    // Generate demo coupon
    const coupon =
      "FIT-" +
      Math.random().toString(36).slice(2, 8).toUpperCase();

    // Save transaction
    wallet.transactions.unshift({
      type: "REDEEM",
      coins,
      description: "Demo coupon: " + coupon,
      date: new Date()
    });

    res.json({
      message: "Demo coupon generated successfully.",
      coupon,
      balance: wallet.balance
    });
  });

}

export default registerFitcoinRoutes;