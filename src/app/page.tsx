import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">TRABALHO 01</p>
        <h1>AuthTask Manager</h1>
        <p>
          Base funcional da aplicação para o trabalho de testes unitários com Jest +
          React Testing Library.
        </p>
        <div className="actions">
          <Link href="/login">Entrar no sistema</Link>
          <Link href="/dashboard" className="ghost">
            Ir para dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
