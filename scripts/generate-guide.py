from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def set_cell_shading(cell, color):
    """Set background color for a table cell."""
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color)
    cell._tc.get_or_add_tcPr().append(shading)

def add_heading_styled(doc, text, level=1):
    """Add a styled heading."""
    p = doc.add_heading(text, level=level)
    run = p.runs[0]
    run.font.color.rgb = RGBColor(0x2E, 0x55, 0x48)  # Dark green
    if level == 1:
        run.font.size = Pt(24)
        run.bold = True
    elif level == 2:
        run.font.size = Pt(16)
        run.bold = True
    else:
        run.font.size = Pt(13)
        run.bold = True
    return p

def add_body_text(doc, text, bold=False, italic=False):
    """Add body text with consistent styling."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    run.bold = bold
    run.italic = italic
    return p

def add_bullet(doc, text, indent=0):
    """Add a bullet point."""
    p = doc.add_paragraph(text, style='List Bullet')
    p.paragraph_format.left_indent = Inches(0.25 + indent * 0.25)
    for run in p.runs:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    return p

def add_numbered(doc, text, indent=0):
    """Add a numbered list item."""
    p = doc.add_paragraph(text, style='List Number')
    p.paragraph_format.left_indent = Inches(0.25 + indent * 0.25)
    for run in p.runs:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    return p

# ============================================================
# BUILD THE DOCUMENT
# ============================================================
doc = Document()

# Title
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_run = title.add_run("DesignMyLife")
title_run.font.size = Pt(32)
title_run.font.bold = True
title_run.font.color.rgb = RGBColor(0x2E, 0x55, 0x48)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle_run = subtitle.add_run("Complete User Guide")
subtitle_run.font.size = Pt(16)
subtitle_run.font.italic = True
subtitle_run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

doc.add_paragraph()
meta = doc.add_paragraph()
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
meta_run = meta.add_run("Version 1.0 | May 2026")
meta_run.font.size = Pt(10)
meta_run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

doc.add_page_break()

# ============================================================
# TABLE OF CONTENTS
# ============================================================
add_heading_styled(doc, "Table of Contents", level=1)
sections = [
    "1. Getting Started",
    "2. The Cockpit (Dashboard)",
    "3. Habits",
    "4. Goals",
    "5. Tasks",
    "6. Journal",
    "7. Focus (Pomodoro Timer)",
    "8. Analytics",
    "9. Settings",
    "10. BCI Score Explained",
    "11. AI Coaching",
    "12. Mobile Usage",
    "13. Publishing Your App",
    "14. Troubleshooting",
    "15. Tips for Success",
]
for s in sections:
    p = doc.add_paragraph(s, style='List Number')
    for run in p.runs:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

doc.add_page_break()

# ============================================================
# 1. GETTING STARTED
# ============================================================
add_heading_styled(doc, "1. Getting Started", level=1)

add_heading_styled(doc, "Creating an Account", level=2)
add_body_text(doc, "When you first open DesignMyLife, you will see the sign-in screen.")
add_numbered(doc, "Click \"Create one\" below the Sign in button.")
add_numbered(doc, "Enter your email address and choose a secure password.")
add_numbered(doc, "Click the Sign up button to register.")
add_numbered(doc, "You will be automatically signed in and taken to the Cockpit (Dashboard).")

add_body_text(doc, "Your login session lasts 30 days. After that, you will need to sign in again. Your data is saved securely in the PostgreSQL database, so nothing is lost when you log out.")

doc.add_paragraph()
add_heading_styled(doc, "Signing In", level=2)
add_body_text(doc, "If you already have an account, simply enter your email and password on the sign-in screen and click Sign in. If you forget your password, contact the app administrator to reset it.")

doc.add_paragraph()
add_heading_styled(doc, "Navigation", level=2)
add_body_text(doc, "Once signed in, you will see the sidebar on the left (on desktop) or a hamburger menu (on mobile) with links to all sections of the app:")
for nav in ["Cockpit", "Habits", "Goals", "Tasks", "Journal", "Focus", "Analytics", "Settings"]:
    add_bullet(doc, nav)

# ============================================================
# 2. THE COCKPIT (DASHBOARD)
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "2. The Cockpit (Dashboard)", level=1)

add_body_text(doc, "The Cockpit is your home screen. It gives you a single-glance overview of your entire life operating system.")

doc.add_paragraph()
add_heading_styled(doc, "Behavioral Consistency Index (BCI)", level=2)
add_body_text(doc, "The large score card at the top shows your BCI score -- a number from 0 to 100 that summarizes how consistent you are across all tracked areas of your life. This is calculated automatically using a weighted formula:")
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
formula_run = p.add_run("BCI = (Habits x 0.4) + (Goals x 0.3) + (Tasks x 0.2) + (Journal x 0.1)")
formula_run.font.size = Pt(11)
formula_run.font.italic = True
formula_run.font.color.rgb = RGBColor(0x2E, 0x55, 0x48)
add_body_text(doc, "You do not need to calculate this yourself. The app computes it in real time every time you check in a habit, complete a task, update a goal, or write a journal entry.")

doc.add_paragraph()
add_heading_styled(doc, "Quick Stats Row", level=2)
add_body_text(doc, "Below the BCI card, four smaller cards show counts for:")
add_bullet(doc, "Active habits (and how many you completed today)")
add_bullet(doc, "Pending tasks (split by status)")
add_bullet(doc, "Active goals")
add_bullet(doc, "Total journal entries written")

add_body_text(doc, "Click any of these cards to jump directly to that section of the app.")

# ============================================================
# 3. HABITS
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "3. Habits", level=1)

add_body_text(doc, "Habits are the foundation of your behavioral consistency. Track daily or weekly routines and build streaks over time.")

doc.add_paragraph()
add_heading_styled(doc, "Creating a Habit", level=2)
add_numbered(doc, "Go to the Habits page from the sidebar.")
add_numbered(doc, "Click the \"New\" button in the top-right corner.")
add_numbered(doc, "Enter a name (e.g., \"Drink 2L water\", \"Read 20 pages\").")
add_numbered(doc, "Optionally add a description to remind yourself why this habit matters.")
add_numbered(doc, "Choose a frequency: Daily or Weekly.")
add_numbered(doc, "Click \"Create habit\" to save.")

doc.add_paragraph()
add_heading_styled(doc, "Checking In", level=2)
add_body_text(doc, "Each habit card shows a circle icon on the left. Tap or click it to mark the habit as done for today. A filled circle means completed. The card will also show a line-through on the habit name.")
add_body_text(doc, "Check-ins can only be done once per day per habit. If you already checked in, the circle will be filled and disabled.")

doc.add_paragraph()
add_heading_styled(doc, "Streak Tracking", level=2)
add_body_text(doc, "Every habit tracks two numbers:")
add_bullet(doc, "Current Streak -- how many consecutive days (or weeks) you have checked in without missing.")
add_bullet(doc, "Longest Streak -- the highest streak you have ever achieved for this habit.")
add_body_text(doc, "If you miss a day, your current streak resets to 0. Your longest streak remains as a record to beat.")

doc.add_paragraph()
add_heading_styled(doc, "Completion History Calendar", level=2)
add_body_text(doc, "Click the chevron (down arrow) on any habit card to expand a GitHub-style heatmap calendar. It shows the last 91 days (13 weeks) of your completion history:")
add_bullet(doc, "Dark green squares = completed days")
add_bullet(doc, "Light gray squares = missed days")
add_bullet(doc, "Empty squares = future or before the habit was created")
add_body_text(doc, "This visual pattern helps you identify which days of the week you are strongest and where you tend to fall off.")

doc.add_paragraph()
add_heading_styled(doc, "Editing and Deleting Habits", level=2)
add_body_text(doc, "Click the pencil icon on any habit card to edit its name, description, or frequency. Click the trash icon to delete it permanently. Deleting a habit also removes all its check-in history.")

# ============================================================
# 4. GOALS
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "4. Goals", level=1)

add_body_text(doc, "Goals are long-term targets you want to achieve. Break them into milestones to track progress incrementally.")

doc.add_paragraph()
add_heading_styled(doc, "Creating a Goal", level=2)
add_numbered(doc, "Go to the Goals page.")
add_numbered(doc, "Click the \"New\" button.")
add_numbered(doc, "Enter a name and description.")
add_numbered(doc, "Choose a category (e.g., Career, Health, Finance, Learning, Personal).")
add_numbered(doc, "Set a target date if you have a deadline.")
add_numbered(doc, "Click \"Create goal\" to save.")

doc.add_paragraph()
add_heading_styled(doc, "Adding Milestones", level=2)
add_body_text(doc, "Every goal has a Milestones section. Click \"Add milestone\" and type a step (e.g., \"Complete Chapter 1\", \"Save $500\"). Milestones act as a checklist inside each goal.")
add_body_text(doc, "As you check off milestones, the goal's progress bar updates automatically to show the percentage complete. For example, if a goal has 4 milestones and you complete 2, the progress is 50%.")

doc.add_paragraph()
add_heading_styled(doc, "Goal Status", level=2)
add_body_text(doc, "Goals can have one of three statuses:")
add_bullet(doc, "Active -- currently in progress (default).")
add_bullet(doc, "Completed -- finished. This also updates the BCI score.")
add_bullet(doc, "On Hold -- paused but kept in the system for later.")
add_body_text(doc, "Use the status dropdown on each goal card to change it.")

doc.add_paragraph()
add_heading_styled(doc, "Editing and Deleting Goals", level=2)
add_body_text(doc, "Click the pencil icon to edit any goal. Click the trash icon to delete it. Deleting a goal also removes all its milestones permanently.")

# ============================================================
# 5. TASKS
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "5. Tasks", level=1)

add_body_text(doc, "Tasks are short-term actionable items with priority levels and a status workflow.")

doc.add_paragraph()
add_heading_styled(doc, "Creating a Task", level=2)
add_numbered(doc, "Go to the Tasks page.")
add_numbered(doc, "Click the \"New\" button.")
add_numbered(doc, "Enter a title and optional description.")
add_numbered(doc, "Set the priority: Urgent, High, Medium, or Low.")
add_numbered(doc, "Set the status: To Do, In Progress, or Completed.")
add_numbered(doc, "Optionally set a due date.")
add_numbered(doc, "Click \"Create task\" to save.")

doc.add_paragraph()
add_heading_styled(doc, "Priority System", level=2)
add_body_text(doc, "Tasks are color-coded by priority:")
add_bullet(doc, "Urgent -- red badge. Handle immediately.")
add_bullet(doc, "High -- orange badge. Important but not immediate.")
add_bullet(doc, "Medium -- yellow/amber badge. Standard priority.")
add_bullet(doc, "Low -- green badge. Can be deferred.")

doc.add_paragraph()
add_heading_styled(doc, "Status Workflow", level=2)
add_body_text(doc, "Tasks move through three statuses:")
add_bullet(doc, "To Do -- not started yet.")
add_bullet(doc, "In Progress -- actively being worked on.")
add_bullet(doc, "Completed -- done. Moves to the Completed tab.")
add_body_text(doc, "Use the tabs at the top of the Tasks page to filter by status. The badge on each tab shows the count.")

doc.add_paragraph()
add_heading_styled(doc, "Due Dates", level=2)
add_body_text(doc, "If a task has a due date, it will appear next to the task title. Tasks that are overdue (past due date and not completed) will stand out visually.")

# ============================================================
# 6. JOURNAL
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "6. Journal", level=1)

add_body_text(doc, "The Journal is a simple, markdown-free writing space for daily reflection. Track your mood and build a personal archive over time.")

doc.add_paragraph()
add_heading_styled(doc, "Creating an Entry", level=2)
add_numbered(doc, "Go to the Journal page.")
add_numbered(doc, "Click the \"New\" button.")
add_numbered(doc, "Select your mood: Great, Good, Neutral, Bad, or Rough.")
add_numbered(doc, "Write freely in the content box. There is no formatting needed.")
add_numbered(doc, "Add tags (comma-separated) if you want to organize entries by theme (e.g., \"work, stress, breakthrough\").")
add_numbered(doc, "Click \"Save entry\" to store it.")

doc.add_paragraph()
add_heading_styled(doc, "Reading Your Entries", level=2)
add_body_text(doc, "Journal entries are displayed as cards in reverse chronological order (newest first). Each card shows:")
add_bullet(doc, "The date and time")
add_bullet(doc, "Your mood (with a color badge)")
add_bullet(doc, "A word count")
add_bullet(doc, "Any tags you added")
add_bullet(doc, "The first few lines of content")
add_body_text(doc, "Click any card to open the full entry in a detail view.")

doc.add_paragraph()
add_heading_styled(doc, "Searching and Filtering", level=2)
add_body_text(doc, "Use the search bar at the top of the Journal page to find entries by:")
add_bullet(doc, "Keyword in the content")
add_bullet(doc, "Tag name")
add_bullet(doc, "Date range (if you type a date like \"2026-05\")")
add_body_text(doc, "The total word count across all entries is shown in the page header.")

doc.add_paragraph()
add_heading_styled(doc, "Editing and Deleting", level=2)
add_body_text(doc, "Open an entry in detail view to edit or delete it. Changes are saved immediately.")

# ============================================================
# 7. FOCUS (POMODORO TIMER)
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "7. Focus (Pomodoro Timer)", level=1)

add_body_text(doc, "The Focus page helps you enter deep work using the Pomodoro Technique -- focused work sessions broken up by short breaks.")

doc.add_paragraph()
add_heading_styled(doc, "How It Works", level=2)
add_body_text(doc, "The Pomodoro Technique is simple:")
add_numbered(doc, "Choose a task you want to work on.")
add_numbered(doc, "Set a timer for 25 minutes and focus exclusively on that task.")
add_numbered(doc, "When the timer rings, take a 5-minute break.")
add_numbered(doc, "After 4 pomodoros, take a longer 15-minute break.")
add_body_text(doc, "This method trains your brain to focus in short, intense bursts and prevents burnout.")

doc.add_paragraph()
add_heading_styled(doc, "Timer Controls", level=2)
add_body_text(doc, "The Focus page has a large ring timer in the center:")
add_bullet(doc, "Choose mode: 25 min (Focus), 5 min (Short Break), or 15 min (Long Break).")
add_bullet(doc, "Click Start to begin the countdown. The ring fills as time passes.")
add_bullet(doc, "Click Pause to freeze the timer. Click Resume to continue.")
add_bullet(doc, "Click Reset to return to the full duration.")
add_bullet(doc, "Enable Auto-advance to automatically switch between Focus and Break modes when the timer ends.")

doc.add_paragraph()
add_heading_styled(doc, "Session Counter", level=2)
add_body_text(doc, "The number of completed focus sessions is tracked and saved in your browser. This count resets only if you clear your browser's local storage. It is not tied to your account on the server.")

# ============================================================
# 8. ANALYTICS
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "8. Analytics", level=1)

add_body_text(doc, "The Analytics page visualizes your behavioral data with interactive charts. It is read-only -- you cannot edit data here, only view trends.")

doc.add_paragraph()
add_heading_styled(doc, "Charts Available", level=2)

add_body_text(doc, "BCI Component Breakdown", bold=True)
add_body_text(doc, "Four cards at the top show the weighted contribution of each component to your overall BCI score:")
add_bullet(doc, "Streaks (S) -- weighted 0.4")
add_bullet(doc, "Consistency (C) -- weighted 0.3")
add_bullet(doc, "Task Completion (T) -- weighted 0.2")
add_bullet(doc, "Goal Progress (G) -- weighted 0.1")

doc.add_paragraph()
add_body_text(doc, "Habit Completions (Bar Chart)", bold=True)
add_body_text(doc, "A bar chart showing how many habits you completed each day over the last 7 days. Bars are taller on productive days and shorter (or zero) on missed days.")

doc.add_paragraph()
add_body_text(doc, "BCI Radar Chart", bold=True)
add_body_text(doc, "A radar (spider) chart plotting your current scores across the four BCI dimensions. A symmetrical shape means balanced consistency. A lopsided shape means you are strong in some areas and weak in others.")

doc.add_paragraph()
add_body_text(doc, "Streak Leaderboard", bold=True)
add_body_text(doc, "A bar chart ranking your habits by current streak length. The longest streak is on the left, shortest on the right.")

doc.add_paragraph()
add_body_text(doc, "Task Status Pie Chart", bold=True)
add_body_text(doc, "A pie chart showing the proportion of your tasks in each status: To Do, In Progress, and Completed. A healthy ratio has a large Completed slice.")

doc.add_paragraph()
add_heading_styled(doc, "When to Check Analytics", level=2)
add_body_text(doc, "Review your Analytics page at the end of each week to identify patterns. Ask yourself:")
add_bullet(doc, "Which days of the week do I check in the most habits?")
add_bullet(doc, "Is my BCI trending up or down?")
add_bullet(doc, "Which habit has my longest streak? Can I extend it?")
add_bullet(doc, "Do I have too many tasks stuck in \"To Do\"?")

# ============================================================
# 9. SETTINGS
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "9. Settings", level=1)

add_body_text(doc, "The Settings page manages your account and app preferences.")

doc.add_paragraph()
add_heading_styled(doc, "Profile", level=2)
add_body_text(doc, "Update your display name. This name appears in the app header. Click \"Update profile\" to save.")

doc.add_paragraph()
add_heading_styled(doc, "Password", level=2)
add_body_text(doc, "Change your password by entering your current password and a new password. Click \"Change password\" to confirm. You will stay signed in after changing your password.")

doc.add_paragraph()
add_heading_styled(doc, "AI Coaching", level=2)
add_body_text(doc, "DesignMyLife includes an optional AI coaching feature powered by Anthropic Claude. When enabled, the AI can analyze your BCI data and habits to provide personalized suggestions.")
add_body_text(doc, "Important: AI coaching is entirely optional. The BCI score works with pure math and does not require AI. If no AI API key is configured, the AI section is disabled and the app functions fully.")
add_body_text(doc, "To enable AI coaching, the app administrator must add an AI_API_KEY environment variable. Then toggle the switch in Settings to turn it on.")

# ============================================================
# 10. BCI SCORE EXPLAINED
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "10. BCI Score Explained", level=1)

add_body_text(doc, "The Behavioral Consistency Index (BCI) is the central metric of DesignMyLife. It distills all your tracked behaviors into a single score from 0 to 100.")

doc.add_paragraph()
add_heading_styled(doc, "The Formula", level=2)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
formula = p.add_run("BCI = (S x 0.4) + (C x 0.3) + (T x 0.2) + (G x 0.1)")
formula.font.size = Pt(12)
formula.font.bold = True
formula.font.color.rgb = RGBColor(0x2E, 0x55, 0x48)

add_body_text(doc, "Where:")
add_bullet(doc, "S (Streaks) -- derived from your habit streak lengths. Longer streaks = higher S.")
add_bullet(doc, "C (Consistency) -- derived from your habit check-in rate over the last 30 days. More regular = higher C.")
add_bullet(doc, "T (Task Completion) -- derived from the percentage of tasks you have completed versus total created.")
add_bullet(doc, "G (Goal Progress) -- derived from the average completion percentage across all your active goals.")

doc.add_paragraph()
add_heading_styled(doc, "Score Ranges", level=2)
table = doc.add_table(rows=5, cols=2)
table.style = 'Table Grid'

rows_data = [
    ("Range", "Meaning"),
    ("0 - 25", "Getting started. Focus on building one or two core habits."),
    ("26 - 50", "Building momentum. You have some consistency but gaps remain."),
    ("51 - 75", "Strong consistency. Most habits and goals are on track."),
    ("76 - 100", "Exceptional. You are highly consistent across all life areas."),
]

for i, (col1, col2) in enumerate(rows_data):
    row = table.rows[i]
    row.cells[0].text = col1
    row.cells[1].text = col2
    for cell in row.cells:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.size = Pt(10)
        if i == 0:
            set_cell_shading(cell, "E8F5E9")
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.bold = True

add_body_text(doc, "Your BCI updates automatically in real time. You do not need to refresh the page.")

# ============================================================
# 11. AI COACHING
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "11. AI Coaching", level=1)

add_body_text(doc, "AI Coaching is an optional premium feature that uses Anthropic's Claude AI to analyze your data and provide personalized guidance.")

doc.add_paragraph()
add_heading_styled(doc, "What AI Coaching Does", level=2)
add_bullet(doc, "Analyzes your BCI components to identify your weakest area.")
add_bullet(doc, "Suggests specific habits to start or improve based on your patterns.")
add_bullet(doc, "Provides motivational messaging tailored to your current streaks.")
add_bullet(doc, "Recommends goal adjustments if you are overloaded with tasks.")

doc.add_paragraph()
add_heading_styled(doc, "How to Enable It", level=2)
add_numbered(doc, "The app administrator must add an AI_API_KEY environment variable to the project settings.")
add_numbered(doc, "Go to Settings in the app.")
add_numbered(doc, "Toggle the \"AI Coaching\" switch to ON.")
add_numbered(doc, "Return to the Cockpit. An AI coaching panel will appear with personalized suggestions.")

doc.add_paragraph()
add_heading_styled(doc, "Privacy Note", level=2)
add_body_text(doc, "AI Coaching sends your BCI scores and habit names to Anthropic's API for analysis. No passwords, emails, or journal content is transmitted. The app administrator controls whether the feature is available.")

doc.add_paragraph()
add_heading_styled(doc, "Without AI", level=2)
add_body_text(doc, "If AI is not enabled, the app works perfectly. The BCI score is calculated with pure mathematics. All features -- habits, goals, tasks, journal, analytics, and focus -- function identically.")

# ============================================================
# 12. MOBILE USAGE
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "12. Mobile Usage", level=1)

add_body_text(doc, "DesignMyLife is fully responsive and works on phones, tablets, and desktops. The layout adapts automatically to your screen size.")

doc.add_paragraph()
add_heading_styled(doc, "Mobile Layout", level=2)
add_bullet(doc, "The sidebar is hidden on small screens. Tap the hamburger menu (three lines) in the top-left to open the navigation drawer.")
add_bullet(doc, "The BCI score card and stats cards stack vertically on phones.")
add_bullet(doc, "Habit cards show streaks inline on mobile instead of in a separate column.")
add_bullet(doc, "The Focus timer stays centered and readable on all screen sizes.")
add_bullet(doc, "Journal entry cards switch to a single-column layout on phones for easy reading.")

doc.add_paragraph()
add_heading_styled(doc, "Tips for Mobile", level=2)
add_bullet(doc, "Add the app to your home screen for quick access (it works like a native app in your browser).")
add_bullet(doc, "Check in habits first thing in the morning before you get busy.")
add_bullet(doc, "Use the Focus timer during commutes or waiting times for micro-sessions.")
add_bullet(doc, "Write journal entries on your phone during quiet moments -- the mood selector is one tap.")

# ============================================================
# 13. PUBLISHING YOUR APP
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "13. Publishing Your App", level=1)

add_body_text(doc, "You can publish DesignMyLife to the web for free and share it with anyone.")

doc.add_paragraph()
add_heading_styled(doc, "Is Publishing Free?", level=2)
add_body_text(doc, "Yes. Replit's free tier includes deployment hosting. Your app gets a free subdomain like your-project.replit.app. You can publish and republish as many times as you want at no cost.")

doc.add_paragraph()
add_heading_styled(doc, "How to Publish", level=2)
add_numbered(doc, "Make sure the app works in the preview pane (all pages load, you can sign in, data saves).")
add_numbered(doc, "Click the Publish button in the Replit UI (top-right corner).")
add_numbered(doc, "Choose \"Autoscale\" as the deployment type (best for web apps with a backend).")
add_numbered(doc, "Click Publish. Replit builds and deploys automatically.")
add_numbered(doc, "Your app is live at the provided URL within a few minutes.")

doc.add_paragraph()
add_heading_styled(doc, "Updating After Publishing", level=2)
add_body_text(doc, "You can edit your code anytime and republish:")
add_bullet(doc, "Make changes in the Replit editor.")
add_bullet(doc, "Test them in the preview pane.")
add_bullet(doc, "Click Publish again. The new build deploys automatically.")
add_bullet(doc, "Your live URL stays the same. User data in the database is preserved.")
add_body_text(doc, "There is no limit to how many times you can republish the same project.")

doc.add_paragraph()
add_heading_styled(doc, "What Gets Deployed", level=2)
add_bullet(doc, "The React frontend (compiled and minified).")
add_bullet(doc, "The Express API server (backend).")
add_bullet(doc, "The PostgreSQL database (data persists between deployments).")
add_bullet(doc, "All environment variables configured in Replit secrets.")

doc.add_paragraph()
add_heading_styled(doc, "Custom Domain", level=2)
add_body_text(doc, "You can connect a custom domain (e.g., designmylife.com) if you upgrade to a paid Replit plan. Free-tier users use the .replit.app subdomain.")

# ============================================================
# 14. TROUBLESHOOTING
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "14. Troubleshooting", level=1)

add_heading_styled(doc, "Cannot Sign In", level=2)
add_bullet(doc, "Check that Caps Lock is off.")
add_bullet(doc, "If you forgot your password, ask the app administrator to reset it in the database.")
add_bullet(doc, "If the sign-in button does nothing, check that the API server is running (see the Workflows panel).")

doc.add_paragraph()
add_heading_styled(doc, "Data Not Saving", level=2)
add_bullet(doc, "Check that the API server workflow is running (green dot in the Workflows panel).")
add_bullet(doc, "Check the browser console (F12) for red error messages.")
add_bullet(doc, "Make sure you are signed in. Anonymous users cannot save data.")

doc.add_paragraph()
add_heading_styled(doc, "BCI Score Stuck at 0", level=2)
add_bullet(doc, "Create at least one habit and check in at least once.")
add_bullet(doc, "Create at least one goal with milestones and mark some complete.")
add_bullet(doc, "Create at least one task and mark it completed.")
add_bullet(doc, "Write at least one journal entry.")
add_body_text(doc, "The BCI requires data in all four areas to produce a meaningful score.")

doc.add_paragraph()
add_heading_styled(doc, "Page Not Loading or Blank", level=2)
add_bullet(doc, "Refresh the browser (Ctrl+R or Cmd+R).")
add_bullet(doc, "Check that the frontend workflow is running in the Workflows panel.")
add_bullet(doc, "Clear browser cache and hard-refresh (Ctrl+Shift+R or Cmd+Shift+R).")

doc.add_paragraph()
add_heading_styled(doc, "AI Coaching Not Working", level=2)
add_bullet(doc, "Confirm that an AI_API_KEY environment variable is set in Replit Secrets.")
add_bullet(doc, "Check that the AI toggle in Settings is turned ON.")
add_bullet(doc, "If no key is configured, AI coaching is gracefully disabled and the app works normally.")

# ============================================================
# 15. TIPS FOR SUCCESS
# ============================================================
doc.add_page_break()
add_heading_styled(doc, "15. Tips for Success", level=1)

add_body_text(doc, "Here are proven strategies to get the most out of DesignMyLife:")

doc.add_paragraph()
add_heading_styled(doc, "Start Small", level=2)
add_body_text(doc, "Do not create 10 habits on day one. Start with 1-2 simple daily habits (e.g., drink water, stretch 5 minutes). Mastery builds momentum.")

doc.add_paragraph()
add_heading_styled(doc, "Stack Habits", level=2)
add_body_text(doc, "Link a new habit to an existing one. Example: \"After I brush my teeth, I will meditate for 2 minutes.\" This triggers the new habit automatically.")

doc.add_paragraph()
add_heading_styled(doc, "Use the Focus Timer for Everything", level=2)
add_body_text(doc, "The Pomodoro timer is not just for work. Use it for exercise, reading, studying, or even household chores. The ritual of starting a timer creates a mental boundary between distraction and focus.")

doc.add_paragraph()
add_heading_styled(doc, "Review Weekly", level=2)
add_body_text(doc, "Every Sunday, spend 5 minutes on the Analytics page. Look at:")
add_bullet(doc, "Your BCI trend (is it going up?)")
add_bullet(doc, "Which habits had the weakest week (low completion)")
add_bullet(doc, "Goals that are stalled (no milestone progress)")
add_bullet(doc, "Journal mood patterns (are you consistently \"Rough\" on Mondays?)")

doc.add_paragraph()
add_heading_styled(doc, "Write Even When You Do Not Feel Like It", level=2)
add_body_text(doc, "Journal entries do not need to be long. A single sentence about your day counts. The act of recording your mood creates self-awareness that compounds over time.")

doc.add_paragraph()
add_heading_styled(doc, "Break Goals into Tiny Milestones", level=2)
add_body_text(doc, "A goal like \"Get fit\" is too vague. Break it into milestones: \"Walk 10 minutes daily for a week,\" \"Do 10 pushups,\" \"Try a yoga class.\" Small wins fuel motivation.")

doc.add_paragraph()
add_heading_styled(doc, "Protect Your Streaks", level=2)
add_body_text(doc, "Streaks are powerful psychological motivators. If you are about to break a streak, do the bare minimum. A 2-minute meditation still counts as a check-in. Consistency beats intensity.")

doc.add_paragraph()
add_heading_styled(doc, "Use Tags to Find Patterns", level=2)
add_body_text(doc, "Tag journal entries with themes like work, family, health, stress. After a month, search for \"stress\" and review those entries. You will spot triggers you never noticed.")

doc.add_paragraph()
add_heading_styled(doc, "Celebrate Milestones", level=2)
add_body_text(doc, "When you hit a 7-day streak, complete a goal, or reach a BCI of 50, acknowledge it. The app tracks the data, but the meaning comes from you. Positive reinforcement makes habits stick.")

# ============================================================
# FOOTER
# ============================================================
doc.add_paragraph()
doc.add_paragraph()
hr = doc.add_paragraph()
hr.alignment = WD_ALIGN_PARAGRAPH.CENTER
hr_run = hr.add_run("---")
hr_run.font.color.rgb = RGBColor(0xCC, 0xCC, 0xCC)

footer = doc.add_paragraph()
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer_run = footer.add_run("DesignMyLife User Guide v1.0 | Built on Replit")
footer_run.font.size = Pt(10)
footer_run.font.italic = True
footer_run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

# Save
doc.save("/home/runner/workspace/guides/DesignMyLife-User-Guide.docx")
print("Guide saved to /home/runner/workspace/guides/DesignMyLife-User-Guide.docx")
