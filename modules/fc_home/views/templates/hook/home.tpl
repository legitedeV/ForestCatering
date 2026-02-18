<section class="fc-hero" style="padding:120px 0;text-align:center;">
  <div class="container">
    {if $hero_title}
      <h1>{$hero_title|escape:'htmlall':'UTF-8'}</h1>
    {/if}

    {if $hero_subtitle}
      <p>{$hero_subtitle|escape:'htmlall':'UTF-8'}</p>
    {/if}

    {if $hero_button}
      <a href="#kontakt" class="btn btn-primary">
        {$hero_button|escape:'htmlall':'UTF-8'}
      </a>
    {/if}
  </div>
</section>
