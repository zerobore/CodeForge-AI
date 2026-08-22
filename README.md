# CodeForge-AI

**Learn, Code, Build & Create with AI** — a premium coding platform with courses, a live playground, a project library, and a tiered multi-model AI assistant.

## ✨ Features (v1.1.0)

### AI Assistant with tier-based access
| Who | AI Models |
|---|---|
| 🧑 Guest (no sign-in) | ChatGPT |
| ✉️ Signed in (email) | ChatGPT |
| 🔵 Signed in with Google | ChatGPT + **Gemini** |
| 👑 VIP / Admin (promo code) | **All** — ChatGPT + Gemini + Claude |

### 8 unique animated chat themes
Free: Neon Pulse · Aurora Flow · Cyber Grid · Sunset Blaze · Ocean Depth
VIP-only: Royal Gold · Matrix Rain · Candy Pop — each with animated backgrounds and message animations (`css/chat-themes.css`).

### Auth & security
- Firebase Email/Password auth (loaded once, idempotent init, demo-mode fallback)
- Google sign-in via Firebase (popup + redirect fallback, provider id normalization)
- reCAPTCHA v3 on login/signup (single script load, `grecaptcha.ready()`, non-blocking)
- VIP via promo codes — normalized, single-use per account, usage-tracked

### Admin panel (`#admin`)
Activate the admin promo code (`ZB-00-11-22-33`), then open **Account → Admin Panel**:
overview stats, AI usage by provider, promo-code management (generate/disable),
user management (grant/revoke VIP), and a live activity log.

### Platform
- 15+ courses, 50+ projects, live HTML/CSS/JS playground
- Responsive across desktop / tablet / mobile (slide-in chat drawer, touch targets)
- Dark / light / system themes

## 🚀 Run it

Static site — no build step:

```bash
npx serve .        # or: python3 -m http.server 8000
```

Or open `index.html` directly. Without a backend or API keys the app runs in **demo mode**: auth, promo codes, chat, and the admin panel all work against `localStorage`.

## 📁 Structure

```
index.html            # single-page app
css/styles.css        # app styles + responsive rules
css/chat-themes.css   # 8 animated chat themes
js/config.js          # config: AI tiers, chat themes, auth, promo codes
js/auth.js            # Firebase/Google/reCAPTCHA/promo codes + AI access tiers
js/ai-assistant.js    # chat: providers, animations, usage tracking
js/theme.js           # app themes + ChatThemeManager
js/admin.js           # admin panel
js/*.js               # learn/languages/playground/projects/dashboard/navigation/app
promo-codes.txt       # VIP + admin promo codes
```

## 🔑 Promo codes

See `promo-codes.txt`. Admin code unlocks the admin panel. For production, validate codes server-side.

## 📄 Docs

- `IMPLEMENTATION_SUMMARY.md` — full feature/fix changelog
- `QUICK_START.md` — deployment & credential setup
