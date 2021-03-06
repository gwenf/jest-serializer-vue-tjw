const helpers = require('./helpers.js');
const removeTestTokens = require('./removeTestTokens.js');

/**
 * This removes the data-server-rendered="true" from your snapshots.
 *
 * @param  {string} html     The markup being serialized
 * @param  {object} options  Options object for this serializer
 * @return {string}          Modified HTML string
 */
function removeServerRenderedText (html, options) {
  if (!options || options.removeServerRendered) {
    const $ = helpers.$(html);

    $('[data-server-rendered]').removeAttr('data-server-rendered');

    return $.html();
  }
  return html;
}

/**
 * This removes data-v-1234abcd="" from your snapshots.
 *
 * @param  {string} html     The markup being serialized
 * @param  {object} options  Options object for this serializer
 * @return {string}          Modified HTML string
 */
function removeScopedStylesDataVIDAttributes (html, options) {
  if (!options || options.removeDataVId) {
    // [-\w]+ will catch 1 or more instaces of a-z, A-Z, 0-9, hyphen (-), or underscore (_)
    const regex = / data-v-[-\w]+/g;

    // [' data-v-asdf=""', ' data-v-qwer', ' data-v-asdf']
    let dataVIds = html.match(regex) || [];
    // ['data-v-asdf', 'data-v-qwer', 'data-v-asdf']
    dataVIds = dataVIds.map(function (match) {
      return match.trim().replace('=""', '');
    });
    // ['data-v-asdf', 'data-v-qwer']
    dataVIds = Array.from(new Set(dataVIds));

    const $ = helpers.$(html);
    dataVIds.forEach(function (attribute) {
      $('[' + attribute + ']').removeAttr(attribute);
    });

    html = $.html();
  }
  return html;
}

/**
 * This removes all HTML comments from your snapshots.
 * Normal <!---->
 * Multi-line <!-- \n asdf \n asdf \n -->
 * Containing HTML <!-- <div></div> -->
 *
 * @param  {string} html     The markup being serialized
 * @param  {object} options  Options object for this serializer
 * @return {string}          Modified HTML string
 */
function removeAllComments (html, options) {
  if (options && options.removeComments) {
    // The best Stackoverflow has to offer.
    // Also removes a trailing newline if it exists.
    return html.replace(/(?=<!--)([\s\S]*?)-->(\n)?/g, '');
  }
  return html;
}

/**
 * Loops over the attributesToClear array to set the attribute
 * value to empty string on all matching elements.
 *
 * @param  {string} html     The markup being serialized
 * @param  {object} options  Options object for this serializer
 * @return {string}          Modified HTML string
 */
function clearAttributes (html, options) {
  if (
    options &&
    options.attributesToClear &&
    options.attributesToClear.length
  ) {
    const $ = helpers.$(html);
    options.attributesToClear.forEach(function (attribute) {
      $('[' + attribute + ']').attr(attribute, '');
    });

    return $.html();
  }
  return html;
}

/**
 * Performs all string manipulations on the rendered DOM
 * prior to formatting. Cheerio or regex string manipulation.
 *
 * @param  {string} html     The markup being serialized
 * @param  {object} options  Options object for this serializer
 * @return {string}          The markup being serialized
 */
function stringManipulation (html, options) {
  html = removeServerRenderedText(html, options);
  html = removeTestTokens(html, options);
  html = removeScopedStylesDataVIDAttributes(html, options);
  html = removeAllComments(html, options);
  html = clearAttributes(html, options);

  return html;
}

module.exports = stringManipulation;
