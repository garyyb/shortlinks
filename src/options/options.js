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

/** Sets up the add shortlink dialog. */
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
      new MDCSnackbar(document.getElementById('add-success-snackbar'));
  const failureSnackbar = 
      new MDCSnackbar(document.getElementById('add-failure-snackbar'));

  /** 
   * Tries to submit the add form. Closes the dialog if sucessful, otherwise
   * displays an error.
   */
  const submitAddForm = () => {
    ShortlinkMessenger.
        sendAddMessage(linkTextfield.value, resultTextField.value).then(
      () => {
        refreshShortlinks();
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

/** 
 * Refreshes shortlinks and rerenders the list. 
 * @returns {Promise} Resolved when list has been rerendered, or rejected if
 *                    there was an error in fetching updated shortlinks.
 */
async function refreshShortlinks() {
  const shortlinks = await ShortlinkMessenger.sendFetchMessage();
  const oldList = document.getElementById('shortlinks-list');
  const newList = 
      nunjucks.render('shortlinksList.njk', { shortlinks: shortlinks }).trim();
  
  const template = document.createElement('template');
  template.innerHTML = newList;

  oldList.replaceWith(template.content.firstChild);
  setupDeleteButtons();
}

/** Sets up the refresh button in the shortlink list. */
function setupRefreshButton() {
  const refreshButton = document.getElementById('refresh-button');
  const successSnackbar = 
      new MDCSnackbar(document.getElementById('refresh-success-snackbar'));
  const failureSnackbar = 
      new MDCSnackbar(document.getElementById('refresh-failure-snackbar'));
  refreshButton.addEventListener('click', () => {
    refreshShortlinks().then(
      () => successSnackbar.open(),
      (reason) => {
        failureSnackbar.labelText = 'Failed to refresh shortlinks: ' + reason;
        failureSnackbar.open();
      }
    );
  });
}

/** Sets up the delete shortlink buttons in the shortlink list. */
function setupDeleteButtons() {
  const successSnackbar = 
      new MDCSnackbar(document.getElementById('delete-success-snackbar'));
  const failureSnackbar = 
      new MDCSnackbar(document.getElementById('delete-failure-snackbar'));
  
  const onSuccessfulDelete = () => {
    refreshShortlinks();
    successSnackbar.open();
  }

  const onFailedDelete = (reason) => {
    failureSnackbar.labelText = 'Failed to delete shortlink: ' + reason;
    failureSnackbar.open();
  }

  const deleteButtons = 
      Array.from(document.querySelectorAll('.shortlink-delete'));
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      ShortlinkMessenger.sendDeleteMessage(button.dataset.toDelete)
                        .then(onSuccessfulDelete, onFailedDelete);
    });
  });
}

renderPage().then(() => {
  // Do any additional page setup, now that the page has finished rendering.
  setupAddDialog();
  setupRefreshButton();
  setupDeleteButtons();
});