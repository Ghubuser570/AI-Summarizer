const API_BASE = "http://localhost:8000";

// --- VAULT UPLOAD LOGIC ---
document.getElementById("upload-btn").addEventListener("click", async () => {
    const fileInput = document.getElementById("pdf-upload");
    const statusText = document.getElementById("upload-status");

    if (fileInput.files.length === 0) {
        statusText.textContent = "❌ No file selected, Overlord! 🛑";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    statusText.textContent = "⏳ Securing file to vault and spinning up Redis worker...";

    try {
        const response = await fetch(`${API_BASE}/upload/`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        statusText.textContent = `✅ ${data.message}`;
    } catch (error) {
        statusText.textContent = `❌ Upload failed: ${error.message}`;
    }
});

// --- CHAT INTERFACE LOGIC ---
function appendMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.classList.add(sender === "Overlord" ? "user-message" : "ai-message");
    msgDiv.textContent = `${sender === "Overlord" ? "👑" : "🤖"} ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}

// --- ASK AI (RAG SYNTHESIS) ---
document.getElementById("ask-btn").addEventListener("click", async () => {
    const queryInput = document.getElementById("query-input");
    const query = queryInput.value.trim();

    if (!query) return;

    appendMessage("Overlord", query);
    queryInput.value = "";

    try {
        const response = await fetch(`${API_BASE}/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query, top_k: 3 })
        });
        const data = await response.json();
        
        if (data.error) {
            appendMessage("AI", `Error: ${data.error}`);
        } else {
            appendMessage("AI", data.response);
        }
    } catch (error) {
        appendMessage("AI", `Matrix connection error: ${error.message} 🛑`);
    }
});

// --- RAW VECTOR SEARCH ---
document.getElementById("search-btn").addEventListener("click", async () => {
    const queryInput = document.getElementById("query-input");
    const query = queryInput.value.trim();

    if (!query) return;

    appendMessage("Overlord", `[RAW VECTOR SEARCH]: ${query}`);
    queryInput.value = "";

    try {
        const response = await fetch(`${API_BASE}/search/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query, top_k: 3 })
        });
        const data = await response.json();
        
        if (data.error) {
            appendMessage("AI", `Error: ${data.error}`);
        } else {
            let resultText = `Found ${data.matches.length} math-matched chunks:\n`;
            data.matches.forEach((m, i) => {
                resultText += `\n[Match ${i+1}]: ${m.text.substring(0, 150)}...`;
            });
            appendMessage("AI", resultText);
        }
    } catch (error) {
        appendMessage("AI", `Matrix connection error: ${error.message} 🛑`);
    }
});