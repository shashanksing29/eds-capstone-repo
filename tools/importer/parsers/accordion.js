/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `accordion` block. Base: accordion.
 * Source: wknd-trendsetters.site faq-page rc2 and landing-page rc6 FAQ lists,
 * authored as native <details class="faq-item"> disclosures.
 *
 * Convention: 2 columns, one row per item.
 *   Cell 1: title (mandatory) — the question / summary label.
 *   Cell 2: content (mandatory) — the answer body (rich text).
 * The +/- toggle icon inside the summary is decorative and dropped.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('details.faq-item, details, .faq-item'));

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const summary = item.querySelector('summary, .faq-question');
    const answer = item.querySelector('.faq-answer')
      || item.querySelector('div:not(.faq-question)');

    // Question text (strip decorative toggle icon; prefer the inner <span>).
    const span = summary ? summary.querySelector('span') : null;
    const questionText = summary
      ? (span ? span.textContent : summary.textContent).trim()
      : '';
    const q = document.createElement('p');
    q.textContent = questionText;

    const bodyParts = answer
      ? Array.from(answer.childNodes).filter((n) => (n.nodeType === 3
        ? n.textContent.trim().length > 0
        : n.nodeType === 1))
      : [];

    cells.push([q, bodyParts.length ? bodyParts : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
