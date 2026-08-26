/**
 * Banner block.
 *
 * Content model (authors may omit rows/cells; decorate defensively):
 *   Row 1: image (picture)
 *   Row 2: title text
 *   Row 3 (optional): a background color (any valid CSS color, e.g. "#e30613" or "teal")
 *
 * When no background color is authored, the banner falls back to the default
 * blue defined in banner.css (--banner-default-bg).
 *
 * The dark variant is triggered by the "banner (dark)" option in authoring and
 * is handled purely in CSS via the `.banner.dark` selector.
 */
export default function decorate(block) {
  const rows = [...block.children];

  let picture;
  let title;
  let bgColor;

  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const pic = cell.querySelector('picture');
    if (pic && !picture) {
      picture = pic;
      return;
    }
    const text = cell.textContent.trim();
    if (!text) return;
    if (!title) {
      title = text;
    } else if (!bgColor) {
      bgColor = text;
    }
  });

  // Build the banner content.
  const content = document.createElement('div');
  content.className = 'banner-content';

  if (picture) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'banner-image';
    imageWrapper.append(picture);
    content.append(imageWrapper);
  }

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'banner-title';
    heading.textContent = title;
    content.append(heading);
  }

  block.replaceChildren(content);

  // Apply the authored background color; CSS provides the default blue.
  if (bgColor) {
    block.style.setProperty('--banner-bg', bgColor);
  }
}
