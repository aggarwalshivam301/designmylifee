import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListJournalEntries,
  getListJournalEntriesQueryKey,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  type JournalInputMood,
  type JournalUpdateMood,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Pencil, Trash2, FileText, Sparkles, Loader2, Brain, Tag } from "lucide-react";

interface JournalEntry {
  id: number;
  title?: string | null;
  content: string;
  mood: string;
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: {
    themes: string[];
    insights: string[];
    suggestions: string[];
    sentiment: string;
    emotionalTone?: string;
    analyzedAt: string;
  } | null;
}

const MOODS = [
  { value: "great", label: "Great", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  { value: "good", label: "Good", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "okay", label: "Okay", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  { value: "rough", label: "Rough", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  { value: "awful", label: "Awful", color: "bg-destructive/10 text-destructive border-destructive/20" },
];

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "text-chart-1",
  neutral: "text-muted-foreground",
  negative: "text-destructive",
};

function getMoodStyle(mood: string) {
  return MOODS.find(m => m.value === mood)?.color || "bg-muted text-muted-foreground";
}
function getMoodLabel(mood: string) {
  return MOODS.find(m => m.value === mood)?.label || mood;
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
function getToken(): string {
  return localStorage.getItem("dml_token") || "";
}

async function analyzeEntry(entryId: number) {
  const res = await fetch("/api/ai/analyze-reflection", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ entryId }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export default function Journal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: entries, isLoading } = useListJournalEntries();

  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<JournalEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ title: "", content: "", mood: "okay", tags: "" });

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JournalEntry["aiAnalysis"] | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", content: "", mood: "okay", tags: "" });
    setShowDialog(true);
  };

  const openEdit = (e: JournalEntry) => {
    setEditTarget(e);
    setForm({ title: e.title || "", content: e.content, mood: e.mood, tags: e.tags.join(", ") });
    setViewEntry(null);
    setShowDialog(true);
  };

  const openView = (entry: JournalEntry) => {
    setViewEntry(entry);
    // Show cached AI analysis if it exists
    setAnalysis(entry.aiAnalysis || null);
  };

  const handleSave = () => {
    if (!form.content.trim()) return;
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editTarget) {
      updateEntry.mutate({ id: editTarget.id, data: {
        title: form.title || undefined, content: form.content,
        mood: form.mood as JournalUpdateMood, tags,
      } }, { onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Entry updated" }); } });
    } else {
      createEntry.mutate({ data: {
        title: form.title || undefined, content: form.content,
        mood: form.mood as JournalInputMood, tags,
      } }, { onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Entry saved" }); } });
    }
  };

  const handleDelete = (id: number) => {
    deleteEntry.mutate({ id }, { onSuccess: () => { invalidate(); setViewEntry(null); toast({ title: "Entry deleted" }); } });
  };

  const handleAnalyze = async () => {
    if (!viewEntry) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeEntry(viewEntry.id);
      setAnalysis(result.analysis);
      // Update local list so re-opening shows cached analysis
      invalidate();
      toast({ title: "AI analysis complete" });
    } catch {
      toast({ variant: "destructive", title: "Analysis failed", description: "Check that your GOOGLE_API_KEY is configured." });
    } finally {
      setAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Journal</h1>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const list = (entries || []) as JournalEntry[];
  const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalWords = list.reduce((s, e) => s + e.wordCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Journal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{list.length} entries &middot; {totalWords.toLocaleString()} words</p>
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0" data-testid="button-new-entry">
          <Plus className="w-4 h-4 mr-1.5" />
          New
        </Button>
      </div>

      {list.length === 0 && (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start reflecting — even a few sentences a day compounds over time.</p>
            <Button className="mt-6" onClick={openCreate}>Write your first entry</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((entry) => (
          <Card
            key={entry.id}
            className="hover:shadow-md transition-all cursor-pointer"
            onClick={() => openView(entry)}
            data-testid={`entry-card-${entry.id}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {entry.title
                    ? <CardTitle className="text-base font-semibold leading-snug">{entry.title}</CardTitle>
                    : <CardTitle className="text-base font-semibold text-muted-foreground leading-snug">Untitled</CardTitle>
                  }
                  <CardDescription className="mt-1">
                    {timeAgo(entry.createdAt)} &middot; {entry.wordCount} words
                    {entry.aiAnalysis && (
                      <span className="ml-2 text-primary text-xs inline-flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> analyzed
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge className={`text-xs shrink-0 ${getMoodStyle(entry.mood)}`} variant="outline">
                  {getMoodLabel(entry.mood)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{entry.content}</p>
              {entry.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {entry.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── View Entry Dialog ── */}
      <Dialog open={!!viewEntry} onOpenChange={() => { setViewEntry(null); setAnalysis(null); }}>
        {viewEntry && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="font-serif text-xl">{viewEntry.title || "Untitled"}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(viewEntry.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    &nbsp;&middot;&nbsp;{viewEntry.wordCount} words
                  </p>
                </div>
                <Badge className={`text-xs shrink-0 mt-1 ${getMoodStyle(viewEntry.mood)}`} variant="outline">
                  {getMoodLabel(viewEntry.mood)}
                </Badge>
              </div>
            </DialogHeader>

            {/* Entry content */}
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewEntry.content}</p>
            </div>

            {viewEntry.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap items-center">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                {viewEntry.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}

            {/* ── AI Analysis Panel ── */}
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI Analysis</span>
                  {analysis?.analyzedAt && (
                    <span className="text-xs text-muted-foreground">
                      &middot; {timeAgo(analysis.analyzedAt)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                    : <><Sparkles className="w-3 h-3" /> {analysis ? "Re-analyze" : "Analyze"}</>
                  }
                </Button>
              </div>

              {analyzing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Gemini is reading your entry...
                </div>
              )}

              {!analyzing && !analysis && (
                <p className="text-xs text-muted-foreground">
                  Click Analyze to get AI-powered insights — themes, emotional tone, and personalized suggestions based on what you wrote.
                </p>
              )}

              {analysis && !analyzing && (
                <div className="space-y-3">
                  {/* Sentiment + tone */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Sentiment:</span>
                    <span className={`font-medium capitalize ${SENTIMENT_COLOR[analysis.sentiment] || "text-foreground"}`}>
                      {analysis.sentiment}
                    </span>
                    {analysis.emotionalTone && (
                      <>
                        <span className="text-muted-foreground">&middot; Tone:</span>
                        <span className="font-medium capitalize text-foreground">{analysis.emotionalTone}</span>
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Themes */}
                  {analysis.themes?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Themes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.themes.map(theme => (
                          <span key={theme} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {analysis.insights?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Insights</p>
                      <ul className="space-y-1.5">
                        {analysis.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysis.suggestions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Suggestions</p>
                      <ul className="space-y-1.5">
                        {analysis.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-chart-1 mt-2 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" className="text-destructive hover:bg-destructive/10 w-full sm:w-auto" onClick={() => handleDelete(viewEntry.id)}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => openEdit(viewEntry)} className="w-full sm:w-auto">
                <Pencil className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
              <Button onClick={() => { setViewEntry(null); setAnalysis(null); }} className="w-full sm:w-auto">Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{editTarget ? "Edit entry" : "New journal entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input
                  placeholder="Give this entry a title..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  data-testid="input-entry-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={form.mood} onValueChange={v => setForm(f => ({ ...f, mood: v }))}>
                  <SelectTrigger data-testid="select-mood"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>What's on your mind?</Label>
              <Textarea
                placeholder="Write freely — no one else reads this..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={10}
                className="resize-none font-sans leading-relaxed"
                data-testid="textarea-entry-content"
              />
              <p className="text-xs text-muted-foreground">
                {form.content.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="e.g. gratitude, goals, mindset"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                data-testid="input-tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createEntry.isPending || updateEntry.isPending || !form.content.trim()}
              data-testid="button-save-entry"
            >
              <FileText className="w-4 h-4 mr-2" />
              {editTarget ? "Save changes" : "Save entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
