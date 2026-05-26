# DesignMyLife — User Guide

## What is DesignMyLife?

DesignMyLife (DML) is your personal life operating system. It brings together habit tracking, goal setting, task management, journaling, focus sessions, and AI-powered analytics into one place — so you can design your life with intention and see real progress over time.

---

## Getting Started

### Creating an Account

1. Open the app and click **Create one** below the sign-in form.
2. Enter your name, email address, and a password.
3. Click **Create account** — you'll be signed in immediately.

### Signing In

Enter your email and password, then click **Sign in**. Your session lasts 30 days. You can sign out at any time from the **Settings** page.

---

## The Cockpit (Dashboard)

The Cockpit is your home base. Every time you open the app, start here to get a snapshot of where you stand.

**What you'll see:**

- **BCI Score** — your Behavioral Consistency Index, a single number (0–100) that reflects how consistent you're being across habits, goals, and tasks. Think of it as a fitness score for your daily discipline.
  - Grade A (80–100): Excellent
  - Grade B (65–79): Good
  - Grade C (50–64): Developing
  - Grade D (below 50): Needs attention
- **Four BCI components** — Streak Consistency, Completion Rate, Time Consistency, Goal Alignment — each shown as a mini card so you know exactly where to improve.
- **Quick stats** — today's habit completions, active goals, pending tasks, and journal entries this week.

---

## Habits

Habits are the foundation of the BCI score. Build streaks, track completions, and watch your consistency compound.

### Creating a Habit

1. Click **New habit** (top right of the Habits page).
2. Fill in:
   - **Name** — what the habit is (e.g. "Morning run")
   - **Description** — optional context
   - **Frequency** — Daily or Weekly
   - **Category** — Health, Learning, Finance, Relationships, or Other
3. Click **Create habit**.

### Checking In

- Click **Check in** on any habit card to mark it done for today.
- A habit already completed today shows a confirmation state — you can't double-count.

### Streaks & Heatmap

- Each habit card shows your **current streak** and **longest streak**.
- Click the calendar icon on any habit card to expand a **91-day heatmap** (like a GitHub contribution graph) showing every day you completed that habit.

### Editing or Deleting

Click the **three-dot menu** on a habit card to edit its details or delete it.

---

## Goals

Goals give your habits direction. Each goal can have a set of milestones, and your progress percentage updates automatically as you complete them.

### Creating a Goal

1. Click **New goal**.
2. Enter:
   - **Title** — what you're working toward
   - **Description** — why it matters
   - **Category** — Career, Health, Learning, Finance, Relationships, Project, or Other
   - **Target date** — when you want to achieve it
   - **Status** — Active, Paused, or Completed

**Tip:** Click **Elaborate with AI** instead of typing a full goal. Type something vague like "get fit" or "launch a side project" and AI will turn it into a structured goal with a description, category, target date, and 4–6 milestones — all filled in for you.

### Milestones

- Add milestones inside a goal to break it into steps.
- Check off each milestone as you complete it — the goal's progress bar updates instantly.
- Click **Decompose with AI** on any goal card to have AI generate a fresh set of milestones based on your goal title and category.

### Tracking Progress

Each goal card shows a progress bar reflecting the percentage of milestones completed. Change the status to **Completed** when you're done.

---

## Tasks

Tasks are your to-do list with priority levels. Keep urgent and high-priority work at the top so nothing slips through.

### Creating a Task

1. Click **New task**.
2. Fill in:
   - **Title** — what needs to be done
   - **Description** — optional notes
   - **Priority** — Urgent, High, Medium, or Low
   - **Due date** — optional deadline
   - **Linked goal** — optionally connect it to a goal
   - **Estimated time** — in minutes

### Moving Tasks Through Stages

Each task has a status you move it through:

- **To Do** → click **Start** to move to In Progress
- **In Progress** → click **Complete** to mark it done
- **Completed** → shown in the completed section with a timestamp

Urgent tasks are flagged in the header so they're always visible.

---

## Journal

The journal is your private daily reflection space. Write freely — it's never visible to anyone else.

### Writing an Entry

1. Click **New** (top right).
2. Optionally add a **title**.
3. Select your **mood** — Great, Good, Okay, Rough, or Awful.
4. Write in the **content area** (word count shown live).
5. Add optional **tags** (comma-separated, e.g. "gratitude, goals, mindset").
6. Click **Save entry**.

### Reading an Entry

Click any journal card to open the full entry in a reading view.

### AI Analysis

Inside any open journal entry, you'll see an **AI Analysis** panel. Click **Analyze** to have Gemini read your entry and return:

- **Sentiment** — positive, neutral, or negative overall tone
- **Emotional tone** — a single word capturing the feeling (e.g. reflective, hopeful, anxious)
- **Themes** — 2–4 topic labels pulled from what you wrote
- **Insights** — 2–3 observations about your state of mind or patterns
- **Suggestions** — 2–3 actionable things you can do based on the entry

Results are saved to the entry — re-opening it shows the cached analysis instantly. Click **Re-analyze** anytime to refresh.

Cards on the main journal list show a small "analyzed" label when an entry has been processed.

---

## Focus (Pomodoro Timer)

Use the Focus page to work in structured time blocks and avoid distraction.

### How it Works

The timer follows the Pomodoro technique:

- **25 minutes** — focused work session
- **5 minutes** — short break
- **15 minutes** — long break (after every 4 sessions)

### Using the Timer

1. Open the **Focus** page.
2. Click **Start** to begin a 25-minute work session.
3. A circular progress ring fills as time passes.
4. When the session ends, the timer automatically moves to a short break.
5. Your **session count** is shown and persists across page reloads.

**Auto-advance:** Toggle auto-advance on to move between work and break sessions without clicking.

**Custom length:** Adjust the session length using the presets (25 / 5 / 15 min) or enter a custom value.

---

## Analytics

The Analytics page shows visualizations of your data over time so you can spot trends and patterns.

**Charts included:**

- **7-day habit completions** — a bar chart showing how many habits you completed each day this week
- **BCI radar chart** — a spider chart of your four BCI components so you can see your shape at a glance
- **Streak leaderboard** — your top habits ranked by current streak length
- **Task status breakdown** — a pie chart of your tasks by status (To Do, In Progress, Completed)

---

## Settings

Manage your account from the **Settings** page.

### Profile

Update your display name or email address.

### Password

Change your password. You'll need to enter your current password to confirm.

### AI Features

Toggle **Enable AI features** to opt in or out of AI-powered analysis across the app (goal elaboration, BCI insights, journal analysis). When disabled, all features fall back to rule-based calculations — the app works fully without AI.

---

## AI Features Overview

All AI in DesignMyLife is powered by **Google Gemini** (gemini-2.0-flash) using your own API key.

| Feature | Where | What it does |
|---|---|---|
| Elaborate goal | Goals — New goal dialog | Turns a vague description into a SMART goal with milestones |
| Decompose milestones | Goals — goal card menu | Generates 4–6 milestones for any existing goal |
| Journal analysis | Journal — entry view | Extracts themes, insights, sentiment, and suggestions |
| BCI analysis | Cockpit / Analytics | AI-written narrative about your behavioral patterns |

If no API key is configured, all features fall back gracefully — the app works with math-based scoring and keyword heuristics so nothing is ever broken.

---

## Tips & Best Practices

- **Check in habits daily** — even one check-in builds the streak and lifts your BCI score.
- **Write a short journal entry each evening** — even 50 words gives the AI enough to surface useful patterns over time.
- **Use the "Elaborate with AI" button** when setting goals — it saves time and produces better-structured goals than writing from scratch.
- **Link tasks to goals** — this improves your Goal Alignment score (one of the four BCI components).
- **Review Analytics weekly** — the 7-day chart and radar show you where you're gaining or losing momentum.
- **Use Focus sessions for deep work** — 4 pomodoros = 2 hours of focused output. The session counter keeps you accountable.
