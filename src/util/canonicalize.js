goog.module('shortlinks.util.canonicalize');

/**
 * Canonicalizes shortlinks and result links into a consistent form. Does this
 * as follows:
 * 1. If the link doesn't contain a https?:// scheme, prepends http:// to it.
 * 2. If the link doesn't contain a '/' (excluding the scheme component),
 *    appends a '/' to it. 
 * @param {string} link The link to canonicalize.
 * @returns {string} Canonicalized link.
 */
function canonicalize(link) {
  let canonicalized = link;
  if (link.match(/^https?:\/\//i) === null) {
    canonicalized = 'http://' + canonicalized;
    if (link.indexOf('/') === -1) {
      canonicalized = canonicalized + '/';
    }
  } else if (link.match(/^https?:\/\/.*\//i) === null) {
    canonicalized = canonicalized + '/';
  }
  return canonicalized;
}

/**
 * Strips a string canonicalized by canonicalize of its scheme.
 * @param {string} canonicalized Canonicalized link.
 * @return {string} Stripped link.
 */
function stripScheme(canonicalized) {
  return canonicalized.replace(/^https?:\/\//i, '');
}

exports = {canonicalize, stripScheme};