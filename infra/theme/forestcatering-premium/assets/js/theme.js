(() => {
  const root = document.documentElement;
  const switcher = document.querySelector('[data-pill-switch]');
  const options = Array.from(document.querySelectorAll('[data-brand-option]'));
  const sets = document.querySelectorAll('[data-brand-set]');
  const copyMap = {
    catering: {
      kicker: 'ForestCatering Premium',
      title: 'Catering, który wzmacnia koncentrację zespołu i podnosi standard każdego wydarzenia.',
      subtitle: 'Od śniadań biznesowych po kolacje bankietowe — gotujemy sezonowo, serwujemy punktualnie i dbamy o każdy detal obsługi.',
      cta_main: 'Poznaj pakiety cateringowe',
      cta_secondary: 'Zobacz ofertę ForestBar',
      bar_section: 'ForestBar to mobilny koncept koktajlowy dla premier, wesel i eventów korporacyjnych. Zapewniamy bar, szkło, lód, składniki oraz zespół, który prowadzi obsługę płynnie, elegancko i bez kolejek.'
    },
    bar: {
      kicker: 'ForestBar by ForestCatering',
      title: 'Mobilny bar koktajlowy, który zamienia wydarzenie w wieczór premium.',
      subtitle: 'Przyjeżdżamy z pełnym wyposażeniem, autorską kartą koktajli i zespołem barmańskim gotowym obsłużyć gości bez kompromisów jakości.',
      cta_main: 'Sprawdź pakiety ForestBar',
      cta_secondary: 'Wróć do cateringu firmowego',
      bar_section: 'ForestBar zapewnia profesjonalny serwis koktajlowy na galach, premierach i eventach prywatnych. Koncepcję baru dopasowujemy do scenariusza wydarzenia oraz identyfikacji marki.'
    }
  };

  function setBrand(brand) {
    root.setAttribute('data-brand', brand);
    localStorage.setItem('fc_brand_mode', brand);
    document.cookie = `fc_brand_mode=${brand};path=/;max-age=31536000;samesite=lax`;
    options.forEach((option) => {
      const isActive = option.dataset.brandOption === brand;
      option.setAttribute('aria-selected', String(isActive));
      option.tabIndex = isActive ? 0 : -1;
    });
    sets.forEach((set) => set.classList.toggle('is-hidden', set.dataset.brandSet !== brand));
    Object.entries(copyMap[brand]).forEach(([key, value]) => {
      document.querySelectorAll(`[data-copy="${key}"]`).forEach((node) => (node.textContent = value));
    });
  }

  const cookieBrand = (document.cookie.match(/(?:^|; )fc_brand_mode=(bar|catering)/) || [])[1];
  const stored = localStorage.getItem('fc_brand_mode') || cookieBrand;
  setBrand(stored === 'bar' ? 'bar' : 'catering');

  if (switcher) {
    switcher.addEventListener('click', (event) => {
      const target = event.target.closest('[data-brand-option]');
      if (target) setBrand(target.dataset.brandOption);
    });
    switcher.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const current = root.getAttribute('data-brand') || 'catering';
      const next = current === 'catering' ? 'bar' : 'catering';
      setBrand(next);
      event.preventDefault();
    });
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
  } else {
    document.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-visible'));
  }
})();
