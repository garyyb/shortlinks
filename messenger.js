/** 
 * Enum like object which defines possible message types. Note that we can't
 * use the Symbol type for Enum values, as they aren't cloneable. 
 */
const MessageType = Object.freeze({
  ADD    : 1,
  DELETE : 2
});

class ShortlinkMessenger {
  /**
   * @param {string} shortlink The shortlink to add. Should exclude the url
   *                           scheme.
   * @param {string} result The url string to map the shortlink to.
   * @returns {Promise} Promise which is resolved with no message if the add was
   *                    successful, or rejected with a reason if it wasn't. 
   */
  sendAddMessage(shortlink, result) {
    return browser.runtime.sendMessage({
      messageType: MessageType.ADD,
      shortlink: shortlink,
      result: result
    });
  }

  /**
   * @param {string} shortlink The shortlink to delete.
   * @return {Promise} Promise which is resolved with no message id the delete
   *                   was successful, or rejected with a reason if it wasn't.
   */
  sendDeleteMessage(shortlink) {
    return browser.runtime.sendMessage({
      messageType: MessageType.DELETE,
      shortlink: shortlink
    });
  }
}