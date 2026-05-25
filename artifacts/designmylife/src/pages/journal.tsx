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
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Pencil, Trash2, FileText } from "lucide-react";

interface JournalEntry {
  id: number;
  title?: string | null;
  content: string;
  mood: string;
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

const MOODS = [
  { value: "great", label: "Great", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  { value: "good", label: "Good", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "okay", label: "Okay", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  { value: "rough", label: "Rough", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  { value: "awful", label: "Awful", color: "bg-destructive/10 text-destructive border-destructive/20" },
];

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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", content: "", mood: "okay", tags: "" });
    setShowDialog(true);
  };

  const openEdit = (e: JournalEntry) => {
    setEditTarget(e);
    setForm({
      title: e.title || "",
      content: e.content,
      mood: e.mood,
      tags: e.tags.join(", "),
    });
    setViewEntry(null);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.content.trim()) return;
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editTarget) {
      updateEntry.mutate({ id: editTarget.id, data: {
        title: form.title || undefined,
        content: form.content,
        mood: form.mood as JournalUpdateMood,
        tags,
      } }, {
        onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Entry updated" }); },
      });
    } else {
      createEntry.mutate({ data: {
        title: form.title || undefined,
        content: form.content,
        mood: form.mood as JournalInputMood,
        tags,
      } }, {
        onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Entry saved" }); },
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteEntry.mutate({ id }, { onSuccess: () => { invalidate(); setViewEntry(null); toast({ title: "Entry deleted" }); } });
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
            onClick={() => setViewEntry(entry)}
            data-testid={`entry-card-${entry.id}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {entry.title ? (
                    <CardTitle className="text-base font-semibold leading-snug">{entry.title}</CardTitle>
                  ) : (
                    <CardTitle className="text-base font-semibold text-muted-foreground leading-snug">Untitled</CardTitle>
                  )}
                  <CardDescription className="mt-1">
                    {timeAgo(entry.createdAt)} &middot; {entry.wordCount} words
                  </CardDescription>
                </div>
                <Badge className={`text-xs shrink-0 ${getMoodStyle(entry.mood)}`} variant="outline">
                  {getMoodLabel(entry.mood)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {entry.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Entry Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        {viewEntry && (
          <DialogContent className="max-w-2xl">
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
            <div className="max-h-96 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewEntry.content}</p>
            </div>
            {viewEntry.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {viewEntry.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(viewEntry.id)} data-testid={`button-delete-entry-${viewEntry.id}`}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => openEdit(viewEntry)} data-testid={`button-edit-entry-${viewEntry.id}`}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={() => setViewEntry(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Create/Edit Dialog */}
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
                  <SelectTrigger data-testid="select-mood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
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
