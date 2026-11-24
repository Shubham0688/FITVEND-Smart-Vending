import React, { useState } from "react";
import "./VendingSimulation.css";

const products = [
  { name: "Protein Shake", price: 120, emoji: "🥤" },
  { name: "Almond Pack", price: 60, emoji: "🥜" },
  { name: "Energy Bar", price: 50, emoji: "🍫" },
  { name: "Coconut Water", price: 45, emoji: "🥥" },
  { name: "Soy Drink", price: 100, emoji: "🥛" },
  { name: "Banana Oats", price: 70, emoji: "🍌" },
];

export default function VendingSimulation() {
  const [selected, setSelected] = useState(products[0]);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dispensed, setDispensed] = useState(false);
  const [stock, setStock] = useState(6);
  const [orders, setOrders] = useState(0);
  const [logs, setLogs] = useState([
    "FITVEND system initialized.",
    "Waiting for customer interaction.",
  ]);

  const addLog = (message) => {
    setLogs((previous) => [
      ...previous,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  const scanCard = () => {
    if (busy) return;

    setAuthenticated(true);
    addLog("RFID demo card authenticated successfully.");
  };

  const dispenseProduct = () => {
    if (!authenticated || busy || stock <= 0) return;

    setBusy(true);
    setDispensed(false);

    addLog(`Dispensing command received: ${selected.name}`);
    addLog("Motor driver activated (simulation).");

    setTimeout(() => {
      setDispensed(true);
      setStock((previous) => previous - 1);
      setOrders((previous) => previous + 1);
      setBusy(false);
      setAuthenticated(false);

      addLog("IR sensor: Product detected in pickup tray.");
      addLog(`${selected.name} dispensed successfully.`);
    }, 1500);
  };

  const resetMachine = () => {
    if (busy) return;

    setAuthenticated(false);
    setDispensed(false);
    setStock(6);
    setOrders(0);
    setLogs(["Simulation reset.", "Machine ready for next customer."]);
  };

  return (
    <div className="vending-simulation">
      <div className="vs-header">
        <div>
          <p className="vs-label">FITSQUAD PRESENTS</p>
          <h1>FITVEND</h1>
          <p>Smart Personalized Vending Machine</p>
        </div>

        <span className="vs-online">● SYSTEM ONLINE</span>
      </div>

      <div className="vs-layout">
        {/* MACHINE DISPLAY */}
        <div className="vs-machine">
          <h3>PRODUCT DISPLAY</h3>

          <div className="vs-window">
            <div className="vs-shelves">
              {products.map((product) => (
                <span key={product.name}>{product.emoji}</span>
              ))}
            </div>
            <p>SMART PRODUCT STORAGE</p>
          </div>

          <div className="vs-screen">
            <small>TOUCH DISPLAY</small>
            <h2>{dispensed ? "SUCCESS!" : busy ? "DISPENSING..." : "WELCOME!"}</h2>
            <p>
              {dispensed
                ? "Collect your product"
                : selected.name}
            </p>
            <strong>₹{selected.price}</strong>
          </div>

          <div className="vs-scanner">
            <span>📶</span>
            <h3>RFID SCANNER</h3>
            <p>
              {authenticated
                ? "Member verified ✓"
                : "Waiting for card"}
            </p>

            <button
              onClick={scanCard}
              disabled={authenticated || busy}
            >
              {authenticated ? "Card Verified" : "Tap Demo Card"}
            </button>
          </div>

          <div className="vs-tray">
            {busy ? (
              <span className="vs-loading">⚙️ Motor Running...</span>
            ) : dispensed ? (
              <span className="vs-product-fall">
                {selected.emoji}
              </span>
            ) : (
              "PICKUP TRAY · EMPTY"
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="vs-controls">
          <section className="vs-card">
            <h2>① Select Product</h2>

            <div className="vs-products">
              {products.map((product) => (
                <button
                  key={product.name}
                  className={
                    selected.name === product.name
                      ? "vs-product selected"
                      : "vs-product"
                  }
                  onClick={() => {
                    if (busy) return;
                    setSelected(product);
                    setDispensed(false);
                    addLog(`Selected ${product.name}`);
                  }}
                  disabled={busy}
                >
                  <span>{product.emoji}</span>
                  <strong>{product.name}</strong>
                  <small>₹{product.price}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="vs-card">
            <h2>② Dispensing Control</h2>

            <div className="vs-info">
              <span>Selected product</span>
              <strong>{selected.name}</strong>
            </div>

            <div className="vs-info">
              <span>Price</span>
              <strong>₹{selected.price}</strong>
            </div>

            <button
              className="vs-dispense"
              onClick={dispenseProduct}
              disabled={!authenticated || busy || stock <= 0}
            >
              {busy ? "Dispensing..." : "⚡ Dispense Product"}
            </button>

            <button className="vs-reset" onClick={resetMachine}>
              Reset Simulation
            </button>

            <p className="vs-message">
              {!authenticated
                ? "Scan the demo RFID card first."
                : busy
                ? "Please wait while the product is dispensed."
                : "Member authenticated. Ready to dispense!"}
            </p>
          </section>
        </div>
      </div>

      {/* MACHINE LOGS */}
      <section className="vs-logs">
        <h3>⚙ MACHINE ACTIVITY LOG</h3>

        <div className="vs-log-content">
          {logs.map((log, index) => (
            <p key={index}>› {log}</p>
          ))}
        </div>

        <div className="vs-stats">
          <div>
            <strong>{stock}</strong>
            <span>Demo Stock</span>
          </div>

          <div>
            <strong>{orders}</strong>
            <span>Dispensed</span>
          </div>

          <div>
            <strong>{busy ? "ACTIVE" : "IDLE"}</strong>
            <span>Motor Status</span>
          </div>
        </div>
      </section>

      <p className="vs-disclaimer">
        Prototype simulation only. RFID, motor, and IR sensor operations
        are simulated. No physical hardware or real payment is connected.
      </p>
    </div>
  );
}