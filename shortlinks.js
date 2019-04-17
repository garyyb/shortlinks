/** Manages shortlinks, storing them, updating them, and setting redirects. */
class ShortlinkManager {
  constructor() {
    this.shortlinks = new Map();
    this.listener = null;

    this.setInstallationListener_();
    this.setStorageChangedListener_();
    this.syncShortlinks_();
  }

  /**
   * @param {string} shortlink The shortlink. Should exclude the url scheme.
   * @param {string} result The url string to map the shortlink to.
   */
  addShortlink(shortlink, result) {
    console.log('Shortlinks: Adding Shortlink: ' + shortlink + ': ' + result);
    browser.storage.sync.set({[shortlink]: result}).catch(
      reason => console.log('Shortlinks: Failed to add shortlink ' +
        shortlink + ': '  + result + ' to sync storage. Reason: ' + reason));
  }

  /**
   * Sets the listener for the onInstalled event, to set some sane default
   * configurations for a new user.
   */
  setInstallationListener_() {
    /**
     * Listener for when the extension is installed or updated. Sets the default
     * shortlinks so the user can get started quickly, without configuration.
     * @param {Object} details Contains information about this installation.
     */
    const installationListener = (details) => {
      const defaultShortlinks = new Map([
        ['http://c/', 'https://calendar.google.com/'],
        ['http://m/', 'https://mail.google.com/']
      ]);

      // Only set default shortlinks if this is the first time the extension
      // was installed.
      console.log('Shortlinks: Install detected with reason ' + details.reason);
      if (details.reason === 'install') {
        // Only set default shortlinks if there are no shortlinks already
        // present in sync storage (if there is, this extension was already
        // installed on a different device).
        this.isSyncStorageEmpty_().then(
          isEmpty => {
            if (!isEmpty) return;
            defaultShortlinks.forEach((value, key, _) => {
              this.addShortlink(key, value);
            });
          }, 
          reason => console.log('Shortlinks: Fetching sync storage bytes in \
            use failed with reason: ' + reason));
      }
    }
  
    browser.runtime.onInstalled.addListener(installationListener);
  }

  /**
   * Sets a listener for the contents of sync storage changing, indicating that
   * shortlinks mappings have changed.
   */
  setStorageChangedListener_() {
    /**
     * @param {Object} changes Object describing the change. 
     * @param {string} areaName The name of the storage area changed.
     */
    const storageListener = (changes, areaName) => {
      // TODO: Utilize changes object instead of reloading the whole Map. See
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged#Parameters.
      if (areaName === 'sync') {
        console.log('Shortlinks: Detected change in shortlinks.');
        this.syncShortlinks_();
      }
    };

    browser.storage.onChanged.addListener(storageListener);
  }

  /**
   * Checks if sync storage is empty.
   * @returns {Promise} Promise fulfilled with a boolean indicating if sync
   *                    storage is empty. 
   */
  isSyncStorageEmpty_() {
    return new Promise((resolve, reject) => {
      browser.storage.sync.get(null).then(
        results => resolve(Object.entries(results).length === 0), 
        reason => reject(reason));
    });
  }

  /**
   * Synchronizes shortlinks from sync storage. Can be used as a listener for
   * onStorageChanged event.
   */
  syncShortlinks_() {
    browser.storage.sync.get(null).then(
      results => {
        console.log('Shortlinks: Syncing shortlinks: ');
        console.log(results);
        this.shortlinks = new Map(Object.entries(results));
        if (this.shortlinks.size > 0) this.updateRequestListener_();
      },
      reason => console.log('Shortlinks: Failed to sync shortlinks with \
        reason: ' + reason));
  }

  /**
   * Clears the old request listener if it exists, and sets a new one with all
   * the shortlinks stored in sync storage. 
   */
  updateRequestListener_() {
    if (this.listener !== null) {
      browser.webRequest.onBeforeRequest.removeListener(this.listener);
    }

    this.listener = (requestDetails) => {
      const shortlink = requestDetails.url;
      console.log('Shortlinks: Detected Shortlink: ' + shortlink);
      return {
        redirectUrl: this.shortlinks.get(shortlink)
      };
    }

    browser.webRequest.onBeforeRequest.addListener(
      this.listener,
      {urls: [...this.shortlinks.keys()]},
      ['blocking']
    );
  }
}

const manager = new ShortlinkManager();