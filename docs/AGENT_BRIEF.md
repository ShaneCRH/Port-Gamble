# Agent Brief — Port Gamble Weddings & Events rebuild

You are taking over a project for **Shane Evans** (Creative Roots Holdings). Read this file first, then read `docs/HANDOFF.md` in full; it has every detail gathered so far (site audit, pricing, bookings, lead data, strategy, open requests). This brief tells you the mission, the rules, and how to get access to everything.

---

## 1. Mission (one paragraph)

Shane is acquiring Port Gamble (a historic WA mill town and its wedding venue) and wants the wedding-venue web presence **rebuilt and automated**. The venue's tour-to-booking close rate is **75%**, so the whole system exists to **get warm leads onto a tour as fast as possible**, with as little manual work as possible. Shane dislikes GoHighLevel's UI and wants to **talk to an agent (you) and have things done**: CRM updates, scheduling, texts/emails, reporting, marketing. Sites: `portgamble.com` (town/tourism) and `portgambleweddings.com` (the revenue site).

## 2. Operating rules (non-negotiable)

1. **Never send anything to couples, leads, vendors or the seller** (email, SMS, iMessage, posts) without Shane's explicit approval of that specific message. Drafts are fine (e.g., Gmail drafts).
2. **Never spend money** (ads, domains, purchases, paid tools) or change billing without explicit approval.
3. **Do not modify, redirect or cut over the live sites or any seller-owned account** (domains, CMS, Google Business Profile, GA, social, The Knot/WeddingWire, Constant Contact). Digital-asset transfer is an *open diligence item*; the acquisition has not closed. Build and stage in parallel only.
4. **Privacy:** couples' names, emails, phones and addresses live in the source spreadsheets in Drive. Do not copy them into the git repo, logs, PRs or third-party services. Use aggregates or IDs. Never open or reproduce credentials (a file named `PG DD L66 PGWE Passwords.xlsx` exists in Drive; do not open it; recommend moving logins to a password manager).
5. **Report honestly:** state what you verified vs. inferred. Numbers in the handoff came partly from OCR of screenshots and from survey-based "how did you hear about us" counts.
6. Don't invent facts about "Rakazo" (a self-hostable agent tool Shane mentioned); it could not be verified. Ask him.

## 3. How to get the code

- **Repository:** https://github.com/ShaneCRH/Port-Gamble
- **Working branch:** `claude/relaxed-heisenberg-3ijac9` (the repo has no other branch yet, so no default/base branch exists; ask Shane before creating `main`).
- **Clone:**
  ```bash
  git clone https://github.com/ShaneCRH/Port-Gamble.git
  cd Port-Gamble
  git checkout claude/relaxed-heisenberg-3ijac9
  ```
- **Authentication:** the repo may be private. Use a GitHub token or SSH key that Shane provisions for you (read/write to this repo only). **Never paste tokens into the repo, issues or chat logs.** If you are running in Claude Code on the web, the GitHub integration at https://claude.ai/connect-github handles auth.
- **Contents right now:** `docs/HANDOFF.md` (full context) and this file. **No application code exists yet.**
- Commit to the working branch; push with `git push -u origin claude/relaxed-heisenberg-3ijac9`. Do not push elsewhere or force-push without Shane's permission. Open PRs as drafts.

## 4. How to get the data (all read-only)

- **Google Drive** (owner Marli Tarbaux; Shane has access). Root folder **"PG Business DD"**, id `1GUfZ2dP2tPaNMa_Mji3Yl62-NWteqS7H`; the "Weddings & Events" folder is `1mmxcWLsgozL2ICeDxFmVjf_mgnR7w2kF`. `docs/HANDOFF.md` section 10 lists the IDs of every file we've used (weddings spreadsheets 2023–2028, lead-source files, GA and Constant Contact reports, ad agreements, tour-info doc, vendor list).
  - In the previous session, Drive was reached through **Composio** (`GOOGLEDRIVE_FIND_FILE` with `q`/`folder_id`, `GOOGLEDRIVE_DOWNLOAD_FILE`), account alias `shane-drive`. Claude's built-in Drive connector had its search/read tools turned off. Shane can enable them at https://claude.ai/customize/connectors. If you have neither, ask Shane to share the specific files.
  - PDFs (analytics, Constant Contact) are **image-only**; extract with OCR (`pypdfium2` + `pytesseract` worked).
- **Gmail** (shane@creativerootsholdings.com): read access via the Gmail connector. Useful threads: "PG Current Town Operations Model & Forecast", "Updated Model V10 & Rent Roll", "PG Due Diligence Request List & Tracker", "Port Gamble Offering Package", "Introduction and DD access". Create **drafts only**.
- **Live sites:** `portgamble.com` and `portgambleweddings.com` are public. In Claude Code cloud, add these four hosts to the environment's allowed hosts first: `portgamble.com`, `www.portgamble.com`, `portgambleweddings.com`, `www.portgambleweddings.com`.
- **Not reachable:** Raydient's data room (hosted by **Real Capital Markets**; invitation went to Marli). Shane must download files from it and hand them to you.
- **Other connectors seen (authorization state at handoff):** Vercel (connected, unused), UpHex for Google/Meta ads and funnels (connected, unused), GoHighLevel (**not authorized**), Porkbun (**not authorized**), Slack, Google Calendar.

## 5. Key facts you must not get wrong

- Venue: **Hood Canal Vista Pavilion** (120 seated indoor; ~185–200 under tent, April–October) and **St. Paul's Church** (1879; 150 sanctuary). Combination package is most popular (church 4-hr block + Pavilion 9 am–10 pm).
- Pricing (May–Sep): 2026 Pavilion Fri/Sun $5,600, **Sat $6,350**, Mon–Thu $5,050; 2027 Pavilion Fri/Sun $5,850, **Sat $6,650**, Mon–Thu $5,350; 2027 combination Sat $7,250. Seasonal (Oct–Apr) prices not yet captured. Extra hour: $300 (site) vs $280 (tour doc): confirm.
- **2027:** 66 weddings booked, $357,815, average ≈ $5,421; seller target ≈ 85 weddings / $370K. Peak Saturdays are essentially sold out; open inventory is **Fri/Sun in season, Mon–Thu, and Oct–Apr**.
- Weddings per year (survey data): 2023 = 106, 2024 = 102, 2025 = 93, 2026 = 88 → **declining**. The Knot is the largest tracked paid channel (20–21/yr recently); "drive by" ~20/yr; referrals shrinking; social ≈ 0.
- Website analytics (Jan 2024–Sep 2026): ~39K users; Check Your Date ≈ 7.1K views; Book a Tour ≈ 3.5K views; **no conversion tracking exists**.
- Expected value per toured lead ≈ $5.4K × 75% ≈ **~$4K**, the ceiling for cost per booked tour.
- Marketing today: **$0 paid spend, no Google/Meta ad accounts.** The Knot/WeddingWire/Zola/Here Comes the Guide listings exist; owner and cost unknown.

## 6. What to do first (in order)

1. Read `docs/HANDOFF.md` fully.
2. From Drive, read the **2026 and 2028 weddings spreadsheets** and the **ad agreements** (folder `1cCa9DdDGoIxySy09cSX4lQoG3tXCZ1rm`); extract spend and 2028 pacing into aggregates; append findings to `docs/HANDOFF.md`.
3. Search Gmail/Drive for a **tour or inquiry log** (none found yet). If none exists, add it to the request list for Raydient (Eric Ayala is the best contact).
4. **Draft (do not send)** request emails to Raydient and to Marli in Gmail drafts using the list in `HANDOFF.md` §12; show Shane.
5. Ask Shane to confirm the back end (GHL thin pipe / custom stack / hybrid). Until then, design the booking flow so the backend is swappable behind a small API.
6. Scaffold the new site in this repo (suggested: Next.js on Vercel): **date-check → tour booking** as the primary CTA on every page; add measurable conversion events; keep it staged, not live.
7. Do a real **competitor audit** of top venue sites' tour-booking flows (only search-level research has been done).
8. Report back to Shane with what you verified, what you assumed, and what needs his approval.

## 7. How Shane works

He wants to **talk and have it done**. Be direct, give a recommendation, ask only the questions that block you, and keep him out of tool UIs. He prefers plain lists. He has said he cares most about **automation** and **speed from warm lead to tour**.
