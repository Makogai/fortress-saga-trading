# Fortress Saga — Card Tracker

A web app for tracking Fortress Saga album cards and sharing your collection (trade/need) for Discord.

## Quick start

```bash
npm install
npm run dev
```

Open the app. Everyone starts with a **clean slate** (all counts 0). Then:

1. **Edit counts** — Click **Edit counts** and type how many you have per card.
2. **Import counts** — Use a counts-only file (see format below).
3. **Share** — Click **Share** to copy a link; anyone who opens it sees your collection.

Export options: **Full image**, **Trading only** (dupes + need), or **Copy text** for Discord.

---

## Import format (counts only)

Use **Import counts** with a text file in this format:

- **One line per album** (albums in fixed order — see in-app **Format guide**).
- **Each line:** exactly 10 comma-separated numbers (card counts in **game page order**).
  - Game order = page 1 first (2 cards top, 3 bottom), then page 2 (2 top, 3 bottom). So positions 1–5 = first page, 6–10 = second page.
- **Numbers:** `0` = missing, `1` = owned, `2+` = duplicate (tradeable).

**Album order** (use this order in your file):

1. Equipment Album  
2. Monster Album  
3. Petite Album  
4. Boss Album  
5. Hero Album I  
6. Fortress Album I  
7. Hero Album II  
8. Fortress Album II  

**Example file:**

```
1,1,1,0,1,0,1,1,1,0
1,1,1,2,1,2,2,1,1,1
0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
```

Line 1 = Equipment Album (10 counts), line 2 = Monster Album, … line 8 = Fortress Album II.

The in-app **Format guide** button shows this same info and an example.

---

## Share link

Click **Share** to copy a link that encodes your current card counts. When someone opens the link, they see your collection (and can export images or text from it). The link uses the URL hash (`#s=...`) so it works without a server.

---

## Full import (optional)

**Full import** accepts the legacy format with album names and card names:

- One album per block: a **title line** followed by **10 card lines**.
- Each card line: `RARITY Name, COUNT`  
  Example: `U Caligo Pride, 1`

Use this if you have a file that lists every card by name; otherwise use **Import counts** with numbers only.

---

## Tech

- Vite + React + TypeScript
- TailwindCSS
- html-to-image (PNG export)

Runs locally; no backend. Data can be saved in the browser (localStorage) or shared via the generated link.
