import markdown
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

md_content = """
# DesignMyLife
## Complete User Guide

*Version 1.0 | May 2026*

---

## Table of Contents

1. Getting Started
2. The Cockpit (Dashboard)
3. Habits
4. Goals
5. Tasks
6. Journal
7. Focus (Pomodoro Timer)
8. Analytics
9. Settings
10. BCI Score Explained
11. AI Coaching
12. Mobile Usage
13. Publishing Your App
14. Troubleshooting
15. Tips for Success

---

## 1. Getting Started

### Creating an Account

When you first open DesignMyLife, you will see the sign-in screen.

1. Click **"Create one"** below the Sign in button.
2. Enter your email address and choose a secure password.
3. Click the **Sign up** button to register.
4. You will be automatically signed in and taken to the Cockpit (Dashboard).

Your login session lasts **30 days**. After that, you will need to sign in again. Your data is saved securely in the PostgreSQL database, so nothing is lost when you log out.

### Signing In

If you already have an account, simply enter your email and password on the sign-in screen and click **Sign in**. If you forget your password, contact the app administrator to reset it.

### Navigation

Once signed in, you will see the sidebar on the left (on desktop) or a hamburger menu (on mobile) with links to all sections:

- **Cockpit** -- Dashboard overview
- **Habits** -- Daily check-ins and streaks
- **Goals** -- Long-term targets with milestones
- **Tasks** -- Priority-based todo list
- **Journal** -- Daily writing with mood tracking
- **Focus** -- Pomodoro timer
- **Analytics** -- Visual charts and trends
- **Settings** -- Account and preferences

---

## 2. The Cockpit (Dashboard)

The Cockpit is your home screen. It gives you a single-glance overview of your entire life operating system.

### Behavioral Consistency Index (BCI)

The large score card at the top shows your **BCI score** -- a number from 0 to 100 that summarizes how consistent you are across all tracked areas of your life. This is calculated automatically using a weighted formula:

> **BCI = (Habits x 0.4) + (Goals x 0.3) + (Tasks x 0.2) + (Journal x 0.1)**

You do not need to calculate this yourself. The app computes it in real time every time you check in a habit, complete a task, update a goal, or write a journal entry.

### Quick Stats Row

Below the BCI card, four smaller cards show counts for:

- Active habits (and how many you completed today)
- Pending tasks (split by status)
- Active goals
- Total journal entries written

Click any of these cards to jump directly to that section of the app.

---

## 3. Habits

Habits are the foundation of your behavioral consistency. Track daily or weekly routines and build streaks over time.

### Creating a Habit

1. Go to the **Habits** page from the sidebar.
2. Click the **"New"** button in the top-right corner.
3. Enter a name (e.g., "Drink 2L water", "Read 20 pages").
4. Optionally add a description to remind yourself why this habit matters.
5. Choose a frequency: **Daily** or **Weekly**.
6. Click **"Create habit"** to save.

### Checking In

Each habit card shows a **circle icon** on the left. Tap or click it to mark the habit as done for today. A filled circle means completed. The card will also show a line-through on the habit name.

Check-ins can only be done **once per day** per habit. If you already checked in, the circle will be filled and disabled.

### Streak Tracking

Every habit tracks two numbers:

- **Current Streak** -- how many consecutive days (or weeks) you have checked in without missing.
- **Longest Streak** -- the highest streak you have ever achieved for this habit.

If you miss a day, your current streak resets to 0. Your longest streak remains as a record to beat.

### Completion History Calendar

Click the **chevron (down arrow)** on any habit card to expand a GitHub-style heatmap calendar. It shows the last **91 days** (13 weeks) of your completion history:

- **Dark green squares** = completed days
- **Light gray squares** = missed days
- **Empty squares** = future or before the habit was created

This visual pattern helps you identify which days of the week you are strongest and where you tend to fall off.

### Editing and Deleting Habits

Click the **pencil icon** on any habit card to edit its name, description, or frequency. Click the **trash icon** to delete it permanently. Deleting a habit also removes all its check-in history.

---

## 4. Goals

Goals are long-term targets you want to achieve. Break them into milestones to track progress incrementally.

### Creating a Goal

1. Go to the **Goals** page.
2. Click the **"New"** button.
3. Enter a name and description.
4. Choose a category (e.g., Career, Health, Finance, Learning, Personal).
5. Set a target date if you have a deadline.
6. Click **"Create goal"** to save.

### Adding Milestones

Every goal has a **Milestones** section. Click "Add milestone" and type a step (e.g., "Complete Chapter 1", "Save $500"). Milestones act as a checklist inside each goal.

As you check off milestones, the goal's progress bar updates automatically. For example, if a goal has 4 milestones and you complete 2, the progress is **50%**.

### Goal Status

Goals can have one of three statuses:

- **Active** -- currently in progress (default)
- **Completed** -- finished. This also updates the BCI score.
- **On Hold** -- paused but kept in the system for later

Use the status dropdown on each goal card to change it.

### Editing and Deleting Goals

Click the **pencil icon** to edit any goal. Click the **trash icon** to delete it. Deleting a goal also removes all its milestones permanently.

---

## 5. Tasks

Tasks are short-term actionable items with priority levels and a status workflow.

### Creating a Task

1. Go to the **Tasks** page.
2. Click the **"New"** button.
3. Enter a title and optional description.
4. Set the priority: **Urgent**, **High**, **Medium**, or **Low**.
5. Set the status: **To Do**, **In Progress**, or **Completed**.
6. Optionally set a due date.
7. Click **"Create task"** to save.

### Priority System

Tasks are color-coded by priority:

- **Urgent** -- red badge. Handle immediately.
- **High** -- orange badge. Important but not immediate.
- **Medium** -- yellow/amber badge. Standard priority.
- **Low** -- green badge. Can be deferred.

### Status Workflow

Tasks move through three statuses:

- **To Do** -- not started yet
- **In Progress** -- actively being worked on
- **Completed** -- done. Moves to the Completed tab.

Use the tabs at the top of the Tasks page to filter by status. The badge on each tab shows the count.

### Due Dates

If a task has a due date, it will appear next to the task title. Tasks that are overdue (past due date and not completed) will stand out visually.

---

## 6. Journal

The Journal is a simple, markdown-free writing space for daily reflection. Track your mood and build a personal archive over time.

### Creating an Entry

1. Go to the **Journal** page.
2. Click the **"New"** button.
3. Select your mood: **Great**, **Good**, **Neutral**, **Bad**, or **Rough**.
4. Write freely in the content box. There is no formatting needed.
5. Add **tags** (comma-separated) if you want to organize entries by theme (e.g., "work, stress, breakthrough").
6. Click **"Save entry"** to store it.

### Reading Your Entries

Journal entries are displayed as cards in reverse chronological order (newest first). Each card shows:

- The date and time
- Your mood (with a color badge)
- A word count
- Any tags you added
- The first few lines of content

Click any card to open the full entry in a detail view.

### Searching and Filtering

Use the search bar at the top of the Journal page to find entries by:

- Keyword in the content
- Tag name
- Date range (if you type a date like "2026-05")

The total word count across all entries is shown in the page header.

### Editing and Deleting

Open an entry in detail view to edit or delete it. Changes are saved immediately.

---

## 7. Focus (Pomodoro Timer)

The Focus page helps you enter deep work using the **Pomodoro Technique** -- focused work sessions broken up by short breaks.

### How It Works

The Pomodoro Technique is simple:

1. Choose a task you want to work on.
2. Set a timer for **25 minutes** and focus exclusively on that task.
3. When the timer rings, take a **5-minute break**.
4. After 4 pomodoros, take a longer **15-minute break**.

This method trains your brain to focus in short, intense bursts and prevents burnout.

### Timer Controls

The Focus page has a large ring timer in the center:

- **Choose mode**: 25 min (Focus), 5 min (Short Break), or 15 min (Long Break)
- **Start** -- begin the countdown. The ring fills as time passes.
- **Pause** -- freeze the timer. Click Resume to continue.
- **Reset** -- return to the full duration.
- **Auto-advance** -- automatically switch between Focus and Break modes when the timer ends.

### Session Counter

The number of completed focus sessions is tracked and saved in your browser. This count resets only if you clear your browser's local storage. It is not tied to your account on the server.

---

## 8. Analytics

The Analytics page visualizes your behavioral data with interactive charts. It is read-only -- you cannot edit data here, only view trends.

### Charts Available

**BCI Component Breakdown**

Four cards at the top show the weighted contribution of each component to your overall BCI score:

- **Streaks (S)** -- weighted 0.4
- **Consistency (C)** -- weighted 0.3
- **Task Completion (T)** -- weighted 0.2
- **Goal Progress (G)** -- weighted 0.1

**Habit Completions (Bar Chart)**

A bar chart showing how many habits you completed each day over the last 7 days. Bars are taller on productive days and shorter (or zero) on missed days.

**BCI Radar Chart**

A radar (spider) chart plotting your current scores across the four BCI dimensions. A symmetrical shape means balanced consistency. A lopsided shape means you are strong in some areas and weak in others.

**Streak Leaderboard**

A bar chart ranking your habits by current streak length. The longest streak is on the left, shortest on the right.

**Task Status Pie Chart**

A pie chart showing the proportion of your tasks in each status: To Do, In Progress, and Completed. A healthy ratio has a large Completed slice.

### When to Check Analytics

Review your Analytics page at the end of each week to identify patterns. Ask yourself:

- Which days of the week do I check in the most habits?
- Is my BCI trending up or down?
- Which habit has my longest streak? Can I extend it?
- Do I have too many tasks stuck in "To Do"?

---

## 9. Settings

The Settings page manages your account and app preferences.

### Profile

Update your display name. This name appears in the app header. Click **"Update profile"** to save.

### Password

Change your password by entering your current password and a new password. Click **"Change password"** to confirm. You will stay signed in after changing your password.

### AI Coaching

DesignMyLife includes an optional AI coaching feature powered by Anthropic Claude. When enabled, the AI can analyze your BCI data and habits to provide personalized suggestions.

**Important**: AI coaching is entirely optional. The BCI score works with pure math and does not require AI. If no AI API key is configured, the AI section is disabled and the app functions fully.

To enable AI coaching, the app administrator must add an **AI_API_KEY** environment variable. Then toggle the switch in Settings to turn it on.

---

## 10. BCI Score Explained

The **Behavioral Consistency Index (BCI)** is the central metric of DesignMyLife. It distills all your tracked behaviors into a single score from 0 to 100.

### The Formula

> **BCI = (S x 0.4) + (C x 0.3) + (T x 0.2) + (G x 0.1)**

Where:

- **S (Streaks)** -- derived from your habit streak lengths. Longer streaks = higher S.
- **C (Consistency)** -- derived from your habit check-in rate over the last 30 days. More regular = higher C.
- **T (Task Completion)** -- derived from the percentage of tasks you have completed versus total created.
- **G (Goal Progress)** -- derived from the average completion percentage across all your active goals.

### Score Ranges

| Range | Meaning |
|-------|---------|
| 0 - 25 | Getting started. Focus on building one or two core habits. |
| 26 - 50 | Building momentum. You have some consistency but gaps remain. |
| 51 - 75 | Strong consistency. Most habits and goals are on track. |
| 76 - 100 | Exceptional. You are highly consistent across all life areas. |

Your BCI updates automatically in real time. You do not need to refresh the page.

---

## 11. AI Coaching

AI Coaching is an optional premium feature that uses Anthropic's Claude AI to analyze your data and provide personalized guidance.

### What AI Coaching Does

- Analyzes your BCI components to identify your weakest area.
- Suggests specific habits to start or improve based on your patterns.
- Provides motivational messaging tailored to your current streaks.
- Recommends goal adjustments if you are overloaded with tasks.

### How to Enable It

1. The app administrator must add an **AI_API_KEY** environment variable to the project settings.
2. Go to **Settings** in the app.
3. Toggle the **"AI Coaching"** switch to ON.
4. Return to the Cockpit. An AI coaching panel will appear with personalized suggestions.

### Privacy Note

AI Coaching sends your BCI scores and habit names to Anthropic's API for analysis. No passwords, emails, or journal content is transmitted. The app administrator controls whether the feature is available.

### Without AI

If AI is not enabled, the app works perfectly. The BCI score is calculated with pure mathematics. All features -- habits, goals, tasks, journal, analytics, and focus -- function identically.

---

## 12. Mobile Usage

DesignMyLife is fully responsive and works on phones, tablets, and desktops. The layout adapts automatically to your screen size.

### Mobile Layout

- The sidebar is hidden on small screens. Tap the **hamburger menu** (three lines) in the top-left to open the navigation drawer.
- The BCI score card and stats cards stack vertically on phones.
- Habit cards show streaks inline on mobile instead of in a separate column.
- The Focus timer stays centered and readable on all screen sizes.
- Journal entry cards switch to a single-column layout on phones for easy reading.

### Tips for Mobile

- Add the app to your home screen for quick access (it works like a native app in your browser).
- Check in habits first thing in the morning before you get busy.
- Use the Focus timer during commutes or waiting times for micro-sessions.
- Write journal entries on your phone during quiet moments -- the mood selector is one tap.

---

## 13. Publishing Your App

You can publish DesignMyLife to the web for free and share it with anyone.

### Is Publishing Free?

**Yes.** Replit's free tier includes deployment hosting. Your app gets a free subdomain like `your-project.replit.app`. You can publish and republish as many times as you want at no cost.

### How to Publish

1. Make sure the app works in the preview pane (all pages load, you can sign in, data saves).
2. Click the **Publish** button in the Replit UI (top-right corner).
3. Choose **"Autoscale"** as the deployment type (best for web apps with a backend).
4. Click **Publish**. Replit builds and deploys automatically.
5. Your app is live at the provided URL within a few minutes.

### Updating After Publishing

You can edit your code anytime and republish:

- Make changes in the Replit editor.
- Test them in the preview pane.
- Click **Publish** again. The new build deploys automatically.
- Your live URL stays the same. User data in the database is preserved.

There is **no limit** to how many times you can republish the same project.

### What Gets Deployed

- The React frontend (compiled and minified)
- The Express API server (backend)
- The PostgreSQL database (data persists between deployments)
- All environment variables configured in Replit secrets

### Custom Domain

You can connect a custom domain (e.g., designmylife.com) if you upgrade to a paid Replit plan. Free-tier users use the `.replit.app` subdomain.

---

## 14. Troubleshooting

### Cannot Sign In

- Check that Caps Lock is off.
- If you forgot your password, ask the app administrator to reset it in the database.
- If the sign-in button does nothing, check that the API server is running (see the Workflows panel).

### Data Not Saving

- Check that the API server workflow is running (green dot in the Workflows panel).
- Check the browser console (F12) for red error messages.
- Make sure you are signed in. Anonymous users cannot save data.

### BCI Score Stuck at 0

- Create at least one habit and check in at least once.
- Create at least one goal with milestones and mark some complete.
- Create at least one task and mark it completed.
- Write at least one journal entry.

The BCI requires data in all four areas to produce a meaningful score.

### Page Not Loading or Blank

- Refresh the browser (Ctrl+R or Cmd+R).
- Check that the frontend workflow is running in the Workflows panel.
- Clear browser cache and hard-refresh (Ctrl+Shift+R or Cmd+Shift+R).

### AI Coaching Not Working

- Confirm that an **AI_API_KEY** environment variable is set in Replit Secrets.
- Check that the AI toggle in Settings is turned ON.
- If no key is configured, AI coaching is gracefully disabled and the app works normally.

---

## 15. Tips for Success

Here are proven strategies to get the most out of DesignMyLife:

### Start Small

Do not create 10 habits on day one. Start with 1-2 simple daily habits (e.g., drink water, stretch 5 minutes). Mastery builds momentum.

### Stack Habits

Link a new habit to an existing one. Example: "After I brush my teeth, I will meditate for 2 minutes." This triggers the new habit automatically.

### Use the Focus Timer for Everything

The Pomodoro timer is not just for work. Use it for exercise, reading, studying, or even household chores. The ritual of starting a timer creates a mental boundary between distraction and focus.

### Review Weekly

Every Sunday, spend 5 minutes on the Analytics page. Look at:

- Your BCI trend (is it going up?)
- Which habits had the weakest week (low completion)
- Goals that are stalled (no milestone progress)
- Journal mood patterns (are you consistently "Rough" on Mondays?)

### Write Even When You Do Not Feel Like It

Journal entries do not need to be long. A single sentence about your day counts. The act of recording your mood creates self-awareness that compounds over time.

### Break Goals into Tiny Milestones

A goal like "Get fit" is too vague. Break it into milestones: "Walk 10 minutes daily for a week," "Do 10 pushups," "Try a yoga class." Small wins fuel motivation.

### Protect Your Streaks

Streaks are powerful psychological motivators. If you are about to break a streak, do the bare minimum. A 2-minute meditation still counts as a check-in. Consistency beats intensity.

### Use Tags to Find Patterns

Tag journal entries with themes like work, family, health, stress. After a month, search for "stress" and review those entries. You will spot triggers you never noticed.

### Celebrate Milestones

When you hit a 7-day streak, complete a goal, or reach a BCI of 50, acknowledge it. The app tracks the data, but the meaning comes from you. Positive reinforcement makes habits stick.

---

*DesignMyLife User Guide v1.0 | Built on Replit*
"""

# Convert markdown to HTML
html_body = markdown.markdown(md_content, extensions=['tables'])

# Build full HTML with styling
html_full = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2cm;
  }}
  body {{
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
  }}
  h1 {{
    font-size: 24pt;
    color: #2E5548;
    border-bottom: 2px solid #2E5548;
    padding-bottom: 0.3em;
    margin-top: 1.5em;
    page-break-before: always;
  }}
  h1:first-of-type {{
    page-break-before: auto;
    text-align: center;
    border-bottom: none;
    font-size: 32pt;
    margin-top: 3em;
  }}
  h2 {{
    font-size: 16pt;
    color: #2E5548;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
  }}
  h3 {{
    font-size: 13pt;
    color: #3A6B5A;
    margin-top: 1em;
  }}
  p {{
    margin: 0.6em 0;
    text-align: justify;
  }}
  ul, ol {{
    margin: 0.5em 0;
    padding-left: 1.5em;
  }}
  li {{
    margin: 0.3em 0;
  }}
  blockquote {{
    border-left: 3px solid #2E5548;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: #f8faf9;
    font-style: italic;
    color: #2E5548;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 10pt;
  }}
  th {{
    background: #E8F5E9;
    color: #2E5548;
    font-weight: bold;
    padding: 8px;
    border: 1px solid #ccc;
    text-align: left;
  }}
  td {{
    padding: 8px;
    border: 1px solid #ccc;
  }}
  tr:nth-child(even) {{
    background: #f9f9f9;
  }}
  hr {{
    border: none;
    border-top: 1px solid #ddd;
    margin: 1.5em 0;
  }}
  strong {{
    color: #2E5548;
  }}
  em {{
    color: #555;
  }}
  .subtitle {{
    text-align: center;
    font-size: 14pt;
    color: #666;
    font-style: italic;
    margin-bottom: 2em;
  }}
  .meta {{
    text-align: center;
    font-size: 10pt;
    color: #888;
    margin-top: 2em;
  }}
  .toc-item {{
    margin: 0.3em 0;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

# Generate PDF
HTML(string=html_full).write_pdf("/home/runner/workspace/guides/DesignMyLife-User-Guide.pdf")
print("PDF saved to /home/runner/workspace/guides/DesignMyLife-User-Guide.pdf")
