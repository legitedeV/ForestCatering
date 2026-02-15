<footer id="kontakt" class="fc-footer" role="contentinfo">
  <div class="container">
    <div>
      <h2>ForestCatering</h2>
      <p>Smak, punktualność i obsługa premium dla biur, wydarzeń oraz planów zdjęciowych w Szczecinie i okolicach.</p>
    </div>
    <div>
      <h3>Kontakt</h3>
      {if isset($contact_infos) && ($contact_infos.phone || $contact_infos.email || $contact_infos.address.formatted)}
        <ul class="fc-contact-list">
          {if $contact_infos.phone}<li>Telefon: <a href="tel:{$contact_infos.phone|regex_replace:'/\s+/':''|escape:'htmlall':'UTF-8'}">{$contact_infos.phone|escape:'htmlall':'UTF-8'}</a></li>{/if}
          {if $contact_infos.email}<li>E-mail: <a href="mailto:{$contact_infos.email|escape:'htmlall':'UTF-8'}">{$contact_infos.email|escape:'htmlall':'UTF-8'}</a></li>{/if}
          {if $contact_infos.address.formatted}<li>Adres: {$contact_infos.address.formatted nofilter}</li>{/if}
        </ul>
      {else}
        <p>Uzupełnij dane kontaktowe w Panelu Administracyjnym → Kontakt.</p>
      {/if}
    </div>
  </div>
</footer>
