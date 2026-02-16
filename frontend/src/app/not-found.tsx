import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-fc-accent/30 bg-fc-bgElev p-8 text-center">
      <h1 className="text-2xl font-semibold">Nie znaleziono strony</h1>
      <p className="mt-2 text-fc-muted">Wybrana strona nie istnieje lub została przeniesiona.</p>
      <Link href="/" className="mt-4 inline-block rounded-full bg-fc-accent px-4 py-2 font-semibold text-black">
        Wróć na stronę główną
      </Link>
    </div>
  );
}
