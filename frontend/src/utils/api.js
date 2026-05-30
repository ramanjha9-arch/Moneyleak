const BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * analyzeFiles — streams SSE logs back via onLog callback,
 * resolves with final data or rejects with error.
 */
export function analyzeFiles(files, textInput, analysisType = "full", onLog) {
  return new Promise(async (resolve, reject) => {
    const form = new FormData();
    if (textInput) form.append("textInput", textInput);
    form.append("analysisType", analysisType);
    files.forEach((f) => form.append("files", f));

    let response;
    try {
      response = await fetch(`${BASE}/api/analyze`, { method: "POST", body: form });
    } catch (networkErr) {
      return reject(new Error(`Network error: Cannot reach the backend. Check that the server is running and VITE_API_BASE_URL is set. (${networkErr.message})`));
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown server error");
      return reject(new Error(`Server returned ${response.status}: ${errText}`));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let evt;
            try { evt = JSON.parse(raw); } catch { continue; }

            if (evt.type === "log" && onLog) {
              onLog(evt);
            } else if (evt.type === "done") {
              resolve({ success: true, data: evt.data, modelUsed: evt.modelUsed });
              return;
            } else if (evt.type === "error") {
              reject(new Error(evt.error || "Analysis failed"));
              return;
            }
          }
        }
        // Stream ended without a done/error event
        reject(new Error("Server closed the connection unexpectedly. The analysis may have timed out."));
      } catch (streamErr) {
        reject(new Error(`Stream read error: ${streamErr.message}`));
      }
    };

    pump();
  });
}

export async function chatWithAI(message, context) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
