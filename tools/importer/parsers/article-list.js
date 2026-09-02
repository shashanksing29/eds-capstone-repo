/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `article-list` block. Base: article-list.
 * Source: wknd-trendsetters.site listing-page rc3 blog index grid.
 *
 * ⚠️ Intentional low completeness score: the article-list block is
 * auto-populated from the site's query-index.json at render time
 * (article-list.js). The authoring-analysis deliberately chose article-list
 * over manual cards precisely because this grid is the dynamic /blog/* feed, so
 * the hand-authored teaser cards are NOT copied into the output — they are
 * replaced by the live feed. Authoring is config-only:
 *   Row 1: block name.
 *   Row 2 (optional): path prefix scoping the listing (here `/blog/`).
 */
export default function parse(element, { document }) {
  // Derive the listing prefix from the cards' link targets (all share /blog/).
  const hrefs = Array.from(element.querySelectorAll('a[href]'))
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h.startsWith('/'));

  let prefix = '';
  if (hrefs.length) {
    const first = hrefs[0].split('/').filter(Boolean);
    if (first.length > 1) prefix = `/${first[0]}/`;
  }

  const cells = [];
  if (prefix) {
    const p = document.createElement('p');
    p.textContent = prefix;
    cells.push([p]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
