goog.module('shortlinks.options.options');

const {ShortlinkMessenger} = goog.require('shortlinks.util.messenger');
const MDCDialog = mdc.dialog.MDCDialog;

nunjucks.configure('templates', {autoescape: true});

/**
 * Renders the page with a list of shortlinks.
 * @returns {Promise} Resolved when page is finished loading, or rejected if
 *                    there was an error in loading the page.
 */
async function renderPage() {
  try {
    const shortlinks = await ShortlinkMessenger.sendFetchMessage();
    document.body.innerHTML =
      nunjucks.render('body.njk', { shortlinks: shortlinks });
  } catch (reason) {
    console.log('Shortlinks: Fetching shortlinks failed with reason: '
      + reason);
  }
}

/**
 * Sets up the add shortlink dialog.
 */
function setupAddDialog() {
  const dialog = new MDCDialog(document.getElementById('add-dialog'));
  const button = document.getElementById('add-button');
  button.addEventListener('click', () => {
    dialog.open();
  });
}

renderPage().then(() => {
  // Do any additional page setup, now that the page has finished rendering.
  setupAddDialog()
});