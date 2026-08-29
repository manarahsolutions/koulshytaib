/** Minimal routing placeholder — not a designed UI surface. */
export function RouteStub({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="typo-heading-s text-text">{title}</h1>
      <p className="typo-body-s mt-2 text-text-muted">
        مرحلة التأسيس فقط — لا واجهة تصميمية بعد.
      </p>
    </main>
  );
}
