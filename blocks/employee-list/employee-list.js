/*
 * Employee List block
 * Renders a paginated list of employees from a published JSON sheet.
 * Shows 10 at a time; a "Load more" button (label sourced from the
 * placeholders sheet) appends the next 10.
 *
 * Authoring:
 *   | Employee List |
 *   | /employees.json |   <- link or text: path to the published data sheet
 */

const PAGE_SIZE = 10;

/**
 * Fetch the placeholders sheet and return a key/value map.
 * @returns {Promise<Object>}
 */
async function fetchPlaceholders() {
  try {
    const resp = await fetch('/placeholders.json');
    if (!resp.ok) return {};
    const json = await resp.json();
    const data = json.data || [];
    return data.reduce((acc, row) => {
      if (row.Key) acc[row.Key] = row.Value;
      return acc;
    }, {});
  } catch (e) {
    return {};
  }
}

/**
 * Fetch employee rows from the given data path.
 * @param {string} path
 * @returns {Promise<Array>}
 */
async function fetchEmployees(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export default async function decorate(block) {
  // Resolve the data source path from a link or plain text cell.
  const link = block.querySelector('a');
  let dataPath = link ? link.getAttribute('href') : block.textContent.trim();
  block.textContent = '';
  if (!dataPath) return;
  try {
    // normalise to a same-origin path
    dataPath = new URL(dataPath, window.location.origin).pathname;
  } catch (e) { /* keep as-is */ }

  const [employees, placeholders] = await Promise.all([
    fetchEmployees(dataPath),
    fetchPlaceholders(),
  ]);

  const loadMoreLabel = placeholders.loadMore || placeholders.loadmore || 'Load more';

  const table = document.createElement('table');
  table.className = 'employee-list-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Name</th><th>Department</th><th>Experience</th><th>City</th></tr>';
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  let shown = 0;
  const renderNext = () => {
    const slice = employees.slice(shown, shown + PAGE_SIZE);
    slice.forEach((emp) => {
      const tr = document.createElement('tr');
      [emp.Name, emp.Department, emp.Experience, emp.City].forEach((val) => {
        const td = document.createElement('td');
        td.textContent = val || '';
        tr.append(td);
      });
      tbody.append(tr);
    });
    shown += slice.length;
  };

  renderNext();
  block.append(table);

  // Load more button, only if there are more rows to show.
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'employee-list-more button';
  button.textContent = loadMoreLabel;
  const updateButton = () => {
    button.hidden = shown >= employees.length;
  };
  button.addEventListener('click', () => {
    renderNext();
    updateButton();
  });
  updateButton();
  block.append(button);
}
