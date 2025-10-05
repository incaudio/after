import { freegptChat } from "./freegpt";

export async function getMusicSuggestions(userHistory: any[]): Promise<any[]> {
  try {
    // Compose a prompt based on user history
    const prompt = `You are a music recommendation AI. Based on the following user actions (searches, plays, likes), suggest 3 music cards (title, description, query) that would be relevant and interesting.\nUser history: ${JSON.stringify(userHistory)}\nReply as a JSON array.`;
    const text = await freegptChat({
      messages: [
        { role: "system", content: "You are a music recommendation AI. Suggest 3 music cards based on user history." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr;
    } catch (err) {
      console.error('AI suggestion JSON parse error:', err, text);
    }
    return [];
  } catch (err) {
    console.error('AI suggestion error:', err);
    return [];
  }
}

export async function getSearchSuggestions(currentInput: string, userHistory: any[]): Promise<string[]> {
  try {
    const prompt = `You are a smart search suggestion AI for a music app. Given the user's current input and history, suggest 3 full-sentence search queries they might want to try.\nCurrent input: "${currentInput}"\nUser history: ${JSON.stringify(userHistory)}\nReply as a JSON array of strings.`;
    const text = await freegptChat({
      messages: [
        { role: "system", content: "You are a search suggestion AI for a music app." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr;
    } catch (err) {
      console.error('AI search suggestion JSON parse error:', err, text);
    }
    return [];
  } catch (err) {
    console.error('AI search suggestion error:', err);
    return [];
  }
}
