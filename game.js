// ✅ 1. Initialize Supabase Correctly
const SUPABASE_URL = 'https://hehapncfqigzplnmcxbt.supabase.co';
const SUPABASE_ANON_KEY = ''; // truncated for safety
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ 2. Game Class
class DoNothingGame {
  constructor() {
    this.gameState = 'menu';
    this.startTime = 0;
    this.survivalTime = 0;
    this.highScore = 0;
    this.gameTimer = null;
    this.countdownTimer = null;
    this.username = localStorage.getItem('username') || null;
    this.userId = localStorage.getItem('user_id') || null;
    
    if (!this.userId) {
      this.userId = crypto.randomUUID();
      localStorage.setItem('user_id', this.userId);
    }

    this.initializeElements();
    this.createParticles();
    this.bindEvents();
    this.loadHighScore();

    if (!this.username) this.promptUsername();
  }

  initializeElements() {
    this.menuScreen = document.getElementById('menu-screen');
    this.countdownScreen = document.getElementById('countdown-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');

    this.startBtn = document.getElementById('start-btn');
    this.tryAgainBtn = document.getElementById('try-again-btn');
    this.leaderboardBtn = document.getElementById('leaderboard-btn');

    this.countdownEl = document.getElementById('countdown');
    this.timerEl = document.getElementById('timer');
    this.survivalTimeEl = document.getElementById('survival-time');
    this.highScoreDisplay = document.getElementById('high-score');
    this.highScoreValue = document.getElementById('high-score-value');
  }

  promptUsername() {
  let name = '';
  while (!name || name.trim().length < 3) {
    name = prompt('Enter your name for the leaderboard (min 3 characters):', '')?.trim();
    if (!name) alert('Name is required!');
    else if (name.length < 3) alert('Name must be at least 3 characters.');
  }
  this.username = name;
  localStorage.setItem('username', name);
  }


  createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.width = p.style.height = Math.random() * 6 + 2 + 'px';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (Math.random() * 4 + 4) + 's';
      particlesContainer.appendChild(p);
    }
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startGame());
    this.tryAgainBtn.addEventListener('click', () => this.resetGame());
    this.leaderboardBtn?.addEventListener('click', () => this.fetchLeaderboard());

    const fail = () => this.handleFailure();
    document.addEventListener('mousemove', fail);
    document.addEventListener('click', fail);
    document.addEventListener('keydown', fail);
    document.addEventListener('wheel', fail);
    document.addEventListener('touchstart', fail);
    document.addEventListener('touchmove', fail);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.gameState === 'playing') fail();
    });

    window.addEventListener('blur', () => {
      if (this.gameState === 'playing') fail();
    });

    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (this.gameState === 'playing') fail();
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && this.gameState === 'playing') fail();
    });
  }

  loadHighScore() {
    const score = this.getCookie('doNothingHighScore');
    if (score) {
      this.highScore = parseFloat(score);
      this.updateHighScoreDisplay();
    }
  }

  saveHighScore() {
    this.setCookie('doNothingHighScore', this.highScore.toString(), 365);
  }

  updateHighScoreDisplay() {
    if (this.highScore > 0) {
      this.highScoreValue.textContent = this.highScore.toFixed(1) + 's';
      this.highScoreDisplay.classList.remove('hidden');
    }
  }

  setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? parts[1] : r;
    }, null);
  }

  async startGame() {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.log('Fullscreen denied');
    }
    this.showScreen('countdown');
    let count = 3;
    this.countdownEl.textContent = count;
    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) this.countdownEl.textContent = count;
      else if (count === 0) this.countdownEl.textContent = 'GO!';
      else {
        clearInterval(this.countdownTimer);
        this.startPlaying();
      }
    }, 1000);
  }

  startPlaying() {
    this.gameState = 'playing';
    this.showScreen('game');
    this.startTime = Date.now();
    this.gameTimer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.timerEl.textContent = elapsed.toFixed(1) + 's';
    }, 100);
  }

  handleFailure() {
    if (this.gameState !== 'playing') return;
    this.survivalTime = (Date.now() - this.startTime) / 1000;
    this.endGame();
  }

  async endGame() {
    this.gameState = 'game-over';
    clearInterval(this.gameTimer);
    const score = parseFloat(this.survivalTime.toFixed(1));
    this.survivalTimeEl.textContent = `You survived for ${score} seconds`;

    if (score > this.highScore) {
      this.highScore = score;
      this.saveHighScore();
      this.updateHighScoreDisplay();
      this.highScoreDisplay.classList.add('new-record');
      this.showNotification('🎉 New High Score!', 'success');
      setTimeout(() => this.highScoreDisplay.classList.remove('new-record'), 4000);
    }

    // Only update score in Supabase if it's better than previous
    const { data: existing } = await supabaseClient
      .from('scores')
      .select('score')
      .eq('id', this.userId)
      .single();

    if (!existing || score > existing.score) {
      await fetch('/api/submit-score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: this.userId,
    name: this.username,
    score: score
  })
});

    }

    this.showScreen('game-over');
  }

  resetGame() {
    this.gameState = 'menu';
    clearInterval(this.gameTimer);
    clearInterval(this.countdownTimer);
    if (document.fullscreenElement) document.exitFullscreen();
    this.showScreen('menu');
  }

  showScreen(screen) {
    this.menuScreen.classList.add('hidden');
    this.countdownScreen.classList.add('hidden');
    this.gameScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');

    const target = document.getElementById(`${screen}-screen`);
    if (target) target.classList.remove('hidden');
    else console.warn(`Screen "${screen}-screen" not found`);
  }

  showNotification(msg, type) {
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  async fetchLeaderboard() {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();

    if (res.status !== 200) return alert('Failed to fetch leaderboard.');

    const div = document.createElement('div');
    div.className = 'notification success';
    div.innerHTML = `<strong>Top Players:</strong><ul style="list-style:none;padding:0;margin:0;">` +
      data.map((x, i) => `<li>#${i + 1} ${x.name} - ${x.score}s</li>`).join('') +
      '</ul>';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 10000);
  }
}

// ✅ 3. Initialize Game
document.addEventListener('DOMContentLoaded', () => {
  window.game = new DoNothingGame();
});
