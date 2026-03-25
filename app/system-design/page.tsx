import SystemDesignCanvas from '@/components/system-design/SystemDesignCanvas';

export default function SystemDesignPage() {
  return (
    <div className="space-y-8">
      <header className="nm-flat rounded-lg p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-(--heading-color)">
          System Design Studio
        </h1>
        <p className="text-sm md:text-base opacity-75 mt-3 max-w-3xl">
          Build architecture diagrams with reusable nodes and dynamic handles. Submit the graph for validation
          to detect missing links or incorrect connections.
        </p>
      </header>

      <SystemDesignCanvas />
    </div>
  );
}
