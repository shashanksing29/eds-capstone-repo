import { getMetadata } from '../../scripts/aem.js';

/**
 * Turns a path segment (e.g. "terms-and-conditions") into a readable label
 * ("Terms And Conditions").
 * @param {string} segment
 * @returns {string}
 */
function labelForSegment(segment) {
  return decodeURIComponent(segment)
    .replace(/\.[^.]+$/, '') // drop any extension
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Breadcrumb block (adapted from the WKND breadcrumb).
 *
 * Builds a trail that reflects the current page's path. Each ancestor segment
 * becomes a link; the final crumb is the current page title (from metadata,
 * falling back to the last path segment) and is rendered as plain text.
 *
 * @param {HTMLElement} block The breadcrumb block element
 */
export default function decorate(block) {
  const title = getMetadata('og:title') || document.title;
  const { pathname } = window.location;
  const segments = pathname.split('/').filter((s) => s.length && s !== 'index');

  const trail = [{ text: 'Home', link: '/' }];

  let path = '';
  segments.forEach((segment, i) => {
    path += `/${segment}`;
    const isLast = i === segments.length - 1;
    trail.push({
      text: isLast ? (title || labelForSegment(segment)) : labelForSegment(segment),
      // last crumb has no link (current page)
      link: isLast ? undefined : path,
    });
  });

  const ul = document.createElement('ul');
  trail.forEach((step) => {
    const li = document.createElement('li');
    let wrap = li;
    if (step.link) {
      wrap = document.createElement('a');
      wrap.href = step.link;
      li.append(wrap);
    }
    const span = document.createElement('span');
    span.textContent = step.text;
    wrap.append(span);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
