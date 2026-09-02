/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `cards` block. Base: cards.
 * Source: wknd-trendsetters.site landing-page photo grid + latest-articles grid,
 * and article-page trend grid.
 *
 * Convention: 2 columns (image | text), one row per card. Authors may omit the
 * text cell (image-only grid); an empty second cell keeps the table even.
 * The grid container is the block element; each direct child is one card.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each direct child of the grid is a card: either an <a> (linked card) or a
  // plain <div> wrapper (image-only tile).
  const cardEls = Array.from(element.children);

  cardEls.forEach((card) => {
    // Image (prefer <picture>, else <img>).
    const picture = card.querySelector('picture');
    const img = picture || card.querySelector('img');

    // Body content: tag, date, heading, description. Image-only tiles have none.
    const bodyParts = [];

    const tag = card.querySelector('.tag');
    const date = card.querySelector('.article-card-meta .paragraph-sm, .trend-card-meta .paragraph-sm');
    const heading = card.querySelector('h2, h3, h4, .h4-heading, .h3-heading');
    const desc = card.querySelector('.trend-card-body p, .article-card-body p');

    // Preserve the card link on the heading when the whole card is an anchor.
    const href = card.tagName === 'A' ? card.getAttribute('href') : null;

    if (tag) {
      const p = document.createElement('p');
      p.textContent = tag.textContent.trim();
      if (p.textContent) bodyParts.push(p);
    }
    if (date) {
      const p = document.createElement('p');
      p.textContent = date.textContent.trim();
      if (p.textContent) bodyParts.push(p);
    }
    if (heading) {
      const text = heading.textContent.trim();
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        const level = /^H[1-6]$/.test(heading.tagName) ? heading.tagName : 'H3';
        const h = document.createElement(level);
        h.append(a);
        bodyParts.push(h);
      } else {
        bodyParts.push(heading);
      }
    }
    if (desc) bodyParts.push(desc);

    if (img && bodyParts.length) {
      cells.push([img, bodyParts]);
    } else if (img) {
      cells.push([img, '']);
    } else if (bodyParts.length) {
      cells.push(['', bodyParts]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
