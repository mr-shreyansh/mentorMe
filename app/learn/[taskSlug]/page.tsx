import { taskRegistry } from "@/lib/tasks/taskRegistry";
import TaskShell from "@/components/tasks/TaskShell";
import { notFound } from "next/navigation";

export default async function TaskPage({ params }: { params: Promise<{ taskSlug: string }> }) {
  const { taskSlug } = await params;
  const task = taskRegistry[taskSlug];
  
  if (!task) return notFound();
  
  return <TaskShell taskSlug={taskSlug} />;
}

export function generateStaticParams() {
  return Object.keys(taskRegistry).map((slug) => ({ taskSlug: slug }));
}
