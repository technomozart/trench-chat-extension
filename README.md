# Trench Chat

**CA-based chat rooms for memecoin traders.**

Trench Chat is a Chrome extension that creates instant chat rooms based on token Contract Addresses (CA). Copy a CA, join a room, and talk with other traders watching the same chart — in real time.

No Telegram. No Discord. No setup.

## Features

- **Instant CA Chat Rooms** — paste any token contract address to join its chat
- **Real-Time Messaging** — messages appear instantly via WebSocket
- **Image Sharing** — share screenshots and images in chat
- **Emoji Reactions** — react to messages with 🔥 💎 🚀 😂 👀 💀
- **Discover Tab** — find active rooms and see where traders are talking
- **Referral System** — share your code, earn points when friends join
- **Daily Streaks** — check in daily to earn bonus points (up to 150/day at 30-day streak)
- **Points System** — earn points for messages, reactions, new rooms, and referrals
- **User Profiles** — custom avatars, bios, and SOL wallet display
- **Admin Moderation** — mute/block users, spam & flood protection
- **General Chat & Announcements** — community-wide rooms
- **Side Panel or Popup** — use it however you prefer
- **Dark Theme** — clean, modern UI built for traders

## How It Works

1. Install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/trench-chat/ldofgngehlekjikgbkojhapbglmceedj)
2. Create an account (or log in)
3. Paste any token's contract address
4. You're in the chat — start talking

Every token automatically has its own room. No one creates it. No one owns it.

## Permissions

This extension requests the following permissions:

- **`storage`** — saves your auth token and chat preferences locally
- **`sidePanel`** — enables the side panel chat view
- **`activeTab`** — reads the current tab URL to detect token CAs for Quick Chat

**No broad host permissions. No access to your browsing data. No data collection beyond chat messages.**

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS (Chrome Extension Manifest V3)
- **Backend:** Node.js, Express, Socket.IO, PostgreSQL
- **Hosting:** Railway

## Server Connection

The extension connects to `trench-chat-server-production.up.railway.app` via Socket.IO (WebSocket with polling fallback) for real-time messaging. 

Data transmitted:
- Chat messages (text and images)
- Username and auth token
- Room joins/leaves
- Emoji reactions

No page content, browsing history, cookies, or sensitive browser data is ever accessed or transmitted.

## Privacy

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details.

**TL;DR:** We only store what's needed for chat (username, messages, profile info). No tracking. No analytics. No data selling.

## Links

- **Website:** [trenchchat.xyz](https://trenchchat.xyz)
- **Chrome Web Store:** [Install Trench Chat](https://chromewebstore.google.com/detail/trench-chat/ldofgngehlekjikgbkojhapbglmceedj)
- **Twitter/X:** [@trenchchatt](https://x.com/trenchchatt)

## License

MIT License — see [LICENSE](LICENSE)
