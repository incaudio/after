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
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: "whisper-1",
      });
      transcription = transcriptionResponse.text;
    } catch (error) {
      console.log('Transcription failed, using AI analysis only');
    }

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Analyze vibe using GPT-5
    const analysisPrompt = `You are a music vibe analyzer. Analyze the following hummed/sung melody or audio description and identify the musical vibes, mood, and suggest search terms for finding similar songs.

${transcription ? `Transcribed audio: ${transcription}` : 'Audio was hummed or instrumental'}

Identify:
1. Top 5 musical vibes from this list: ${MUSICAL_VIBES.join(', ')}
2. Overall mood and tempo
3. 4-6 specific search terms that would help find similar songs
4. Genre suggestions

Respond in JSON format:
{
  "vibes": [{"name": "vibe_name", "confidence": 0.0-1.0, "description": "brief explanation"}],
  "mood": "overall mood description",
  "tempo": "fast/moderate/slow",
  "genre": "genre suggestion",
  "suggestedSearchTerms": ["search term 1", "search term 2", ...]
}`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert music analyst specializing in identifying musical vibes and emotions. Always respond with valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      vibes: result.vibes || [],
      suggestedSearchTerms: result.suggestedSearchTerms || [],
      mood: result.mood,
      genre: result.genre,
      tempo: result.tempo,
    };
  } catch (error) {
    console.error('Vibe analysis error:', error);
    throw new Error('Failed to analyze vibe');
  }
}

export async function recognizeAudio(audioBase64: string): Promise<{
  recognized: boolean;
  title?: string;
  artist?: string;
  album?: string;
  confidence?: number;
}> {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    const tempFilePath = path.join(os.tmpdir(), `recognize-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Use Whisper to transcribe any lyrics
    const openai = getOpenAIClient();
    const audioReadStream = fs.createReadStream(tempFilePath);
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
    });

    fs.unlinkSync(tempFilePath);

    // Use GPT-5 to identify the song from lyrics
    if (transcription.text && transcription.text.length > 10) {
      const identificationPrompt = `Identify the song from these lyrics: "${transcription.text}"

If you can identify the song, respond with JSON:
{
  "recognized": true,
  "title": "song title",
  "artist": "artist name",
  "album": "album name (if known)",
  "confidence": 0.0-1.0
}

If you cannot identify it, respond with:
{
  "recognized": false
}`;

      const openaiClient = getOpenAIClient();
      const response = await openaiClient.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a music identification expert. Identify songs from lyrics accurately. Always respond with valid JSON."
          },
          {
            role: "user",
            content: identificationPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    }

    return { recognized: false };
  } catch (error) {
    console.error('Audio recognition error:', error);
    return { recognized: false };
  }
}
