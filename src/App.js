import React, { useState, useEffect } from "react";
import "./styles.css";

const combos = [
  [1, 2, 3],
  [1, 2, 3, 2],
  [1, 6, 3],
  [2, 3, 2],
  [1, 2, 5, 2],
  [3, 4, 2],
  [1, 2, 3, 4],
  [1, 2, 5],
  [2, 5, 4],
  [1, 6, 3, 2],
  [1, 2, 1],
  [2, 3, 2, 1],
  [3, 2, 3],
  [1, 4, 3, 2],
  [1, 1, 2, 3]
];

const dingSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

function getRandomCombo() {
  return combos[Math.floor(Math.random() * combos.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(1, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function App() {
  const [comboStack, setComboStack] = useState([getRandomCombo()]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);

  useEffect(() => {
    let timer;
    if (roundStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && roundStarted) {
      dingSound.play().catch(() => {});
      setRoundOver(true);
      setRoundStarted(false);
    }
    return () => clearInterval(timer);
  }, [roundStarted, timeLeft]);

  const startRound = () => {
    setTimeLeft(180);
    setRoundStarted(true);
    setRoundOver(false);
  };

  const nextRound = () => {
    if (comboStack.length < 5) {
      setComboStack([...comboStack, getRandomCombo()]);
    }
    setTimeLeft(180);
    setRoundStarted(false);
    setRoundOver(false);
  };

  const startOver = () => {
    setComboStack([getRandomCombo()]);
    setTimeLeft(180);
    setRoundStarted(false);
    setRoundOver(false);
  };

  return (
    <div
      className="app"
      style={{ backgroundColor: roundOver ? "#ff4d4d" : "white", minHeight: "100vh", padding: "2rem", textAlign: "center" }}
    >
      <h1>Boxing Combos</h1>
      <p style={{ fontSize: "2rem" }}>Time Left: {formatTime(timeLeft)}</p>

      {comboStack.map((combo, i) => (
        <div key={i} className="combo-block">
          <span className="combo-label">Combo {i + 1}:</span>
          {combo.join(" - ")}
        </div>
      ))}

      {!roundStarted && !roundOver && (
        <div>
          <button onClick={startRound}>Begin Round</button>
          <button onClick={startOver} style={{ marginLeft: "1rem" }}>Start Over</button>
        </div>
      )}

      {roundStarted && !roundOver && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={startOver}>Start Over</button>
          <button onClick={nextRound} style={{ marginLeft: "1rem" }}>Next Round</button>
        </div>
      )}

      {roundOver && (
        <div>
          {comboStack.length < 5 && <button onClick={nextRound}>Next Round</button>}
          <button onClick={startOver} style={{ marginLeft: "1rem" }}>
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
