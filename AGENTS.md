# Notes for agents working in this repository

## What this is

A single-page architecture-studio site ("go.arch"): dark charcoal theme, gold
accents, fixed left rail, hero pager, about, project carousel, stats, clients
grid, contact form, footer.

It is **deliberately dependency-free** — no framework, no bundler, no package
manager, no backend:

```
index.html            all markup, one page
css/base.css          tokens, reset, typography, buttons, section heads, reveal
css/layout.css        fixed rail, top bar, nav, footer, page shell
css/sections.css      hero, about, projects, stats, clients, contact, lightbox
css/responsive.css    breakpoints (1240 / 1024 / 979 / 760 / 400)
js/main.js            reveal, mobile menu, nav spy, hero pager, form, lightbox
js/carousel.js        project gallery scrolling
assets/wireframe.svg  hand-authored B&W artwork for the About column
```

Keep new CSS in the file matching its area rather than appending to `base.css`.
Do not convert this to a framework unless the user asks for one.

## Running it

```
docker compose -f docker-compose.base44.yml up -d --build
```

`web` is plain `nginx:alpine` serving the four bind-mounted paths on host port
3000. Edits are visible on refresh; no rebuild and no restart are needed for
HTML/CSS/JS. If a new top-level asset directory is added, add a volume for it.

Verify:

```
curl -sI http://localhost:3000/ | head -1        # HTTP/1.1 200 OK
curl -sI http://localhost:3000/css/base.css      # 200
docker compose -f docker-compose.base44.yml ps
```

## Things that are easy to break

- The header is fixed and its left edge tracks `--rail-w`; the rail disappears
  below 980px and `--rail-w` is set to `0px` there. Both must stay in sync.
- `.page` pads for rail + header; `section[id]` uses `scroll-margin-top` so anchor
  links do not hide section titles under the fixed bar.
- Hero slides are absolutely positioned; the first must carry `is-active`.
- Fonts come from Google Fonts, photography from Unsplash CDN URLs. Both need
  network access; the layout still works without them (dark panels + overlays).
- The contact form has no backend — it validates and confirms client-side only.

## Credentials

None. `.base44/environment.json` declares no secrets.
