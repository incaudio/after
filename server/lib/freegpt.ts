// FreeGPT API wrapper for Mate music app
// Uses https://api.chatanywhere.com.cn/v1/chat/completions (public FreeGPT endpoint)

import fetch from 'node-fetch';

const FREEGPT_API_URL = 'https://api.chatanywhere.com.cn/v1/chat/completions';

export async function freegptChat({ messages, model = 'gpt-3.5-turbo', max_tokens = 400, temperature = 0.7 }) {
  const res = await fetch(FREEGPT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FreeGPT error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
