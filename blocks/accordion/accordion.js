/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 *
 * Content model (one row per item; author defensively — cells may be omitted):
 *   | accordion |
 *   | Question / label | Answer body (rich text) |
 *
 * Each authored row becomes a native <details>/<summary> disclosure so the
 * FAQ toggles open/closed with no JS interaction wiring required.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    if (!label) return;
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    if (body) body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary);
    if (body) details.append(body);
    row.replaceWith(details);
  });
}
