goog.module('shortlinks.options.options');

nunjucks.configure('templates', {autoescape: true});

/**
 * Renders the list of shortlinks for configuration.
 */
function renderList() {
  const shortlinks = {
    'c/': 'calendar.google.com',
    'm/': 'mail.google.com'
  };
  document.body.innerHTML = nunjucks.render('body.njk', {shortlinks: shortlinks}); 
}

renderList();