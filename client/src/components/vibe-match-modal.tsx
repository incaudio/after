import { useState, useRef, useEffect } from "react";
import { X, Mic, StopCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { VibeMatchResult } from "@shared/schema";
import { useLocation } from "wouter";

interface VibeMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VibeMatchModal({ open, onOpenChange }: VibeMatchModalProps) {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  const vibeMatchMutation = useMutation<VibeMatchResult, Error, string>({
    mutationFn: async (audioData: string) => {
      return await apiRequest("POST", "/api/vibe-match", { audioData }) as Promise<VibeMatchResult>;
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up audio visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(",")[1];
          vibeMatchMutation.mutate(base64Audio);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      visualize();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgb(139, 92, 246)");
        gradient.addColorStop(1, "rgb(59, 130, 246)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      const avgLevel = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(avgLevel / 255);
    };

    draw();
  };

  const handleSearchVibe = (searchTerm: string) => {
    onOpenChange(false);
    setLocation(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  useEffect(() => {
    if (!open) {
      stopRecording();
      vibeMatchMutation.reset();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="glass-elevated rounded-2xl max-w-2xl w-full p-8 pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-semibold">Vibe Match</h2>
                <p className="text-sm text-muted-foreground">Hum a tune and find similar songs</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-vibe-match"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Visualization */}
          <div className="relative mb-8">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 rounded-xl bg-black/20"
            />
            {!isRecording && !vibeMatchMutation.data && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Click the microphone to start</p>
              </div>
            )}
          </div>

          {/* Recording control */}
          <div className="flex justify-center mb-8">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={vibeMatchMutation.isPending}
                className={`w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 ${
                  vibeMatchMutation.isPending ? "animate-pulse" : ""
                }`}
                data-testid="button-start-recording"
              >
                <Mic className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={stopRecording}
                className={`w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 ${
                  audioLevel > 0.3 ? "animate-pulse-glow" : ""
                }`}
                data-testid="button-stop-recording"
              >
                <StopCircle className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Results */}
          {vibeMatchMutation.isPending && (
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Analyzing your vibe...</p>
            </div>
          )}

          {vibeMatchMutation.data && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Detected vibes */}
              {vibeMatchMutation.data.vibes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-medium">Detected Vibes</h3>
                  <div className="flex flex-wrap gap-2">
                    {vibeMatchMutation.data.vibes.slice(0, 5).map((vibe, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-3 py-1"
                        data-testid={`badge-vibe-${index}`}
                      >
                        {vibe.name} ({Math.round(vibe.confidence * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Search suggestions */}
              {vibeMatchMutation.data.suggestedSearchTerms.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-medium">Try Searching For</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {vibeMatchMutation.data.suggestedSearchTerms.slice(0, 4).map((term, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSearchVibe(term)}
                        className="justify-start glass hover:bg-violet-500/20"
                        data-testid={`button-search-suggestion-${index}`}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {vibeMatchMutation.isError && (
            <div className="text-center text-destructive">
              <p>Failed to analyze vibe. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
