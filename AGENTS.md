# Notes for agents working in this repository

## What this is

A single-page architecture-studio site ("go.arch"): dark charcoal theme, gold
accents, fixed left rail, hero pager, about, project carousel, stats, clients
grid, contact form, footer.

It is **deliberately dependency-free** — no framework, no bundler, no package
manager, no backend:

```
index.html                    all markup, one page
css/base.css                  tokens, reset, typography, buttons, section heads, reveal
css/layout.css                fixed rail, top bar, nav, footer, page shell
css/cinematic-hero.css        sticky, scroll-driven video hero
css/sections.css              about, projects, stats, clients, contact, lightbox
css/responsive.css            breakpoints (1240 / 1024 / 979 / 760 / 400)
js/main.js                    reveal, mobile menu, nav spy, form, lightbox
js/carousel.js                project gallery scrolling
js/hero-scroll.js             binds the hero video timeline to scroll
assets/wireframe.svg          hand-authored B&W artwork for the About column
assets/video/hero.mp4         10s hero clip, re-encoded for frame scrubbing
assets/video/hero-poster.jpg  first frame, painted before the clip decodes
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

## Cinematic hero (scroll-driven video)

`#hero` is a tall scroll runway (420vh desktop, 330–380vh on smaller screens)
whose child `.cine__sticky` is pinned under the header. `js/hero-scroll.js` maps
scroll progress onto `video.currentTime`: scrolling down advances the clip,
scrolling up rewinds it. The clip never plays by itself (`play` is force-paused)
and never loops.

- Seeking is serialized — one `currentTime` write in flight, replayed on `seeked`
  — so fast scrolling does not thrash the decoder.
- Progress is eased (lerp .15) and only written when it moves by more than .0004.
- Four stages (arrival / ascent / through the glass / interior) drive the rail
  counter, the mobile dots and the hairline progress line.
- `prefers-reduced-motion` collapses the runway (`is-static`), parks the clip on
  its first frame and keeps the copy visible.
- The `.mp4` must keep dense keyframes or scrubbing stutters. Re-encode with:

```
docker run --rm -v "$PWD:/w" --entrypoint /ffmpeg mwader/static-ffmpeg:latest \
  -i /w/source.mp4 -an -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
  -profile:v main -level 4.0 -g 2 -keyint_min 2 -sc_threshold 0 \
  -movflags +faststart /w/assets/video/hero.mp4
```

## Things that are easy to break

- The header is fixed and its left edge tracks `--rail-w`; the rail disappears
  below 980px and `--rail-w` is set to `0px` there. Both must stay in sync.
- `.page` pads for rail + header; `section[id]` uses `scroll-margin-top` so anchor
  links do not hide section titles under the fixed bar.
- The hero pins with `top: var(--header-h)`; if that variable changes, the pin,
  the hero height and the rail all have to agree.
- Fonts come from Google Fonts, photography from Unsplash CDN URLs. Both need
  network access; the layout still works without them (dark panels + overlays).
- The contact form has no backend — it validates and confirms client-side only.

## Credentials

None. `.base44/environment.json` declares no secrets.
