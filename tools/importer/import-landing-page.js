/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import tabsParser from './parsers/tabs.js';
import accordionParser from './parsers/accordion.js';
import bannerParser from './parsers/banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  columns: columnsParser,
  cards: cardsParser,
  tabs: tabsParser,
  accordion: accordionParser,
  banner: bannerParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Marketing landing layout: hero banner followed by stacked feature/content sections and cards',
  urls: [
    'https://wknd-trendsetters.site/',
  ],
  blocks: [
    { name: 'hero', instances: ['#main-content > header.section.secondary-section'] },
    { name: 'columns', instances: ['#main-content > section.section:nth-of-type(1)'] },
    {
      name: 'cards',
      instances: [
        '#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm',
        '#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md',
      ],
    },
    { name: 'tabs', instances: ['#main-content > section.section:nth-of-type(3) > div.container > div.tabs-wrapper'] },
    { name: 'accordion', instances: ['#main-content > section.section:nth-of-type(5) div.faq-list'] },
    { name: 'banner', instances: ['#main-content > section.section.inverse-section'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero banner', selector: '#main-content > header.section.secondary-section', style: 'light-grey', blocks: ['hero'], defaultContent: [] },
    { id: 'rc2', name: 'Case-study feature', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'rc3', name: 'Photo grid', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'light-grey', blocks: ['cards'], defaultContent: [] },
    { id: 'rc4', name: 'Testimonial tabs', selector: '#main-content > section.section:nth-of-type(3)', style: null, blocks: ['tabs'], defaultContent: [] },
    { id: 'rc5', name: 'Latest articles', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'light-grey', blocks: ['cards'], defaultContent: [] },
    { id: 'rc6', name: 'FAQ accordion', selector: '#main-content > section.section:nth-of-type(5)', style: null, blocks: ['accordion'], defaultContent: [] },
    { id: 'rc7', name: 'Promo banner', selector: '#main-content > section.section.inverse-section', style: 'dark', blocks: ['banner'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
