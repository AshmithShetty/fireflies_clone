import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotebooksPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notebooks</h2>
      </div>
      <div className="flex h-[50vh] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No notebooks created</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven't created any notebooks yet. Notebooks help you organize your meeting notes, action items, and summaries.
          </p>
        </div>
      </div>
    </div>
  );
}
