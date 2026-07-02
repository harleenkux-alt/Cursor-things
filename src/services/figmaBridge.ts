import type { MainToUiMessage, UiToMainMessage } from '@/types/messages';

/**
 * Thin, typed wrapper around the UI↔main `postMessage` channel.
 *
 * All UI code should talk to the sandbox through this bridge rather than
 * touching `parent.postMessage` directly, so the transport stays swappable
 * (e.g. for tests or a future web-preview mode).
 */
class FigmaBridge {
  private listeners = new Set<(msg: MainToUiMessage) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage);
    }
  }

  private handleMessage = (event: MessageEvent): void => {
    const data = event.data?.pluginMessage as MainToUiMessage | undefined;
    if (!data || typeof data.type !== 'string') return;
    this.listeners.forEach((fn) => fn(data));
  };

  /** Send a message to the main thread. */
  post(message: UiToMainMessage): void {
    parent.postMessage({ pluginMessage: message }, '*');
  }

  /** Subscribe to messages from the main thread. Returns an unsubscribe fn. */
  subscribe(fn: (msg: MainToUiMessage) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const bridge = new FigmaBridge();
