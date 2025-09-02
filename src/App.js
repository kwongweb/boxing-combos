import React, { useState, useEffect, useRef } from "react";
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

function getRandomCombo(usedCombos = []) {
  const availableCombos = combos.filter(combo => 
    !usedCombos.some(used => 
      used.length === combo.length && used.every((val, i) => val === combo[i])
    )
  );
  
  if (availableCombos.length === 0) {
    // If all combos are used, return a random one from the full list
    return combos[Math.floor(Math.random() * combos.length)];
  }
  
  return availableCombos[Math.floor(Math.random() * availableCombos.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(1, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function App() {
  const [comboStack, setComboStack] = useState([getRandomCombo([])]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [confirmationTimer, setConfirmationTimer] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showStartOverConfirmation, setShowStartOverConfirmation] = useState(false);
  const [startOverConfirmationTimer, setStartOverConfirmationTimer] = useState(0);
  const videoRef = useRef(null);
  const wakeLockRef = useRef(null);
  const confirmationIntervalRef = useRef(null);
  const startOverConfirmationIntervalRef = useRef(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock was released');
        });
        console.log('Wake Lock is active');
      }
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await requestWakeLock();
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

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

  useEffect(() => {
    if (showConfirmation && confirmationTimer > 0) {
      confirmationIntervalRef.current = setInterval(() => {
        setConfirmationTimer((prev) => prev - 1);
      }, 1000);
    } else if (confirmationTimer === 0 && showConfirmation) {
      setShowConfirmation(false);
    }
    return () => {
      if (confirmationIntervalRef.current) {
        clearInterval(confirmationIntervalRef.current);
      }
    };
  }, [showConfirmation, confirmationTimer]);

  useEffect(() => {
    if (showStartOverConfirmation && startOverConfirmationTimer > 0) {
      startOverConfirmationIntervalRef.current = setInterval(() => {
        setStartOverConfirmationTimer((prev) => prev - 1);
      }, 1000);
    } else if (startOverConfirmationTimer === 0 && showStartOverConfirmation) {
      setShowStartOverConfirmation(false);
    }
    return () => {
      if (startOverConfirmationIntervalRef.current) {
        clearInterval(startOverConfirmationIntervalRef.current);
      }
    };
  }, [showStartOverConfirmation, startOverConfirmationTimer]);

  const startRound = () => {
    setTimeLeft(180);
    setRoundStarted(true);
    setRoundOver(false);
    setShowConfirmation(false);
    setConfirmationTimer(0);
    requestWakeLock();

    // iOS workaround
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const initiateNextRound = () => {
    setShowConfirmation(true);
    setConfirmationTimer(5);
  };

  const confirmNextRound = () => {
    if (comboStack.length < 5) {
      setComboStack([...comboStack, getRandomCombo(comboStack)]);
    }
    setTimeLeft(180);
    setRoundStarted(false);
    setRoundOver(false);
    setShowConfirmation(false);
    setConfirmationTimer(0);
  };

  const cancelNextRound = () => {
    setShowConfirmation(false);
    setConfirmationTimer(0);
  };

  const startOver = () => {
    setComboStack([getRandomCombo([])]);
    setTimeLeft(180);
    setRoundStarted(false);
    setRoundOver(false);
    setShowConfirmation(false);
    setConfirmationTimer(0);
  };

  return (
    <div
      className="app"
      style={{
        backgroundColor: roundOver ? "#ff4d4d" : roundStarted ? "#90EE90" : "white",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center"
      }}
    >
      {/* Hidden video to keep iOS screen awake */}
      <video
        ref={videoRef}
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        muted
        loop
        playsInline
        style={{ display: "none" }}
      />

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
          <div style={{ marginTop: "1rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); startOver(); }}>Start Over</a>
          </div>
        </div>
      )}

      {roundStarted && !roundOver && (
        <div style={{ marginTop: "1rem" }}>
          <div>
            <a href="#" onClick={(e) => { e.preventDefault(); initiateNextRound(); }}>Next Round</a>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); startOver(); }}>Start Over</a>
          </div>
        </div>
      )}

      {roundOver && (
        <div>
          {comboStack.length < 5 && !showConfirmation && (
            <button onClick={initiateNextRound}>Next Round</button>
          )}
          {showConfirmation && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "1.5rem", margin: "1rem 0" }}>
                Confirm Next Round? ({confirmationTimer}s)
              </p>
              <div>
                <button 
                  onClick={confirmNextRound}
                  style={{ 
                    background: "linear-gradient(135deg, #28a745, #1e7e34)",
                    marginRight: "1rem"
                  }}
                >
                  Yes, Next Round
                </button>
                <button 
                  onClick={cancelNextRound}
                  style={{ 
                    background: "linear-gradient(135deg, #dc3545, #c82333)"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); startOver(); }}>Start Over</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
