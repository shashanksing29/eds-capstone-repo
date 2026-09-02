/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `hero` block. Base: hero.
 * Source: wknd-trendsetters.site (landing / listing / faq / article / blog-post heroes).
 *
 * Convention: 1 column, 3 rows.
 *   Row 1: block name (added by createBlock).
 *   Row 2: background image(s).
 *   Row 3: title + subheading + supporting copy + optional CTAs.
 *
 * Authors omit CTAs / extra copy on some pages, so extraction is defensive.
 */
export default function parse(element, { document }) {
  // Cover image(s). Prefer <picture>, else <img>; de-dupe imgs nested in pictures.
  const imgNodes = Array.from(element.querySelectorAll('picture, img.cover-image, img'));
  const images = imgNodes.filter((node) => {
    if (node.tagName === 'IMG' && node.closest('picture')) return false;
    return true;
  });

  // Title — first h1/h2 in the hero.
  const heading = element.querySelector('h1, h2');

  // Supporting copy — subheading + intro paragraphs.
  const paragraphs = Array.from(element.querySelectorAll('p'));

  // Byline / date / read-time lines (blog-post hero) authored as flex rows.
  const metaRows = Array.from(element.querySelectorAll('div.flex-horizontal'));

  // Category tag (blog-post hero).
  const tag = element.querySelector('div.tag, .tag');

  // CTA buttons.
  const ctaLinks = Array.from(element.querySelectorAll('a.button, .button-group a'));

  if (!heading && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image(s).
  cells.push([images.length ? images : '']);

  // Row 3: heading + copy + meta + tag + CTAs.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  paragraphs.forEach((p) => contentCell.push(p));
  metaRows.forEach((row) => {
    const text = row.textContent.replace(/\s+/g, ' ').trim();
    if (text) {
      const line = document.createElement('p');
      line.textContent = text;
      contentCell.push(line);
    }
  });
  if (tag) {
    const text = tag.textContent.trim();
    if (text) {
      const tagP = document.createElement('p');
      tagP.textContent = text;
      contentCell.push(tagP);
    }
  }
  ctaLinks.forEach((a) => contentCell.push(a));

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
