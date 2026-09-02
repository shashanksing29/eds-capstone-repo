/**
 * Banner block.
 *
 * Content model (authors may omit rows/cells; decorate defensively):
 *   Row 1: image (picture) — used as the full-bleed background of the card
 *   Row 2: rich content — heading, paragraph(s) and an optional call-to-action link
 *   Row N (optional): a bare CSS color (e.g. "#e30613" or "teal") for the legacy
 *           solid-colour banner variant (only applied when no image is authored)
 *
 * When an image is present the block renders as an overlay card (image behind a
 * gradient with the text overlaid). When no image is present it falls back to the
 * legacy solid-colour banner (default blue, overridable via the color cell).
 *
 * The "dark" section option is applied by EDS to the surrounding section
 * (`.section.dark`) and is handled purely in CSS.
 */
export default function decorate(block) {
  const rows = [...block.children];

  let picture;
  let bgColor;
  const body = document.createElement('div');
  body.className = 'banner-body';

  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const pic = cell.querySelector('picture');
    if (pic && !picture) {
      picture = pic;
      return;
    }

    const text = cell.textContent.trim();
    if (!text && !cell.children.length) return;

    // A standalone CSS color value authored in its own cell -> background override.
    if (text && !pic && cell.children.length <= 1 && CSS.supports('color', text)) {
      bgColor = text;
      return;
    }

    // Preserve the real content elements (headings, paragraphs, buttons) as-is.
    [...cell.childNodes].forEach((node) => body.append(node));
  });

  block.replaceChildren();

  if (picture) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'banner-image';
    imageWrapper.append(picture);
    block.append(imageWrapper);
    // Eager-load the banner image so it never flickers as a broken placeholder,
    // even when the banner is rendered inside a lazily-loaded fragment.
    const img = picture.querySelector('img');
    if (img) {
      img.setAttribute('loading', 'eager');
      img.removeAttribute('fetchpriority');
    }
  }

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('banner-title');

  block.append(body);

  // Apply the authored background color for the legacy solid-colour variant.
  if (bgColor) block.style.setProperty('--banner-bg', bgColor);
}
