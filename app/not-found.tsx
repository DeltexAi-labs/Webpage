import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found shell">
      <p className="eyebrow dark-eyebrow">404 · Page not found</p>
      <h1>This route has not been built.</h1>
      <p>The page may have moved, or the address may be incomplete.</p>
      <Link href="/" className="button button-ink">Return home</Link>
    </main>
  );
}
