// ======================================================================
// SITE SETTINGS. Most day-to-day content lives in your Google Sheet (see README).
// This file holds the one-time setup values.
// ======================================================================
window.CONFIG = {
  brand: 'UNIPILOT GLOBAL',
  tagline: 'Guide • Educate • Empower',
  email: 'unipilotglobal@gmail.com',
  formEmail: '',   // optional: the inbox that receives form requests. Empty = same as email above. Use the address that already got mails from submissions@formsubmit.co
  facebook: 'https://www.facebook.com/profile.php?id=61580476092952',
  linkedin: 'https://www.linkedin.com/company/unipilot-global/',
  // LEGAL PAGE: fill these in when your business registration is ready. Empty values show an honest 'will be published' note.
  legal: { legalName: 'UNIPILOT GLOBAL', businessType: 'Online education consultancy and information service', owner: '', registration: '', address: '', phone: '', governingLaw: '', cancelHours: 24, refundDays: 10, updated: '19 October 2026' },

  // Your content lives in this Excel file inside the site (data folder). Edit it, upload it to GitHub, done.
  // LIVE EDITING: paste your Google Sheet ID here (the long text between /d/ and /edit in the sheet address). Empty = use the Excel file below.
  sheetId: '',
  contentFile: 'content.xlsx',

  // FORM EMAILS (pick ONE, see SETUP-GUIDE.md part 2):
  // A) web3formsKey: free key from web3forms.com. Every form is emailed straight to you. Easiest. (2 minutes)
  web3formsKey: '',
  // B) scriptUrl: optional Google script that ALSO sends an automatic reply to the student and counts students live.
  scriptUrl: '',
  // If both are empty the site uses FormSubmit (needs ONE activation click in your inbox after the first test). It retries automatically and falls back to a second FormSubmit route.

  whatsapp: '4915214232206', // digits only with country code (can also be set in the Excel "Settings" tab)
  whatsappDisplay: '+49 152 14232206',   // how the number is shown on the site
  whatsappMessage: 'Hello UNIPILOT GLOBAL, I would like help with my scholarship application.',
  youtubeChannel: '',
  social: { instagram: '', linkedin: '', tiktok: '', telegram: '', x: '' },   // paste full links; only filled ones are shown

  // Home page headline (leave empty to keep the default)
  heroTitle: '', heroEm: '', heroLead: '',

  defaultVideo: '',        // a general "how to apply" YouTube link shown on scholarships that have no video of their own

  studentsBase: 3000,      // students already guided. +1 is added for every form submitted (needs scriptUrl)
  seminarsHeld: null,      // number of free seminars held so far (optional)
  yearsExperience: null,   // e.g. 5 (shown only when filled)

  guidelinePrice: '',      // default guideline price, e.g. '$20'. Empty = "Ask for price"
  payLink: '',
  guidelineIncludes: [
    'Eligibility self-check against the official rules',
    'Complete document checklist with formatting tips',
    'Essay or research-proposal structure and prompts',
    'Application timeline counted back from the deadline',
    'Common reasons applications are rejected',
    'Walkthrough of the official application portal'
  ],

  // Services (Services page and consultation form). Add, remove or reword freely. icon: pen doc cap check chat user globe play
  services: [
    { id: 'sop',       icon: 'pen',   name: 'SOP & Personal Statement Review', price: '', desc: 'Detailed feedback so your story, goals and fit with the scholarship come across clearly and convincingly.' },
    { id: 'cv',        icon: 'doc',   name: 'CV & Resume Review', price: '', desc: 'A clean, scholarship-ready CV that puts your research, leadership and impact where reviewers look first.' },
    { id: 'proposal',  icon: 'cap',   name: 'Research Proposal Review', price: '', desc: 'Sharpen your research question, method and impact for PhD and research scholarships.' },
    { id: 'guideline', icon: 'check', name: 'Scholarship Guideline', price: '', desc: 'A step-by-step guide to one scholarship: eligibility, documents, essays and timeline.' },
    { id: 'session',   icon: 'chat',  name: 'One-to-One Consultation', price: '', desc: 'Review your profile together and leave with a realistic shortlist and plan.' },
    { id: 'expert',    icon: 'user',  name: 'Field Expert Consultation', price: '', desc: 'Speak with an advisor experienced in your subject to explore scholarships, supervisors and labs.' },
    { id: 'interview', icon: 'user',  name: 'Interview Preparation', price: '', desc: 'Practice the questions panels ask and learn how to answer with confidence.' },
    { id: 'full',      icon: 'globe', name: 'Full Application Support', price: '', desc: 'Hands-on help from first shortlist to submission, including documents and deadlines.' }
  ],

  // Menu. To add a page, add a line here.
  nav: [
    { id: 'home',      label: 'Home',          href: 'index.html' },
    { id: 'find',      label: 'Scholarships',  href: 'scholarships.html' },
    { id: 'materials', label: 'Free Materials', href: 'materials.html' },
    { id: 'seminars',  label: 'Seminars',      href: 'seminars.html' },
    { id: 'services',  label: 'Services & Visa',      href: 'services.html' },
    { id: 'news',      label: 'News & Stories',          href: 'news.html' }
  ]
};
