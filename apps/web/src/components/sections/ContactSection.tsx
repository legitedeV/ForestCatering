'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import GradientText from '@/components/ui/GradientText';

const serviceOptions = [
  'Wesele',
  'Event firmowy',
  'Catering dzienny',
  'Bar mobilny',
  'Chrzciny / Komunia',
  'Inne',
];

async function submitContactForm(formData: FormData) {
  // Server action placeholder — logs form data for now
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    serviceType: formData.get('serviceType'),
    eventDate: formData.get('eventDate'),
    guestCount: formData.get('guestCount'),
    message: formData.get('message'),
  };
  // eslint-disable-next-line no-console
  console.log('[ContactSection] Form submitted:', data);
}

const contactInfo = [
  { icon: '📞', label: 'Telefon', value: '+48 123 456 789' },
  { icon: '✉️', label: 'Email', value: 'kontakt@foresthub.pl' },
  { icon: '📍', label: 'Adres', value: 'Szczecin, Polska' },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!infoRef.current) return;

    const items = infoRef.current.querySelectorAll('.contact-info-item');

    const ctx = gsap.context(() => {
      gsap.from(items, {
        x: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: infoRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const inputClasses =
    'w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/20 focus:border-[var(--color-accent)]/40 focus:bg-white/[0.06]';

  return (
    <section
      id="kontakt"
      ref={sectionRef}
      className="section-spacing"
      style={{ backgroundColor: '#0D1F15' }}
    >
      <div className="container-site">
        {/* Heading */}
        <div className="mb-16 text-center md:mb-24">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              display: 'inline-block',
            }}
          >
            <GradientText as="h2">
              Porozmawiajmy
            </GradientText>
          </span>
        </div>

        <div className="grid gap-16 lg:grid-cols-[1fr_auto]">
          {/* Contact Form */}
          <form action={submitContactForm} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="sr-only">
                  Imię i nazwisko
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Imię i nazwisko"
                  className={inputClasses}
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className={inputClasses}
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="sr-only">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Telefon"
                  className={inputClasses}
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label htmlFor="serviceType" className="sr-only">
                  Rodzaj usługi
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  required
                  className={inputClasses}
                  style={{ color: 'var(--color-text-primary)' }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Rodzaj usługi
                  </option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="eventDate" className="sr-only">
                  Data wydarzenia
                </label>
                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  className={inputClasses}
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label htmlFor="guestCount" className="sr-only">
                  Liczba gości
                </label>
                <input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min={1}
                  placeholder="Liczba gości"
                  className={inputClasses}
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="sr-only">
                Wiadomość
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Twoja wiadomość..."
                className={inputClasses}
                style={{ color: 'var(--color-text-primary)', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-bg-primary)]"
              style={{
                borderColor: 'var(--color-accent)',
                color: 'var(--color-accent)',
              }}
            >
              Wyślij wiadomość
            </button>
          </form>

          {/* Contact Info Sidebar */}
          <div
            ref={infoRef}
            className="flex flex-col justify-center gap-8 lg:min-w-[260px]"
          >
            {contactInfo.map((info) => (
              <div key={info.label} className="contact-info-item flex items-start gap-4">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.15em]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {info.label}
                  </p>
                  <p
                    className="mt-1 font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
