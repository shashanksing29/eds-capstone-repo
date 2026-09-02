/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `columns` block. Base: columns.
 * Source: wknd-trendsetters.site landing/listing featured-article feature and
 * faq/article two-column feature sections.
 *
 * Convention: N columns x 1 content row — each direct child of the inner
 * grid-layout becomes one column cell holding its content (image, heading,
 * text, CTA). An inline breadcrumb trail (landing rc2) is kept as authored
 * links per analysis; only its decorative caret image is dropped.
 */
export default function parse(element, { document }) {
  // The multi-column content lives in an inner .grid-layout; fall back to the
  // container's inner div or the element itself.
  const grid = element.querySelector('div.grid-layout')
    || element.querySelector(':scope > div.container > div')
    || element;

  const columns = Array.from(grid.children).filter((c) => c.nodeType === 1);

  if (columns.length < 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Drop decorative caret images inside inline breadcrumb trails, keeping links.
  columns.forEach((col) => {
    col.querySelectorAll('.breadcrumbs img').forEach((img) => img.remove());
  });

  // One row whose cells are the columns.
  const row = columns.map((col) => {
    const parts = Array.from(col.childNodes).filter((n) => {
      if (n.nodeType === 3) return n.textContent.trim().length > 0;
      return n.nodeType === 1;
    });
    return parts.length ? parts : col;
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
