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
 *
 * Variants:
 *   accordion (single) — exclusive accordion: opening one item closes the
 *   others, using a shared native <details name> group.
 */

export default function decorate(block) {
  // "single" variant → exclusive accordion. A shared name makes modern
  // browsers auto-close sibling items when one opens.
  const groupName = block.classList.contains('single')
    ? `accordion-${[...block.parentElement.children].indexOf(block)}`
    : null;

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
    if (groupName) details.name = groupName;
    details.append(summary);
    if (body) details.append(body);
    row.replaceWith(details);
  });
}
