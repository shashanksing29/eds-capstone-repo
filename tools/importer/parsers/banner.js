/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `banner` block. Base: banner.
 * Source: wknd-trendsetters.site landing-page rc7 (inverse full-bleed promo band).
 *
 * Content model (banner.js): each row is a single cell.
 *   Row 1: background image (picture).
 *   Row 2: title text.
 *   Row 3 (optional): background color — not authored here (dark variant is a
 *   CSS-only concern handled via the section style), so it is omitted.
 * The subheading + CTA follow the title in the source; the banner block keeps
 * only image + title, so we fold the supporting copy and CTA into the title
 * cell as additional elements to avoid dropping authored content.
 */
export default function parse(element, { document }) {
  const picture = element.querySelector('picture') || element.querySelector('img');

  const heading = element.querySelector('h1, h2, .h1-heading, .h2-heading');
  const paragraphs = Array.from(element.querySelectorAll('p'));
  const ctaLinks = Array.from(element.querySelectorAll('a.button, .button-group a'));

  if (!heading && !picture) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: background image.
  if (picture) cells.push([picture]);

  // Row 2: title + supporting copy + CTA (single cell).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  paragraphs.forEach((p) => contentCell.push(p));
  ctaLinks.forEach((a) => contentCell.push(a));
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner', cells });
  element.replaceWith(block);
}
