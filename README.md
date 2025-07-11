# 🕹️ Do Nothing Game

A fun and ironic game where the goal is to do... absolutely nothing! Try to survive by not moving, clicking, touching, or doing anything. The game tracks your survival time and submits your high score to a Supabase-powered leaderboard.

---

## 🚀 Features

- Fullscreen countdown and game timer
- Failure detection based on user interaction
- Local high score tracking using cookies
- Supabase integration:
  - Score submission
  - Leaderboard fetch and display
- Responsive UI with fun particle effects

---

## 🛠️ Technologies Used

- HTML, CSS, JavaScript
- [Supabase](https://supabase.com/) (PostgreSQL, REST API, RLS)
- UUID for user identity
- LocalStorage for username/user ID
- Cookies for local high score

---

## 📦 Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/do-nothing-game.git
cd do-nothing-game
````

### 2. Configure Supabase

Create a Supabase project and a `scores` table with the following schema:

| Column       | Type        | Description               |
| ------------ | ----------- | ------------------------- |
| `id`         | `uuid`      | Primary key (user ID)     |
| `name`       | `text`      | Player name               |
| `score`      | `double`    | Survival time in seconds  |
| `created_at` | `timestamp` | Auto-generated (optional) |

Enable **Row Level Security (RLS)** and add these policies:

* ✅ Allow public read
* ✅ Allow public insert
* ✅ Allow public update

### 3. Add Supabase Keys

In your JavaScript (`main.js` or inside the HTML file), configure your Supabase credentials:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Replace the values with your actual project URL and anon key from Supabase.

---

## 🧪 Run the Game

Just open the `index.html` file in your browser:

```bash
open index.html
# or
python3 -m http.server  # then go to http://localhost:8000
```

---

## 📈 Leaderboard

Top 10 players are fetched from Supabase and displayed with their survival time when you click the **Leaderboard** button.

---

## 👤 Local Identity

* A unique user ID is generated and stored using `localStorage`.
* Your username is prompted once and remembered for future plays.

---

## 💡 Tips

* Don’t touch your mouse, keyboard, or screen!
* Going fullscreen increases the challenge.
* Your score is saved locally and remotely.

---

## 🛡️ License

MIT License. Free to use, fork, and have fun!

---

## 🧠 Inspired By

> This game was inspired by the ironic idea that sometimes… doing nothing is the hardest challenge.
