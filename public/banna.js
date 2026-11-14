/*!
 * banna by Mohammadreza Rokhbin, https://rokhbin.ir
 * A crew of cursors builds your page in front of the visitor.
 * One file, no dependencies. Add it to <head>:
 *   <script src="banna.js"></script>
 * Options go on the script tag as data attributes; see README.md.
 */
(function () {
  'use strict'
  if (window.Banna) return

  const tag = document.currentScript
  const data = (tag && tag.dataset) || {}
  const number = (value, fallback) => (Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback)

  const root = document.documentElement
  const phone = innerWidth < 700
  const options = {
    speed: number(data.speed, 1),
    agents: number(data.agents, phone ? 4 : 8),
    maxWait: number(data.maxWait, 7),
    maxLayers: number(data.maxLayers, 400),
    auto: data.auto !== 'false',
    bar: data.bar !== 'false',
    credit: false,
    once: data.once === 'session',
    colors: (data.colors || '#F5B942,#3BD6C6,#FF7A66,#E8EDF5,#8FB4FF,#FF9CCB,#9BE564').split(',').map((c) => c.trim()),
    exclude: data.exclude || '',
  }

  const LABELS = {
    id: { agents: 'Agen Kursor', layers: 'Elemen', skip: 'Lewati Animasi', credit: '' },
    en: { agents: 'Agents', layers: 'Layers', skip: 'Skip', credit: '' },
    fa: { agents: 'سازنده', layers: 'لایه', skip: 'همین حالا نشان بده', credit: '' },
  }
  const language = () => (root.lang || 'en').slice(0, 2).toLowerCase()
  const label = (key) => data[`label${key[0].toUpperCase()}${key.slice(1)}`] || (LABELS[language()] || LABELS.en)[key]
  const localDigits = (n) => (language() === 'fa' ? String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]) : String(n))

  // Elements hidden with a class, never by rewriting them, so the page stays intact for
  // search engines, screen readers and any framework that owns the DOM.
  const PAGE_CSS = `
    html.sb-pending body { opacity: 0 !important; }
    .sb-wait { opacity: 0 !important; }
    @media print { html.sb-pending body, .sb-wait { opacity: 1 !important; } }`
  const LAYER_CSS = `
    :host { all: initial; }
    .layer { position: fixed; inset: 0; z-index: 2147483646; overflow: hidden; pointer-events: none; opacity: 0; transition: opacity .35s; }
    .layer.on { opacity: 1; }
    .cursor { position: absolute; top: 0; left: 0; color: var(--c); will-change: transform; filter: drop-shadow(0 3px 6px rgb(0 0 0 / .5)); pointer-events: none; }
    .cursor svg { display: block; transition: transform .1s; }
    .cursor.press svg { transform: scale(.72); }
    .cursor-tag {
      position: absolute;
      top: 13px;
      left: 13px;
      background: var(--c);
      color: #040814;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      padding: 1.5px 6.5px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.55);
      user-select: none;
    }
    /* Clean, ultra-minimal Figma-style selection bounding box */
    .box {
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      border: 1px solid var(--c);
      background: transparent;
      box-shadow: 0 0 8px color-mix(in srgb, var(--c) 20%, transparent);
      transition: opacity .25s;
      pointer-events: none;
    }
    .box.out { opacity: 0; }
    .box i {
      position: absolute;
      width: 5px;
      height: 5px;
      background: #ffffff;
      border: 1px solid var(--c);
      border-radius: 1px;
    }
    .box i.tl { top: -3px; left: -3px; }
    .box i.tr { top: -3px; right: -3px; }
    .box i.bl { bottom: -3px; left: -3px; }
    .box i.br { bottom: -3px; right: -3px; }
    .badge {
      position: absolute;
      bottom: -18px;
      right: 0;
      padding: 1px 5px;
      border-radius: 3px;
      background: var(--c);
      color: #040814;
      font: 700 9px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .caret { position: absolute; top: 0; left: 0; width: 2px; background: var(--c); box-shadow: 0 0 8px var(--c); }
    .bar { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 2147483647; display: flex; align-items: center; gap: 12px; padding: 5px 6px 5px 16px; background: rgb(13 19 42 / .92); border: 1px solid rgb(255 255 255 / .16); border-radius: 999px; color: #F6F1E7; font: 14px/1.5 system-ui, sans-serif; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity .25s, visibility .25s; }
    .bar.on { opacity: 1; visibility: visible; }
    .bar button { min-height: 36px; padding: 0 14px; background: none; border: 1px solid rgb(255 255 255 / .35); border-radius: 999px; color: inherit; font: inherit; font-weight: 700; cursor: pointer; }
    .bar button:hover { border-color: #F5B942; color: #FFD27A; }
    .bar button:focus-visible, .bar a:focus-visible { outline: 3px solid #F5B942; outline-offset: 2px; }
    .bar a { color: #FFD27A; font-size: 12px; text-decoration: none; }
    .bar a:hover { text-decoration: underline; }
    @media (max-width: 899px) { .bar { bottom: auto; top: 68px; gap: 8px; font-size: 12px; } .bar button { padding: 0 10px; } }
    @media print { .layer, .bar { display: none; } }`

  // Constructable sheets keep working under a strict Content-Security-Policy.
  const addStyles = (target, css) => {
    try {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      target.adoptedStyleSheets = [...target.adoptedStyleSheets, sheet]
    } catch {
      const style = document.createElement('style')
      style.textContent = css
      ;(target.head || target).append(style)
    }
  }

  const blocked = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true
    if (new URLSearchParams(location.search).has('nobanna')) return true
    if (options.once) {
      try {
        if (sessionStorage.getItem('banna-seen')) return true
        sessionStorage.setItem('banna-seen', '1')
      } catch {
        // storage can be unavailable; building once more does no harm
      }
    }
    return false
  }

  const ease = (k) => k * k * (3 - 2 * k)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

  // ---------------------------------------------------------------- what to build

  const IGNORE = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'TITLE', 'BR', 'WBR', 'OPTION', 'DIALOG', 'HEAD'])
  const MEDIA = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME', 'SVG', 'OBJECT', 'EMBED'])
  const CONTROL = new Set(['BUTTON', 'SELECT', 'INPUT', 'TEXTAREA', 'SUMMARY'])

  const hasOwnText = (el) => {
    for (const node of el.childNodes) if (node.nodeType === 3 && node.nodeValue.trim()) return true
    return false
  }
  const looksLikeBox = (cs) => {
    const color = cs.backgroundColor
    const filled = color !== 'transparent' && !/^rgba?\(.*,\s*0\)$/.test(color) && !/\/\s*0\)$/.test(color)
    return filled || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none' || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0
  }

  function classify(el, cs, rect) {
    const name = el.tagName.toUpperCase()
    if (!rect.width || !rect.height) return null
    // Full-screen backdrops, such as a fixed 3D canvas, are scenery rather than content.
    if (cs.position === 'fixed' && rect.width >= innerWidth * 0.9 && rect.height >= innerHeight * 0.9) return null
    if (MEDIA.has(name)) return rect.width > 12 && rect.height > 12 ? 'box' : 'fade'
    if (CONTROL.has(name)) return 'fade'
    if (name === 'A' && !hasOwnText(el)) return looksLikeBox(cs) ? 'fade' : null
    if (name === 'A') return 'fade'
    if (hasOwnText(el)) return looksLikeBox(cs) && rect.height < 90 && rect.width < 420 ? 'fade' : 'text'
    if (rect.width >= 24 && rect.height >= 24 && looksLikeBox(cs)) {
      // Whole-page wrappers and fixed backdrops stay put; only their contents get built.
      if (rect.height > innerHeight * 1.5 || cs.position === 'fixed') return null
      if (rect.width >= innerWidth - 1 && rect.height >= innerHeight - 1) return null
      return 'box'
    }
    return null
  }

  const WHOLE = new Set(['text', 'fade'])

  function collect() {
    const tasks = []
    const byEl = new Map()
    const visit = (el, parent) => {
      if (tasks.length >= options.maxLayers) return
      if (IGNORE.has(el.tagName.toUpperCase()) || el.id === 'sb-host') return
      if (el.hasAttribute('data-banna-skip') || el.hidden) return
      if (options.exclude && el.matches(options.exclude)) return
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') return
      if (el.type === 'hidden') return
      const rect = el.getBoundingClientRect()
      // Visually hidden helpers, such as honeypot fields and skip text, are never seen.
      if (rect.width <= 2 && rect.height <= 2 && cs.overflow !== 'visible') return
      // Parked off the page, like skip links, so the cursors could never reach it.
      if (rect.bottom + scrollY <= 0 || rect.right + scrollX <= 0) return
      const kind = classify(el, cs, rect)
      let next = parent
      if (kind) {
        const task = { el, kind, parent, state: 'hidden', queuedAt: 0, agent: null, cleanup: [] }
        tasks.push(task)
        byEl.set(el, task)
        next = task
        const media = MEDIA.has(el.tagName.toUpperCase())
        if (WHOLE.has(kind) || media) return
      }
      for (const child of el.children) visit(child, next)
    }
    for (const child of document.body.children) visit(child, null)
    return { tasks, byEl }
  }

  // ---------------------------------------------------------------- the crew

  let current = null

  function start() {
    if (current) current.stop()
    const rtl = getComputedStyle(root).direction === 'rtl' || getComputedStyle(document.body).direction === 'rtl'
    const { tasks, byEl } = collect()
    tasks.forEach((t) => t.el.classList.add('sb-wait'))
    root.classList.remove('sb-pending')
    if (!tasks.length) return

    const host = document.createElement('div')
    host.id = 'sb-host'
    host.setAttribute('aria-hidden', 'true')
    host.setAttribute('data-banna-skip', '')
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    addStyles(shadow, LAYER_CSS)
    const layer = document.createElement('div')
    layer.className = 'layer'
    shadow.append(layer)

    let bar = null
    let countEl = null
    if (options.bar) {
      bar = document.createElement('div')
      bar.className = 'bar'
      bar.dir = rtl ? 'rtl' : 'ltr'
      countEl = document.createElement('span')
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = label('skip')
      button.addEventListener('click', skip)
      bar.append(countEl, button)
      shadow.append(bar)
      // The bar is the one real control in the layer; the rest is decoration.
      host.removeAttribute('aria-hidden')
      layer.setAttribute('aria-hidden', 'true')
      countEl.setAttribute('aria-hidden', 'true')
    }

    let built = 0
    const finish = (task) => {
      if (task.state === 'done') return
      task.state = 'done'
      task.cleanup.forEach((fn) => fn())
      task.cleanup = []
      task.el.classList.remove('sb-wait')
      built++
      if (task.agent) {
        task.agent.script = null
        task.agent.task = null
        task.agent = null
      }
    }

    const AI_MODELS = [
      { name: 'Claude 3.7 Sonnet', color: '#F59E0B' },
      { name: 'Gemini 2.5 Pro', color: '#38BDF8' },
      { name: 'o3-mini', color: '#10B981' },
      { name: 'DeepSeek R1', color: '#818CF8' },
      { name: 'GPT-5', color: '#0EA5E9' },
      { name: 'Qwen 2.5 Max', color: '#2DD4BF' },
      { name: 'Grok 3', color: '#FB7185' },
    ]

    const makeCursor = (color, name) => {
      const el = document.createElement('div')
      el.className = 'cursor'
      el.style.setProperty('--c', color)
      const NS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(NS, 'svg')
      svg.setAttribute('viewBox', '0 0 20 22')
      svg.setAttribute('width', '18')
      svg.setAttribute('height', '20')
      const path = document.createElementNS(NS, 'path')
      path.setAttribute('d', 'M2 2l15 8-6.500 2L8 19z')
      path.setAttribute('fill', 'currentColor')
      path.setAttribute('stroke', '#ffffff')
      path.setAttribute('stroke-width', '1.4')
      path.setAttribute('stroke-linejoin', 'round')
      svg.append(path)
      el.append(svg)

      let tag = null
      if (name) {
        tag = document.createElement('div')
        tag.className = 'cursor-tag'
        tag.textContent = name
        el.append(tag)
      }

      layer.append(el)
      return { el, tag }
    }
    const agents = Array.from({ length: Math.max(1, options.agents) }, (_, i) => {
      const angle = (i / options.agents) * Math.PI * 2
      const model = AI_MODELS[i % AI_MODELS.length]
      const color = model.color
      const name = model.name
      const { el, tag } = makeCursor(color, name)
      return {
        el,
        tagEl: tag,
        color,
        name,
        x: innerWidth / 2 + Math.cos(angle) * 70,
        y: innerHeight / 2 + Math.sin(angle) * 70,
        angle,
        orbitOffset: i * (Math.PI * 2 / options.agents),
        orbitSpeed: 0.9 + (i % 3) * 0.3,
        orbitRadiusX: 65 + (i * 18),
        orbitRadiusY: 45 + (i * 12),
        script: null,
        task: null
      }
    })

    let userMouseX = innerWidth / 2
    let userMouseY = innerHeight * 0.4
    let hasUserMoved = false
    const onUserMouseMove = (e) => {
      userMouseX = e.clientX
      userMouseY = e.clientY
      hasUserMoved = true
    }
    window.addEventListener('mousemove', onUserMouseMove, { passive: true })

    function* travel(a, target, seconds) {
      const sx = a.x
      const sy = a.y
      let t = 0
      while (t < seconds) {
        t += (yield) * options.speed
        const k = ease(Math.min(1, t / seconds))
        const [x, y] = target()
        a.x = sx + (x - sx) * k
        a.y = sy + (y - sy) * k
      }
    }

    function* buildBox(a, task) {
      const { el } = task
      const startX = (r) => (rtl ? r.right : r.left)
      const endX = (r) => (rtl ? r.left : r.right)
      yield* travel(a, () => {
        const r = el.getBoundingClientRect()
        return [startX(r), r.top]
      }, 0.28)

      const cs = getComputedStyle(el)
      const box = document.createElement('div')
      box.className = 'box'
      box.style.setProperty('--c', a.color)
      if (cs.borderRadius) {
        box.style.borderRadius = cs.borderRadius
      }

      const iTL = document.createElement('i'); iTL.className = 'tl'
      const iTR = document.createElement('i'); iTR.className = 'tr'
      const iBL = document.createElement('i'); iBL.className = 'bl'
      const iBR = document.createElement('i'); iBR.className = 'br'
      box.append(iTL, iTR, iBL, iBR)

      const badge = document.createElement('span')
      badge.className = 'badge'
      box.append(badge)
      layer.append(box)

      task.cleanup.push(() => {
        box.remove()
      })

      const place = (k) => {
        const r = el.getBoundingClientRect()
        const w = r.width * k
        const h = r.height * k
        box.style.width = `${w}px`
        box.style.height = `${h}px`
        box.style.transform = `translate(${rtl ? r.right - w : r.left}px, ${r.top}px)`
        badge.textContent = `${Math.round(w)} × ${Math.round(h)}`
        a.x = startX(r) + (endX(r) - startX(r)) * k
        a.y = r.top + r.height * k
      }
      let t = 0
      while (t < 0.42) {
        t += (yield) * options.speed
        place(ease(Math.min(1, t / 0.42)))
      }
      el.classList.remove('sb-wait')
      box.classList.add('out')
      t = 0
      while (t < 0.18) {
        t += (yield) * options.speed
        place(1)
      }
    }

    // Typing is a moving clip over the real text. Nothing in the DOM changes, so joined
    // scripts stay joined and frameworks that own the text are not disturbed.
    function textLines(el) {
      const box = el.getBoundingClientRect()
      const range = document.createRange()
      range.selectNodeContents(el)
      const lines = []
      for (const r of range.getClientRects()) {
        if (!r.width || !r.height) continue
        const line = lines.find((l) => Math.abs(l.top + l.height / 2 - (r.top + r.height / 2)) < r.height * 0.6)
        if (line) {
          const left = Math.min(line.left, r.left)
          line.right = Math.max(line.right, r.right)
          line.left = left
          line.top = Math.min(line.top, r.top)
          line.bottom = Math.max(line.bottom, r.bottom)
          line.height = line.bottom - line.top
        } else {
          lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, height: r.height })
        }
      }
      lines.sort((p, q) => p.top - q.top)
      return lines.map((l) => ({ left: l.left - box.left, right: l.right - box.left, top: l.top - box.top, bottom: l.bottom - box.top }))
    }

    function* buildText(a, task) {
      const { el } = task
      const textRtl = getComputedStyle(el).direction === 'rtl'
      const lines = textLines(el)
      if (!lines.length) return
      const startOf = (l) => (textRtl ? l.right : l.left)
      yield* travel(a, () => {
        const r = el.getBoundingClientRect()
        return [r.left + startOf(lines[0]), r.top + lines[0].bottom - 4]
      }, 0.2)

      const previousClip = el.style.clipPath
      task.cleanup.push(() => {
        el.style.clipPath = previousClip
      })
      const caret = document.createElement('div')
      caret.className = 'caret'
      caret.style.setProperty('--c', a.color)
      layer.append(caret)
      task.cleanup.push(() => caret.remove())

      const widths = lines.map((l) => l.right - l.left)
      const total = widths.reduce((s, w) => s + w, 0) || 1
      const chars = el.textContent.trim().length
      const step = total / Math.max(1, chars) // reveal in whole characters, like typing
      // Big display text, like a headline number, is typed slowly enough to be seen.
      const big = parseFloat(getComputedStyle(el).fontSize) > 100
      const seconds = big ? 1.4 : clamp(chars * 0.016, 0.28, 1.2)
      const pad = 40

      const draw = (done) => {
        let left = Math.floor(done / step) * step
        let i = 0
        while (i < lines.length - 1 && left >= widths[i]) {
          left -= widths[i]
          i++
        }
        const l = lines[i]
        const x = textRtl ? l.right - left : l.left + left
        const w = el.offsetWidth || el.getBoundingClientRect().width
        const top = i === 0 ? -pad : l.top
        const bottom = l.bottom + (i === lines.length - 1 ? pad : 0)
        // Lines above in full, then the current line up to the caret.
        el.style.clipPath = textRtl
          ? `polygon(${-pad}px ${-pad}px, ${w + pad}px ${-pad}px, ${w + pad}px ${bottom}px, ${x}px ${bottom}px, ${x}px ${top}px, ${-pad}px ${top}px)`
          : `polygon(${-pad}px ${-pad}px, ${w + pad}px ${-pad}px, ${w + pad}px ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, ${-pad}px ${bottom}px)`
        const r = el.getBoundingClientRect()
        caret.style.height = `${l.bottom - l.top}px`
        caret.style.transform = `translate(${r.left + x}px, ${r.top + l.top}px)`
        a.x = r.left + x
        a.y = r.top + l.bottom - 3
      }
      draw(0)
      el.classList.remove('sb-wait')
      let t = 0
      while (t < seconds) {
        t += (yield) * options.speed
        draw(ease(Math.min(1, t / seconds)) * total)
      }
    }

    function* buildFade(a, task) {
      const { el } = task
      yield* travel(a, () => {
        const r = el.getBoundingClientRect()
        return [r.left + r.width / 2, r.top + r.height / 2]
      }, 0.2)
      a.el.classList.add('press')
      el.classList.remove('sb-wait')
      let t = 0
      while (t < 0.16) t += (yield) * options.speed
      a.el.classList.remove('press')
    }

    const scripts = { box: buildBox, text: buildText, fade: buildFade }

    let running = false
    let stopped = false
    let last = 0
    let lastActivity = 0
    let barText = ''
    let dispersePhase = false
    let disperseStart = 0
    const wake = () => {
      lastActivity = performance.now()
      // New work can arrive after the cursors faded but before the loop stopped.
      layer.classList.add('on')
      if (!running && !stopped) {
        running = true
        last = performance.now()
        requestAnimationFrame(frame)
      }
    }

    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          seen.unobserve(e.target)
          const task = byEl.get(e.target)
          if (task && task.state === 'hidden') {
            task.state = 'queued'
            task.queuedAt = performance.now()
            wake()
          }
        }
      },
      // No margin: the footer sits at the very bottom of the page, so it must count as soon as it shows.
      { rootMargin: '0px' },
    )
    tasks.forEach((t) => seen.observe(t.el))

    const frame = (now) => {
      if (stopped) return
      try {
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now

        // Biarkan proses pembangunan berjalan santai dan normal
        let waiting = 0
        for (const task of tasks) {
          if (task.state === 'queued') {
            if (now - task.queuedAt > options.maxWait * 2000) finish(task)
            else waiting++
          } else if (task.state === 'active' && !task.el.isConnected) {
            finish(task)
          }
        }

        for (let idx = 0; idx < agents.length; idx++) {
          const a = agents[idx]
          if (!a.script) {
            // Prioritas 1: Elemen yang sedang berada di viewport layar saat ini
            let task = tasks.find((t) => {
              if (t.state !== 'queued') return false
              if (t.parent && t.parent.state !== 'done') return false
              const r = t.el.getBoundingClientRect()
              return r.top >= -40 && r.top <= innerHeight + 60
            })
            // Prioritas 2: Task queued manapun
            if (!task) {
              task = tasks.find((t) => t.state === 'queued' && (!t.parent || t.parent.state === 'done'))
            }

            if (task) {
              task.state = 'active'
              task.agent = a
              a.task = task
              a.script = scripts[task.kind](a, task)
              a.script.next()
            }
          }
          if (a.script) {
            lastActivity = now
            const task = a.task
            try {
              if (a.script.next(dt).done) finish(task)
            } catch (err) {
              console.warn('banna task err:', err)
              finish(task)
            }
          } else {
            // When waiting for scroll/more elements, playfully orbit around user's cursor or center!
            a.angle += dt * (a.orbitSpeed || 1.0)
            const targetCenter = hasUserMoved
              ? [userMouseX, userMouseY]
              : [innerWidth / 2, innerHeight * 0.42]

            const rX = a.orbitRadiusX || 70
            const rY = a.orbitRadiusY || 45
            const targetX = targetCenter[0] + Math.cos(a.angle + (a.orbitOffset || 0)) * rX
            const targetY = targetCenter[1] + Math.sin(a.angle * 1.1 + (a.orbitOffset || 0)) * rY

            const k = 1 - Math.exp(-dt * 2.8)
            a.x += (targetX - a.x) * k
            a.y += (targetY - a.y) * k
          }
          a.el.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px)`
        }

        if (waiting > 0) lastActivity = now

        if (bar) {
          const text = `${localDigits(agents.filter((a) => a.script).length)} ${label('agents')} · ${localDigits(built)} / ${localDigits(tasks.length)} ${label('layers')}`
          if (text !== barText) {
            barText = text
            countEl.textContent = text
          }
          bar.classList.toggle('on', (waiting > 0 || now - lastActivity < 700) && built < tasks.length)
        }

        // Selesaikan secara alami tanpa buru-buru
        const idle = now - lastActivity
        const allDone = built >= tasks.length

        if (!allDone) {
          // KEEP CURSORS VISIBLE AND ACTIVE while waiting for user to scroll to bottom sections!
          layer.classList.add('on')
        } else {
          // Mencar / scatter animation keluar layar saat semua elemen selesai
          if (!dispersePhase) {
            dispersePhase = true
            disperseStart = now
            for (let idx = 0; idx < agents.length; idx++) {
              const a = agents[idx]
              const scatterAngle = (idx / agents.length) * Math.PI * 2 + (Math.random() * 0.4 - 0.2)
              const speed = 1400 + Math.random() * 500
              a.vx = Math.cos(scatterAngle) * speed
              a.vy = Math.sin(scatterAngle) * speed
            }
          }

          const disperseElapsed = (now - disperseStart) / 1000
          for (const a of agents) {
            a.x += (a.vx || 0) * dt
            a.y += (a.vy || 0) * dt
            a.el.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px)`
            a.el.style.opacity = String(Math.max(0, 1 - disperseElapsed * 1.8))
          }

          if (disperseElapsed > 0.65) {
            document.dispatchEvent(new CustomEvent('banna:done'))
            stop()
            return
          }
        }

        requestAnimationFrame(frame)
      } catch (err) {
        console.error('Banna frame recovery:', err)
        tasks.forEach(finish)
        stop()
      }
    }

    function skip() {
      tasks.forEach(finish)
      stop()
    }
    function stop() {
      if (stopped) return
      stopped = true
      tasks.forEach(finish)
      seen.disconnect()
      host.remove()
      window.removeEventListener('mousemove', onUserMouseMove)
      removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
      current = null
    }
    const onKey = (e) => {
      if (e.key === 'Escape') skip()
    }
    // Keyboard users must never land on something invisible.
    const onFocus = (e) => {
      for (let el = e.target; el; el = el.parentElement) {
        const task = byEl.get(el)
        if (task) finish(task)
      }
    }
    addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)

    current = { stop, skip }
    wake()
  }

  addStyles(document, PAGE_CSS)

  window.Banna = {
    start() {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      try {
        sessionStorage.removeItem('banna-seen')
      } catch {}
      addStyles(document, PAGE_CSS)
      if (current) current.stop()
      document.querySelectorAll('#sb-host').forEach((h) => h.remove())
      document.querySelectorAll('.sb-wait').forEach((el) => el.classList.remove('sb-wait'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => {
        start()
      }, 100)
    },
    skip() {
      if (current) current.skip()
    },
    stop() {
      if (current) current.stop()
    },
  }

  if (!options.auto || blocked()) return

  root.classList.add('sb-pending')
  // If anything goes wrong, the page must still appear.
  const failsafe = setTimeout(() => root.classList.remove('sb-pending'), 3500)
  const begin = () => {
    clearTimeout(failsafe)
    try {
      start()
    } catch (err) {
      root.classList.remove('sb-pending')
      document.querySelectorAll('.sb-wait').forEach((el) => el.classList.remove('sb-wait'))
      console.warn('banna stopped:', err)
    }
  }
  const scheduleBegin = () => {
    // Wait brief tick so React finishes hydration cleanly without class mismatch
    setTimeout(() => {
      begin()
    }, 120)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleBegin, { once: true })
  else scheduleBegin()
})()
