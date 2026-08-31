import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Article List block
 * Fetches the site's query index (query-index.json) and renders each
 * published page as a card. Publishing a new page makes it appear here
 * automatically — no code or content change required.
 *
 * Authoring (all cells optional):
 *   | Article List |
 *   | /query-index.json |   <- optional: a different index source
 *   | /blog/ |              <- optional: only list pages under this path prefix
 */

const DEFAULT_SOURCE = '/query-index.json';

/**
 * Fetch all rows from a query index, following pagination.
 * @param {string} source
 * @returns {Promise<Array>}
 */
async function fetchIndex(source) {
  const rows = [];
  const limit = 500;
  let offset = 0;
  let total = Infinity;
  try {
    while (offset < total) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(`${source}?limit=${limit}&offset=${offset}`);
      if (!resp.ok) break;
      // eslint-disable-next-line no-await-in-loop
      const json = await resp.json();
      total = json.total ?? (json.data || []).length;
      rows.push(...(json.data || []));
      offset += limit;
      if (!json.data || json.data.length === 0) break;
    }
  } catch (e) {
    // return whatever we have
  }
  return rows;
}

export default async function decorate(block) {
  // Read optional config from the authored cells.
  const links = [...block.querySelectorAll('a')].map((a) => a.getAttribute('href'));
  const texts = [...block.querySelectorAll('div')].map((d) => d.textContent.trim()).filter(Boolean);
  const source = links.find((h) => h && h.includes('query-index')) || DEFAULT_SOURCE;
  const prefix = texts.find((t) => t.startsWith('/') && !t.includes('query-index')) || '';
  block.textContent = '';

  let articles = await fetchIndex(source);

  // Filter: only pages under an optional prefix, and skip the current page /
  // any obviously non-article utility paths.
  const here = window.location.pathname.replace(/\.html$/, '');
  articles = articles.filter((a) => a.path
    && a.path !== here
    && (!prefix || a.path.startsWith(prefix)));

  // newest first when a lastModified timestamp is available
  articles.sort((a, b) => Number(b.lastModified || 0) - Number(a.lastModified || 0));

  const ul = document.createElement('ul');
  articles.forEach((article) => {
    const li = document.createElement('li');

    if (article.image) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'article-list-card-image';
      const pic = createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]);
      const a = document.createElement('a');
      a.href = article.path;
      a.append(pic);
      imageWrapper.append(a);
      li.append(imageWrapper);
    }

    const body = document.createElement('div');
    body.className = 'article-list-card-body';
    const title = article.title || article.path;
    body.innerHTML = `<h3><a href="${article.path}">${title}</a></h3>`;
    if (article.description) {
      const p = document.createElement('p');
      p.textContent = article.description;
      body.append(p);
    }
    li.append(body);

    ul.append(li);
  });

  if (!articles.length) {
    const empty = document.createElement('p');
    empty.className = 'article-list-empty';
    empty.textContent = 'No articles published yet.';
    block.append(empty);
    return;
  }

  block.append(ul);
}
