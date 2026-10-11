(() => {
  const languages = Object.keys(clipProTranslations);
  const page = document.body.dataset.page;
  const currentURL = new URL(location.href);
  const selector = document.getElementById('language');
  const storageKey = 'clippro-website-language';

  function matchLanguage(value) {
    if (!value) return null;
    const tag = value.toLowerCase();
    const exact = languages.find(language => language.toLowerCase() === tag);
    if (exact) return exact;
    if (tag.startsWith('zh')) {
      return /(?:hant|tw|hk|mo)(?:-|$)/.test(tag) ? 'zh-Hant' : 'zh-Hans';
    }
    return languages.find(language => language === tag.split('-')[0]) || null;
  }

  let savedLanguage;
  try { savedLanguage = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
  const requestedLanguage = matchLanguage(currentURL.searchParams.get('lang'));
  const browserLanguage = (navigator.languages || [navigator.language])
    .map(matchLanguage).find(Boolean);
  const initialLanguage = requestedLanguage || matchLanguage(savedLanguage) || browserLanguage || 'en';

  function render(language) {
    const content = clipProTranslations[language];
    const ui = content.ui;
    const link = (href, label) => `<a href="${href}">${label}</a>`;
    const replacements = {
      operator: '<strong>郑志勇</strong>',
      email: link('mailto:zzy13692563075@gmail.com', 'zzy13692563075@gmail.com'),
      privacy: link('privacy.html', ui.privacy),
      eula: link('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/', ui.eula),
      applePrivacy: link('https://www.apple.com/legal/privacy/', ui.applePrivacy),
      githubPrivacy: link('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', ui.githubPrivacy),
      appleSubscriptions: link('https://apps.apple.com/account/subscriptions', ui.appleSubscriptions),
      appleRefund: link('https://reportaproblem.apple.com/', ui.appleRefund)
    };
    document.documentElement.lang = language;
    document.querySelectorAll('[data-ui]').forEach(element => {
      element.innerHTML = ui[element.dataset.ui];
    });
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const [documentName, index] = element.dataset.i18n.split('.');
      element.innerHTML = content[documentName][index].replace(/\{(\w+)\}/g, (_, key) => replacements[key]);
    });
    document.querySelectorAll('[data-heading]').forEach(element => {
      element.textContent = document.getElementById(element.dataset.heading).querySelector('h2').textContent;
    });
    document.querySelector('header nav').setAttribute('aria-label', ui.nav);
    const aside = document.querySelector('aside');
    if (aside) aside.setAttribute('aria-label', ui.toc);
    document.querySelectorAll('main img').forEach(element => { element.alt = ui.icon; });
    selector.setAttribute('aria-label', ui.language);
    selector.value = language;
    document.title = `${page === 'index' ? ui.homeTitle : ui[page]} · ClipPro`;
    document.querySelector('meta[name="description"]').content =
      page === 'index' ? ui.homeIntro.replace(/<br>/g, ' ') : content[page][0];

    // Absolute paths also keep the earlier /privacy/ and /terms/ URLs working.
    const base = new URL(document.querySelector('header .brand').getAttribute('href'), location.href);
    document.querySelectorAll('a[href]').forEach(element => {
      const href = element.getAttribute('href');
      if (href.startsWith('#')) return;
      const destination = new URL(href, base);
      if (destination.origin === location.origin) {
        destination.searchParams.set('lang', language);
        element.href = destination.href;
      }
    });
  }

  selector.addEventListener('change', () => {
    const language = selector.value;
    try { localStorage.setItem(storageKey, language); } catch { /* Storage is optional. */ }
    currentURL.searchParams.set('lang', language);
    history.replaceState(null, '', currentURL);
    render(language);
  });
  render(initialLanguage);
})();
