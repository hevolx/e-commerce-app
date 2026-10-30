/**
 * True when the request comes from a browser (page navigation or form post)
 * rather than an API client, so the response should be a page or a redirect.
 */
const wantsHtml = (req) => req.accepts(['json', 'html']) === 'html';

module.exports = wantsHtml;
