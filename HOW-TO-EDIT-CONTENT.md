# UNIPILOT GLOBAL: how the Excel file works

## 1. The idea
Your website has no database. All its content comes from ONE file: `content.xlsx`. Each tab (sheet) feeds one part of the website. When someone opens your site, it reads that file and builds the pages. So: change a cell, save, publish, and the site changes.

## 2. Your routine with GitHub Desktop
1. Open `content.xlsx` inside your repository folder on your computer (use File Explorer to find the folder).
2. Edit, then SAVE and close Excel.
3. Open GitHub Desktop. You will see `content.xlsx` listed as changed. Write a short summary such as "added scholarships", click **Commit to main**, then **Push origin**.
4. Wait 1 to 2 minutes, then reload the site (Ctrl+F5).

## 3. Rules that keep it from breaking
- Never rename a tab and never change the heading row (row 1).
- One row = one item. No empty rows between items, no merged cells.
- To write a list in one cell, separate the items with the `|` symbol (example: `Transcript | CV | 2 reference letters`).
- Dates: write `2026-11-15`. Names and text: normal text, no need for quotes.
- A cell you don't know can stay empty. The site hides what is empty.
- Dropdown cells (Status, Type, Region, Funding) only accept their listed words. Use the dropdown.

## 4. Tab by tab

### Opportunities (scholarships and internships)
Required: **Type**, **Name**. Strongly recommended: Sponsor, Region, Levels, Funding, Award, Deadline, Eligibility, Official link.

| Column | What to write |
|---|---|
| Status | Open (default), Closed (stays, marked Closed) or Hidden (removed from site) |
| Featured | Yes = shown first |
| Type | Scholarship or Internship |
| Name | Full official name. Same name twice = ONE card; the newer row updates the older |
| Sponsor | Who pays or runs it |
| Region | Africa, Asia, Europe, North America, Latin America & Caribbean, Oceania |
| Host countries | Countries where you study, separated by commas. Can stay empty |
| Levels | Bachelor, Master, PhD, or combined: `Master, PhD` |
| Subjects | Can stay empty. Write `All fields` if open to everyone |
| Funding | Full, Stipend or Partial |
| Award | What it covers, in one line |
| Deadline | Free text, for example `Mar 27` or `Sep 30 - Nov 15, 2026`. Write the month name: this is how "Deadlines this month" finds it |
| Eligibility | Who can apply |
| Effort / Best for | Short notes: how hard, who it suits |
| Description | 2 to 4 sentences about it |
| Documents | List with `|`. Shows as the tick-box checklist on the page |
| Selection / Winners | How people are chosen, who won before |
| Expert tips | Your own tips, separated by `|` |
| Official link | The real application page |
| YouTube | Your video guide link for this scholarship |
| Price / Pay link | Only if the guideline has its own price |
| Added on / Verified on | Dates. "Added on" feeds "Recently added" |
| ID, Tags, Duplicate? | Leave alone. They fill themselves |

### Seminars
Title, Date (`2026-11-15`), Time, **Status** (Upcoming, Past, Draft = hidden), Topic, Speaker, Attendees, Register link, Recording (YouTube link), Cover photo (see section 5).
After the seminar: change Status to Past, add Attendees and the Recording.

### News
Date, Category (Deadline, Update...), Title, Summary, Link (optional), Pinned (Yes keeps it on top).

### Videos
YouTube link, Title, Description, Category.

### Reviews and success stories
Name, Country, **Result** (for example "Awarded DAAD Master's scholarship, Germany"), **Review** (the student's own words), Rating (1 to 5), Photo, **Approved = Yes**. Only real reviews, with the student's permission. Without `Yes` it is hidden.

### Experts
Field, Name, Role, About, Photo. Shown on the consultation page by subject.

### Visa
Country, Visa type, Processing time (as on the official site), Key documents (separate with `|`), Official link, Notes, Last checked.

### Materials (free guides, templates, checklists)
Title, Type (Guide, Template, Checklist, Sample, Video, Course), Description, **Link**, **Related scholarships**, Category, Added on, Featured, **Status = Published** to show.
- **Link:** upload the file to Google Drive, Share > "Anyone with the link" > Viewer, paste the link. YouTube links also work.
- **Related scholarships:** `All` shows it on every scholarship page. Otherwise write names separated by `|`, for example `DAAD | Chevening`. A short word like DAAD matches every scholarship containing it.
- It shows on the Free Materials page AND in a "Free materials" box on each matching scholarship page.
(Your file does not have this tab yet? Open `Materials-tab.xlsx`, right-click its tab > Move or Copy > choose your content file > tick "Create a copy".)

### Settings
Key / Value pairs: WhatsApp number, students counter start, years of experience. Change only the Value column.

## 5. How to add images
Images are used in: **Seminars (Cover photo)**, **Reviews (Photo)**, **Experts (Photo)**.
1. Prepare the picture. Use .jpg, a simple name with no spaces (`ayesha.jpg`), under 500 KB. Seminar covers about 1200 x 630 pixels. Photos of people: square, about 400 x 400.
2. Copy it into the `images` folder of your repository on your computer.
3. In Excel write the path in the cell: `images/ayesha.jpg` (small letters, the same spelling as the file).
4. Commit and Push in GitHub Desktop. The picture goes up together with the Excel file.
You can also paste a normal web address (`https://...jpg`) or a Google Drive share link (Anyone with the link).
If a picture does not show, the name or folder is usually spelled differently. GitHub is case sensitive: `Ayesha.JPG` is not `ayesha.jpg`.

## 6. Quick problem solver
- Nothing changed on the site: did you Push? Wait 2 minutes, press Ctrl+F5.
- Row not shown: check Status (not Hidden or Draft), the required cell is filled, and for reviews Approved = Yes.
- Material not shown: Status must be Published and Link must start with https://.

## NEW: automatic news
The News page now writes itself from your Opportunities tab. You do nothing extra.
- A scholarship or internship with **Added on** in the last 45 days appears as New scholarship or New internship. If more than 3 share the same date, they are grouped into one item.
- An opportunity whose **Deadline** has a full date with the year (for example `Oct 28, 2026`) appears as Closing soon during the last 30 days before it closes. Deadlines without a year are ignored.
- Your own rows in the News tab still work and can be pinned. Keep writing those for special announcements.

## Internships
Set **Type** to Internship in the Opportunities tab. The finder always shows a Type filter and an Internships quick pick.

## Seminars
A seminar row with Status = Upcoming now always shows. If Title is empty the site uses Topic, then the words Free seminar. Fill Title anyway for a better look.

## NEW: Mentors (Experts tab) - the consultation page
The consultation page is now a mentor directory. Each row in the Experts tab is one mentor card. Visitors search, filter by scholarship, open the full profile, and book through you.

Columns:
- **Name, Field, About**: required. About can have several lines (press Alt+Enter inside the cell).
- **Role**: for example `Consultant` or `PhD researcher`.
- **Tagline**: one short line on the card, for example `Erasmus Mundus and MSCA winner`.
- **Scholarships**: the scholarships this mentor won or knows well, separated by `|`. These become the filter buttons on the page, so use the same spelling for every mentor (DAAD, Chevening, Erasmus Mundus...).
- **Education**, **Highlights**: lists separated by `|`. Shown as bullet lists in the full profile.
- **Languages**, **Based in**: short text.
- **LinkedIn**: the full link starting with https://.
- **Photo**: write ONLY the file name, for example `ar1.jpeg`, and put that file in the `images` folder of the website. The spelling and the ending (.jpg or .jpeg) must be exactly the same. A square photo about 600 x 600 pixels, under 500 KB, looks best.
- **Featured**: Yes shows this mentor first.
- **Status**: Hidden removes the mentor from the site. Empty or Published shows it.

Filters appear automatically once you have 4 or more mentors.

Direct links you can share: `consultation.html?mentor=md-abdur-rahman` opens that mentor's profile (the name in small letters with dashes).

## NEW: Pilots (the consultation page) - extra columns in the Experts tab
The website now calls mentors **pilots**. Three new columns make profiles richer:
- **Studied in**: countries separated by `|`, for example `Germany | Poland`. They appear as flags on the card and as a Studied in row on the full profile, and visitors can filter by country.
- **Universities**: list separated by `|`.
- **Helps with**: what this pilot can help with, separated by `|`, for example `SOP review | CV | Scholarship shortlist | Visa interview`. Shown as chips.
The profile also shows Scholarships, Education journey (from the Education column), Highlights, Languages, Based in and LinkedIn. Use the exact English country name so the flag appears.

## NEW: Topic hubs on the Free Materials page (Topics tab)
The navy block Prepare for every step shows one box per topic (IELTS, TOEFL, SAT, GRE & GMAT, SOP, CV & Resume, Recommendation Letters, Visa & Interview). Clicking a box opens a page with the topic's video and free materials.
- To show a material inside a topic, write the topic name in the **Category** column of the Materials tab (for example `SOP`).
- **YouTube** in the Topics tab: paste your own video link. If it is empty, the site shows a button that searches YouTube for that topic. **Search terms** changes what is searched.
- Add a new topic by adding a row (Topic, Icon, Description). Set Status to Hidden to remove one.

## NEW: Legal and Privacy page
`legal.html` holds Business information, Terms, Privacy and Cancellation and refunds. Fill the `legal` section of config.js when your registration is ready: owner, registration (licence number and authority), address, phone, governingLaw, cancelHours, refundDays. Until then the page honestly says registration is in progress. Have a lawyer read the page before you rely on it.

## NEW: automatic news (closing soon, closed, upcoming, new)
The News page and the home page now write news by themselves from your Excel file. You do nothing extra.
- **Closing soon**: a listing whose closing date is within 30 days. The date is taken from the new column **Deadline date** (write 2026-11-15) or, if that is empty, from the last full date with a year in the Deadline text, for example `Sep 30 - Nov 15, 2026`. Deadlines like `Mar 27 (annual)` have no year and are ignored on purpose, so the site never guesses.
- **Closed**: the closing date was in the last 30 days.
- **Upcoming**: a listing whose **Opens on** date (new column, 2026-12-01) is within 60 days, and any free seminar with Status = Upcoming in the next 30 days. Within a week after the opening date it shows as Now open.
- **New**: listings with Added on in the last 45 days (grouped when more than 3 share a date).
Add the two new columns **Opens on** and **Deadline date** at the end of the first row of the Opportunities tab (after the last heading). Your own rows in the News tab still work for special announcements.

## NEW: how the Continent and Country filters work
The continent of a listing now comes from its Host countries, so the two filters can never disagree. Choosing a continent shows only the countries in that continent that have listings. A listing hosted in several continents appears under each. If the Region column differs from the host (for example a scholarship hosted in Japan for African applicants), the listing is filed under Japan's continent and gets an Applicants from Africa tag, which students can pick under Applicant.
Always fill **Host countries**. A listing without it cannot be found by country.

## NEW in this update (October 2026)

Everything below is optional. Your current Excel file keeps working exactly as it is. Each item only needs a new column header if you want to use it. Add the header in the first row of the tab, spelled exactly like this.

### Home page: "Closing soon" replaces "Recently added"
The home page now shows up to three listings that close within the next 45 days, soonest first, each with a "days left" badge.
- If fewer than three listings close that soon, the block adds listings whose deadline month is the current month (your Featured ones first).
- If nothing fits at all, it shows your Featured listings under the title "Start exploring".
The closing date comes from the **Deadline date** column of the Opportunities tab when you fill it (write a real date, for example `2026-12-15`). If that column is empty, the site reads the last full date with a year from the **Deadline** text, for example "Opens 1 Sep 2026, closes 15 Dec 2026". A deadline written only as "Varies" or "Rolling" has no date, so add a **Deadline date** when you want it counted.
Optional extra column: **Opens on** (a real date) for listings that have not opened yet.

### Filters button
The scholarship list and the pilot list now have a **Filters** button next to the search box. It opens a panel with all filters and a "Show N results" button. Nothing to edit in Excel.

### Free Materials with a sign-in gate and file types
In the Materials tab, add two optional columns:
- **Access**: write `Sign in` to lock a material. The visitor then enters an email address once to unlock it. Leave it empty for a free, open material.
- **Format**: PDF, Excel, PowerPoint, Word, Image, Video, Sheet or Slides. If you leave it empty, the site guesses it from the link.
The **Link** can be any public file link: a Google Drive share link, a direct .pdf, .xlsx, .pptx or image link.
Each unlock arrives in your inbox like the other forms (the person's email and the material they opened), so you know who your materials reach.

### News with photos and a Featured flag
In the News tab, add two optional columns:
- **Photo**: only the file name, for example `seminar-day.jpg`, and put that file in the `images` folder (same rule as seminar covers). A full web link also works.
- **Featured**: write `Yes` to show the item in a "Featured news" block on the home page.

### Services & Visa is now one page
The Visa page is now a section inside **Services & Visa**. Old links to `visa.html` still work: they jump to the Visa section. Your Visa tab is used as before.

### News & Stories is now one page
News and Student stories are two tabs inside **News & Stories**. Old links still work. Your News and Reviews tabs are used as before.

### Find my match (guide button)
A small "Find my match" button appears on the pages. A visitor answers 4 questions (level, region, funding, subject) and sees up to 3 matching listings from your own Excel, a link to see all of them in the filter, and a button to book a consultation. It never invents a scholarship: it only shows what is in your Excel. Nothing to edit.

### The menu
The "Chat on WhatsApp" item left the menu. WhatsApp stays in the top bar, the header button and the footer. To change the menu, edit the `nav` list in `config.js`.
