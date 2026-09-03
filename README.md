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

## Contact form setup

The site contact form does **not** display your email publicly. Submissions are forwarded to you via [Web3Forms](https://web3forms.com/) (free tier works for GitHub Pages).

1. Go to [web3forms.com](https://web3forms.com/) and enter the email where you want to receive inquiries.
2. Copy your **Access Key**.
3. Paste it into `data/site-config.json`:

```json
{
  "contactForm": {
    "endpoint": "https://api.web3forms.com/submit",
    "accessKey": "YOUR_ACCESS_KEY_HERE"
  }
}
```

4. Deploy. When someone submits the form, Web3Forms emails you their name, email, organization, inquiry type, and message so you can reach out directly.

See `data/site-config.example.json` for the template. Your email is stored only in the Web3Forms dashboard—not in the public HTML.

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

Tracked events: `cta_nav`, `cta_hero`, `resume_download`, `contact_submit`, `contact_click`, `venture_visit`

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
