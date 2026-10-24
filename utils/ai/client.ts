// Transport for Claude calls — the ONE place that knows how a request reaches
// the model. Today it calls the Anthropic Messages API directly with plain
// `fetch` (deliberately not the SDK, for robustness under Metro/React Native).
// Moving the key server-side later means pointing this file at a proxy; the
// calls built on top of it don't change.
//
// Never throws: returns { ok: false, reason } on any failure so callers can fall
// back. In development, failures and cache usage are logged to the terminal.

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const TIMEOUT_MS = 20000;

export interface PromptBlock {
  text: string;
  cache?: boolean;   // mark as a cache breakpoint: everything up to here is cacheable
}

export interface ClaudeRequest {
  label: string;         // for dev logs, e.g. "selectExercises"
  model: string;
  maxTokens: number;
  system: string;
  blocks: PromptBlock[]; // user-message content, stable blocks first
  effort: 'low' | 'medium' | 'high'; // how much the model thinks before answering
  serverFallback?: boolean; // let the API retry on another model if a safety check declines (Sonnet 5.5+)
}

export type ClaudeResult = { ok: true; text: string } | { ok: false; reason: string };

function getApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  return key && key.length > 0 ? key : null;
}

export function devWarn(label: string, message: string) {
  if (__DEV__) console.warn(`[Regain AI] ${label}: ${message}`);
}

export async function callClaude(req: ClaudeRequest): Promise<ClaudeResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const reason = 'no API key (EXPO_PUBLIC_ANTHROPIC_API_KEY missing from .env)';
    devWarn(req.label, reason);
    return { ok: false, reason };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        // Needed only for the web build (CORS); harmless on native.
        'anthropic-dangerous-direct-browser-access': 'true',
        ...(req.serverFallback ? { 'anthropic-beta': 'server-side-fallback-2026-07-01' } : {}),
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens, // covers the model's thinking AND its answer
        output_config: { effort: req.effort },
        ...(req.serverFallback ? { fallbacks: 'default' } : {}),
        system: req.system,
        messages: [
          {
            role: 'user',
            content: req.blocks.map((b) => ({
              type: 'text',
              text: b.text,
              ...(b.cache ? { cache_control: { type: 'ephemeral' } } : {}),
            })),
          },
        ],
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const reason = `HTTP ${res.status}: ${data?.error?.message ?? 'no error body'}`;
      devWarn(req.label, reason);
      return { ok: false, reason };
    }
    if (__DEV__ && data?.usage) {
      const u = data.usage;
      console.log(
        `[Regain AI] ${req.label}: in ${u.input_tokens} · cache write ${u.cache_creation_input_tokens ?? 0} · cache read ${u.cache_read_input_tokens ?? 0} · out ${u.output_tokens}`
      );
    }
    if (data?.stop_reason === 'refusal') {
      const reason = `declined by a safety check (${data?.stop_details?.category ?? 'no category'})`;
      devWarn(req.label, reason);
      return { ok: false, reason };
    }
    // The response can start with (empty) thinking blocks — read the answer by type.
    const text = data?.content?.find((b: any) => b?.type === 'text')?.text;
    if (typeof text !== 'string') {
      const reason = `no answer text (stop_reason: ${data?.stop_reason})`;
      devWarn(req.label, reason);
      return { ok: false, reason };
    }
    return { ok: true, text };
  } catch (e: any) {
    const reason = e?.name === 'AbortError' ? `timed out after ${TIMEOUT_MS / 1000}s` : `network error: ${e?.message ?? e}`;
    devWarn(req.label, reason);
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}
