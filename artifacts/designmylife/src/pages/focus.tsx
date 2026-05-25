import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = "work" | "shortBreak" | "longBreak";

const DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function Focus() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem("dml_focus_sessions") || "0");
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      playBeep();
      setIsRunning(false);
      
      if (mode === "work") {
        const newSessions = sessionsCompleted + 1;
        setSessionsCompleted(newSessions);
        localStorage.setItem("dml_focus_sessions", newSessions.toString());
        
        toast({
          title: "Focus session completed!",
          description: "Great job. Time for a break.",
        });
        
        if (newSessions % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("shortBreak");
        }
      } else {
        toast({
          title: "Break over!",
          description: "Ready to focus again?",
        });
        switchMode("work");
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;
  
  // SVG Circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Focus</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Deep work sessions to build momentum.</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          data-testid="button-toggle-sound"
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
        <CardContent className="p-8 md:p-12 flex flex-col items-center">
          <div className="flex gap-2 mb-12 p-1 bg-muted rounded-lg">
            <Button
              variant={mode === "work" ? "default" : "ghost"}
              onClick={() => switchMode("work")}
              className="rounded-md px-6"
              data-testid="button-mode-work"
            >
              <Brain className="w-4 h-4 mr-2" />
              Focus
            </Button>
            <Button
              variant={mode === "shortBreak" ? "default" : "ghost"}
              onClick={() => switchMode("shortBreak")}
              className="rounded-md px-6"
              data-testid="button-mode-short"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Short Break
            </Button>
            <Button
              variant={mode === "longBreak" ? "default" : "ghost"}
              onClick={() => switchMode("longBreak")}
              className="rounded-md px-6"
              data-testid="button-mode-long"
            >
              Long Break
            </Button>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center mb-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r={radius}
                className="stroke-muted"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="130"
                cy="130"
                r={radius}
                className={`transition-all duration-1000 ease-linear ${
                  mode === 'work' ? 'stroke-primary' : 'stroke-chart-2'
                }`}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-serif font-bold tracking-tighter text-foreground">
                {formatTime(timeLeft)}
              </span>
              <span className="text-muted-foreground mt-2 font-medium">
                {mode === "work" ? "Stay focused" : "Take a breather"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className={`w-32 h-14 text-lg rounded-xl hover-elevate ${
                isRunning ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""
              }`}
              onClick={toggleTimer}
              data-testid="button-toggle-timer"
            >
              {isRunning ? (
                <><Pause className="w-5 h-5 mr-2" /> Pause</>
              ) : (
                <><Play className="w-5 h-5 mr-2 ml-1" /> Start</>
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-xl"
              onClick={resetTimer}
              data-testid="button-reset-timer"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground">
          <span className="font-bold text-foreground">{sessionsCompleted}</span> focus sessions completed
        </p>
      </div>
    </div>
  );
}