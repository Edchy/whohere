# WHO HERE? — Product Bible & Source of Truth
*Version 1.0 — March 2026*

---

> **This document is the single source of truth for the Who Here? app.** It synthesizes the original concept conversation (rubesgpt.md) and the initial planning notes (plan.md) into a living reference for design, development, content, and strategy decisions. When in doubt, come back here.

---

## Table of Contents

1. [Napkin Sketch — The Core Idea](#1-napkin-sketch)
2. [Business Plan — Lean Canvas](#2-business-plan)
3. [User Journey — The Story](#3-user-journey)
4. [PRD — Product Requirements Document](#4-prd)
5. [Design System](#5-design-system)
6. [Question Card Design System](#6-question-card-design)
7. [Social Psychology & The Experiment](#7-social-psychology)
8. [Monetization Strategy](#8-monetization)
9. [Content Strategy & Question Writing Guide](#9-content-strategy)
10. [MVP Roadmap](#10-mvp-roadmap)
11. [Risk Register](#11-risk-register)

---

## 1. Napkin Sketch

### The Core Idea (One Sentence)
> **"Who Here?" is a mobile app that turns any public space into a game board — using the surrounding strangers as characters for questions about intuition, projection, and human perception.**

### What It Is
A question-card app. You open it, choose your mode, and cards appear one at a time — each starting with "Who here…?" followed by a description of a trait, characteristic, or fictional personal history. You look around. You pick someone. You discuss why. That's it.

The surrounding people are never involved. They never know. The game lives entirely in the private bubble of the players.

### What It Is Not
- Not a social network
- Not a trivia game
- Not an icebreaker gimmick
- Not a party game (even though it can be used at a party)

### The Single Strongest Hook
The app makes **our unconscious, automatic judgments of strangers visible** — and turns them into conversation. It's a social perception game disguised as fun. Almost every human being does this constantly and silently. This is the first app that says: *let's do it out loud, together, with curiosity instead of shame.*

### Example Cards
- *"Who here… has a drawer in their hallway full of old parking tickets?"*
- *"Who here… waited until secondary school to learn how to tie their shoes?"*
- *"Who here… looks like they'd be the main character in a true crime documentary?"*
- *"Who here… has a secret relationship with a neighbor in the same stairwell?"*
- *"Who here… would survive the longest in a zombie apocalypse?"*

### The Three Modes (The Spine of the App)
| Mode | Social Context | Core Feeling |
|---|---|---|
| 💕 Dating | First date, new romantic interest | Flirty curiosity, vulnerability |
| 👯 Friends | Old or new friends, groups | Humor, discussion, laughter |
| 🧍 Solo | Alone on a train, waiting | Observation, meditation, self-insight |

### The Cynical VC Stress-Test (Weaknesses to Solve)
- **The "Creep" Factor** — If users feel they're dissecting strangers, they'll quit. Must stay "social perception," never "social dissection."
- **The Content Treadmill** — 50 questions = app deleted after 3 dates. Need a deep library.
- **Context Dependency** — App is useless without people around. Must design for this.
- **Social Anxiety Barrier** — Some users will feel uncomfortable. Must design that discomfort away.

---

## 2. Business Plan

### Lean Canvas

| Block | Content |
|---|---|
| **Problem** | First-date awkward silence. Public boredom during transit. Superficial social interactions. |
| **Customer Segments** | Primary: Urban adults 20–40, dating / socializing. Secondary: Couples, friend groups. Tertiary: Therapists, coaches (future). |
| **Unique Value Proposition** | "A game about how we read people." A private bubble of shared observation in the middle of a crowd. |
| **Solution** | Premium question-card app, three modes (Dating / Friends / Solo), environment-aware, no login needed, no strangers involved. |
| **Channels** | App Store / Google Play. Organic social (TikTok, Instagram). Word of mouth from first dates. |
| **Revenue Streams** | Freemium core + unlock full version (59–79 SEK). Future: themed content packs (29–39 SEK each). |
| **Cost Structure** | Development (React Native or Flutter), content writing, design, App Store fees. |
| **Key Metrics** | 30-day retention, free-to-paid conversion rate, session length per mode. |
| **Unfair Advantage** | The question quality + voice is handcrafted — not AI-generated filler. The psychological depth is the moat. |

### Positioning Statement
*"Perfekt för dejter — kul med vänner — intressant ensam."*
("Perfect for dates — fun with friends — interesting alone.")

### Primary Target User
- Age 20–40, urban environment
- Socially curious, not necessarily extroverted
- Dating or actively socializing
- Interested in psychology, design, self-awareness
- Has disposable income for small app purchases

### Competitive Landscape
- **Cards Against Humanity / similar** — Too loud, requires physical cards, no psychological depth
- **Truth or Dare apps** — Too juvenile, no observational mechanic
- **Conversation starter apps** — Too generic, no game layer
- **Bumble / Hinge icebreakers** — Context-locked (only useful in-app)
- **Who Here?** — Unique position: a *premium social tool* for people who are already together, using the environment as the game board. No direct competitor exists in this exact space.

---

## 3. User Journey

### Primary Journey: First Date at a Bar

**Step 1 — The Trigger**
A couple is on a first date. Conversation has gone well but there's a lull. One person has heard about the app. They say: "Do you want to try something fun?"

**Step 2 — Onboarding**
Open the app. No login. No lengthy tutorial. The screen presents three large, clean options:

> 💕 On a date
> 👯 With friends
> 🧍 Alone

**Step 3 — Mode Selection**
They tap *"On a date."*

**Step 4 — Environment Check** *(optional, a single extra screen)*
> Where are you?
> 🪑 Sitting still
> 🚶 People are passing by
> 🎲 Doesn't matter

They tap *"Sitting still."* A tailored card pool loads.

**Step 5 — The Play**
A card appears with large, clean typography:

> *"Who here… looks like they carry a deep secret?"*

They look around the bar. They each pick someone. They whisper their answers and explain their reasoning. Laughter. A moment of intimacy. They realize they picked completely different people. "Wait, why her? What made you think that?" The conversation writes itself.

**Step 6 — Swipe to Next**
They swipe. Another card appears. The flow is effortless.

**Step 7 — The Discretion Button**
Someone walks close. One player taps the small 👀 button in the corner. The screen goes neutral instantly. No one notices. The moment passes. They continue.

**Step 8 — The Paywall Moment**
After 15 questions, a soft prompt:

> *"Ready for more?*
> 🔒 Who here… could have become obsessed with something in an alarming way?*
> Unlock the full deck for 59 kr"*

The emotional peak is right now. They're having fun. This is the perfect moment. Conversion happens naturally.

**Step 9 — The Memory**
Later, they remember the app not as "a game we played" but as "this thing that made us talk for two hours." That's the emotional residue. That's also the word-of-mouth moment.

---

### Secondary Journey: Solo on the Train

User opens app. Selects *"Alone."* Card appears:

> *"Who here pulled your attention first?"*
> *"What made you choose that person?"*
> *"What does your choice say about you?"*

It becomes almost meditative. A mindfulness-adjacent experience. The commute becomes interesting.

---

### Tertiary Journey: Friend Group at a Café

Four friends, rainy Sunday afternoon. Someone pulls out the app. Friends mode. The absurdist questions come out:

> *"Who here could have started a cult?"*

Everyone points at different people. Someone points at the barista. Another points at an old man by the window. Debate erupts. Laughter. Someone takes a screenshot of their conversation and posts it.

---

## 4. PRD — Product Requirements Document

### Must-Have Features (V1 / MVP)

| Feature | Description | Priority |
|---|---|---|
| Mode Selection | Three modes: Dating, Friends, Solo | P0 |
| Question Card Engine | Random or category-based card display | P0 |
| Swipe UX | Smooth card swipe to advance | P0 |
| Discretion Mode | One-tap button to hide the screen instantly | P0 |
| Environment Filter | Stationary vs. flow environment, filters question pool | P1 |
| Freemium Gate | Limited free cards, unlock full deck | P0 |
| Offline Functionality | Cards available without internet | P1 |
| No Login Required | Zero friction onboarding | P0 |

### Nice-to-Have Features (V2+)

| Feature | Description |
|---|---|
| Content Packs | Purchasable themed packs (After Dark, Travel, Deep Cuts) |
| Follow-Up Prompts | Optional: "What made you choose that person?" shown after a card |
| Favorites | Save cards you loved |
| Custom Deck | Let users build their own session |
| Language Packs | English, Swedish, other markets |

### User Stories

- *As a dater, I want questions that feel flirty but safe, so I can learn how my date thinks without making them uncomfortable.*
- *As a solo commuter, I want questions that slow me down and make me actually look at people around me.*
- *As a friend, I want questions absurd enough to spark a debate, not just a nod.*
- *As a user in any mode, I want to instantly hide the app if someone might see my screen.*
- *As a first-time user, I want to understand the app in under 10 seconds with zero explanation needed.*

### Tech Stack Recommendation

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | React Native or Flutter | Cross-platform, iOS + Android from one codebase |
| Backend | Minimal — local JSON card database to start | Keeps it fast, offline, cheap |
| Payments | RevenueCat | Industry standard for mobile in-app purchases |
| Analytics | PostHog or Mixpanel | Track retention + conversion |
| Database (later) | Firebase or Supabase | If user accounts are added later |

### Success Metrics

| Metric | Target (Month 3) |
|---|---|
| 30-day retention | > 25% |
| Free → Paid conversion | > 8% |
| Session length (dating mode) | > 12 minutes |
| App Store rating | > 4.5 stars |
| Average cards per session | > 10 |

---

## 5. Design System

### Design Philosophy
This app is **a premium social tool, not a game.** Every design decision should reinforce that it feels:
- Smart and intentional
- Calm and confident
- Intimate without being precious
- Mature without being boring

Reference feeling: **A modern dating app crossed with a design magazine.** Think Calm × Hinge × Kinfolk.

### Color Palette

**Option A — Dark Premium (recommended for V1)**
| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#0D0D0D` | Main background |
| `--bg-card` | `#1A1A1A` | Card surface |
| `--text-primary` | `#F5F0E8` | Primary text (warm off-white) |
| `--text-secondary` | `#8A8480` | Labels, metadata |
| `--accent` | `#C8A97A` | Accent — warm gold/amber |
| `--accent-soft` | `#3D2F1E` | Accent backgrounds |
| `--destructive` | `#8B3A3A` | Error states only |

**Option B — Light Premium (warm, editorial)**
| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#FAF7F2` | Warm off-white background |
| `--bg-card` | `#FFFFFF` | Card surface |
| `--text-primary` | `#1C1C1C` | Primary text |
| `--text-secondary` | `#7A7570` | Labels |
| `--accent` | `#2B2B2B` | Near-black for accents |
| `--border` | `#E8E2D9` | Subtle dividers |

> **Principle:** Premium = less color. The accent color appears sparingly — only for interactive affordances and brand moments. Never decorative.

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Card Question | Serif (e.g., Playfair Display, or DM Serif Display) | 28–36px | Regular/Light |
| Mode Label | Sans (e.g., Inter, DM Sans) | 14px | Medium |
| UI Labels | Sans | 12–13px | Regular |
| Body / Metadata | Sans | 14–16px | Regular |

> **Principle:** The question itself must feel *important*. Using a serif typeface for the card question creates gravitas. This is not a quiz — it's a prompt worth sitting with.

### Motion Design
- Card swipe: soft horizontal slide, 300ms ease-out. Not bouncy. Not snappy.
- Mode selection: fade + slight upward drift, 200ms
- Discretion button: instant black overlay, no animation — this must feel like a reflex
- Transitions between screens: 250ms fade. Nothing flashy.

> **Principle:** Animations are pacing tools, not flourishes. They should make the app feel *considered*, not entertaining.

### Spacing & Layout
- Cards are centered with generous vertical padding — the question breathes
- Bottom navigation is minimal: only what's essential (next card, mode indicator, discretion button)
- White space is a design element, not empty space

### Iconography
- Minimal, thin-line icons. No filled icons. No emoji in the UI itself (only in mode selection as subtle visual cues).
- The less decoration, the more premium.

### Voice & Tone (UI Copy)
- Calm, intelligent, slightly witty
- Never instructional or tutorial-heavy
- Onboarding = almost no words: the mechanic explains itself in one swipe
- Error states are human and light ("No cards left in this pack — try another mode?")

---

## 6. Question Card Design System

> **The cards are the product. Everything else serves the cards.** The question card is the moment the app lives or dies. It needs to be instantly recognizable, visually impeccable, and psychologically effective.

### Card Anatomy

```
┌─────────────────────────────┐
│                             │
│   [MODE INDICATOR]          │  ← small, top-left: "💕 dating"
│                             │
│                             │
│   Who here…                 │  ← brand phrase, smaller weight
│                             │
│   "…has a secret the        │  ← the question itself, large serif
│    people closest to        │
│    them would never         │
│    guess?"                  │
│                             │
│                             │
│                [SWIPE →]    │  ← ghost hint, fades in/out
│   [👀]          [⋯]        │  ← discretion button + options
└─────────────────────────────┘
```

### Card Design Principles

**1. The phrase "Who here…" is always present and treated as a brand element.**
It should appear in a slightly different weight or color from the question body — a visual anchor that says: *this is our thing.*

**2. The question must have room to breathe.**
No cramped text. If a question is too long, rephrase it — don't shrink the font. Maximum ~15–20 words per card, ideally under 12.

**3. Cards must feel like they belong to a set.**
A user who sees one card on someone else's screen — in a screenshot, on TikTok — should immediately know what app it's from. This is the brand tattoo.

**4. No decorative illustration on cards.**
The text is the art. The typography does all the heavy lifting. Any illustration or icon would diminish the literary quality of the question.

**5. Mode color coding — subtle, not loud.**
Each mode gets a color temperature:
- Dating: warm amber/rose undertone
- Friends: neutral, no tint
- Solo: slightly cooler, more minimal

This is applied as a *very subtle* card tint or border, not a background swap.

### Card States

| State | Visual |
|---|---|
| Active | Full card, question visible |
| Swiped (exit) | Slides left, fades |
| Incoming (next) | Peeks from right edge, 10% visible |
| Locked (freemium) | Blurred text, lock icon, accent CTA |
| Discretion mode | Card instantly covered by black/dark overlay |

### Brand Identity on Cards

**The "Who here…" Prefix as Brand**
This two-word phrase is the app's signature. It should be typeset identically on every card, functioning almost like a logo. Consider:
- Set in a distinct weight or style (e.g., italic if the rest is roman, or lighter if the question is heavier)
- Small amount of letter-spacing on it
- A subtle accent color treatment

**Logo / Wordmark**
The app logo should be:
- Text-first: the wordmark "Who Here?" in the serif card font
- Possibly with a question mark as the standalone icon (for app icon)
- Clean, monochromatic in use — no gradient
- Works in both dark and light versions

**Potential Mascot Direction**
Rather than a character mascot, consider an *abstract mark* — something like:
- A stylized eye (observation)
- Two overlapping speech bubbles (shared perception)
- A question mark constructed from negative space within a crowd silhouette
This should feel editorial, not cute. Think *The New Yorker* rather than Duolingo.

**App Icon**
- Dark background (works on both iOS and Android home screens)
- The standalone mark (eye, "?", or abstract crowd shape) in warm gold/off-white
- No text in the icon — the mark carries the brand alone

### Card Typography Refinement

The question text on cards should be **set in a high-quality serif at large size.** Recommendations:
- **Playfair Display** — elegant, high contrast, free on Google Fonts
- **DM Serif Display** — more editorial, very clean
- **Canela** (if budget allows) — the premium editorial choice, used by many premium media brands
- **Freight Display** — warm, intelligent feel

The "Who here…" prefix in:
- **Same font, italic variant** — creates a nice visual contrast and makes it feel like a prompt/stage direction
- Or in the sans-serif at small caps — creates a label-like effect

### Card Content Taxonomy

Cards are organized internally by:

```
Mode (Dating / Friends / Solo)
  └── Environment (Stationary / Flow / Any)
       └── Tone (Playful / Deep / Absurd / Flirty / Dark / Empathetic)
            └── Psychological Register (Projection / Observation / Narrative / Challenge)
```

This taxonomy is invisible to the user but essential for the content engine to serve the right card at the right moment.

### Card Writing Formula
A great card contains at least one of:
- **Projection** ("…is most like me when no one's watching")
- **Narrative** ("…has a secret that would make a great short story")
- **Uncertainty** ("…seems like they're carrying something")
- **Intuition** ("…you'd trust first in a crisis")
- **Contrast** ("…is the most different from what they appear")

Cards should never feel like survey questions. They should feel like **invitations to imagine**.

---

## 7. Social Psychology & The Experiment

> This section is the philosophical heart of the app. It's what separates Who Here? from every other conversation game. It should inform copy, onboarding, marketing, and press materials.

### The Core Insight
Every person on this planet constantly, unconsciously, and automatically makes snap judgments about strangers. We assess threat, status, mood, history, and character from a single glance — in milliseconds. This process is called **thin-slice judgment** in social psychology, and it's one of the most fundamental and universal human behaviors.

**The key observation:** We do this *all the time* — but we almost never talk about it. It lives in the silent interior. We think it, and then we move on.

Who Here? brings this process to the surface, into conversation, and treats it as a legitimate subject of curiosity rather than a source of shame.

### The Experiment
When two people play Who Here? together, something specific happens:

1. **Observation** — They look at the same space, the same people.
2. **Projection** — They each make a choice based on their own internal associations.
3. **Comparison** — They share their choices and discover they picked different people.
4. **Reflection** — The natural question arises: "Why did you pick them? What did you see?"
5. **Revelation** — The answers reveal not just what they think of the stranger, but what they think in general — their pattern recognition, their biases, their worldview.

**The stranger is a mirror.** The person you point at says more about you than about them.

### The Biases We're Engaging With
Who Here? playfully surfaces several well-documented cognitive phenomena:

- **Confirmation Bias** — We notice details that confirm what we already expect
- **Halo Effect** — We let one positive trait (attractiveness, style) influence our whole assessment
- **Stereotyping** — We assign characteristics based on category membership (age, gender, clothing)
- **Fundamental Attribution Error** — We overestimate character and underestimate circumstance
- **Projection** — We attribute our own thoughts, feelings, or traits to others
- **Pattern Recognition** — We see faces, stories, and personalities in random data

None of these are pathological. They're universal. The app treats them with curiosity, not judgment.

### The Ethical Foundation
The app's design is built on a firm ethical principle:

> **The strangers are never involved.** They are never pointed at, spoken to, photographed, or harmed. They remain entirely unaware. The questions are not about judging the strangers — they're about understanding the players.

This is what separates the app from surveillance, from mockery, or from social dissection. The rules of the game explicitly require discretion: no pointing, no staring, no behavior that could make anyone uncomfortable.

The app is empathy training in disguise. By asking "what made you choose that person?" it consistently redirects attention back to the player's own reasoning — making their unconscious process visible and examinable.

### Design for Social Safety
Every interaction in the app should reinforce that this is a *safe* and *respectful* activity. Specific design choices that embody this:

- **Discretion Mode** — The "no one must notice" button. Instant neutral screen. This signals that privacy (for both players and observed) is a core value.
- **Question framing** — Cards always frame the stranger as a protagonist or archetype, never a victim. "Who here looks like they could start a cult?" rather than "Who here looks stupid?"
- **Ethical rules in onboarding** — Brief, non-preachy, built into the experience: *whisper your answers, don't point, don't stare.*
- **The Solo reflection prompts** — "What does your choice say about you?" consistently turns the lens inward.

### Why This Matters (The Cultural Argument)
In an era of social media surveillance, public cameras, facial recognition, and algorithmic profiling — the idea of *looking at strangers* has become politically fraught. Who Here? reclaims something that was always human and always innocent: the act of noticing other people with curiosity and imagination.

The app makes the case that there is something valuable, even beautiful, about being in a public space and being *interested* in the people around you. Not to consume them, not to document them, not to judge them — but to *wonder* about them. To let them inspire stories and conversations.

In a world where everyone is looking at their phones, this app uses the phone to make you look up.

### The Challenge We're Posing
The app implicitly asks users: *Can you hold your own bias lightly?* Can you choose a person, explain your reasoning, and then laugh at how little your reasoning is actually based on? Can you be surprised when your partner picks someone completely different? Can you use that surprise to understand yourself better?

The game only works if players approach it with openness. It rewards curiosity and self-awareness. In this sense, it's not just entertainment — it's a low-stakes, high-fun exercise in cognitive humility.

### Research Touchstones (for press and marketing)
- Malcolm Gladwell's *Blink* — The power and limits of snap judgments
- Daniel Kahneman's *Thinking, Fast and Slow* — System 1 (intuition) vs. System 2 (reasoning)
- Nalini Ambady's work on thin-slice judgments — How accurate (and inaccurate) first impressions are
- Philip Zimbardo's situational psychology — How context shapes perception

---

## 8. Monetization Strategy

### Philosophy
People don't pay for questions. They pay for **moments**. The monetization strategy should reflect this: unlock prompts should appear at peak emotional engagement, not as arbitrary friction.

### V1 Model: Freemium + Full Unlock

**Free tier:**
- 10–15 questions per mode (30–45 total)
- All three modes accessible
- One environment type

**Paid — "Full Deck" (59–79 SEK / ~$5–7):**
- Unlimited questions across all modes
- All environment types
- All core tones

### V2 Model: Content Packs (Additional Revenue Layer)

| Pack Name | Description | Price |
|---|---|---|
| 💕 Date Night Pro | Extended dating mode, deeper questions | 29–39 SEK |
| 🔥 After Dark | Adult themes, boundary-pushing content | 39 SEK |
| 🧠 Psychology & Intuition | Deeper reflective questions, solo-heavy | 29 SEK |
| 🌿 Empathy Pack | Warm, humane, more emotional | 29 SEK |
| ✈️ Travel Pack | Airports, trains, transit-specific | 29 SEK |
| 🎄 Seasonal / Event | Holiday, festival, event-specific | 19–29 SEK |
| 😂 Absurd Pack | Pure comedy, wild scenarios | 29 SEK |

### Paywall Moment Design
Show a locked card with blurred text to trigger curiosity:
> 🔒 *"Who here… could have become obsessed with something in an alarming way?"*
> **Unlock the full deck** [CTA button]

This appears *after* 10–15 free cards, when engagement is high and the habit is formed.

### Long-term: Subscription (Optional, Post-Product-Market-Fit)
- 29 SEK/month
- New questions added weekly
- Early access to new packs
- Only viable once there's a loyal user base and consistent content production capacity

### Pricing Psychology
- 59 SEK is the sweet spot — it feels like "the cost of one coffee" and not a commitment
- Never show the free limit on first open — let users fall in love first
- Consider: "Pay once, yours forever" framing to differentiate from subscription fatigue

---

## 9. Content Strategy & Question Writing Guide

### Voice of the Cards
The questions should feel like they were written by someone who is:
- Sharp but not cruel
- Curious but not invasive
- Funny but not slapstick
- Smart but not academic

The cards have a *personality*. They are the brand voice made concrete.

### The Question Taxonomy

**Tones available per mode:**

| Tone | Dating | Friends | Solo |
|---|---|---|---|
| Intuition & Psychology | ✓ | ✓ | ✓ |
| Playful / Absurd | — | ✓ | — |
| Flirty / Romantic | ✓ | — | — |
| Dark / Mysterious | ✓ (light) | ✓ | ✓ |
| Empathy / Reflection | ✓ | — | ✓ |
| Pure Observation | — | — | ✓ |

### Writing Principles

**DO:**
- Frame the stranger as a protagonist with a story
- Use conditional language: "could have," "might be," "seems like"
- Aim for 8–15 words per question
- Write questions that provoke images, not just yes/no
- Build in room for multiple valid answers

**DON'T:**
- Make the stranger a victim or target of cruelty
- Ask questions that require proximity to or interaction with the stranger
- Write questions that feel like surveillance ("who here is carrying something illegal")
- Use clinical or cold language
- Be generic ("who here seems friendly")

### Category Examples (Card Library Seed)

**Dating Mode:**
- *"…you'd be most nervous to introduce to your parents?"*
- *"…could have gotten you to break a rule?"*
- *"…hides something surprising under a calm surface?"*
- *"…you'd trust first in a genuine emergency?"*
- *"…reminds you of a younger version of yourself?"*

**Friends Mode:**
- *"…could have started a cult and genuinely succeeded?"*
- *"…has the most unread emails right now?"*
- *"…would go viral on the internet by complete accident?"*
- *"…has a hobby that would surprise everyone who knows them?"*
- *"…would survive the longest if society collapsed?"*

**Solo Mode:**
- *"Who here caught your attention first?"*
- *"What made you choose that person?"*
- *"Who here seems the most at ease with themselves?"*
- *"Who here seems furthest from home right now?"*
- *"What does your first choice say about what you notice first in people?"*

### Content Production Plan
- Start with 30 high-quality, handcrafted questions per mode (90 total)
- Test on real people before launch
- Iterate based on which cards get skipped vs. spark conversation
- Build to 200+ cards per mode before adding packs

---

## 10. MVP Roadmap

### Phase 0: Proof of Concept (Prototype)
**Goal:** Validate the feeling, not the tech.
- Figma prototype of 3 screens: mode selection, environment, card
- 30 real question cards written
- Test with 5–10 real people on real dates / friend sessions
- Measure: do they laugh? do they keep playing? do they feel uncomfortable?

### Phase 1: MVP Build
**Goal:** Functional, shippable app.
- Mode selection screen
- Environment selection (optional, skippable)
- Card engine (swipe to next)
- Discretion button
- Basic question pool (30 per mode)
- Freemium gate (10 free per mode → unlock full)
- No login required
- iOS first

**Tech decisions:**
- React Native (or Flutter)
- Local JSON card database (no backend needed yet)
- RevenueCat for payments

### Phase 2: Content & Polish
**Goal:** Make it feel premium and justify word-of-mouth.
- Expand card library to 100+ per mode
- Animation polish (especially card swipe)
- App Store optimization (screenshots, description)
- Android port
- Soft launch in Sweden

### Phase 3: Growth & Packs
**Goal:** Revenue diversification + retention.
- First content pack (After Dark or Travel)
- Push notification strategy ("Have a date tonight?")
- Social sharing mechanic (screenshot of a card with brand watermark)
- Consider: English internationalization

### Phase 4: Platform
- User accounts (optional — save favorites, track sessions)
- Subscription model (if monthly content is sustainable)
- B2B: corporate icebreaker version (renamed, rebranded)

---

## 11. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| "Creep" perception — users feel they're mocking strangers | High | Framing ("about us, not them"), tone guidelines, ethical rules in onboarding |
| Content becomes generic over time | High | Handcrafted voice, consistent tone guidelines, writer involvement |
| Social anxiety barrier | Medium | Discretion Mode, non-judgmental framing, no pressure to share |
| Context dependency (no people around) | Medium | Solo mode works anywhere; consider offline/at-home prompts as fallback |
| App Store rejection (sexual content in After Dark) | Medium | Separate age-gating, clearly labeled pack, Apple/Google compliance review |
| Low conversion from free to paid | Medium | Strategic paywall placement, locked card preview, strong question quality |
| Virality without monetization | Low | Brand watermark on shared cards, App Store link in share copy |

---

## Appendix: Key Decisions Made So Far

| Decision | Choice | Rationale |
|---|---|---|
| Design aesthetic | Premium / minimalist | Higher perceived value, higher conversion |
| Primary use case | Dating | Highest emotional payoff, strongest word-of-mouth |
| App architecture | Three modes | Clear user segmentation, simple mental model |
| Question tone | Psychological / curious | Differentiates from party games, creates loyalty |
| Monetization | Freemium + full unlock, packs later | Simple to build, easy to test, scalable |
| Tech stack | React Native or Flutter | Cross-platform from day one |
| First market | Sweden | Closest to creator, lower competition, strong design culture |
| Login requirement | None (V1) | Zero friction is mandatory for virality |

---

*Last updated: March 2026. This document should be treated as a living product spec — update it as decisions are made, not after.*
