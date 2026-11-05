export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">SafeArrival</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Get home. Check in.</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          A journey safety check-in prototype that helps you let trusted people know when you have arrived safely.
        </p>
        <div className="mt-8 rounded-xl border bg-card p-5 text-sm text-card-foreground shadow-sm">
          Project scaffold is ready. Journey setup and check-in flows will be added next.
        </div>
      </section>
    </main>
  );
}
