import type { RegisteredComponent } from '@builder.io/sdk-react-nextjs';

function Placeholder({ text }: { text?: string }) {
  return null;
}

export const registeredComponents: RegisteredComponent[] = [
  {
    component: Placeholder,
    name: 'HeroSimple',
    inputs: [
      { name: 'heading', type: 'string', defaultValue: 'Welcome to Forest Hub' },
      { name: 'subheading', type: 'string', defaultValue: '' },
      { name: 'backgroundImage', type: 'file', allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'] },
      { name: 'ctaText', type: 'string', defaultValue: 'Dowiedz się więcej' },
      { name: 'ctaLink', type: 'url', defaultValue: '/kontakt' },
    ],
  },
  {
    component: Placeholder,
    name: 'ServicesGrid',
    inputs: [
      { name: 'heading', type: 'string', defaultValue: 'Nasze usługi' },
      {
        name: 'services',
        type: 'list',
        subFields: [
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'icon', type: 'string' },
          { name: 'link', type: 'url' },
        ],
      },
    ],
  },
  {
    component: Placeholder,
    name: 'TestimonialsCarousel',
    inputs: [
      { name: 'heading', type: 'string', defaultValue: 'Opinie naszych klientów' },
      {
        name: 'testimonials',
        type: 'list',
        subFields: [
          { name: 'author', type: 'string' },
          { name: 'role', type: 'string' },
          { name: 'quote', type: 'longText' },
          { name: 'avatar', type: 'file', allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'] },
        ],
      },
    ],
  },
  {
    component: Placeholder,
    name: 'ContactForm',
    inputs: [
      { name: 'heading', type: 'string', defaultValue: 'Skontaktuj się z nami' },
      { name: 'description', type: 'string', defaultValue: '' },
      { name: 'submitLabel', type: 'string', defaultValue: 'Wyślij' },
    ],
  },
  {
    component: Placeholder,
    name: 'GalleryGrid',
    inputs: [
      { name: 'heading', type: 'string', defaultValue: 'Galeria' },
      {
        name: 'images',
        type: 'list',
        subFields: [
          { name: 'image', type: 'file', allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'] },
          { name: 'alt', type: 'string' },
          { name: 'caption', type: 'string' },
        ],
      },
    ],
  },
  {
    component: Placeholder,
    name: 'CTABanner',
    inputs: [
      { name: 'heading', type: 'string', defaultValue: 'Gotowy na niezapomniane wydarzenie?' },
      { name: 'description', type: 'string', defaultValue: '' },
      { name: 'ctaText', type: 'string', defaultValue: 'Zapytaj o ofertę' },
      { name: 'ctaLink', type: 'url', defaultValue: '/kontakt' },
      { name: 'variant', type: 'enum', enum: ['default', 'dark', 'accent'], defaultValue: 'default' },
    ],
  },
];
