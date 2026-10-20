#!/usr/bin/env node
// Usage: node extend-checks.mjs <appDir> --baseline <untouchedDir> [--out <dir>] [--json out.json]
// Chromium: set CHROME_PATH, otherwise the newest ~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome is used.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }
const TEXT_EXT = new Set(['.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.json', '.html'])
const REASON = 'Cannot cover that week, two others are already off.'

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) args[a.slice(2)] = argv[++i]
    else args._.push(a)
  }
  return args
}

const log = (...m) => console.error('[extend-checks]', ...m)

function walk(root, base = root) {
  const out = []
  if (!fs.existsSync(root)) return out
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, base))
    else out.push(path.relative(base, full))
  }
  return out.sort()
}

function newestMtime(paths) {
  let newest = 0
  for (const p of paths) {
    if (!fs.existsSync(p)) continue
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      for (const f of walk(p)) newest = Math.max(newest, fs.statSync(path.join(p, f)).mtimeMs)
    } else newest = Math.max(newest, stat.mtimeMs)
  }
  return newest
}

function ensureBuild(dir) {
  const index = path.join(dir, 'dist', 'index.html')
  const fresh =
    fs.existsSync(index) &&
    fs.statSync(index).mtimeMs >= newestMtime([path.join(dir, 'src'), path.join(dir, 'index.html'), path.join(dir, 'package.json')])
  if (fresh) return { passed: true, ran: false }
  const started = Date.now()
  const result = spawnSync('npm', ['run', 'build'], { cwd: dir, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  const passed = result.status === 0 && fs.existsSync(index)
  const out = { passed, ran: true, seconds: +((Date.now() - started) / 1000).toFixed(1) }
  if (!passed) out.error = `${result.error ? result.error.message + '\n' : ''}${result.stdout || ''}${result.stderr || ''}`.trim().split('\n').slice(-25).join('\n')
  return out
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = path.join(os.homedir(), '.cache', 'ms-playwright')
  if (!fs.existsSync(root)) return undefined
  const dirs = fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  for (const d of dirs) {
    for (const sub of ['chrome-linux64', 'chrome-linux']) {
      const exe = path.join(root, d, sub, 'chrome')
      if (fs.existsSync(exe)) return exe
    }
  }
  return undefined
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pollUntil(fn, timeoutMs = 3000, step = 100) {
  const end = Date.now() + timeoutMs
  for (;;) {
    const value = await fn()
    if (value) return value
    if (Date.now() > end) return value
    await sleep(step)
  }
}

const indexUrl = (dir, hash = '') => `${pathToFileURL(path.join(dir, 'dist', 'index.html')).href}${hash}`

async function openPage(browser, dir, hash, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.consoleErrors = []
  page.on('console', (m) => m.type() === 'error' && page.consoleErrors.push(m.text()))
  page.on('pageerror', (e) => page.consoleErrors.push(String(e.message || e)))
  await page.goto(indexUrl(dir, hash), { waitUntil: 'load' })
  await page.waitForFunction(() => (document.getElementById('root')?.childElementCount ?? 0) > 0, null, { timeout: 5000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready).catch(() => {})
  await sleep(250)
  return page
}

async function closePage(page) {
  await page.context().close()
}

function readPng(buf) {
  return PNG.sync.read(buf)
}

function padded(png, width, height) {
  if (png.width === width && png.height === height) return png
  const out = new PNG({ width, height })
  out.data.fill(0)
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255
    out.data[i + 2] = 255
    out.data[i + 3] = 255
  }
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0)
  return out
}

function diffRatio(bufA, bufB) {
  const a = readPng(bufA)
  const b = readPng(bufB)
  const width = Math.max(a.width, b.width)
  const height = Math.max(a.height, b.height)
  const pa = padded(a, width, height)
  const pb = padded(b, width, height)
  const changed = pixelmatch(pa.data, pb.data, null, width, height, { threshold: 0.1 })
  return {
    changedPixels: changed,
    totalPixels: width * height,
    ratio: +(changed / (width * height)).toFixed(5),
    sizeMismatch: a.width !== b.width || a.height !== b.height ? { baseline: [b.width, b.height], app: [a.width, a.height] } : null,
  }
}

async function capture(browser, dir, hash, viewport) {
  const page = await openPage(browser, dir, hash, viewport)
  const opts = { fullPage: true, animations: 'disabled', caret: 'hide' }
  const plain = await page.screenshot(opts)
  const masked = await page.screenshot({ ...opts, mask: [page.locator('nav, aside')], maskColor: '#ff00ff' })
  await closePage(page)
  return { plain, masked }
}

async function collateralChecks(browser, appDir, baseDir) {
  const pages = {}
  const routes = { schedule: '#/', staff: '#/staff' }
  for (const [name, hash] of Object.entries(routes)) {
    for (const viewport of [DESKTOP, MOBILE]) {
      const [app, base] = [await capture(browser, appDir, hash, viewport), await capture(browser, baseDir, hash, viewport)]
      const full = diffRatio(app.plain, base.plain)
      const ignoringNav = diffRatio(app.masked, base.masked)
      pages[`${name}@${viewport.width}`] = { ...full, ratioIgnoringNav: ignoringNav.ratio }
    }
  }
  const ratios = Object.values(pages).map((p) => p.ratio)
  const navRatios = Object.values(pages).map((p) => p.ratioIgnoringNav)
  return {
    pages,
    maxRatio: Math.max(...ratios),
    maxRatioIgnoringNav: Math.max(...navRatios),
  }
}

const TIME_OFF_RE = /time.?off/i

async function settle(page, names) {
  await pollUntil(
    () => page.evaluate((list) => list.some((n) => document.body.innerText.includes(n)), names),
    4000,
  )
  await sleep(250)
}

async function pageChecks(browser, appDir, outDir, staffNames) {
  fs.mkdirSync(outDir, { recursive: true })
  const jpeg = { type: 'jpeg', quality: 80, fullPage: true, animations: 'disabled', caret: 'hide' }
  const result = { found: false, viaSidebar: false, linkText: null, href: null, hash: null, screenshots: {}, consoleErrors: [] }

  const shotSchedule = async (viewport, label) => {
    const page = await openPage(browser, appDir, '#/', viewport)
    const file = path.join(outDir, `schedule-${label}.jpg`)
    await page.screenshot({ ...jpeg, path: file })
    result.screenshots[`schedule-${label}`] = file
    await closePage(page)
  }
  await shotSchedule(DESKTOP, 'desktop')
  await shotSchedule(MOBILE, 'mobile')

  const desktop = await openPage(browser, appDir, '#/', DESKTOP)
  const candidates = desktop.locator('nav a, aside a').filter({ hasText: TIME_OFF_RE })
  const anyLinks = desktop.locator('a').filter({ hasText: TIME_OFF_RE })
  let link = null
  if ((await candidates.count()) > 0) {
    link = candidates.first()
    result.viaSidebar = true
  } else if ((await anyLinks.count()) > 0) link = anyLinks.first()

  if (link) {
    result.linkText = (await link.innerText().catch(() => '')).trim()
    result.href = await link.getAttribute('href')
    await link.click({ timeout: 3000 }).catch(() => {})
    await sleep(200)
    result.found = true
  } else {
    for (const guess of ['#/time-off', '#/timeoff', '#/time_off', '#/timeOff', '#/time-off-requests']) {
      await desktop.goto(indexUrl(appDir, guess))
      await sleep(400)
      const heading = await desktop.locator('h1, h2').first().innerText().catch(() => '')
      if (TIME_OFF_RE.test(heading)) {
        result.found = true
        result.href = guess
        break
      }
    }
  }

  if (!result.found) {
    await closePage(desktop)
    return result
  }

  result.hash = new URL(desktop.url()).hash || result.href
  await settle(desktop, staffNames)
  const file = path.join(outDir, 'timeoff-desktop.jpg')
  await desktop.screenshot({ ...jpeg, path: file })
  result.screenshots['timeoff-desktop'] = file
  result.consoleErrors.push(...desktop.consoleErrors)
  await closePage(desktop)

  const mobile = await openPage(browser, appDir, result.hash, MOBILE)
  await settle(mobile, staffNames)
  const mfile = path.join(outDir, 'timeoff-mobile.jpg')
  await mobile.screenshot({ ...jpeg, path: mfile })
  result.screenshots['timeoff-mobile'] = mfile
  result.mobileOverflowX = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  result.consoleErrors.push(...mobile.consoleErrors)
  await closePage(mobile)
  result.consoleErrors = [...new Set(result.consoleErrors)]
  return result
}

function rowFinder({ name, allNames, buttonRe, statusRe, mark }) {
  const others = allNames.filter((n) => n !== name && !n.includes(name) && !name.includes(n))
  const buttonTest = buttonRe ? new RegExp(buttonRe, 'i') : null
  const statusTest = statusRe ? new RegExp(statusRe, 'i') : null
  document.querySelectorAll('[data-xc-row]').forEach((el) => el.removeAttribute('data-xc-row'))
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const starts = []
  while (walker.nextNode()) {
    const node = walker.currentNode
    const parent = node.parentElement
    if (parent && node.nodeValue.includes(name) && !parent.closest('script, style, dialog, [role="dialog"]')) starts.push(parent)
  }
  for (const start of starts) {
    for (let el = start; el && el !== document.body; el = el.parentElement) {
      const text = el.innerText || ''
      if (others.some((other) => text.includes(other))) break
      const hasButton =
        !buttonTest ||
        [...el.querySelectorAll('button, [role="button"], a')].some((b) => buttonTest.test(`${b.innerText || ''} ${b.getAttribute('aria-label') || ''}`))
      if (hasButton && (!statusTest || statusTest.test(text))) {
        if (mark) el.setAttribute('data-xc-row', '1')
        return { text }
      }
    }
  }
  return null
}

async function markRow(page, name, allNames, buttonRe) {
  return page.evaluate(rowFinder, { name, allNames, buttonRe, statusRe: null, mark: true })
}

async function rowStatus(page, name, allNames) {
  const row = await page.evaluate(rowFinder, { name, allNames, buttonRe: null, statusRe: 'pending|approved|declined', mark: false })
  if (!row) return { status: 'gone', text: '' }
  const text = row.text
  const status = /declined/i.test(text) ? 'declined' : /approved/i.test(text) ? 'approved' : /pending/i.test(text) ? 'pending' : 'unknown'
  return { status, text: text.replace(/\s+/g, ' ').slice(0, 200) }
}

const countButtons = (page, re) => page.getByRole('button', { name: re }).count()

async function openDecline(page, name, allNames) {
  const row = await markRow(page, name, allNames, 'decline')
  if (!row) return { error: 'no row with a decline button for the pending request' }
  await page.locator('[data-xc-row="1"]').getByRole('button', { name: /decline/i }).first().click({ timeout: 3000 })
  await sleep(350)

  const dialog = page.locator('dialog[open], [role="dialog"], [aria-modal="true"]').filter({ visible: true })
  let scope = null
  let field = null
  const fieldSelector = 'textarea:visible, input:visible:not([type="checkbox"]):not([type="radio"]):not([type="search"]):not([type="hidden"])'
  if ((await dialog.count()) > 0) {
    scope = dialog.first()
    field = scope.locator(fieldSelector).first()
  } else {
    await markRow(page, name, allNames, null)
    field = page.locator(`[data-xc-row="1"] ${fieldSelector.replaceAll(', ', ', [data-xc-row="1"] ')}`).first()
    if ((await field.count()) === 0) field = page.locator(fieldSelector).first()
  }
  const hasField = (await field.count()) > 0
  if (!scope) {
    if (hasField) {
      const handle = await field.elementHandle()
      await handle.evaluate((el) => {
        document.querySelectorAll('[data-xc-form]').forEach((n) => n.removeAttribute('data-xc-form'))
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if ([...p.querySelectorAll('button')].some((b) => /decline|confirm|send|submit|save|reject/i.test(`${b.innerText} ${b.getAttribute('aria-label') || ''}`))) {
            p.setAttribute('data-xc-form', '1')
            return
          }
        }
      })
      scope = page.locator('[data-xc-form="1"]')
      if ((await scope.count()) === 0) scope = page.locator('[data-xc-row="1"]')
    } else scope = page.locator('[data-xc-row="1"]')
  }
  const confirm = scope.getByRole('button', { name: /decline|confirm|send|submit|save|reject/i }).last()
  return { scope, field: hasField ? field : null, confirm, modal: (await dialog.count()) > 0 }
}

async function newestLines(scope) {
  const text = await scope.innerText().catch(() => '')
  return new Set(text.split('\n').map((l) => l.trim()).filter(Boolean))
}

async function functionalChecks(browser, appDir, hash, data) {
  const { staffNames, pending, nameOf, allNames } = data
  const result = {
    pendingListed: { passed: false },
    approve: { passed: false },
    declineEmptyBlocked: { passed: false },
    declineWithReason: { passed: false },
  }
  const counts = new Map()
  for (const r of data.all) counts.set(r.staffId, (counts.get(r.staffId) || 0) + 1)
  const target = pending.find((r) => counts.get(r.staffId) === 1) || pending[0]
  const targetName = nameOf(target)
  const load = async () => {
    const page = await openPage(browser, appDir, hash, DESKTOP)
    await settle(page, staffNames)
    return page
  }

  {
    const page = await load()
    const body = await page.evaluate(() => document.body.innerText)
    const shown = pending.filter((r) => body.includes(nameOf(r)))
    result.pendingListed = { passed: shown.length === pending.length, expected: pending.length, found: shown.length, missing: pending.filter((r) => !body.includes(nameOf(r))).map(nameOf) }
    await closePage(page)
  }

  {
    const page = await load()
    const before = await rowStatus(page, targetName, allNames)
    const approveBefore = await countButtons(page, /approve/i)
    const row = await markRow(page, targetName, allNames, 'approve')
    const detail = { target: targetName, statusBefore: before.status, approveButtonsBefore: approveBefore }
    if (!row) {
      result.approve = { passed: false, ...detail, note: 'no row with an approve button for the pending request' }
    } else {
      await page.locator('[data-xc-row="1"]').getByRole('button', { name: /approve/i }).first().click({ timeout: 3000 })
      await sleep(350)
      const dialog = page.locator('dialog[open], [role="dialog"], [aria-modal="true"]').filter({ visible: true })
      if ((await dialog.count()) > 0) {
        const confirm = dialog.first().getByRole('button', { name: /approve|confirm|yes|ok/i }).last()
        if ((await confirm.count()) > 0) await confirm.click({ timeout: 3000 }).catch(() => {})
      }
      const after = await pollUntil(async () => {
        const s = await rowStatus(page, targetName, allNames)
        return s.status === 'approved' ? s : null
      }, 3500)
      const final = after || (await rowStatus(page, targetName, allNames))
      const approveAfter = await countButtons(page, /approve/i)
      const rowGone = final.status === 'gone' && approveAfter < approveBefore
      result.approve = {
        passed: final.status === 'approved' || rowGone,
        ...detail,
        statusAfter: final.status,
        approveButtonsAfter: approveAfter,
        evidence: final.status === 'approved' ? 'row now reads approved' : rowGone ? 'row left the pending view' : 'status unchanged',
      }
    }
    await closePage(page)
  }

  {
    const page = await load()
    const flow = await openDecline(page, targetName, allNames)
    if (flow.error) result.declineEmptyBlocked = { passed: false, note: flow.error }
    else {
      const linesBefore = await newestLines(flow.scope)
      const disabled = await flow.confirm.isDisabled().catch(() => false)
      if (flow.field) await flow.field.fill('')
      if (!disabled) await flow.confirm.click({ timeout: 3000 }).catch(() => {})
      await sleep(900)
      const status = await rowStatus(page, targetName, allNames)
      const linesAfter = await newestLines(flow.scope)
      const newLines = [...linesAfter].filter((l) => !linesBefore.has(l))
      const errorText = newLines.find((l) => /required|must|empty|provide|enter|cannot|can't|please|error|failed|reason/i.test(l))
      const alert = (await page.locator('[role="alert"]:visible').count()) > 0
      const invalid = flow.field ? await flow.field.evaluate((el) => el.getAttribute('aria-invalid') === 'true' || !el.checkValidity()).catch(() => false) : false
      const errorShown = Boolean(errorText) || alert || invalid
      const stillOpen = flow.field ? await flow.field.isVisible().catch(() => false) : await flow.scope.isVisible().catch(() => false)
      result.declineEmptyBlocked = {
        passed: status.status !== 'declined' && (disabled || errorShown || stillOpen),
        confirmDisabled: disabled,
        errorShown,
        errorText: errorText || null,
        formStillOpen: stillOpen,
        statusAfter: status.status,
        reasonField: Boolean(flow.field),
        modal: flow.modal,
      }
    }
    await closePage(page)
  }

  {
    const page = await load()
    const flow = await openDecline(page, targetName, allNames)
    if (flow.error) result.declineWithReason = { passed: false, note: flow.error }
    else if (!flow.field) result.declineWithReason = { passed: false, note: 'no reason field found after clicking decline', modal: flow.modal }
    else {
      const declineBefore = await countButtons(page, /decline/i)
      await flow.field.fill(REASON)
      await flow.confirm.click({ timeout: 3000 }).catch(() => {})
      const done = await pollUntil(async () => {
        const s = await rowStatus(page, targetName, allNames)
        return s.status === 'declined' ? s : null
      }, 3500)
      const final = done || (await rowStatus(page, targetName, allNames))
      const declineAfter = await countButtons(page, /decline/i)
      const rowGone = final.status === 'gone' && declineAfter < declineBefore
      const alert = await page.locator('[role="alert"]:visible').allInnerTexts()
      result.declineWithReason = {
        passed: final.status === 'declined' || rowGone,
        target: targetName,
        statusAfter: final.status,
        evidence: final.status === 'declined' ? 'row now reads declined' : rowGone ? 'row left the pending view' : 'status unchanged',
        visibleAlerts: alert,
        modal: flow.modal,
      }
    }
    await closePage(page)
  }

  result.passed = Object.values(result).every((r) => r.passed)
  return result
}

async function loadMockData(baseDir) {
  const staff = (await import(pathToFileURL(path.join(baseDir, 'src/data/staff.ts')).href)).staff
  const api = await import(pathToFileURL(path.join(baseDir, 'src/api/timeOff.ts')).href)
  const all = await api.getTimeOffRequests()
  const names = new Map(staff.map((s) => [s.id, s.name]))
  return {
    all,
    pending: all.filter((r) => r.status === 'pending'),
    staffNames: staff.map((s) => s.name),
    allNames: staff.map((s) => s.name),
    nameOf: (r) => names.get(r.staffId),
  }
}

function stripComments(text, file) {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, '')
  if (!file.endsWith('.css') && !file.endsWith('.scss')) out = out.replace(/^\s*\/\/.*$/gm, '')
  return out
}

function addedLines(newText, oldText, file) {
  const pool = new Map()
  for (const line of stripComments(oldText, file).split('\n')) {
    const t = line.trim()
    if (t) pool.set(t, (pool.get(t) || 0) + 1)
  }
  const added = []
  stripComments(newText, file).split('\n').forEach((line) => {
    const t = line.trim()
    if (!t) return
    const left = pool.get(t) || 0
    if (left > 0) pool.set(t, left - 1)
    else added.push(t)
  })
  return added
}

const COLOR_RE = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\bcolor\(\s*(?:srgb|display-p3)/g
const PX_RE = /(?<![\w.#])(\d*\.?\d+)px\b/g
const NAMED_COLOR_RE = /(?:color|background(?:-color)?|border(?:-\w+)?|outline(?:-color)?|fill|stroke)\s*:\s*[^;]*?\b(white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|teal|navy|crimson|tomato)\b/gi
const CUSTOM_PROP_RE = /['"]?(--[A-Za-z0-9_-]+)['"]?\s*:/g

function customProps(srcDir) {
  const map = new Map()
  for (const f of walk(srcDir)) {
    if (!TEXT_EXT.has(path.extname(f))) continue
    const text = stripComments(fs.readFileSync(path.join(srcDir, f), 'utf8'), f)
    for (const m of text.matchAll(CUSTOM_PROP_RE)) {
      if (!map.has(m[1])) map.set(m[1], new Set())
      map.get(m[1]).add(f)
    }
  }
  return map
}

function importedNames(text, file, srcDir) {
  const names = new Set()
  const componentsDir = path.join(srcDir, 'components')
  for (const m of text.matchAll(/import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
    const spec = m[2]
    let target = null
    if (spec.startsWith('.')) target = path.resolve(path.dirname(path.join(srcDir, file)), spec)
    else if (spec.startsWith('@/')) target = path.join(srcDir, spec.slice(2))
    if (!target) continue
    const rel = path.relative(componentsDir, target)
    if (rel.startsWith('..') || path.isAbsolute(rel)) continue
    const clause = m[1]
    const def = clause.match(/^([A-Za-z_$][\w$]*)/)
    if (def) names.add(def[1])
    const named = clause.match(/\{([\s\S]*?)\}/)
    if (named) for (const part of named[1].split(',')) {
      const n = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
      if (n) names.add(n)
    }
  }
  return names
}

function tokenChecks(appDir, baseDir) {
  const appSrc = path.join(appDir, 'src')
  const baseSrc = path.join(baseDir, 'src')
  const appFiles = walk(appSrc)
  const baseFiles = new Set(walk(baseSrc))
  const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8')

  const added = []
  const changed = []
  for (const f of appFiles) {
    if (!baseFiles.has(f)) added.push(f)
    else if (TEXT_EXT.has(path.extname(f)) && read(appSrc, f) !== read(baseSrc, f)) changed.push(f)
    else if (!TEXT_EXT.has(path.extname(f)) && !fs.readFileSync(path.join(appSrc, f)).equals(fs.readFileSync(path.join(baseSrc, f)))) changed.push(f)
  }
  const deleted = [...baseFiles].filter((f) => !appFiles.includes(f))

  const colorLiterals = []
  const rawPx = []
  const namedColors = []
  const baselineExports = new Set()
  for (const f of walk(path.join(baseSrc, 'components'))) {
    if (!/\.(tsx|ts)$/.test(f)) continue
    for (const m of read(path.join(baseSrc, 'components'), f).matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g)) baselineExports.add(m[1])
  }

  const usage = {}
  const rawElements = {}
  const importedPerFile = {}
  for (const f of [...added, ...changed]) {
    const ext = path.extname(f)
    if (!TEXT_EXT.has(ext)) continue
    const newText = read(appSrc, f)
    const oldText = baseFiles.has(f) ? read(baseSrc, f) : ''
    const lines = addedLines(newText, oldText, f)
    const isTokens = f === path.join('styles', 'tokens.css')

    if (!isTokens && ['.css', '.scss', '.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      for (const line of lines) {
        for (const m of line.matchAll(COLOR_RE)) colorLiterals.push({ file: f, value: m[0], line })
        if (ext === '.css' || ext === '.scss' || /style|css|px/i.test(line)) {
          for (const m of line.matchAll(NAMED_COLOR_RE)) namedColors.push({ file: f, value: m[1], line })
        }
        if (/@media|@container/.test(line)) continue
        for (const m of line.matchAll(PX_RE)) {
          if (Number(m[1]) !== 0) rawPx.push({ file: f, value: m[0], line })
        }
      }
    }

    if (/\.(tsx|jsx)$/.test(ext) || /\.(ts|js)$/.test(ext)) {
      const before = baseFiles.has(f) ? importedNames(oldText, f, baseSrc) : new Set()
      const now = importedNames(newText, f, appSrc)
      const fresh = [...now].filter((n) => !before.has(n) && baselineExports.has(n))
      if (fresh.length) importedPerFile[f] = fresh
      if (ext === '.tsx' || ext === '.jsx') {
        for (const line of lines) {
          for (const m of line.matchAll(/<([A-Z]\w*)\b/g)) if (baselineExports.has(m[1])) usage[m[1]] = (usage[m[1]] || 0) + 1
          for (const m of line.matchAll(/<(button|input|select|textarea|table|dialog)\b/g)) rawElements[m[1]] = (rawElements[m[1]] || 0) + 1
        }
      }
    }
  }

  const baseProps = customProps(baseSrc)
  const appProps = customProps(appSrc)
  const newProps = [...appProps.keys()].filter((p) => !baseProps.has(p))
  const inTokensCss = newProps.filter((p) => [...appProps.get(p)].every((f) => f === path.join('styles', 'tokens.css')))
  const elsewhere = newProps.filter((p) => !inTokensCss.includes(p))

  const componentsPrefix = `components${path.sep}`
  const newComponentFiles = added.filter((f) => f.startsWith(componentsPrefix) && /\.(tsx|jsx)$/.test(f))
  const readJson = (dir) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    } catch {
      return {}
    }
  }
  const depsOf = (pkg) => ({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) })
  const appDeps = depsOf(readJson(appDir))
  const baseDeps = depsOf(readJson(baseDir))
  const existingUsed = [...new Set([...Object.values(importedPerFile).flat(), ...Object.keys(usage)])].sort()

  const sample = (arr) => arr.slice(0, 12).map((x) => `${x.file}: ${x.value}  <- ${x.line.slice(0, 90)}`)
  return {
    files: { added, changed, deleted },
    newColorLiterals: { count: colorLiterals.length, samples: sample(colorLiterals) },
    newNamedColorKeywords: { count: namedColors.length, samples: sample(namedColors) },
    newRawPx: { count: rawPx.length, samples: sample(rawPx) },
    newCustomProperties: { count: newProps.length, inTokensCss, elsewhere },
    importsExistingComponents: existingUsed.length > 0,
    existingComponentsImportedBy: importedPerFile,
    existingComponentUsage: usage,
    rawHtmlElementsInAddedLines: rawElements,
    newComponentFiles: { count: newComponentFiles.length, files: newComponentFiles },
    dependenciesAdded: Object.keys(appDeps).filter((d) => !(d in baseDeps)),
    dependenciesChanged: Object.keys(appDeps).filter((d) => d in baseDeps && appDeps[d] !== baseDeps[d]),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const appDir = args._[0] && path.resolve(args._[0])
  const baseDir = args.baseline && path.resolve(args.baseline)
  if (!appDir || !baseDir) {
    console.error('usage: node extend-checks.mjs <appDir> --baseline <untouchedFixtureDir> [--out <dir>] [--json out.json]')
    process.exit(2)
  }
  const outDir = path.resolve(args.out || path.join(os.tmpdir(), `extend-checks-${path.basename(appDir)}`))

  const report = { app: appDir, baseline: baseDir }
  log('building')
  report.build = ensureBuild(appDir)
  const baseBuild = appDir === baseDir ? report.build : ensureBuild(baseDir)
  report.baselineBuild = baseBuild
  report.tokens = tokenChecks(appDir, baseDir)

  if (!report.build.passed || !baseBuild.passed) {
    report.collateral = null
    report.page = null
    report.functional = null
  } else {
    const data = await loadMockData(baseDir)
    const browser = await chromium.launch({ executablePath: findChrome(), args: ['--allow-file-access-from-files'] })
    try {
      log('collateral')
      report.collateral = await collateralChecks(browser, appDir, baseDir)
      log('page')
      report.page = await pageChecks(browser, appDir, outDir, data.staffNames)
      if (report.page.found) {
        log('functional')
        report.functional = await functionalChecks(browser, appDir, report.page.hash, data)
      } else report.functional = { skipped: 'no time-off page found', passed: false }
    } finally {
      await browser.close()
    }
  }

  const json = JSON.stringify(report, null, 2)
  if (args.json) {
    fs.mkdirSync(path.dirname(path.resolve(args.json)), { recursive: true })
    fs.writeFileSync(args.json, json)
  }
  console.log(json)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
