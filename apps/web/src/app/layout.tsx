import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forest Catering — Profesjonalny catering w Szczecinie',
  description:
    'Forest Catering to profesjonalna firma cateringowa ze Szczecina. Oferujemy catering firmowy, weselny, eventowy i usługi barowe.',
}

const selectorEscapingPatch = `(() => {
  if (typeof window === 'undefined') return;
  const patch = (proto, methodName) => {
    const original = proto[methodName];
    if (typeof original !== 'function') return;

    proto[methodName] = function patchedSelector(selector, ...rest) {
      try {
        return original.call(this, selector, ...rest);
      } catch (error) {
        const canRetry =
          typeof selector === 'string' &&
          selector.startsWith('#') &&
          !selector.includes(' ') &&
          !selector.includes(',') &&
          !selector.includes('>') &&
          !selector.includes('+') &&
          !selector.includes('~') &&
          typeof CSS !== 'undefined' &&
          typeof CSS.escape === 'function';

        if (!canRetry) {
          throw error;
        }

        const escapedSelector = '#' + CSS.escape(selector.slice(1));
        return original.call(this, escapedSelector, ...rest);
      }
    };
  };

  patch(Element.prototype, 'querySelector');
  patch(Element.prototype, 'querySelectorAll');
  patch(Document.prototype, 'querySelector');
  patch(Document.prototype, 'querySelectorAll');
})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-forest-900 font-sans text-warmwhite antialiased">
        <script dangerouslySetInnerHTML={{ __html: selectorEscapingPatch }} />
        {children}
      </body>
    </html>
  )
}
