import axios from 'axios';
import jsdom from 'jsdom';
import puppeteer from 'puppeteer-core';

/**
 * This create a result object and allows transform the given data returned.
 *
 * @param {object} result
 * @param {Function} fork
 * @return {object} Return the final result
 */
var createResult = (result, fork) => {
  return fork ? fork(result) : result
};

/**
 * This extract a NodeList using a Query Selector item as root
 *
 * @param {string} html
 * @param {object} node
 * @param {object} options
 * @return {NodeList} // A list of HTMLElement items that match the given Query Selector
 */
var getNodeListFromSelector = (html, node, options = {}) => {
  const dom = new jsdom.JSDOM(html, options);
  const doc = dom.window.document;
  return doc.querySelectorAll(node.value)
};

/**
 * This helper format text when needed removing inconsistences
 *
 * @param {string} text
 * @param {boolean} parse
 * @return {string} Return text parsed/formatted
 */
var inlineTextFormat = (text, parse) => {
  if (!parse) {
    return text
  }

  let inlineValue = text.replace(/\n|\r/g, "");

  return inlineValue.replace(/\s+/g, " ").trim()
};

/**
 * This extract content from a HTMLElement node
 *
 * @param {HTMLElement} node
 * @param {object} selector
 * @return {string} Return content
 */
var getSourceContent = (node, selector) => {
  const { value, attribute, prefix = "", suffix = "", inline = true } = selector;
  const el = node.querySelector(value);
  if (attribute) {
    if (el) {
      return `${prefix}${inlineTextFormat(
        el.getAttribute(attribute),
        inline
      )}${suffix}`
    } else {
      return null
    }
  }

  if (el) {
    return `${prefix}${inlineTextFormat(el.textContent, inline)}${suffix}`
  }

  return null
};

/**
 * This extract sources from a given NodeList of HTMLElement items
 *
 * @param {NodeList} nodeList
 * @param {object} keys
 * @return {Array} Return a list of sources mapped
 */
var getSourcesFromNodeList = (nodeList, keys) => {
  let sources = [];

  nodeList.forEach((node) => {
    let source = {};

    for (const key in keys) {
      if (Object.prototype.hasOwnProperty.call(keys, key)) {
        const selector = keys[key];
        const content = getSourceContent(node, selector);

        if (content) {
          source[key] = content;
        }
      }
    }
    sources = [...sources, source];
  });

  return sources
};

const getDataFromChain = (selector, data) => {
  return selector
    .replace(/\[|\]\.?/g, ".")
    .split(".")
    .filter((s) => s)
    .reduce((acc, val) => acc && acc[val], data)
};

const getSource = (jsonObject, selector) => {
  const { value, prefix = "", suffix = "" } = selector;
  const content = getDataFromChain(value, jsonObject);

  if (content) {
    return `${prefix}${content}${suffix}`
  }

  return null
};

const getSourcesFromJSON = async ({ options, selectors, metadata, fork }) => {
  try {
    const { root, ...rest } = selectors;
    const { data } = await axios(options.request);
    const list = root ? getDataFromChain(root.value, data) : data;
    const sources = list.map((jsonObject) => {
      let source = {};

      for (const item in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, item)) {
          const selector = rest[item];
          const content = getSource(jsonObject, selector);
          if (content) {
            source[item] = content;
          }
        }
      }

      return source
    });

    return createResult(
      {
        sources: sources.slice(0, options.limit),
        metadata,
      },
      fork
    )
  } catch ({ message }) {
    return createResult(
      {
        sources: [],
        metadata,
        error: message,
      },
      fork
    )
  }
};

var JSONEngine = {
  engine: "json",
  run: getSourcesFromJSON,
};

const getSourcesFromMarkup = async ({ options, selectors, metadata, fork }) => {
  try {
    const { root, ...rest } = selectors;
    const { data } = await axios(options.request);
    const nodeList = getNodeListFromSelector(data, root, options.dom);
    const sources = getSourcesFromNodeList(nodeList, rest);

    return createResult(
      {
        sources: sources.slice(0, options.limit),
        metadata,
      },
      fork
    )
  } catch ({ message }) {
    return createResult(
      {
        sources: [],
        metadata,
        error: message,
      },
      fork
    )
  }
};

var markupEngine = {
  engine: "markup",
  run: getSourcesFromMarkup,
};

const createRequest = async ({ url, events = {}, ...rest }) => {
  const browser = await puppeteer.launch(rest);
  const { onBrowserLoad, willPageLoad, onPageLoad, onContentLoad } = events;

  if (onBrowserLoad) {
    await onBrowserLoad(browser);
  }

  const page = await browser.newPage();

  if (willPageLoad) {
    await willPageLoad(page);
  }

  await page.goto(url);

  if (onPageLoad) {
    await onPageLoad(page);
  }

  const content = await page.content();

  if (onContentLoad) {
    await onContentLoad(content, page);
  }

  await browser.close();

  return content
};

const getSourcesFromSPA = async ({ options, selectors, metadata, fork }) => {
  try {
    const { root, ...rest } = selectors;
    const data = await createRequest(options.request);
    const nodeList = getNodeListFromSelector(data, root, options.dom);
    const sources = getSourcesFromNodeList(nodeList, rest);

    return createResult(
      {
        sources: sources.slice(0, options.limit),
        metadata,
      },
      fork
    )
  } catch ({ message }) {
    return createResult(
      {
        sources: [],
        metadata,
        error: message,
      },
      fork
    )
  }
};

var SPAEngine = {
  engine: "spa",
  run: getSourcesFromSPA,
};

/**
 * @param {Array<object>} schemas A list of schemas following the default and/or custom engines registered.
 * @param {Array<Promise>} customEngines A list of custom engines to be registered.
 * @return {Promise} Returns a promise with data sources.
 */
const Tatooine = (schemas, customEngines = []) => {
  const engines = [JSONEngine, markupEngine, SPAEngine, ...customEngines];
  let sources = [];

  schemas.map((schema) => {
    engines.forEach(({ engine, run }) => {
      if (engine === schema.engine) {
        sources = [...sources, run(schema)];
      }
    });
  });

  return Promise.all(sources)
};

export default Tatooine;
//# sourceMappingURL=index.esm.js.map
