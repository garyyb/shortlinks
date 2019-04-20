goog.module('shortlinks.options.options');

const {ShortlinkMessenger} = goog.require('shortlinks.util.messenger');
const MDCDialog = mdc.dialog.MDCDialog;
const MDCSnackbar = mdc.snackbar.MDCSnackbar;
const MDCTextField = mdc.textField.MDCTextField;

const {canonicalize, stripScheme} = goog.require('shortlinks.util.canonicalize');

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
  document.getElementById('add-button').addEventListener('click', () => {
    dialog.open();
  });

  const linkTextfield = 
      new MDCTextField(document.getElementById('shortlink-textfield'));
  const resultTextField = 
      new MDCTextField(document.getElementById('result-textfield'));
  const linkInput = document.getElementById('shortlink-input');
  const resultInput = document.getElementById('result-input');
  const dialogAddButton = document.getElementById('dialog-add-button');

  /** Enable the add button upon both fields being nonempty. */
  const inputListener = () => {
    if (linkTextfield.value && resultTextField.value) {
      dialogAddButton.disabled = false;
    } else {
      dialogAddButton.disabled = true;
    }
  }

  /** 
   * Appends a slash to shortlinks to transparently show users what their
   * shortlink will become (eg, m => m/).
   */
  const appendSlashListener = () => {
    if (linkTextfield.value) {
      linkTextfield.value = stripScheme(canonicalize(linkTextfield.value));
    }
  }

  linkInput.addEventListener('change', inputListener);
  linkInput.addEventListener('change', appendSlashListener);
  resultInput.addEventListener('change', inputListener);

  const successSnackbar = 
      new MDCSnackbar(document.getElementById('success-snackbar'));
  const failureSnackbar = 
      new MDCSnackbar(document.getElementById('failure-snackbar'));

  /** 
   * Tries to submit the add form. Closes the dialog if sucessful, otherwise
   * displays an error.
   */
  const submitAddForm = () => {
    ShortlinkMessenger.
        sendAddMessage(linkTextfield.value, resultTextField.value).then(
      () => {
        successSnackbar.open();
        dialog.close();
        linkTextfield.value = '';
        resultTextField.value = '';
      },
      (reason) => {
        failureSnackbar.labelText = 'Failed to add shortlink: ' + reason;
        failureSnackbar.open();
      }
    )
  }

  dialogAddButton.addEventListener('click', submitAddForm);
}

renderPage().then(() => {
  // Do any additional page setup, now that the page has finished rendering.
  setupAddDialog()
});