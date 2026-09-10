# Elvis S. — Professional Page

Personal authority platform for **Elvis S.**, Architect of Human-Centered Systems.

**Live site:** https://elviscarter.github.io/Elvis_ProfessionalPage/

## Structure

```
├── index.html          # Homepage — distilled identity, case studies, ventures
├── experience.html     # Full employment chronology, projects, technical proof
├── css/styles.css      # Design system (tokens, components, responsive)
├── js/site.js          # Navigation, animations, accordions (deferred)
├── data/writing.json   # Future writing entries (placeholder)
├── asset/              # Images, résumés, logos
├── robots.txt
├── sitemap.xml
├── CONTENT_VERIFICATION.md
└── ASSETS_NEEDED.md
```

## Local development

No build step required — static HTML/CSS/JS.

```bash
# From repository root
python -m http.server 8080
```

Open http://localhost:8080/ (or the port shown).

Because GitHub Pages serves from `/Elvis_ProfessionalPage/`, test subpath behavior if needed:

```bash
# Optional: simulate subpath with a nested folder or GitHub Pages local tools
```

All asset URLs are **relative** (`css/styles.css`, `asset/...`) for subpath compatibility.

## Contact / intake form

Embed a **Google Form** (recommended), **Calendly**, or any link—no backend required. Responses go to Google Sheets if you enable that in Google Forms.

### Google Form (recommended)

1. Create a form at [forms.google.com](https://forms.google.com).
2. Click **Send** → **<>** (embed) → copy the iframe `src` URL.  
   It looks like:  
   `https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true`
3. Paste into `data/site-config.json`:

```json
{
  "contact": {
    "intakeEmbedUrl": "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true",
    "intakePrimaryLabel": "Send an inquiry",
    "intakeEmbed": true
  }
}
```

4. Push to GitHub. The form embeds inline on the Contact section.

**Google Sheets:** In the form editor → **Responses** → link to a spreadsheet. New submissions appear there automatically; optional email notifications under Google Forms settings.

Set `"intakeEmbed": false` to use only the top card link (opens the form in a new tab).

### Calendly (optional)

Use a Calendly URL in `intakeEmbedUrl` instead—the site detects it and loads the Calendly widget.

Until `intakeEmbedUrl` is set, the primary button falls back to LinkedIn.

## Archived résumé password

Older role-specific résumés live in `asset/Resumes/archive/` and are protected two ways:

1. **Site gate** — download links stay hidden until the correct password is entered.
2. **File encryption** — PDF/DOCX files require the same password to open, even with a direct URL.

Set or change the password:

```bash
python scripts/setup_archived_resume_password.py "your-new-password"
```

This re-encrypts the archive files and updates the SHA-256 hash in `data/site-config.json`. Share the password only with people who need archived versions.

## GitHub Pages deployment

1. Push to `master` (or your default branch).
2. Repository **Settings → Pages**
3. Source: **Deploy from branch**
4. Branch: `master` / root (`/`)
5. Site URL: `https://elviscarter.github.io/Elvis_ProfessionalPage/`

No build command or GitHub Action required for the current static setup.

### Custom domain (future)

Add `CNAME` at repo root and configure DNS — relative paths will continue to work.

## Design system

Colors (CSS variables in `css/styles.css`):

- `--color-midnight-ink` #101827 — foundation
- `--color-graphite` #292D33 — primary text
- `--color-parchment` #F3EBDD — warm background
- `--color-burnished-copper` #B65F3A — signature accent
- `--color-stone` #77736D — secondary neutral
- `--color-soft-white` #FCFAF6 — clean surface

Typography: **Cormorant Garamond** (editorial) + **Inter** (UI)

## Analytics (optional)

Add a privacy-conscious provider by defining before `site.js`:

```html
<script>
  window.elvisAnalytics = {
    track: function (event, data) {
      // e.g. Plausible: plausible(event, { props: data })
    }
  };
</script>
```

Tracked events: `cta_nav`, `cta_hero`, `resume_download`, `contact_click`, `venture_visit`

## QA checklist

- [ ] Run locally — no console errors
- [ ] Test mobile nav (320px, 375px)
- [ ] Test keyboard navigation and skip link
- [ ] Test `prefers-reduced-motion` (face float disabled)
- [ ] Verify résumé downloads
- [ ] Verify external venture links
- [ ] Validate JSON-LD: https://validator.schema.org/
- [ ] Lighthouse audit (performance, accessibility, SEO)

See `CONTENT_VERIFICATION.md` for metric sources and flagged items.  
See `ASSETS_NEEDED.md` for logo, profile WebP, and venture logo assets.

## License

© Elvis Segbeaya. All rights reserved.
