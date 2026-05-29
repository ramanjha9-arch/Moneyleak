const BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function analyzeFiles(files, textInput, analysisType = "full") {
  const form = new FormData();
  if (textInput) form.append("textInput", textInput);
  form.append("analysisType", analysisType);
  files.forEach((f) => form.append("files", f));

  const res = await fetch(`${BASE}/api/analyze`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server error" }));
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
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
