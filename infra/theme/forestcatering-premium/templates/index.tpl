{extends file='parent:page.tpl'}

{block name='page_content_container'}
<section class="fc-hero" id="top">
  <div class="fc-rain" aria-hidden="true"></div>
  <div class="container fc-hero-grid">
    <div>
      <p class="fc-kicker" data-copy="kicker">ForestCatering Premium</p>
      <h1 data-copy="title">Catering, który wzmacnia koncentrację zespołu i podnosi standard każdego wydarzenia.</h1>
      <p class="fc-sub" data-copy="subtitle">Od śniadań biznesowych po kolacje bankietowe — gotujemy sezonowo, serwujemy punktualnie i dbamy o każdy detal obsługi.</p>
      <div class="fc-cta-row">
        <a class="btn btn-primary" href="#pakiety" data-copy="cta_main">Poznaj pakiety cateringowe</a>
        <a class="btn btn-secondary" href="#forestbar" data-copy="cta_secondary">Zobacz ofertę ForestBar</a>
      </div>
    </div>
    <div class="fc-hero-art" aria-hidden="true">
      {include file='_partials/hero-suit.tpl'}
    </div>
  </div>
</section>

<section class="fc-section reveal" id="oferta">
  <div class="container">
    <h2>Catering firmowy i eventowy — Szczecin i okolice</h2>
    <p>Realizujemy regularne dostawy do biur, obsługę konferencji, eventów plenerowych oraz planów produkcyjnych. Każde menu budujemy pod charakter wydarzenia, potrzeby dietetyczne i harmonogram dnia.</p>
  </div>
</section>

<section class="fc-section fc-cards reveal" id="pakiety">
  <div class="container">
    <h2>Pakiety: Lunch / Bankiet / Regeneracyjne / Dla ekip</h2>
    <div class="fc-card-grid" data-brand-set="catering">
      <article class="fc-card"><h3>Lunch biznesowy</h3><p>Codzienne zestawy dla zespołów 10–300 osób. Opcje klasyczne, wege i high-protein.</p></article>
      <article class="fc-card"><h3>Bankiet premium</h3><p>Finger food, live stations i serwis kelnerski dla premier produktów i gali.</p></article>
      <article class="fc-card"><h3>Regeneracyjne</h3><p>Posiłki na nocne zmiany, eventy sportowe i produkcje wymagające stałej energii.</p></article>
      <article class="fc-card"><h3>Dla ekip</h3><p>Pakiety terenowe z logistyką „on time” dla ekip montażowych i technicznych.</p></article>
    </div>
    <div class="fc-card-grid is-hidden" data-brand-set="bar">
      <article class="fc-card"><h3>Klasyki koktajlowe</h3><p>Profesjonalny bar z autorską kartą klasyków i nowoczesnych interpretacji.</p></article>
      <article class="fc-card"><h3>Signature menu</h3><p>Koktajle projektowane pod motyw przewodni wieczoru, kolorystykę i sezon.</p></article>
      <article class="fc-card"><h3>Bar bezalkoholowy</h3><p>Mocktaile premium dla wydarzeń rodzinnych, firmowych i kampanii wellbeing.</p></article>
      <article class="fc-card"><h3>Show barmański</h3><p>Interaktywna obsługa baru z kulturą pracy premium i estetyką fine service.</p></article>
    </div>
  </div>
</section>

<section class="fc-section reveal" id="forestbar">
  <div class="container">
    <h2>ForestBar — mobilny bar i koktajle</h2>
    <p data-copy="bar_section">ForestBar to mobilny koncept koktajlowy dla premier, wesel i eventów korporacyjnych. Zapewniamy bar, szkło, lód, składniki oraz zespół, który prowadzi obsługę płynnie, elegancko i bez kolejek.</p>
  </div>
</section>

<section class="fc-section fc-steps reveal" id="jak-zamawiamy">
  <div class="container">
    <h2>Jak zamawiamy</h2>
    <ol>
      <li><strong>Konsultacja 15 minut.</strong> Ustalamy liczbę gości, charakter wydarzenia i preferencje dietetyczne.</li>
      <li><strong>Menu i wycena.</strong> W 24h otrzymujesz konkretną propozycję wariantów wraz z logistyką dostawy.</li>
      <li><strong>Realizacja i serwis.</strong> Przyjeżdżamy punktualnie, rozstawiamy stanowiska i dbamy o ciągłość serwisu.</li>
    </ol>
  </div>
</section>

<section class="fc-section reveal" id="opinie">
  <div class="container">
    <h2>Zaufali nam</h2>
    <ul class="fc-trust-list">
      <li>„Zespół ForestCatering uratował tempo naszego całodniowego szkolenia — zero opóźnień, pełna kultura serwisu.”</li>
      <li>„ForestBar podniósł poziom premiery produktu: świetna organizacja, estetyka i znakomite koktajle bezalkoholowe.”</li>
      <li>„Przy realizacji planu zdjęciowego liczyła się punktualność i elastyczność. Wszystko dowiezione idealnie.”</li>
    </ul>
  </div>
</section>

<section class="fc-section reveal" id="faq">
  <div class="container">
    <h2>FAQ</h2>
    <details><summary>Na jakim obszarze realizujecie dostawy?</summary><p>Działamy w Szczecinie oraz okolicach do 60 km. Przy większych eventach obsługujemy również dalsze lokalizacje po wcześniejszym uzgodnieniu.</p></details>
    <details><summary>Czy przygotowujecie menu wegetariańskie i bezglutenowe?</summary><p>Tak. Każdy pakiet możemy skonfigurować pod diety: wege, bez laktozy, bez glutenu oraz preferencje sportowe.</p></details>
    <details><summary>Jak szybko można zrealizować zamówienie?</summary><p>Standardowo potrzebujemy 48 godzin, a dla stałych klientów utrzymujemy również szybkie sloty realizacyjne.</p></details>
    <details><summary>Czy ForestBar zapewnia pełne wyposażenie?</summary><p>Tak. Dostarczamy mobilny bar, szkło, lód, składniki, dekoracje i pełną obsługę barmańską.</p></details>
    <details><summary>Czy oferujecie faktury i stałe umowy dla firm?</summary><p>Tak. Obsługujemy jednorazowe eventy i abonamentowe dostawy firmowe z rozliczeniem miesięcznym.</p></details>
    <details><summary>Czy pomagacie dobrać liczbę porcji?</summary><p>Tak. Analizujemy harmonogram wydarzenia i rekomendujemy bezpieczne widełki porcji, aby uniknąć niedoborów i nadwyżek.</p></details>
  </div>
</section>
{/block}
