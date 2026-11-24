import React, { useState } from "react";

const productImages = {
  "Classic Protein Shake": "/products/classic-shake.jpg",
  "Plant Protein Shake": "/products/plant-shake.jpg",
  "Protein Bar": "/products/protein-bar.jpg",
  "Lactose-Free Protein Drink": "/products/lactose-free.jpg",
  "Peanut Butter Energy Bar": "/products/peanut-bar.jpg",
  "Roasted Almond Pack": "/products/almonds.jpg",
  "Oats Energy Drink": "/products/oats-drink.jpg",
  "Coconut Water": "/products/coconut-water.jpg",
  "Electrolyte Drink": "/products/electrolyte.jpg",
  "Trail Mix Pack": "/products/trail-mix.jpg",
  "Soy Protein Drink": "/products/soy-drink.jpg",
  "Banana Oat Bar": "/products/banana-bar.jpg"
};

export default function FitMind({ products = [], onAddToCart }) {
  const [command, setCommand] = useState("");
  const [budget, setBudget] = useState(250);
  const [result, setResult] = useState("");
  const [selected, setSelected] = useState([]);
  const [listening, setListening] = useState(false);

  const priceOf = p => Number(p.price || 0);

  const available = products.filter(
    p => p.active !== false && Number(p.stock) > 0
  );

  // VOICE RECOGNITION
  const startVoice = () => {
    const Speech =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Speech) {
      setResult("Please use Google Chrome for voice recognition.");
      return;
    }

    const recognition = new Speech();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onend = () => setListening(false);

    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      setCommand(text);
      processCommand(text);
    };

    recognition.onerror = () => {
      setListening(false);
      setResult("Voice recognition failed. Please try again.");
    };

    recognition.start();
  };

  // KEYWORD AND INTENT MATCHING
  const hasAny = (text, words) =>
    words.some(word => text.includes(word));

  // BUDGET DETECTION
  const getBudget = text => {
    const match = text.match(
      /(?:under|below|within|less than|budget of|only|upto|up to|₹|rs\.?)\s*₹?\s*(\d+)/i
    );

    return match ? Number(match[1]) : null;
  };

  // PRODUCT RECOMMENDATION
  const processCommand = text => {
    if (!text.trim()) {
      setResult("Please enter or speak your requirement.");
      setSelected([]);
      return;
    }

    const q = text.toLowerCase().replace(/[^\w\s₹]/g, " ");

    let found = [...available];
    let message = "";

    const budgetValue = getBudget(q);

    // BUDGET FILTER
    if (budgetValue !== null) {
      found = found.filter(p => priceOf(p) <= budgetValue);
      message = `Products within your budget of ₹${budgetValue}.`;
    }

    // VEGAN / PLANT BASED
    if (hasAny(q, [
      "vegan", "plant based", "plant-based",
      "no animal", "soy based"
    ])) {
      found = found.filter(p =>
        /vegan|plant|soy/i.test(
          `${p.name} ${p.tag || ""} ${p.description || ""}`
        )
      );
      message = "Here are plant-based product options.";
    }

    // LACTOSE FREE
    else if (hasAny(q, [
      "lactose free", "lactose-free",
      "dairy free", "without milk", "no milk"
    ])) {
      found = found.filter(p =>
        /lactose-free/i.test(
          `${p.name} ${p.tag || ""} ${p.description || ""}`
        )
      );
      message = "Here are products labelled lactose-free. Check the package for ingredients.";
    }

    // REFRESHING / HYDRATION
    else if (hasAny(q, [
      "thirsty", "refreshing", "dehydrated",
      "hot", "summer", "water", "hydration",
      "sweating", "sweat"
    ])) {
      found = found.filter(p =>
        /coconut|electrolyte|drink/i.test(
          `${p.name} ${p.category || ""}`
        )
      );
      message = "Here are some drink options.";
    }

    // PRE-WORKOUT
    else if (hasAny(q, [
      "before workout", "pre workout",
      "pre-workout", "starting workout",
      "energy before", "workout starting"
    ])) {
      found = found.filter(p =>
        /banana|oats|energy|trail mix/i.test(p.name)
      );
      message = "Here are some convenient snack and drink options.";
    }

    // POST-WORKOUT
    else if (hasAny(q, [
      "after workout", "post workout",
      "post-workout", "after gym",
      "finished workout", "strength training",
      "protein", "muscle recovery"
    ])) {
      found = found.filter(p =>
        /protein|shake/i.test(
          `${p.name} ${p.category || ""}`
        )
      );
      message = "Here are packaged protein product options. Check their labels for nutritional information.";
    }

    // SNACKS
    else if (hasAny(q, [
      "snack", "hungry", "something to eat",
      "quick bite", "light food", "small meal"
    ])) {
      found = found.filter(p =>
        /snack|bar|almond|trail mix/i.test(
          `${p.name} ${p.category || ""}`
        )
      );
      message = "Here are some snack options.";
    }

    // DRINKS
    else if (hasAny(q, [
      "drink", "beverage", "shake",
      "something to sip"
    ])) {
      found = found.filter(p =>
        /drink|shake/i.test(
          `${p.name} ${p.category || ""}`
        )
      );
      message = "Here are available drink options.";
    }

    // ALMONDS / NUTS
    else if (hasAny(q, [
      "almond", "nuts", "dry fruits"
    ])) {
      found = found.filter(p =>
        /almond|trail mix|peanut/i.test(p.name)
      );
      message = "Here are nut-based snack options.";
    }

    // OATS
    else if (hasAny(q, ["oats", "banana"])) {
      found = found.filter(p =>
        /oats|banana/i.test(p.name)
      );
      message = "Here are oats and banana-based options.";
    }

    // COMPARISON
    if (hasAny(q, ["compare", "comparison", "difference"])) {
      found = found.slice(0, 3);
      message = "Here are products you can compare.";
    }

    // CHEAPEST
    if (hasAny(q, ["cheap", "cheapest", "lowest price", "affordable"])) {
      found.sort((a, b) => priceOf(a) - priceOf(b));
      message = "Here are the most affordable available options.";
    }

    // ALTERNATIVES
    if (hasAny(q, ["alternative", "alternatives", "replace", "replacement"])) {
      found.sort((a, b) => priceOf(a) - priceOf(b));
      message = "Here are some alternative products.";
    }

    // GENERAL PRODUCT SEARCH
    if (!message) {
      const matching = available.filter(p => {
        const details =
          `${p.name} ${p.category || ""} ${p.tag || ""} ${p.description || ""}`
            .toLowerCase();

        return q.split(/\s+/).some(word =>
          word.length > 2 && details.includes(word)
        );
      });

      found = matching;
      message = "Here are the products matching your request.";
    }

    if (found.length === 0) {
      message = "Sorry, no matching products are currently available. Try another preference or budget.";
    } else {
      message += ` ${found.length} product(s) found.`;
    }

    setSelected(found);
    setResult(message);
  };

  // BUDGET OPTIMIZER
  const generateCombo = () => {
    let total = 0;
    const combo = [];

    const sorted = [...available].sort(
      (a, b) => priceOf(a) - priceOf(b)
    );

    for (const p of sorted) {
      if (total + priceOf(p) <= budget) {
        combo.push(p);
        total += priceOf(p);
      }
    }

    setSelected(combo);

    setResult(
      combo.length
        ? `Budget combo generated! Total: ₹${total}. Remaining: ₹${budget - total}.`
        : "No products fit this budget."
    );
  };

  // TEXT TO SPEECH
  const speak = () => {
    if (!window.speechSynthesis || !result) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(result);
    speech.lang = "en-IN";

    window.speechSynthesis.speak(speech);
  };

  return (
    <section className="fitmind">

      <div className="fitmind-heading">
        <span>FITVEND INTELLIGENCE</span>
        <h2>🎙️ FITMIND 2.0</h2>
        <p>Describe your requirement. Discover suitable products.</p>
      </div>

      <div className="fitmind-panel">

        <h3>🎤 Voice Shopping Assistant</h3>

        <button onClick={startVoice} disabled={listening}>
          {listening ? "Listening..." : "Start Speaking"}
        </button>

        <input
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") processCommand(command);
          }}
          placeholder="Example: I need a refreshing drink under 80 rupees"
        />

        <button onClick={() => processCommand(command)}>
          Find Products
        </button>

        <p>{result}</p>

        <button onClick={speak}>
          🔊 Speak Result
        </button>

      </div>

      <div className="fitmind-panel">

        <h3>💰 Smart Budget Optimizer</h3>

        <label>Budget: ₹{budget}</label>

        <input
          type="range"
          min="50"
          max="1000"
          step="10"
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
        />

        <button onClick={generateCombo}>
          Generate Budget Combo
        </button>

      </div>

      <div className="fitmind-results">

        <h3>✨ Recommended Products</h3>

        <div className="fitmind-grid">

          {selected.map((p, i) => (

            <div className="fitmind-product" key={p._id || i}>

              <img
                src={productImages[p.name] || "/products/classic-shake.jpg"}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "contain",
                  borderRadius: "10px"
                }}
              />

              <h4>{p.name}</h4>

              <p>Price: ₹{priceOf(p)}</p>

              <p>{p.tag || "FITVEND Product"}</p>

              <p>Available stock: {p.stock}</p>

              <button
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(p);
                    setResult(`${p.name} selected.`);
                  } else {
                    setResult("Please use the Machine page to place a demo order.");
                  }
                }}
              >
                Select Product
              </button>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}