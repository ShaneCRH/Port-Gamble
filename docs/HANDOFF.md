# Port Gamble Weddings & Events — Project Handoff

Written 2026-11-24 from a working session with Shane Evans. This is the full context for whoever (a person, a Claude session, or an agent) continues the work. It is deliberately detailed, not a summary. Couples' names, emails, phone numbers and addresses are **intentionally excluded** from this file (they exist in the source spreadsheets in Drive, e.g. the *Contact Sheet* tab; Shane has authorized agent access to them under the handling rules in `docs/AGENT_BRIEF.md` §2.4); everything else we learned is here.

---

## 1. The goal

Shane is taking over Port Gamble (the town and its wedding venue, via an acquisition from Raydient; see section 9) and wants to **rebuild the web presence for the wedding venue** with these priorities, in his words:

1. **Automate as much as possible.**
2. **Get warm leads to a tour as fast as possible.** Current close rate for any lead that actually tours is **75%** ("because it's so magical"). So the whole site/funnel exists to get leads onto the tour calendar.
3. Shane **hates working in GoHighLevel (GHL)**. He wants to *talk to an agent* and have it do whatever is needed (CRM, texts, scheduling, reporting) — not click through GHL's UI.
4. He wants **agents operating the business**, and to be able to **send iMessages from his own computer**.
5. He asked about **"Rakazo"**: described as similar to the Grok bot but **self-hostable with your own choice of API**. We could not find anything called Rakazo; it is **unverified**. Evaluate any such tool against the requirements in section 8 before committing.
6. **Marketing:** current paid spend is **$0**; there are **no Meta or Google ad accounts**; unsure about The Knot/WeddingWire status (see section 5.4 — listings exist).

Sites involved: **portgamble.com** (town/tourism site) and **portgambleweddings.com** (the wedding venue site, the one that matters for revenue).

---

## 2. Current-state audit of the two live sites (fetched 2026-11-18)

### portgamble.com ("Visit Port Gamble, Washington")
- Town/tourism site, **not** a wedding funnel. Built on a CMS (`/sc/...css` assets, Typekit fonts, GA `gtag`). Newsletter signup form.
- Nav: Things To Do (Eat & Drink, Shopping, Recreation & Nature, Arts & Culture, Lodging), Events & Festivals (calendar, seasonal events: Country Christmas, Ghost Conference), Live & Work, **Weddings & Event Space** (`/weddings-event-space/`), Our Vision, About (Contact, Getting Here, Press).
- Home page promos: "Plan Your Wedding / Plan Your Event / Plan Your Corporate Retreat" buttons all go to external sites. Events listed: Port Gamble Theater "Christmas Express" (Dec 4–20, 2026); Country Christmas (Dec 5–6).
- Mentions: "15-year development agreement with Kitsap County and a fully entitled master plan." Partner of Visit Kitsap Peninsula. The Gathering at St. Paul's has its own site (gatheringstpauls.org).
- Weddings page describes St. Paul's (150 sanctuary; downstairs 40; terrace 80) and the Pavilion, rates deferred to the wedding site.

### portgambleweddings.com ("Port Gamble Weddings & Events")
- **Platform:** ASP.NET-style CMS (forms use `__RequestVerificationToken`, `ufprt`), jQuery/Swiper/lightcase, GTM `GTM-MVH4K8R`, GA4 `G-K3MNC4W9L7`, cookie banner, an ad-tech pixel (`adsrvr.org`).
- **Nav / pages:** Home, Venues, Check Your Date, Book a Tour, Book Your Date, Galleries, Vendors, Events, Contact, Events Contact, Transactions.
- **Home page process (4 steps):** 01 Venues → 02 Check Your Date → 03 Book A Tour → 04 Book Your Date. Testimonials (Hannah O., Kyle + Kaylee, Haylee + Brenden, Jeva + Forrest). "Meet the Team" (see section 9).
- **Contact info on site:** (360) 297-8074; portgambleweddings@raydient.com; HCVP 4740 View Dr. NE, Port Gamble, WA 98364 (contact page lists office 4749 View Drive NE, mailing P.O. Box 85). Staff emails are printed on the page (scrapable).
- **Facebook / Pinterest / Instagram (@portgamble.weddings)** linked; a WeddingWire listing is linked.

### Funnel weaknesses found (the reason for the rebuild)
| Step | What exists today | Problem |
|---|---|---|
| Check Your Date | An embedded **public Google Calendar** (`pgwecal@gmail.com`, Pacific time) | Visitor must decode a month grid; nothing is captured; no link between "available" and "book a tour." Note on the page: on Sundays St. Paul's is only available 1:00–10:00 pm. |
| Book a Tour | A page with a headline + testimonial; **no visible form or scheduler in the HTML** | The highest-value step has no instant booking. Visitors fall back to phone/contact form. |
| Contact | Form (First, Last, Email, Phone, Message, anti-spam "What color is the sun?") posting to `/contact/` | Emails a shared inbox; no auto-reply, routing, or follow-up. |
| Book Your Date | Download a questionnaire, email it back, receive a contract, sign, pay 50% retainer | No e-sign or online payment in the flow. Steps: questionnaire → rental agreement → signature → 50% date retainer; then planning, rehearsal date set 60 days out, rehearsal packet 30 days out, final balance + security deposit 10 days out. |
| Payments | Separate `/transactions/` form (event name/date, contact, reason, amount, credit card or bank) | Disconnected from any CRM. Reasons: reservation retainer (50%), security deposit, final payment, vendor fee, "Ghost Conference Merchandise." |
| Events page | Conference rooms $75/hr (up to 20 guests for receptions); Pavilion non-wedding $275/hr Mon–Thu, $325/hr Fri–Sun (5-hr min); Historic Museum $125/hr (3-hr min, up to 35) | — |

---

## 3. The venue: spaces, inclusions, pricing

### Hood Canal Vista Pavilion (built 2009)
- Panoramic water views; floor-to-ceiling stone fireplace; six sets of French doors; 31 windows; patio and grassy bluff on Hood Canal. Seasonal **tented terrace** (up mid-April to mid-October).
- Capacity: **120 seated (128 winter)** to 150 standing inside; **tented terrace 185 (to ~200)**; lawn ceremony up to 200. 
- Included: tables & chairs (set/strike by staff), gas fireplace, heat, patio heaters, Wi-Fi, wireless mics, sound system, projector + drop-down screen, unlimited free parking, lighted fence line (roofline color changeable), ADA restrooms, catering workspace, kegerator/fridge.
- Standard rental **9 am–10 pm**; extra hour **$300** (tour doc says $280 — conflicting; confirm); alcohol requires a licensed/insured 3rd-party bartender service (business license, insurance, MAST12) and a WA banquet permit; no BYO.

### St. Paul's Church (built 1879, nondenominational)
- Modeled on a church in the founders' Maine hometown; 8 cathedral stained-glass windows, original pews, domed altar, the **original steeple bell** (couples ring it after the recessional). "Most photographed church in the area."
- Sanctuary **150**; downstairs dressing/reception **up to 40** (tour doc 40–50); waterfront terrace reception up to **80**. ADA ramp. Restrooms in the basement (one per gender). A/C and heat. Piano available (live music welcome; staff doesn't run music).
- Sundays: church unavailable until **1 pm** (services).
- Church-only rental is hourly with a **3-hour minimum**; additional hours $375/hr (2026), $400/hr (2027); at least +4 hours recommended for receptions.

### Pricing (from the site, 2026 / 2027 weddings)
| Package | Window | 2026 | 2027 |
|---|---|---|---|
| Pavilion only | May–Sep, all day | Fri $5,600 · **Sat $6,350** · Sun $5,600 · Mon–Thu $5,050 | Fri $5,850 · **Sat $6,650** · Sun $5,850 · Mon–Thu $5,350 |
| Combination (church 4-hr block + Pavilion all day) — "most popular" | May–Sep | Fri $5,900 · Sat $6,950 · Sun $5,900 · Mon–Thu $5,500 (+$300/extra hr) | Fri $6,450 · **Sat $7,250** · Sun $6,450 (Mon–Thu not captured) |
| Church only | Jan–Dec | ceremony only, 3-hr min; +$375/hr | +$400/hr |
| Seasonal packages | Oct–Apr | exist on the site; **prices not yet captured** | — |

**Always included:** one-hour rehearsal (scheduled ~2 months before, offered a day or two prior), getting-ready spaces, set-up/break-down of tables and chairs, personalized floor-plan schematic, invites to showcases/venue consultation & site visit, mic + sound system (+ projector), venue staff on site for the rehearsal and entire wedding day.

### Policies from the "Wedding Tour Info" doc (the tour script — use for FAQ/pre-tour automation)
- **Catering:** use a Preferred Caterer. Outside/self-catering: security deposit increases up to **$800**, separate agreement, site visit, insurance and checklist; outside caterers must schedule a walkthrough and provide business license, COI and health permit.
- **Alcohol:** 3rd-party professional bartending service (established ≥1 year, business license, insurance, MAST12s) or attached to the caterer; WA banquet permit; all alcohol served by the bartender.
- **Decor — church:** nothing on walls/pews (pew clips recommended); candles in containers taller than the flame (except unity candle); light-colored petals only and swept up; plant stands/easels available. **Pavilion:** nothing on walls; contained candles; floor protection for live bands; clients clean up organic material.
- **Sendoffs:** almost anything allowed except unauthorized fireworks, birdseed, rice/foil confetti, floating paper lanterns; sparklers case-by-case.
- **Parking:** free and unlimited; VIP/coned spots (7 blue passes); parking attendant on site.
- **Bar setup:** a 6' rectangle table forming an L (to deter self-service) plus a 5' barback table.
- **Tables:** 60" rounds (seat 8), 48" rounds, 6' rectangles, 8 cocktail tables; 2 easels.
- **Securing a date:** signed contract + 50% retainer (see site flow).
- Open question in the data: these docs mention differing add-an-hour prices ($280 vs $300) and extended hour "out by 11 pm" — confirm the current rate card.

---

## 4. Demand data: 2027 bookings (66 weddings)

Source: `2027 Weddings Spreadsheet.xlsx` (shared by Shane; also in Drive, Bookings → Weddings). Names/contacts omitted. The spreadsheet's own tally: **$357,815 across 66 events**, with a goal cell of **$370,000 / 85 weddings** (gap −$12,185 / −19). Average ≈ **$5,421** (sheet shows $5,505 on a 65-count).

### By month
| Month | Weddings | Revenue |
|---|---|---|
| Jan | 1 | $5,000 |
| Feb | 1 | $2,600 |
| Mar | 1 | $5,250 |
| Apr | 5 | $22,085 |
| May | 6 | $36,530 |
| Jun | 9 | $48,280 |
| Jul | 10 | $61,860 |
| Aug | 15 | $75,200 |
| Sep | 9 | $55,930 |
| Oct | 8 | $39,580 |
| Nov | 1 | $5,500 |

### Booking-by-booking (name/contact omitted)
| # | Date | Day | Ceremony | Reception | Facility use | Quarter booked | Revenue |
|---|---|---|---|---|---|---|---|
| 1 | 2027-01-22 | Fri | Church | Pavilion | 9:00AM - 10:00PM | 2026 Q3 | $5,000 |
| 2 | 2027-02-21 | Sun | Pavilion | Pavilion | 12:00PM - 9:00PM | 2026 Q1 | $2,600 |
| 3 | 2027-03-06 | Sat | Church | Pavilion | Church 4 HRS; 9:00-10:00PM | 2026 Q3 | $5,250 |
| 4 | 2027-04-03 | Sat | Church | Pavilion | Church 4 HRS; 9:00-10:00PM | 2026 Q2 | $5,250 |
| 5 | 2027-04-09 | Fri | Church |  | Church     3:30PM-6:30PM | 2026 Q2 | $1,125 |
| 6 | 2027-04-10 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM-11:00PM | 2024 Q4 | $5,080 |
| 7 | 2027-04-17 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM-11:00PM | 2026 Q2 | $5,550 |
| 8 | 2027-04-24 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM-11:00PM | 2026 Q1 | $5,080 |
| 9 | 2027-05-01 | Sat | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q1 | $5,800 |
| 10 | 2027-05-08 | Sat | Church | Pavilion | Church 4 HRS; 9:00AM - 10:00PM | 2027 Q3 | $7,250 |
| 11 | 2027-05-15 | Sat | Pavilion | Pavilion | 9:00AM-11:00PM | 2026 Q1 | $6,050 |
| 12 | 2027-05-24 | Mon | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q1 | $4,300 |
| 13 | 2027-05-28 | Fri | Church | Pavilion | Church 4HRS ; 9:00AM - 11:00PM | 2026 Q2 | $5,880 |
| 14 | 2027-05-29 | Sat | Church | Pavilion | Church 4HRS; 9:00AM - 10:00PM | 2026 Q3 | $7,250 |
| 15 | 2027-06-05 | Sat | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q1 | $5,800 |
| 16 | 2027-06-11 | Fri | Church | Pavilion | Church 4 HRS ; 9:00AM-10:00PM | 2026 Q1 | $5,600 |
| 17 | 2027-06-12 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM-10:00PM | 2026 Q1 | $6,000 |
| 18 | 2027-06-18 | Fri | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q3 | $5,550 |
| 19 | 2027-06-19 | Sat | Church | Pavilion | Church 4 HRS; 9:00AM-11:00PM | 2026 Q2 | $7,250 |
| 20 | 2027-06-25 | Fri | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q1 | $5,380 |
| 21 | 2027-06-26 | Sat | Pavilion | Pavilion | 9:00AM - 10:00PM | 2025 Q3 | $5,800 |
| 22 | 2027-06-26 | Sat | Church | - | 11:00AM - 2:00PM | 2026 Q2 | $1,050 |
| 23 | 2027-06-27 | Sun | Pavilion | Pavilion | 9:00 AM - 10:00PM | 2026 Q3 | $5,850 |
| 24 | 2027-07-03 | Sat | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q2 | $6,000 |
| 25 | 2027-07-04 | Sun | Church | Pavilion | Church 4 HRS; 9:00AM - 11:00PM | 2026 Q3 | $6,750 |
| 26 | 2027-07-10 | Sat | Pavilion | Pavilion | 9:00AM - 10:00PM | 2025 Q4 | $5,800 |
| 27 | 2027-07-17 | Sat | Church | Pavilion | CHURCH 4 HRS ;9:00AM - 11:00PM | 2025 Q4 | $6,580 |
| 28 | 2027-07-18 | Sun | Pavilion | Pavilion | 9:00AM - 10:00PM | 2025 Q4 | $5,100 |
| 29 | 2027-07-23 | Fri | Pavilion | Pavilion | 9:00:00 AM - 11:00PM | 2026 Q3 | $6,150 |
| 30 | 2027-07-24 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM-10:00PM | 2026 Q1 | $6,300 |
| 31 | 2027-07-25 | Sun | Church | Pavilion | Church 4 HRS; 9:00AM - 10:00PM | 2026 Q3 | $6,450 |
| 32 | 2027-07-30 | Fri | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q3 | $6,150 |
| 33 | 2027-07-31 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM - 11:00PM | 2026 Q1 | $6,580 |
| 34 | 2027-08-01 | Sun | Church | Church | Church HRS 1:00PM - 3:00PM | 2025 Q3 | $1,050 |
| 35 | 2027-08-06 | Fri | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q2 | $5,880 |
| 36 | 2027-08-06 | Fri | Church | - | 12:00PM - 3:00PM | 2026 Q3 | $1,200 |
| 37 | 2027-08-07 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM - 11:00PM | 2026 Q1 | $6,550 |
| 38 | 2027-08-08 | Sun | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q1 | $5,100 |
| 39 | 2027-08-12 | Thu | Church | Pavilion | Church 4 HRS ; 9:00AM-11:00PM | 2025 Q4 | $5,280 |
| 40 | 2027-08-13 | Fri | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q3 | $6,150 |
| 41 | 2027-08-14 | Sat | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q1 | $6,050 |
| 42 | 2027-08-14 | Sat | Church | Church | 6 HRS | 2026 Q3 | $2,400 |
| 43 | 2027-08-15 | Sun | Pavilion | Pavilion | 9:00AM - 11:00PM | 2027 Q3 | $5,850 |
| 44 | 2027-08-21 | Sat | Church | Pavilion | Church 4 HRS ; 9:00AM - 11:00PM | 2026 Q1 | $6,580 |
| 45 | 2027-08-22 | Sun | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q3 | $5,850 |
| 46 | 2027-08-26 | Thu | Church | Pavilion | 9:00AM - 11:00PM | 2026 Q3 | $5,800 |
| 47 | 2027-08-27 | Fri | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q1 | $5,380 |
| 48 | 2027-08-28 | Sat | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q1 | $6,080 |
| 49 | 2027-09-03 | Fri | Pavilion | Pavilion | Pavilion 9:00 - 11:00PM | 2026 Q3 | $6,150 |
| 50 | 2027-09-04 | Sat | Church | Pavilion | Church 4HRS ; 9:00AM - 10:00PM | 2026 Q1 | $6,300 |
| 51 | 2027-09-05 | Sun | Church | Pavilion | Church 4 HRS ; 9:00AM-11:00PM | 2026 Q2 | $6,200 |
| 52 | 2027-09-10 | Fri | Pavilion | Pavilion | 9:00AM - 11:00PM | 2026 Q3 | $6,150 |
| 53 | 2027-09-11 | Sat | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q2 | $5,500 |
| 54 | 2027-09-12 | Sun | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q3 | $5,850 |
| 55 | 2027-09-18 | Sat | Church | Pavilion | Church 4HRS ; 9:00AM - 11:00PM | 2026 Q1 | $6,080 |
| 56 | 2027-09-19 | Sun | Church | Pavilion | Church 4HRS; 9:00AM - 10:00PM | 2026 Q3 | $6,450 |
| 57 | 2027-09-25 | Sat | Church | Pavilion | Church 4 HRS; 9:00AM - 11:00PM | 2026 Q3 | $7,250 |
| 58 | 2027-10-01 | Fri | Church | Pavilion | 9:00AM - 11:00PM | 2026 Q1 | $5,080 |
| 59 | 2027-10-02 | Sat | Church | Pavilion | 9:00AM - 10:00PM | 2025 Q4 | $4,800 |
| 60 | 2027-10-03 | Sun | Pavilion | Pavilion | 9:00AM - 10:00PM | 2025 Q3 | $4,400 |
| 61 | 2027-10-09 | Sat | Church | Pavilion | Church 4HRS ; 9:00AM - 10:00PM | 2025 Q3 | $4,800 |
| 62 | 2027-10-10 | Sun | Pavilion | Pavilion | 9:00AM - 10:00PM | 2026 Q1 | $5,100 |
| 63 | 2027-10-16 | Sat | Church | Pavilion | Church 4HRS ; 9:00AM - 10:00PM | 2026 Q3 | $5,500 |
| 64 | 2027-10-23 | Sat | Church | Pavilion | Church 4HRS ; 9:00AM - 10:00PM | 2026 Q3 | $5,500 |
| 65 | 2027-10-31 | Sun | Church | Pavilion | Church 4HRS ; 9:00AM - 10:00PM | 2026 Q1 | $4,400 |
| 66 | 2027-11-13 | Sat | Church | Pavilion | Church 4HRS ; 9:00AM - 10:00PM | 2026 Q3 | $5,500 |

### What this data says
- **Peak Saturdays (May–Sep) are essentially sold out** (22 Saturdays, all but May 22 booked; one double-booking day).
- **Fridays/Sundays May–Sep:** 23 of 43 booked (~half open). **Mon–Thu:** 3 weddings total. **Oct–Apr:** 17 weddings. Jan–Mar and Nov have one each.
- By day: Sat 33, Fri 15, Sun 15, Thu 2, Mon 1. Average revenue: Sat ≈ $5,715; Fri ≈ $5,122; Sun ≈ $5,133.
- Ceremony location: Church 38, Pavilion 28. Reception: Pavilion 61.
- **When couples booked ("Quarter Booked"):** 2026 Q1 = 22, Q2 = 10, Q3 = 22; 2025 Q3 = 4, Q4 = 5; 2024 Q4 = 1; 2027 Q3 = 2 (likely typos). **Nothing logged for 2026 Q4 yet** (sheet may be stale). Implication: demand clusters after the holidays (engagement season) and again late summer — so push ad budget Dec–Mar, second push late summer.
- Couples' home states (contact sheet, n = 66): WA 56, OR 2, MD 2, NE/ID/VA/CA/FL/MI 1 each.
- Caterer and bar columns are blank in this file.

---

## 5. Lead-source, traffic and email data (from Marli's Drive; "PG DD L5 / L65 / L67")

### 5.1 "Where brides are hearing about us" (survey-based counts; the sheet covers 2010–2028; 2017–2027 shown)
| Source | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Online (unspecified) | 2 | 8 | 11 | 15 | 8 | 6 | 15 | 12 | 7 | 4 | 3 |
| PortGambleWeddings.com | 5 | 2 | – | – | 1 | – | – | 2 | – | – | – |
| theknot.com (merged WeddingPro) | 5 | 5 | 7 | 3 | 5 | 5 | 17 | 10 | 12 | **20** | **21** |
| WeddingWire | – | 2 | – | 1 | – | – | – | – | – | – | – |
| Search engine | 4 | 7 | 4 | 8 | 4 | 7 | 14 | 7 | 22 | 11 | 1 |
| Instagram/SM | – | – | – | – | – | – | – | – | – | 1 | 1 |
| Facebook/SM | – | 1 | – | 1 | – | 1 | – | 2 | 1 | 1 | 1 |
| Pinterest | – | 1 | – | – | – | 1 | – | – | – | – | – |
| Here Comes The Guide | – | – | – | – | – | – | – | – | 3 | – | 1 |
| WeddingSpot | – | – | 1 | – | – | – | 1 | 2 | – | – | – |
| Zola | – | – | – | – | – | – | 2 | 2 | 2 | 4 | 1 |
| Referral | 13 | 16 | 18 | 16 | 16 | 17 | 12 | 12 | 7 | 9 | 6 |
| Seattle wedding show | 1 | 1 | 2 | 4 | – | 1 | – | – | – | 1 | – |
| Kitsap Wedding Expo / Tour, Puyallup, Everett shows | 1 | – | 1 | – | – | – | 1 | – | – | 2 | – |
| Magazine / Mentor Board | 1 | – | – | 1 | – | – | – | – | – | – | – |
| Guest at wedding/event | 2 | 8 | 7 | 7 | 5 | 4 | 8 | 7 | 6 | 7 | 4 |
| Drive by | 31 | 31 | 33 | 22 | 14 | 16 | 17 | 21 | 16 | 20 | 19 |
| Other (e.g., "live nearby", caterer, local resident) | 5 | 3 | 8 | 16 | 7 | 28 | 18 | 25 | 17 | 8 | 6 |
| COVID postponement | – | – | – | – | 41 | – | – | – | – | – | – |
| Open house | – | – | – | – | – | – | 1 | – | – | – | – |
| **TOTAL weddings** | 70 | 85 | 92 | 94 | 101 | 86 | 106 | 102 | 93 | 88 | 64 |

Notes: this is what couples *said*, not tracked attribution. Total weddings peaked at 106 (2023) and has declined to 88 (2026); 2027 stands at 64–66 with the seller target at 85. The Knot is the largest tracked paid channel and still growing; referrals are shrinking; the venue's own site is almost never credited; social is near zero.

### 5.2 "Where couples come from" (2019–2028, by city; 854 couples booked in the sheet)
Top cities: Bremerton 105, Poulsbo 73, Seattle 71, Port Orchard 56, Tacoma 38, Silverdale 35, Kingston 27, Gig Harbor 20, Bothell 14, Everett 14, Sequim 13, Edmonds 12, Shoreline 12, Bellevue 10, Bellingham 10, Lynnwood 10, Port Angeles 10, Puyallup 9, Renton 9, Olympia 8, Seabeck 8, University Place 7; out of state: CA 16, OR 14. ~135 distinct places. Kitsap-peninsula towns ≈ one third of couples; Seattle ≈ 8%.

### 5.3 Website analytics — portgambleweddings.com GA4 (Jan 1, 2024 – Sep 28, 2026; from a screenshot PDF, read via OCR — figures may be slightly off)
- ~39K users, ~57K sessions, ~125K page views; US = 34K users (engagement-time figure was unreadable in the OCR and is omitted).
- Sessions by channel: Organic Search ≈ 28K, Direct ≈ 18K, Referral ≈ 5.1K, Display ≈ 2.9K, Organic Social ≈ 1.6K, AI Assistant ≈ 105.
- Page views: Home ≈ 45K, Venues ≈ 22K, Galleries ≈ 8.4K, **Check Your Date ≈ 7.1K**, Vendors ≈ 5.3K, Transactions ≈ 4.3K, **Book a Tour ≈ 3.5K**.
- **Key events / conversions: "No data available."** No conversion tracking exists. This is the first fix in the rebuild.

### 5.4 Email — Constant Contact (Oct 1 2023 – Sep 1 2026)
98,388 emails sent; 72,919 delivered; 43% open rate (+15% vs industry); ~3% click rate (≈2,032 unique clicks); 25,469 bounced (!); 143 unsubscribes; opens 40% mobile / 60% desktop.

### 5.5 Listings that exist (found via search; ownership/spend unverified)
The Knot marketplace (`port-gamble-weddings-port-gamble-wa-215845`), WeddingWire (linked from the site), Zola ("up to 185 guests, from $4,000"), Here Comes The Guide, WeddingSpot (Hood Canal Vista Pavilion, St. Paul's). **Who owns these accounts and what is paid is unknown** — a top item to get from the seller.

### 5.6 Existing ad agreements in Drive (amounts not yet read)
Ward Media; Sound Publishing "Edge Club" (Sound Edge Agreement 2026–2027); GKC; Kingston Chamber ad; Washington 1889 Magazine; Discover Kitsap 2026 graphic; Silverdale Chamber destination-guide ad (2021); "Advertising Agreement – OPG Port Gamble LLC – Quarter Page – Signed"; Port Gamble Theater program ads.

---

## 6. Where the headroom is (the strategic read)

1. **Don't spend ad money on peak Saturdays** — they sell out. Target **Fridays/Sundays (May–Sep), Mon–Thu, and Oct–Apr** with value messaging ("fewer crowds, same view").
2. **Consider testing Saturday price** (sold out ~a year ahead). Marli's model assumes ~3%/yr events revenue growth; a higher test is reasonable.
3. **Date-check should steer, not dead-end:** if the Saturday is gone, immediately suggest nearby open Fridays/Sundays/seasonal dates, with a one-click tour.
4. **Ad timing:** heaviest Dec–Mar; second push late summer (booking-quarter pattern).
5. **Expected value of a tour:** ~$5,400 avg × 75% close ≈ **~$4,000 expected revenue per toured lead** (before costs) — the ceiling for what to pay per booked tour.
6. **Fix measurement first:** no GA key events today; no tour/lead log found; ads must optimize to *booked tours* (send a conversion event back to Google/Meta), not form fills.
7. **Social is a ~0 channel;** the venue photographs beautifully — real-wedding content (with photographer credit/permission) is untapped.
8. **Weddings trend down** (106 → 88). Don't assume the site alone is the problem — the 2023 peak coincided with a Knot spike; check spend/listing changes.

---

## 7. Proposed build (not started — repo is empty)

- **Front end:** fast custom site (Next.js on Vercel) with a cinematic hero/video; "Check my date → book a tour" widget as the primary CTA on every page; sticky mobile tour button; pricing transparency; testimonials near the CTA; SEO pages (Hood Canal wedding venue, St. Paul's Church wedding, each package, seasonal).
- **Back end/automation (logic in code that agents can call):** availability from a real calendar (replace the public Google Calendar), tour scheduling, speed-to-lead SMS+email within seconds, tour reminders (confirmation, 24h, 2h), no-show recovery, post-tour follow-up, **date holds with expiry**, online proposal/e-sign/payment, pipeline stages Inquiry → Toured → Hold → Booked, review requests after weddings, funnel reporting (visitors → inquiries → tours → bookings), conversion events to ad platforms.
- **GHL position:** the public API covers contacts, opportunities, calendars, conversations, forms, tags — but **not building workflows**. Plan: keep automation logic in this repo (webhooks + scheduled jobs) and, at most, use GHL as a thin pipe for calendar/SMS — or drop it. **Decision pending** (options: GHL thin pipe / custom stack e.g. Postgres+Twilio+Resend+Stripe / hybrid). GHL's MCP in the session was **not authorized** (needs signing in at claude.ai connectors, or a Private Integration token via a secure form).
- **Agents:** all actions that message couples or move money should require approval until Shane says otherwise.
- **iMessage:** Apple has no public API. A Mac-based bridge (e.g., BlueBubbles-style) can send from Shane's number but needs an always-on, signed-in Mac; use SMS (Twilio/GHL) for routine automation and iMessage for personal outreach. The cloud session cannot reach his Mac unless it is attached as a connected machine.
- **Competitors/tools referenced (not audited):** Planning Pod (tour scheduling, holds, lead webforms), HoneyBook (proposals/contracts/payments; weak for multi-space venues), Tripleseat, Perfect Venue, Zola/Knot/WeddingWire marketplaces. The competitor research was limited to search results — **a proper audit of leading venue sites has not been done.**

---

## 8. Evaluating "Rakazo" (or any self-hosted agent)

Unverified. Check: (1) can it call HTTP APIs/MCP servers; (2) real iMessage channel or only Telegram/Slack/WhatsApp; (3) approval gates before sending to couples or moving money; (4) maintenance and security record (it would touch lead data and payments — use a scoped API key); (5) hosting reliability (a sleeping Mac drops iMessages). Keep the booking/CRM system the source of truth so the agent is replaceable.

---

## 9. Business and transaction context (relevant facts only)

- Seller/current operator: **Raydient** (staff emails @raydient.com). Wedding team listed on the site: **Eric Ayala** (Wedding & Events Manager, since 2013), **Kristen Stanton** and **Amber Bartz** and **Emily Maddox** (Venue Coordinators), **Braedon** (Venue Facility Assistant). Raydient project contacts: Jon Rose (VP), Stephanie Foster (Project Manager), Bob Hunter (Senior PM).
- Buyer side: Creative Roots Holdings — **Marli Tarbaux** (Managing Partner) built the operating model; **Shane Evans** is the user; **Mark Orshoski** is another principal. Drive file names indicate an **executed PSA (9/21/2026)** and a proposed 5th amendment; **closing date not confirmed.**
- Marli's operating model (v10): seller 2026 revenue **$1,399,880** total (rental $994,280; weddings & events $405,600 = **weddings $355,000 + festivals/meetings $42,000 + other**); 2025 weddings & events $332,063; seller 2027 budget weddings & events $425,600. Town operations were described as running at ~**$866K projected 2026 deficit ($565K cash)** per Raydient. Marli's plan: cut event staffing to one accountable event lead + variable labor; track event P&L by booking.
- **Open diligence items that matter here:** *event-level P&Ls for 24–36 months* (open) and *digital assets — websites, domains, social accounts, photography, event leads, CRM, booking data, trademarks* (open; "include transfer of all account credentials at closing"). **Until that transfer happens, do not cut over or touch the old sites/accounts.** Build and stage the new site in parallel.
- A file **"PG DD L66 PGWE Passwords.xlsx"** exists in Marli's Drive (credentials). It was **not opened**; recommend moving credentials to a password manager.

---

## 10. Where the source files live (Google Drive, owner Marli Tarbaux; folder "PG Business DD" id `1GUfZ2dP2tPaNMa_Mji3Yl62-NWteqS7H`)

| Item | Drive ID |
|---|---|
| Weddings & Events folder | `1mmxcWLsgozL2ICeDxFmVjf_mgnR7w2kF` |
| Bookings (L20/21/24) | `1BhNMyGICmbHS7ZaqBWhcBk97-X5IbZmd` (Weddings: `1er7vGzEoVHxcXM86BBB7tK-CzB5Kxjy1`; Events: `1H6i6vct-gIHza4cfVKf-2gK8hhGOlzew`) |
| 2023–2028 Weddings spreadsheets | 2023 `1P1sfRHMKOnikbNs6czIhOZp7umIPn9xI` · 2024 `1wbDx3AEXubUp_GV0I87q-mzP_l7D8X3Z` · 2025 `1hcF4KS_mYW2TfpoC977VNs6dcxTtB5fm` · 2026 `18zn6e01XqmvsH8smssTdVOAUwjHv00FQ` · 2027 `1IC1oGn1VduSXPNOmvcZFWs2l8Puka3Qe` · 2028 `1t4febDb3tsgs_UOXGi6DH_JKzxY1HGXh` |
| Events spreadsheets 2023–2027 | 2023 `1W55JKioH3lGdjy86Ravy3b4Q4PkHbuL7` · 2024 `1rf9b7rWG3YBLa1Lk9siHJb2kB6z5hYC5` · 2025 `15Bhu4I-ihBuWuvEihVaghhfeYFF6VOjk` · 2026 `1XGUuTzExlZy7jyKMDfAErQ7IQlhhrbXW` · 2027 `1WXIBpaOsIyRDB0PLwT-xLlvu_kIloK3u` |
| Where brides hear about us | `1N7fztEpSPB9gPzkxwVGsr3mm6Z6HtpTB` |
| Where couples come from | `1Fd6581_XOrxFkFlSjjHDf4HmoPwCG3Rz` |
| Website folders / GA report | Websites `1F71ejn7_jVnohGXTxtJO7vL1XPJVOBXF`; Weddings Website `1_YzrbpyhG4cvEUc98JzjWZyw_euah4Sp`; GA PDF `1hnVoKSh1UYiY_btgVl3LJZgvUefY2VLH` |
| Constant Contact report | `1oPgcFnzREa-MU3mQ2lkcL3GaoZvUCl-g` |
| Ads (L68) | `1cCa9DdDGoIxySy09cSX4lQoG3tXCZ1rm` |
| Pricing/brochures (L22) | `1uOcEVdP72s1HvR31FiFe5cCOJPsSN1St` (brochures 2023–2026) |
| Wedding Tour Info docs | `1tPlnmoj_wtuZ7KRo5MGkqFoJE9y-dULl` (v2), `12E_toPdZp6CIZVvTKJDSk0NonbOFD45X` |
| Preferred vendors (L33) | `1gvxAkNLmxNNrLAMupab4JOgMzpPq8Vol` |
| Seller DD request list | `1edkPy_Wk_nYHwerkJZ-JGAsQ-KffwUSU` |
| Calendar of Events (L101) | `1YQBxxzsFYuXXewQUgAOCi_XoMCLE60gY` (2023–2026 subfolders) |
| Other noted | Weddings inventory xlsx `1nLRAhZeHnXcB8GSPK9yoJZ-We_hFZG9o`; rack cards 2026; contracts/agreements; Things & FAQs PDF `1ui8_3IJjGu-mLr7A3UmKWsJ89QAgKZVA` |

**Not Drive:** Raydient's data room is hosted by **Real Capital Markets** (invitation went to Marli) and was not reachable from the session.

---

## 11. Access / tooling state at handoff

- **Environment network:** `portgamble.com`, `www.portgamble.com`, `portgambleweddings.com`, `www.portgambleweddings.com` were added to the Default cloud environment's allowed hosts (revert if unwanted).
- **Composio Google Drive** is connected (account alias `shane-drive`); used read-only for search/download. Disconnect in Composio when done.
- **Claude's built-in Google Drive connector** exposed no search/read tools in the cloud session (tools likely toggled off at https://claude.ai/customize/connectors).
- **Gmail** connector worked (read). **GHL and Porkbun** MCPs need authorization. **UpHex** (Google/Meta ads, funnels, leads) and **Vercel** are connected but unused so far.

---

## 12. Still needed (request list for seller/Marli)

**From Raydient / event team (Eric Ayala is the best contact for items 1–4):** (1) lead/inquiry export, 24–36 mo, with date, source, outcome; (2) **tour log** (who toured, date, who booked) — verifies the 75%; (3) copies of inquiry auto-replies/templates and how the questionnaire/contract are produced; (4) 2028 pricing and calendar/holds; (5) marketing spend by channel by month, 24 mo, including The Knot/WeddingWire/Zola/Here Comes the Guide fees and who owns each account; (6) event-level P&Ls; (7) cancellations/refunds/deposit policy in practice; (8) registrar logins for both domains, CMS admin, Google Business Profile, GA, Instagram/Facebook/Pinterest, Constant Contact; (9) photographer/videographer usage rights; (10) CRM/booking-tool export; (11) contracts, questionnaire, rental agreement template, vendor list.

**From Marli:** newest model (V10 + rent roll), the "LCG & PG Upfront Costs" sheet, closing/transfer timing, post-close team plan, monthly marketing/tooling budget.

**From Shane:** create or grant Google Ads, Meta Business, GA access and a billing card; choose the back-end option; say what Rakazo is; confirm whether he wants The Knot kept/expanded.

---

## 13. Immediate next steps for the next session

1. Read the **2026 and 2028 weddings spreadsheets** and the **ad agreements** to estimate spend, 2028 pacing and current-year conversion.
2. Look for a **tour/inquiry log** in Gmail and Drive (none found yet).
3. Decide the back end; then scaffold the site and booking flow in this repo, starting with **date-check → tour booking** with measurable conversion events.
4. Draft (don't send) request emails to Raydient and Marli in Gmail drafts.
5. Do a proper **competitor audit** of top venue sites and tour-booking flows.

---

## 14. Build status (2026-11-24)

The staged site now exists in this repo (see `README.md`): Next.js 16 + Postgres, custom backend ("custom but unbreakable"). Date check with prices and nearby open Fri/Sun/off-season alternatives, self-serve tour booking, sticky mobile tour bar, pricing page, conversion events, transactional message outbox (approval mode, log-only providers), unit + integration tests and CI. Not deployed; `noindex`. Open decisions: base branch, Vercel project and database host, messaging providers, tour schedule, and when automated messages may go live.
