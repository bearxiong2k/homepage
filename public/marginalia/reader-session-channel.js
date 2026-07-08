export function createReaderSessionChannel(options = {}) {
  const docId = String(options.docId || '');
  const sessionId = String(options.sessionId || '');
  const role = String(options.role || 'reader');
  if (!docId || !sessionId) throw new Error('Reader split sessions require docId and sessionId.');
  if (typeof BroadcastChannel !== 'function') {
    throw new Error('Split notes require BroadcastChannel support in this browser.');
  }
  const senderId = randomSessionId();
  const channel = new BroadcastChannel(readerSessionChannelName(docId, sessionId));
  const onMessage = typeof options.onMessage === 'function' ? options.onMessage : null;
  const listener = (event) => {
    const envelope = event.data || {};
    if (envelope.docId !== docId || envelope.sessionId !== sessionId) return;
    if (envelope.senderId === senderId) return;
    onMessage?.(envelope);
  };
  channel.addEventListener('message', listener);
  return {
    docId,
    sessionId,
    role,
    senderId,
    post(type, payload = {}) {
      channel.postMessage({
        type,
        payload,
        docId,
        sessionId,
        role,
        senderId,
        sentAt: Date.now()
      });
    },
    close() {
      channel.removeEventListener('message', listener);
      channel.close();
    }
  };
}

export function readerSessionChannelName(docId, sessionId) {
  return `marginalia-reader:${docId}:${sessionId}`;
}

export function randomSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
