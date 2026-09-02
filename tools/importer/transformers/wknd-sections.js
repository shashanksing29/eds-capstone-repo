/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for wknd-trendsetters.site.
 * Inserts a section break (<hr>) before every non-first section and a Section
 * Metadata block for every section that carries a style (light-grey / highlight
 * / dark). Selectors come from each template's `sections[].selector` in
 * page-templates.json (verified against captured DOM).
 *
 * Breaks are inserted in beforeTransform (while every section element still
 * exists, before parsers replace them); metadata is inserted in afterTransform
 * anchored to a marker <hr> so it survives parser element replacement.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section needs neither a leading break nor (usually) a marker,
      // unless it is styled — then it still needs a marker to anchor metadata.
      if (i === 0 && !section.style) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { Style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        // Section 0 never gets a real leading break — drop its marker <hr>.
        if (i === 0) marker.remove();
      }
    }
  }
}
