const html = document.documentElement;
const langBtn = document.getElementById('languageToggle');
const langFlag = document.getElementById('languageFlag');
const langMenu = document.getElementById('languageMenu');
const navCard = document.getElementById('navCard');
const menuToggle = document.getElementById('menuToggle');
const flags = { nl: 'nlflag.svg', en: 'uk.svg', ar: 'arflag.svg' };
const flagAlt = { nl: 'Nederlands', en: 'English', ar: 'العربية' };

function currentLang(){ return localStorage.getItem('glansoraLang') || 'nl'; }

function setLanguage(lang){
  localStorage.setItem('glansoraLang', lang);
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-nl]').forEach((el)=>{
    const value = el.dataset[lang];
    if(value !== undefined) el.innerHTML = value;
  });

  document.querySelectorAll('[data-nl-placeholder]').forEach((el)=>{
    const value = el.dataset[`${lang}Placeholder`];
    if(value !== undefined) el.placeholder = value;
  });

  document.querySelectorAll('.language-option').forEach((btn)=>{
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if(langFlag){
    langFlag.src = flags[lang] || flags.nl;
    langFlag.alt = flagAlt[lang] || 'Nederlands';
  }
  langMenu?.classList.remove('open');
  document.body.classList.remove('lang-open');
}

function closeNav(){
  navCard?.classList.remove('open');
  document.body.classList.remove('menu-open');
}

document.addEventListener('DOMContentLoaded',()=>{
  setLanguage(currentLang());

  langBtn?.addEventListener('click',(e)=>{
    e.preventDefault();
    langMenu?.classList.toggle('open');
    document.body.classList.toggle('lang-open', langMenu?.classList.contains('open'));
  });

  document.querySelectorAll('.language-option').forEach((btn)=>{
    btn.addEventListener('click',()=> setLanguage(btn.dataset.lang));
  });

  menuToggle?.addEventListener('click',()=>{
    navCard?.classList.toggle('open');
    document.body.classList.toggle('menu-open', navCard?.classList.contains('open'));
  });

  document.addEventListener('click',(e)=>{
    if(langMenu && !e.target.closest('.language')){
      langMenu.classList.remove('open');
      document.body.classList.remove('lang-open');
    }
    if(navCard && menuToggle && !e.target.closest('.nav-card') && !e.target.closest('.menu-toggle')){
      closeNav();
    }
  });

  document.querySelectorAll('.nav-links a').forEach((link)=>{
    link.addEventListener('click', closeNav);
  });

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: .08});
  document.querySelectorAll('.reveal').forEach((el)=>observer.observe(el));

  document.querySelectorAll('form[data-web3forms]').forEach((form)=>{
    const message = form.querySelector('.form-message');
    form.addEventListener('submit', async (event)=>{
      event.preventDefault();
      const key = form.querySelector('input[name="access_key"]')?.value || '';
      if(!key || key.includes('YOUR_')){
        if(message){
          message.textContent = currentLang()==='en' ? 'This form is not connected yet.' : currentLang()==='ar' ? 'النموذج غير مربوط بعد.' : 'Formulier is nog niet gekoppeld aan Web3Forms.';
          message.className = 'form-message error';
        }
        return;
      }
      const button = form.querySelector('button[type="submit"]');
      const oldText = button?.textContent;
      if(button) button.textContent = currentLang()==='en' ? 'Sending...' : currentLang()==='ar' ? 'جارٍ الإرسال...' : 'Versturen...';
      try{
        const response = await fetch('https://api.web3forms.com/submit', { method:'POST', body:new FormData(form) });
        const data = await response.json();
        if(!data.success) throw new Error('submit failed');
        form.reset();
        setLanguage(currentLang());
        if(message){
          message.textContent = currentLang()==='en' ? 'Thanks. Your message has been sent.' : currentLang()==='ar' ? 'شكراً. تم إرسال رسالتك.' : 'Bedankt. Uw bericht is verzonden.';
          message.className = 'form-message success';
        }
      }catch(error){
        if(message){
          message.textContent = currentLang()==='en' ? 'Sending failed. Please call or email us.' : currentLang()==='ar' ? 'تعذر الإرسال. يرجى الاتصال أو إرسال بريد إلكتروني.' : 'Verzenden lukt niet. Bel of mail ons direct.';
          message.className = 'form-message error';
        }
      }
      if(button) button.textContent = oldText;
    });
  });
});
