import { AnimatedSection } from '@/components/ui/AnimatedSection'

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-4">
        <AnimatedSection>
          <h1 className="text-3xl font-bold text-cream md:text-4xl">Polityka prywatności</h1>
          <p className="mt-2 text-sm text-forest-400">Ostatnia aktualizacja: 19.02.2026</p>
          <div className="mt-2 h-1 w-16 rounded bg-accent" />
        </AnimatedSection>

        <AnimatedSection>
          <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:text-cream prose-p:text-forest-100 prose-a:text-accent prose-strong:text-cream">
            <h2>§1 Administrator danych</h2>
            <p>Administratorem danych osobowych jest Forest Catering z siedzibą w Szczecinie, ul. Leśna 42, 70-001 Szczecin. Kontakt z administratorem możliwy jest pod adresem email kontakt@forestcatering.pl lub telefonicznie pod numerem +48 123 456 789. Administrator dokłada wszelkich starań, aby zapewnić bezpieczeństwo przetwarzanych danych osobowych zgodnie z obowiązującymi przepisami prawa.</p>

            <h2>§2 Rodzaje zbieranych danych</h2>
            <p>Zbieramy następujące dane osobowe: imię i nazwisko, adres email, numer telefonu, adres dostawy, dane dotyczące zamówień i preferencji żywieniowych. Dane zbierane automatycznie obejmują: adres IP, typ przeglądarki, czas wizyty, odwiedzone strony, źródło ruchu. W przypadku zamówień eventowych dodatkowo zbieramy: datę wydarzenia, liczbę gości, miejsce realizacji.</p>

            <h2>§3 Cele przetwarzania</h2>
            <p>Dane osobowe przetwarzamy w celu: realizacji zamówień i świadczenia usług cateringowych, kontaktu z Klientem w sprawie zamówienia, wystawiania faktur i dokumentów księgowych, obsługi reklamacji i zapytań, przesyłania informacji marketingowych (za zgodą Klienta), doskonalenia naszych usług i analizy ruchu na stronie internetowej.</p>

            <h2>§4 Podstawa prawna</h2>
            <p>Przetwarzanie danych osobowych odbywa się na podstawie: art. 6 ust. 1 lit. b RODO — wykonanie umowy lub podjęcie działań przed jej zawarciem, art. 6 ust. 1 lit. c RODO — wypełnienie obowiązku prawnego (np. przepisy podatkowe), art. 6 ust. 1 lit. a RODO — zgoda na przetwarzanie (np. newsletter), art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes administratora (np. marketing bezpośredni).</p>

            <h2>§5 Okres przechowywania</h2>
            <p>Dane osobowe przechowujemy przez okres niezbędny do realizacji celów, dla których zostały zebrane: dane związane z zamówieniem — 5 lat od końca roku podatkowego, dane do celów marketingowych — do momentu wycofania zgody, dane analityczne — 26 miesięcy, dane z formularza kontaktowego — 12 miesięcy od ostatniego kontaktu.</p>

            <h2>§6 Prawa użytkownika</h2>
            <p>Każdy użytkownik ma prawo do: dostępu do swoich danych osobowych, sprostowania nieprawidłowych danych, usunięcia danych (&ldquo;prawo do bycia zapomnianym&rdquo;), ograniczenia przetwarzania, przenoszenia danych, sprzeciwu wobec przetwarzania, cofnięcia zgody w dowolnym momencie, złożenia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</p>

            <h2>§7 Pliki cookies</h2>
            <p>Strona internetowa Forest Catering wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania serwisu, analizy ruchu na stronie oraz personalizacji treści. Użytkownik może w każdej chwili zmienić ustawienia przeglądarki dotyczące plików cookies. Wyłączenie obsługi cookies może wpłynąć na funkcjonalność strony. Stosujemy cookies techniczne (niezbędne do działania), analityczne (pomiar ruchu) oraz funkcjonalne (zapamiętanie preferencji).</p>

            <h2>§8 Kontakt z administratorem</h2>
            <p>W sprawach dotyczących ochrony danych osobowych prosimy o kontakt: email: kontakt@forestcatering.pl, telefon: +48 123 456 789, adres korespondencyjny: Forest Catering, ul. Leśna 42, 70-001 Szczecin. Administrator udziela odpowiedzi na zapytania dotyczące danych osobowych w terminie 30 dni od otrzymania żądania.</p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
