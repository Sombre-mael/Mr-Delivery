export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
      <section className="w-full max-w-lg text-center">
        <p className="text-sm font-black uppercase text-gold">Erreur 404</p>
        <h1 className="mt-3 text-4xl font-black">Cette page n’existe pas.</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">Revenez au service de livraison ou ouvrez le suivi colis.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href="/" className="rounded-full bg-ink px-6 py-3 text-sm font-black text-white">Accueil</a>
          <a href="/track" className="rounded-full bg-gold px-6 py-3 text-sm font-black text-ink">Suivre un colis</a>
        </div>
      </section>
    </main>
  );
}
