{if $hero_title || $hero_subtitle || $hero_button}
<section class="fc-hero">
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
{/if}

{if $offer1_title || $offer2_title || $offer3_title}
<section class="fc-section-beige">
  <div class="container">
    <div class="row">
      {if $offer1_title}
        <div class="col-md-4">
          <h3>{$offer1_title|escape:'htmlall':'UTF-8'}</h3>
          {if $offer1_text}<p>{$offer1_text|escape:'htmlall':'UTF-8'}</p>{/if}
        </div>
      {/if}
      {if $offer2_title}
        <div class="col-md-4">
          <h3>{$offer2_title|escape:'htmlall':'UTF-8'}</h3>
          {if $offer2_text}<p>{$offer2_text|escape:'htmlall':'UTF-8'}</p>{/if}
        </div>
      {/if}
      {if $offer3_title}
        <div class="col-md-4">
          <h3>{$offer3_title|escape:'htmlall':'UTF-8'}</h3>
          {if $offer3_text}<p>{$offer3_text|escape:'htmlall':'UTF-8'}</p>{/if}
        </div>
      {/if}
    </div>
  </div>
</section>
{/if}

{if $step1 || $step2 || $step3}
<section class="fc-steps">
  <div class="container">
    <h2>Jak działamy</h2>
    <div class="row">
      {if $step1}<div class="col-md-4"><p>{$step1|escape:'htmlall':'UTF-8'}</p></div>{/if}
      {if $step2}<div class="col-md-4"><p>{$step2|escape:'htmlall':'UTF-8'}</p></div>{/if}
      {if $step3}<div class="col-md-4"><p>{$step3|escape:'htmlall':'UTF-8'}</p></div>{/if}
    </div>
  </div>
</section>
{/if}

{if $cta_title || $cta_button}
<section class="fc-cta-dark">
  <div class="container">
    {if $cta_title}<h2>{$cta_title|escape:'htmlall':'UTF-8'}</h2>{/if}
    {if $cta_button}
      <a href="#kontakt" class="btn btn-primary">
        {$cta_button|escape:'htmlall':'UTF-8'}
      </a>
    {/if}
  </div>
</section>
{/if}
