// Small build-time minifiers and critical-CSS extraction (no dependencies).
// Used by build.mjs. Conservative on purpose: they only remove what is safe
// for this project's hand-written CSS, JS and generated HTML.

// --- CSS ---------------------------------------------------------------------
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Whitespace is collapsed and removed around { } ; , > — never around : + ~
// (descendant pseudo-classes and calc() need those spaces).
export function minifyCss(css) {
  return stripComments(css)
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/:\s+/g, (match, offset, all) => (all.lastIndexOf('{', offset) > all.lastIndexOf('}', offset) ? ':' : match))
    .trim();
}

// Parses a stylesheet into [{ prelude, body }] where body is a string for
// declarations/@font-face/@keyframes and an array for nested @media/@supports.
function parseBlocks(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1; let j = open + 1; let quote = '';
    for (; j < css.length && depth; j += 1) {
      const char = css[j];
      if (quote) { if (char === quote && css[j - 1] !== '\\') quote = ''; continue; }
      if (char === '"' || char === "'") quote = char;
      else if (char === '{') depth += 1;
      else if (char === '}') depth -= 1;
    }
    const body = css.slice(open + 1, j - 1);
    blocks.push({ prelude, body: /^@(media|supports|layer|container)\b/.test(prelude) ? parseBlocks(body) : body });
    i = j;
  }
  return blocks;
}

const serialize = (blocks) => blocks.map(({ prelude, body }) => `${prelude}{${Array.isArray(body) ? serialize(body) : body}}`).join('');

// A selector is critical when its subject (the last compound, e.g. ".b" in
// ".a > .b:hover") names a class from the critical list — the class itself or
// its BEM __element / --modifier; "=name" matches only that exact class. A
// subject without classes (".main-nav a") is judged by the selector's other
// classes. Selectors with only element names, :root, * and pseudo-classes are
// base styles and always critical.
function criticalSelector(selector, prefixes) {
  const classesOf = (text) => [...text.replace(/\([^)]*\)/g, '').matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(([, name]) => name);
  const all = classesOf(selector);
  if (!all.length && !/#/.test(selector)) return true;
  const subject = classesOf(selector.trim().split(/\s*[\s>+~]\s*(?![^[(]*[\])])/).pop() || '');
  const classes = subject.length ? subject : all;
  return classes.some((name) => prefixes.some((prefix) => (prefix.startsWith('=')
    ? name === prefix.slice(1)
    : name === prefix || name.startsWith(`${prefix}__`) || name.startsWith(`${prefix}--`))));
}

function filterBlocks(blocks, prefixes) {
  const kept = [];
  for (const block of blocks) {
    if (Array.isArray(block.body)) {
      const inner = filterBlocks(block.body, prefixes);
      if (inner.length) kept.push({ prelude: block.prelude, body: inner });
    } else if (block.prelude.startsWith('@')) {
      kept.push(block); // @font-face, @keyframes: small and needed early
    } else if (block.prelude.split(',').some((selector) => criticalSelector(selector, prefixes))) {
      kept.push(block);
    }
  }
  return kept;
}

export function criticalCss(css, prefixes) {
  return minifyCss(serialize(filterBlocks(parseBlocks(stripComments(css)), prefixes)));
}

// --- JS: drop full-line comments, indentation and blank lines ------------------
export function minifyJs(js) {
  return js.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('//')).join('\n');
}

// --- HTML: drop indentation and blank lines (no <pre> on this site) -----------
export function minifyHtml(html) {
  return html.split('\n').map((line) => line.trim()).filter(Boolean).join('\n');
}
