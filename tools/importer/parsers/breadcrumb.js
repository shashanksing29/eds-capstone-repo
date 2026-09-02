/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `breadcrumb` block. Base: breadcrumb.
 * Source: wknd-trendsetters.site blog-post rc1 breadcrumb trail (Home > Blog).
 *
 * The breadcrumb trail is authored inside the same section as the article hero.
 * Because the hero parser replaces that whole <section>, this parser lifts the
 * breadcrumb block OUT to become a sibling *before* the section, so it survives
 * hero replacement and renders as a distinct block preceding the hero (matching
 * the authoring analysis).
 *
 * ⚠️ Intentional low completeness score: breadcrumb.js rebuilds the trail from
 * the current page's path + title at render time, ignoring authored cells, so
 * the block only needs its name row.
 */
export default function parse(element, { document }) {
  const cells = [['']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });

  // Anchor the block ahead of the enclosing section (which the hero parser will
  // replace); fall back to replacing the breadcrumb trail in place.
  const section = element.closest('section, header');
  if (section && section.parentNode) {
    section.before(block);
    element.remove();
  } else {
    element.replaceWith(block);
  }
}
