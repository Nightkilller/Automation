# CarouselForge 🚀

**CarouselForge** is a Node.js automation utility designed to run daily via GitHub Actions. It automatically generates high-DPI tech/AI slide carousels (1080x1350px) using Puppeteer (headless Chrome) and sends them to your inbox via the Resend API.

---

## 🛠️ Tech Stack & Architecture

- **Runtime:** Node.js (v20+), utilizing ES modules (`"type": "module"`).
- **LLM Engine:** Groq API (`llama-3.3-70b-versatile` model in JSON mode).
- **Source Aggregators:** TechCrunch & HackerNews RSS feeds (parsed via `rss-parser`).
- **Rendering Engine:** Puppeteer (headless Chromium screenshotting styled HTML templates).
- **Email Delivery:** Resend API (Node.js SDK).
- **Scheduler:** GitHub Actions Cron (`schedule`) & manual trigger (`workflow_dispatch`).
- **Database:** Local file-based storage (`history.json`) for 30-day topic de-duplication.

---

## 📁 Folder Structure

```
carousel-forge/
├── .github/
│   └── workflows/
│       └── daily-carousel.yml   # GHA scheduler & deployment configuration
├── src/
│   ├── index.js                 # Main pipeline orchestrator & error handler
│   ├── topicPicker.js           # Picks RSS news or AI concepts with de-duplication
│   ├── contentGenerator.js      # Formulates prompts and queries Groq API
│   ├── slideRenderer.js         # Launches Puppeteer to screenshot slides to PNGs
│   ├── emailSender.js           # Resolves attachments and sends email via Resend
│   ├── history.js               # History logs manager (loads, saves, prunes)
│   └── template.js              # HTML/CSS template containing the slide design system
├── output/                      # Gitignored directory containing temp PNG outputs
├── history.json                 # Persisted JSON array of selected topics
├── .env.example                 # Example environment configuration template
├── package.json                 # Dependency manifest
└── README.md                    # Setup and runtime documentation
```

---

## 🚀 Local Quickstart

### 1. Install Dependencies
Make sure you have Node.js (v20+) installed. Run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to a new file named `.env`:
```bash
cp .env.example .env
```
Fill in the values in your `.env` file:
* `GROQ_API_KEY`: Obtain this from the Groq Console.
* `RESEND_API_KEY`: Obtain this from the Resend Dashboard.
* `TO_EMAIL`: The recipient email address where the slide carousel should be sent.
* `FROM_EMAIL`: The sender address (uses `onboarding@resend.dev` by default, or your custom verified domain on Resend).
* `IG_HANDLE`: Your social media handle (e.g. `@yourhandle`), which will be displayed in the upper-left of each slide.

### 3. Run Locally
Execute the pipeline:
```bash
npm start
```
This will run the entire workflow: pick a topic, query Groq, render the PNGs in the `output/` directory, send the email, update `history.json`, and clean up the `output/` directory.

---

## ⚙️ Customization Guide

### Adding or Removing Evergreen Concepts
Evergreen concepts are defined inside [src/topicPicker.js](file:///Users/adityagupta/Desktop/auto/src/topicPicker.js) in the `EVERGREEN_CONCEPTS` array. You can easily add, edit, or remove entries there.

### Changing the Email Recipient or Sender
To route the emails differently:
- Modify `TO_EMAIL` or `FROM_EMAIL` in your local `.env` file.
- For production runs, update the corresponding secrets in your GitHubb repository's **Settings → Secrets and variables → Actions**.

### Tweaking the Design & CSS
The layout and design system are defined inside [src/template.js](file:///Users/adityagupta/Desktop/auto/src/template.js):
- **Dimensions:** The slides are fixed at `1080px` wide by `1350px` high (standard 4:5 portrait ratio).
- **Background:** Set using a CSS `linear-gradient` rule to mimic a subtle vintage yellow grid paper notebook.
- **Fonts:** It imports **Lora** (serif) for headings and **Inter** (sans-serif) for body bullets from Google Fonts.
- **Colors & Borders:** The red vertical line on the left mimics a classic notebook margin. Adjust colors under the `.slide-canvas` CSS rules.

---

## 🤖 GitHub Actions Setup (CI/CD)

The project is pre-configured to run automatically every day.

1. **GitHub Secrets:** Add the following secrets in your repository settings:
   - `GROQ_API_KEY`
   - `RESEND_API_KEY`
   - `TO_EMAIL`
   - `FROM_EMAIL` (optional, defaults to `onboarding@resend.dev`)
   - `IG_HANDLE` (optional, defaults to `@dailytechdropss`)

2. **Schedule:**
   The action runs daily at **03:30 UTC** (which translates to **9:00 AM IST**). You can adjust this by changing the cron expression in [.github/workflows/daily-carousel.yml](file:///Users/adityagupta/Desktop/auto/.github/workflows/daily-carousel.yml).
   
3. **Write Permissions:**
   The workflow requires write permissions to commit and push changes back to `history.json`. This is configured using `permissions: contents: write` in the workflow file. Ensure your repository's workflow settings allow write permissions if you run into permission issues.
