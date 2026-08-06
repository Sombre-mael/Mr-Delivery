export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] text-ink" aria-live="polite">
      <div className="text-center">
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-gold" />
        <p className="mt-4 text-sm font-black">Chargement...</p>
      </div>
    </main>
  );
}
