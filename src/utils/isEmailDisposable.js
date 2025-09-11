const disposableDomains = require('disposable-email-domains');

exports.isDisposableEmail = (email) => {
  const domain = email.split('@')[1].toLowerCase();
  return disposableDomains.includes(domain);
}