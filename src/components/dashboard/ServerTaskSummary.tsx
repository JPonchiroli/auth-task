import { taskService } from "@/services/tasks/task.service";

type ServerTaskSummaryProps = {
  userId: string;
};

export async function ServerTaskSummary({ userId }: ServerTaskSummaryProps) {
  const summary = await taskService.getSummary(userId).catch(() => null);

  if (!summary) {
    return (
      <section className="summary-grid">
        <article className="summary-card warning">
          <h2>Resumo indisponível</h2>
          <p>Configure o Firestore para habilitar os dados no servidor.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <h2>Total</h2>
        <strong>{summary.total}</strong>
      </article>
      <article className="summary-card">
        <h2>Concluídas</h2>
        <strong>{summary.completed}</strong>
      </article>
      <article className="summary-card">
        <h2>Pendentes</h2>
        <strong>{summary.pending}</strong>
      </article>
    </section>
  );
}
