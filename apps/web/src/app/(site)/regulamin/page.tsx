import { AnimatedSection } from '@/components/ui/AnimatedSection'

export default function RegulaminPage() {
  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-4">
        <AnimatedSection>
          <h1 className="text-3xl font-bold text-cream md:text-4xl">Regulamin</h1>
          <p className="mt-2 text-sm text-forest-400">Obowiązuje od: 19.02.2026</p>
          <div className="mt-2 h-1 w-16 rounded bg-accent" />
        </AnimatedSection>

        <AnimatedSection>
          <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:text-cream prose-p:text-forest-100 prose-a:text-accent prose-strong:text-cream">
            <h2>§1 Definicje</h2>
            <p>Regulamin — niniejszy dokument określający zasady korzystania ze sklepu internetowego Forest Catering. Sprzedawca — Forest Catering z siedzibą w Szczecinie, ul. Leśna 42, 70-001 Szczecin, NIP: 000-000-00-00. Klient — osoba fizyczna, prawna lub jednostka organizacyjna dokonująca zamówienia. Zamówienie — oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży produktów lub usług cateringowych.</p>

            <h2>§2 Postanowienia ogólne</h2>
            <p>Sklep internetowy Forest Catering prowadzi sprzedaż produktów cateringowych oraz usług eventowych za pośrednictwem sieci Internet. Warunkiem korzystania ze sklepu jest zapoznanie się z niniejszym Regulaminem i jego akceptacja. Sprzedawca dokłada wszelkich starań, aby informacje prezentowane w sklepie były aktualne i rzetelne. Kontakt ze Sprzedawcą możliwy jest pod adresem email kontakt@forestcatering.pl oraz telefonicznie pod numerem +48 123 456 789.</p>

            <h2>§3 Składanie zamówień</h2>
            <p>Zamówienia można składać za pośrednictwem formularza dostępnego w sklepie internetowym, telefonicznie lub mailowo. Po złożeniu zamówienia Klient otrzymuje potwierdzenie na podany adres e-mail. Zamówienia cateringowe wymagają co najmniej 48-godzinnego wyprzedzenia. W przypadku zamówień eventowych wymagany jest co najmniej 14-dniowy termin wyprzedzenia. Sprzedawca zastrzega sobie prawo do odmowy realizacji zamówienia w przypadku braku dostępności produktów.</p>

            <h2>§4 Ceny i płatności</h2>
            <p>Wszystkie ceny podane w sklepie są cenami brutto wyrażonymi w złotych polskich (PLN) i zawierają podatek VAT. Dostępne metody płatności to: przelew bankowy, płatność przy odbiorze oraz płatność online. Sprzedawca wystawia fakturę VAT na życzenie Klienta. Ceny mogą ulec zmianie, przy czym zmiana cen nie dotyczy zamówień już złożonych i potwierdzonych.</p>

            <h2>§5 Dostawa</h2>
            <p>Dostawa realizowana jest na terenie Szczecina i okolic w promieniu 30 km. Koszty dostawy są ustalane indywidualnie w zależności od wielkości zamówienia i odległości. Standardowy czas dostawy wynosi od 2 do 24 godzin w zależności od rodzaju zamówienia. W przypadku zamówień eventowych dostawa jest wliczona w cenę pakietu. Sprzedawca informuje Klienta o planowanej godzinie dostawy.</p>

            <h2>§6 Reklamacje</h2>
            <p>Klient ma prawo do złożenia reklamacji w przypadku niezgodności zamówienia z umową. Reklamację należy zgłosić niezwłocznie, nie później niż w ciągu 24 godzin od dostawy, drogą mailową lub telefoniczną. Sprzedawca rozpatrzy reklamację w terminie 14 dni roboczych od jej otrzymania. W przypadku uzasadnionej reklamacji Sprzedawca zwróci pełną kwotę zamówienia lub zrealizuje zamówienie ponownie.</p>

            <h2>§7 Odstąpienie od umowy</h2>
            <p>Klient będący konsumentem ma prawo do odstąpienia od umowy w terminie 14 dni bez podania przyczyny, z zastrzeżeniem wyjątków przewidzianych w ustawie. Ze względu na charakter produktów spożywczych, prawo odstąpienia nie przysługuje po rozpoczęciu realizacji zamówienia. W przypadku zamówień eventowych, bezkosztowe anulowanie jest możliwe na 7 dni przed planowaną datą realizacji.</p>

            <h2>§8 Ochrona danych osobowych</h2>
            <p>Administratorem danych osobowych Klientów jest Forest Catering. Dane osobowe przetwarzane są zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO). Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się w Polityce Prywatności dostępnej na stronie internetowej Sprzedawcy.</p>

            <h2>§9 Postanowienia końcowe</h2>
            <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu Cywilnego oraz ustawy o prawach konsumenta. Sprzedawca zastrzega sobie prawo do zmiany Regulaminu. O wszelkich zmianach Klienci zostaną poinformowani z 14-dniowym wyprzedzeniem. Ewentualne spory wynikające z umów zawartych na podstawie niniejszego Regulaminu będą rozstrzygane przez sąd właściwy dla siedziby Sprzedawcy.</p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
