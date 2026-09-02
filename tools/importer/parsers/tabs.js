/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `tabs` block. Base: tabs.
 * Source: wknd-trendsetters.site landing-page rc4 testimonial tabs.
 *
 * Convention: 2 columns, one row per tab.
 *   Cell 1: tab label (mandatory) — the clickable menu entry (avatar + name + role).
 *   Cell 2: tab content (mandatory) — the panel (image + name + role + quote).
 *
 * The source keeps panels (`.tabs-content > .tab-pane`) and the menu
 * (`.tab-menu > .tab-menu-link`) as two parallel lists; we zip them by index so
 * each tab's label markup and its panel land in the same row.
 */
export default function parse(element, { document }) {
  const panels = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));
  const menuItems = Array.from(element.querySelectorAll('.tab-menu > .tab-menu-link'));

  if (!panels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panels.forEach((panel, i) => {
    const menu = menuItems[i];
    let label;
    if (menu) {
      label = menu;
    } else {
      const name = panel.querySelector('strong, .paragraph-xl');
      label = document.createElement('p');
      label.textContent = name ? name.textContent.trim() : `Tab ${i + 1}`;
    }
    cells.push([label, panel]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
