import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const checks = [
  {
    title: "Color blindness",
    detail: "Red/green dashboard states should become harder to distinguish under protanopia and deuteranopia."
  },
  {
    title: "Cataracts",
    detail: "News and article pages should lose sharpness, contrast, and fine detail without becoming fully unreadable."
  },
  {
    title: "Glaucoma",
    detail: "The center remains visible while edge navigation, toolbars, and peripheral alerts become harder to detect."
  },
  {
    title: "ADHD",
    detail: "Pages with ads, badges, nav, and content blocks should feel more fragmented and harder to prioritize."
  }
];

export function ResearchNotes() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Portfolio validation notes</CardTitle>
              <CardDescription>
                These checks make the project reviewable as a product case study, not just a visual-effects demo.
              </CardDescription>
            </div>
            <Badge>Hiring manager lens</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {checks.map((check) => (
              <div key={check.title} className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
                <h3 className="font-bold">{check.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{check.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
