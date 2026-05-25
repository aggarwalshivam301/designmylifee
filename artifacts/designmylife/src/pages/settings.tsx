import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProfile,
  getGetProfileQueryKey,
  useUpdateProfile,
  useChangePassword,
  useToggleAI,
  useGetAIStatus,
  getGetAIStatusQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Brain, LogOut, ShieldCheck } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { token, logout, setAuth } = useAuth();

  const { data: profile, isLoading } = useGetProfile({
    query: { enabled: !!token, queryKey: getGetProfileQueryKey() },
  });
  const { data: aiStatus } = useGetAIStatus({
    query: { enabled: !!token, queryKey: getGetAIStatusQueryKey() },
  });

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const toggleAI = useToggleAI();

  const [profileForm, setProfileForm] = useState({ name: "", avatar: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [aiEnabled, setAIEnabled] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name || "", avatar: profile.avatar || "" });
      setAIEnabled(!!profile.aiEnabled);
    }
  }, [profile]);

  const invalidateProfile = () => queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });

  const handleUpdateProfile = () => {
    if (!profileForm.name.trim()) return;
    updateProfile.mutate({ data: { name: profileForm.name, avatar: profileForm.avatar || undefined } }, {
      onSuccess: (data) => {
        invalidateProfile();
        if (token && data) setAuth(token, data);
        toast({ title: "Profile updated" });
      },
      onError: () => toast({ variant: "destructive", title: "Failed to update profile" }),
    });
  };

  const handleChangePassword = () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return;
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast({ variant: "destructive", title: "New password must be at least 6 characters" });
      return;
    }
    changePassword.mutate({ data: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword } }, {
      onSuccess: () => {
        toast({ title: "Password updated" });
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      },
      onError: (err: unknown) => {
        const message = (err as { data?: { message?: string } })?.data?.message || "Failed to update password";
        toast({ variant: "destructive", title: message });
      },
    });
  };

  const handleToggleAI = (enabled: boolean) => {
    setAIEnabled(enabled);
    toggleAI.mutate({ data: { aiEnabled: enabled } }, {
      onSuccess: () => {
        invalidateProfile();
        toast({ title: enabled ? "AI features enabled" : "AI features disabled" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Update your display name and avatar URL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              data-testid="input-display-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL (optional)</Label>
            <Input
              id="avatar"
              placeholder="https://..."
              value={profileForm.avatar}
              onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))}
              data-testid="input-avatar-url"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleUpdateProfile}
              disabled={updateProfile.isPending || !profileForm.name.trim()}
              data-testid="button-save-profile"
            >
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </Button>
            {profile && (
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              data-testid="input-current-password"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changePassword.isPending || !pwForm.currentPassword || !pwForm.newPassword}
            data-testid="button-change-password"
          >
            {changePassword.isPending ? "Updating..." : "Change password"}
          </Button>
        </CardContent>
      </Card>

      {/* AI */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Coaching</CardTitle>
              <CardDescription>Opt in to AI-powered goal decomposition and journal reflection</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!aiStatus?.configured && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <ShieldCheck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                AI features are not currently configured on this server. When an AI API key is added, you'll be able to enable
                AI-powered coaching, goal decomposition, and journal analysis here.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable AI features</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {aiStatus?.configured
                  ? `Powered by ${aiStatus.provider} (${aiStatus.model})`
                  : "Not available — AI key not configured"}
              </p>
            </div>
            <Switch
              checked={aiEnabled}
              onCheckedChange={handleToggleAI}
              disabled={!aiStatus?.configured || toggleAI.isPending}
              data-testid="switch-ai-enabled"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">Sign out</CardTitle>
              <CardDescription>End your current session</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={logout}
            data-testid="button-signout"
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
