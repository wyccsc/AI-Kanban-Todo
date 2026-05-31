import { KanbanBoard } from "@/components/KanbanBoard";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <KanbanBoard />
      </div>
    </main>
  );
}
