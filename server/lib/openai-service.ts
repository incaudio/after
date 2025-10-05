// Reference: javascript_openai blueprint
import OpenAI from "openai";
import { VibeMatchResult } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required. Please add it to your Replit Secrets.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const MUSICAL_VIBES = [
  "energetic", "calm", "melancholic", "upbeat", "dreamy", "intense", "romantic", "mysterious",
  "joyful", "nostalgic", "powerful", "gentle", "dark", "bright", "ethereal", "groovy",
  "chill", "aggressive", "soothing", "euphoric", "ambient", "dramatic", "playful", "epic",
  "funky", "moody", "triumphant", "haunting", "sensual", "rebellious", "peaceful", "cinematic",
  "bluesy", "jazzy", "electronic", "acoustic", "orchestral", "minimalist", "maximalist", "experimental",
  "retro", "futuristic", "organic", "synthetic", "rhythmic", "melodic", "harmonic", "dissonant",
  "uplifting", "depressing", "hopeful", "anxious", "confident", "vulnerable", "angry", "loving",
  "spiritual", "secular", "meditative", "chaotic", "structured", "flowing", "staccato", "legato",
  "major", "minor", "chromatic", "pentatonic", "modal", "atonal", "tonal", "polytonal",
  "fast", "slow", "moderate", "accelerating", "decelerating", "rubato", "steady", "syncopated",
  "loud", "soft", "dynamic", "static", "crescendo", "diminuendo", "forte", "piano",
  "bright", "warm", "cold", "raw", "polished", "lo-fi", "hi-fi", "vintage",
  "danceable", "contemplative", "hypnotic", "catchy", "complex", "simple", "layered", "sparse",
  "vocal-heavy", "instrumental", "a cappella", "symphonic", "chamber", "solo", "ensemble", "choir",
  "traditional", "modern", "fusion", "crossover", "genre-bending", "pure", "hybrid", "eclectic",
  "repetitive", "varied", "progressive", "regressive", "circular", "linear", "cyclical", "evolving",
  "tribal", "urban", "rural", "cosmic", "earthly", "celestial", "infernal", "neutral",
  "masculine", "feminine", "androgynous", "youthful", "mature", "timeless", "dated", "contemporary",
  "commercial", "underground", "mainstream", "niche", "accessible", "challenging", "familiar", "novel",
  "emotional", "intellectual", "physical", "spiritual", "mental", "visceral", "cerebral", "primal",
  "sociable", "solitary", "communal", "individual", "collective", "personal", "universal", "specific",
  "celebratory", "mourning", "reflective", "reactive", "proactive", "passive", "active", "interactive",
  "narrative", "abstract", "literal", "metaphorical", "symbolic", "direct", "indirect", "implicit",
  "improvised", "composed", "arranged", "produced", "raw", "refined", "rough", "smooth",
  "textured", "clean", "distorted", "pure", "mixed", "blended", "separated", "unified",
  "organic", "mechanical", "natural", "artificial", "analog", "digital", "hybrid", "authentic",
  "imitative", "original", "derivative", "innovative", "conventional", "unconventional", "traditional", "revolutionary"
];

export async function analyzeVibeFromAudio(audioBase64: string): Promise<VibeMatchResult> {
  try {
    // Convert base64 to buffer for Whisper transcription
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Save to temporary file for Whisper
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    const tempFilePath = path.join(os.tmpdir(), `vibe-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Transcribe audio (if there's any humming/singing)
    let transcription = '';
    try {
      const openai = getOpenAIClient();
      const audioReadStream = fs.createReadStream(tempFilePath);
      // All OpenAI/Whisper/audio features removed. Only text-based vibe match is supported now.
      // This file is now a stub for compatibility.
        model: "whisper-1",
