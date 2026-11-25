// Local Ollama client (100% local inference, no paid APIs)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:9b';

export async function generate(prompt, { temperature = 0.7, num_predict = 1200 } = {}) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      think: false,
      options: { temperature, num_predict },
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (!data.response) throw new Error('Ollama returned no response');
  return data.response.trim();
}

export async function isAvailable() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export const config = { OLLAMA_URL, MODEL };