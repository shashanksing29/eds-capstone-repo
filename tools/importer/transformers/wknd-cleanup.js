/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for wknd-trendsetters.site.
 * Removes non-authorable global chrome (skip link, top navbar, footer) and
 * leftover non-content elements. Selectors verified against the captured DOM in
 * migration-work/pages/*\/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Nothing blocks parsing on this site (no cookie banners / modals in the
    // captured DOM), so no beforeTransform work is required.
  }

  if (hookName === H.after) {
    // Global chrome that authors never recreate per page.
    // From cleaned.html: <a class="skip-link">, <div class="navbar">,
    // <footer class="footer inverse-footer">.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
      'footer.footer',
      'footer',
    ]);

    // Safe leftover element cleanup.
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
    ]);
  }
}
