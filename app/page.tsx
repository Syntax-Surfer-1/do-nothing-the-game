"use client"

import { useEffect, useRef, useState } from "react"

interface Score {
  id: string
  name: string
  score: number
}

export default function DoNothingGame() {
  const [gameState, setGameState] = useState<"menu" | "countdown" | "playing" | "game-over">("menu")
  const [countdown, setCountdown] = useState(3)
  const [survivalTime, setSurvivalTime] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState("")
  const [showHighScore, setShowHighScore] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const startTimeRef = useRef<number>(0)
  const gameTimerRef = useRef<NodeJS.Timeout>()
  const countdownTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Initialize user data
    const storedUsername = localStorage.getItem("username")
    const storedUserId = localStorage.getItem("user_id")
    const storedHighScore = localStorage.getItem("doNothingHighScore")

    if (!storedUserId) {
      const newUserId = crypto.randomUUID()
      setUserId(newUserId)
      localStorage.setItem("user_id", newUserId)
    } else {
      setUserId(storedUserId)
    }

    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      const name = prompt("Enter your name for the leaderboard:", "Anonymous") || "Anonymous"
      setUsername(name)
      localStorage.setItem("username", name)
    }

    if (storedHighScore) {
      const score = Number.parseFloat(storedHighScore)
      setHighScore(score)
      setShowHighScore(true)
    }

    // Create particles only once when component mounts
    setTimeout(() => {
      createParticles()
    }, 100)
  }, [])

  useEffect(() => {
    const handleFailure = () => {
      // Only fail if we're actually playing
      if (gameState !== "playing") return

      const currentSurvivalTime = (Date.now() - startTimeRef.current) / 1000
      setSurvivalTime(currentSurvivalTime)
      endGame(currentSurvivalTime)
    }

    // Comprehensive failure detection - catch EVERYTHING
    const events = [
      "mousemove",
      "mousedown",
      "mouseup",
      "click",
      "dblclick",
      "keydown",
      "keyup",
      "keypress",
      "wheel",
      "scroll",
      "touchstart",
      "touchmove",
      "touchend",
      "touchcancel",
      "pointerdown",
      "pointermove",
      "pointerup",
      "drag",
      "dragstart",
      "dragend",
      "focus",
      "focusin",
      "focusout",
    ]

    events.forEach((event) => {
      document.addEventListener(event, handleFailure, { passive: false })
      window.addEventListener(event, handleFailure, { passive: false })
    })

    // Tab switching, window switching, minimizing
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === "playing") {
        handleFailure()
      }
    }

    // Window loses focus (Alt+Tab, clicking outside, etc.)
    const handleBlur = () => {
      if (gameState === "playing") {
        handleFailure()
      }
    }

    // Right-click context menu
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      if (gameState === "playing") {
        handleFailure()
      }
    }

    // Fullscreen changes (F11, Escape, etc.)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && gameState === "playing") {
        handleFailure()
      }
    }

    // Window resize (including minimize/maximize)
    const handleResize = () => {
      if (gameState === "playing") {
        handleFailure()
      }
    }

    // Page unload/refresh
    const handleBeforeUnload = () => {
      if (gameState === "playing") {
        handleFailure()
      }
    }

    // Developer tools detection (approximate)
    const handleDevTools = () => {
      if (gameState === "playing") {
        const threshold = 160
        if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
          handleFailure()
        }
      }
    }

    // Selection changes (text selection)
    const handleSelectionChange = () => {
      if (gameState === "playing" && window.getSelection()?.toString()) {
        handleFailure()
      }
    }

    // Bind all event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleBlur) // Even gaining focus fails
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    window.addEventListener("resize", handleResize)
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("selectionchange", handleSelectionChange)

    // Check for dev tools periodically
    const devToolsInterval = setInterval(handleDevTools, 500)

    // Prevent common shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "playing") {
        // Prevent ALL keyboard shortcuts
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
          e.preventDefault()
          handleFailure()
          return
        }

        // Prevent specific keys
        const forbiddenKeys = [
          "F1",
          "F2",
          "F3",
          "F4",
          "F5",
          "F6",
          "F7",
          "F8",
          "F9",
          "F10",
          "F11",
          "F12",
          "Escape",
          "Tab",
          "Enter",
          "Space",
          "Home",
          "End",
          "PageUp",
          "PageDown",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ]

        if (forbiddenKeys.includes(e.key)) {
          e.preventDefault()
          handleFailure()
          return
        }

        // Any other key press fails
        e.preventDefault()
        handleFailure()
      }
    }

    document.addEventListener("keydown", handleKeyDown, { passive: false })

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFailure)
        window.removeEventListener(event, handleFailure)
      })
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleBlur)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("selectionchange", handleSelectionChange)
      document.removeEventListener("keydown", handleKeyDown)
      clearInterval(devToolsInterval)
    }
  }, [gameState]) // Re-run when gameState changes

  const createParticles = () => {
    // Only create particles if we're not playing
    if (gameState === "playing") return

    const particlesContainer = document.getElementById("particles")
    if (!particlesContainer) return

    // Clear existing particles first
    particlesContainer.innerHTML = ""

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.left = Math.random() * 100 + "%"
      particle.style.top = Math.random() * 100 + "%"
      particle.style.width = particle.style.height = Math.random() * 6 + 2 + "px"
      particle.style.animationDelay = Math.random() * 8 + "s"
      particle.style.animationDuration = Math.random() * 4 + 4 + "s"
      particlesContainer.appendChild(particle)
    }
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const startGame = async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch (e) {
      console.log("Fullscreen denied")
    }

    setGameState("countdown")
    let count = 3
    setCountdown(count)

    countdownTimerRef.current = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else if (count === 0) {
        setCountdown(0) // Will show "GO!"
      } else {
        clearInterval(countdownTimerRef.current)
        startPlaying()
      }
    }, 1000)
  }

  const startPlaying = () => {
    setGameState("playing")
    startTimeRef.current = Date.now()

    gameTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setSurvivalTime(elapsed)
    }, 100)
  }

  const endGame = async (finalScore: number) => {
    // Prevent multiple calls
    if (gameState !== "playing") return

    setGameState("game-over")
    clearInterval(gameTimerRef.current)

    const score = Number.parseFloat(finalScore.toFixed(1))

    // Check for new high score
    if (score > highScore) {
      setHighScore(score)
      setShowHighScore(true)
      localStorage.setItem("doNothingHighScore", score.toString())
      showNotification("🎉 New High Score!", "success")
    }

    // Save score to database
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          name: username,
          score,
        }),
      })
    } catch (error) {
      console.error("Failed to save score:", error)
    }
  }

  const resetGame = () => {
    setGameState("menu")
    clearInterval(gameTimerRef.current)
    clearInterval(countdownTimerRef.current)
    setSurvivalTime(0)

    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard")
      const data: Score[] = await response.json()

      const leaderboardHtml = data.map((player, i) => `#${i + 1} ${player.name} - ${player.score}s`).join("<br>")

      showNotification(`Top Players:<br>${leaderboardHtml}`, "success")
    } catch (error) {
      showNotification("Failed to fetch leaderboard", "error")
    }
  }

  return (
    <>
      <div className="background"></div>
      <div className="particles" id="particles"></div>

      {showHighScore && (
        <div className={`high-score ${highScore > survivalTime ? "new-record" : ""}`}>
          <div className="high-score-label">Best Score</div>
          <div className="high-score-value">{highScore.toFixed(1)}s</div>
        </div>
      )}

      {notification && (
        <div
          className={`notification ${notification.type}`}
          dangerouslySetInnerHTML={{ __html: notification.message }}
        />
      )}

      <div className="container">
        {gameState === "menu" && (
          <div id="menu-screen">
            <h1>Do Nothing</h1>
            <div className="subtitle">The Ultimate Test of Self-Control</div>
            <button className="btn" onClick={startGame}>
              Start Game
            </button>
            <button className="btn" onClick={fetchLeaderboard}>
              Leaderboard
            </button>
            <div className="fullscreen-hint">Game will enter fullscreen mode</div>
          </div>
        )}

        {gameState === "countdown" && (
          <div id="countdown-screen">
            <h1>Do Nothing</h1>
            <div className="countdown">{countdown > 0 ? countdown : "GO!"}</div>
          </div>
        )}

        {gameState === "playing" && (
          <div id="game-screen">
            <div className="instruction">{"Don't touch anything..."}</div>
            <div className="timer">{survivalTime.toFixed(1)}s</div>
          </div>
        )}

        {gameState === "game-over" && (
          <div id="game-over-screen">
            <div className="game-over">
              <div className="skull">💀</div>
              <div className="game-over-text">You Did Something.</div>
              <div className="survival-time">You survived for {survivalTime.toFixed(1)} seconds</div>
              <button className="btn" onClick={resetGame}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
