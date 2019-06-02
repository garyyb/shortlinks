goog.module('shortlinks.popup.popup');

const {ShortlinkMessenger} = goog.require('shortlinks.util.messenger');
const MDCTextField = mdc.textField.MDCTextField;

const {canonicalize, stripScheme} = goog.require('shortlinks.util.canonicalize');

nunjucks.configure('templates', {autoescape: true});

function renderPage() {
  document.body.innerHTML = nunjucks.render('addForm.njk');
  const linkTextfield = 
      new MDCTextField(document.getElementById('shortlink-textfield'));
  const resultTextField = 
      new MDCTextField(document.getElementById('result-textfield'));
  const linkInput = document.getElementById('shortlink-input');
  const resultInput = document.getElementById('result-input');
  const addButton = document.getElementById('add-button');

  /** Enable the add button upon both fields being nonempty. */
  const inputListener = () => {
    if (linkTextfield.value && resultTextField.value) {
      addButton.disabled = false;
    } else {
      addButton.disabled = true;
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
  
  const tabs = browser.tabs.query({currentWindow: true, active: true});
  tabs.then(tabs => resultTextField.value = tabs[0].url);

  const submitAddForm = () => {
    ShortlinkMessenger.
        sendAddMessage(linkTextfield.value, resultTextField.value).then(
      () => {},
      (reason) => {
        console.log('Shortlinks: adding shortlink failed with reason ' + 
                     reason);
      }
    );
  }

  addButton.addEventListener('click', submitAddForm);
}

renderPage();