const wallets = new Map();
const sessions = new Map();

const REWARD_PER_SESSION = 10;
const DAILY_LIMIT = 1;

function getWallet(user) {
  if (!wallets.has(user)) {
    wallets.set(user, {
      balance: 0,
      transactions: [],
      rewardedDates: []
    });
  }

  return wallets.get(user);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function registerFitcoinRoutes(app) {

  
  app.get("/api/fitcoin/:user", (req, res) => {
    const user = String(req.params.user || "Guest").trim();
    const wallet = getWallet(user);

    res.json({
      user,
      balance: wallet.balance,
      transactions: wallet.transactions
    });
  });


  app.post("/api/fitcoin/start", (req, res) => {
    const user = String(req.body.user || "Guest").trim();

    if (!user) {
      return res.status(400).json({
        message: "User name is required."
      });
    }

    const sessionId = `SESSION-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    sessions.set(sessionId, {
      user,
      startedAt: Date.now(),
      completed: false
    });

    res.json({
      message: "Workout session started.",
      sessionId
    });
  });


  
  app.post("/api/fitcoin/complete", (req, res) => {
    const { user, sessionId } = req.body;

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
        message: "This session has already received a reward."
      });
    }

    const wallet = getWallet(user);
    const currentDate = today();

    if (wallet.rewardedDates.includes(currentDate)) {
      return res.status(400).json({
        message: "Today's workout reward has already been claimed."
      });
    }

    
    const elapsed = Date.now() - session.startedAt;

    if (elapsed < 5 * 60 * 1000) {
      return res.status(400).json({
        message: "Complete your planned workout session first."
      });
    }

    session.completed = true;

    wallet.balance += REWARD_PER_SESSION;
    wallet.rewardedDates.push(currentDate);

    wallet.transactions.unshift({
      type: "EARN",
      coins: REWARD_PER_SESSION,
      description: "Completed workout session",
      date: new Date()
    });

    res.json({
      message: "Workout completed! FITCOINS added.",
      earned: REWARD_PER_SESSION,
      balance: wallet.balance
    });
  });


  app.post("/api/fitcoin/redeem", (req, res) => {
    const { user, coins } = req.body;

    const wallet = getWallet(String(user || "Guest").trim());
    const amount = Number(coins);

    if (![50, 100, 150, 200].includes(amount)) {
      return res.status(400).json({
        message: "Choose a valid redemption amount."
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        message: "Not enough FITCOINS."
      });
    }

    wallet.balance -= amount;

    const coupon = `FIT-${Date.now().toString().slice(-6)}`;

    wallet.transactions.unshift({
      type: "REDEEM",
      coins: amount,
      description: `Demo coupon: ${coupon}`,
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