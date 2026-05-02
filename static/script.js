let currentMode = "general";

/* ---------- NAVIGATION ---------- */
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");
}

/* ---------- CHAT ---------- */
function addMessage(text, type) {
    const chatbox = document.getElementById("chatbox");

    const div = document.createElement("div");
    div.className = type === "user" ? "user-message" : "bot-message";
    div.innerText = text;

    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

/* ---------- SEND ---------- */
function sendMessage(customMessage = null) {
    const input = document.getElementById("message");
    const message = customMessage || input.value.trim();

    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    addMessage("AI thinking...", "bot");

    fetch("/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            message: message,
            mode: currentMode
        })
    })
    .then(res => res.json())
    .then(data => {
        const msgs = document.querySelectorAll(".bot-message");
        msgs[msgs.length - 1].innerText = data.reply;
    });
}

/* ---------- QUICK ACTION ---------- */
function quickAction(type) {
    if (type === "idea") {
        sendMessage("Δώσε μου startup ideas.");
    }

    if (type === "project") {
        sendMessage("Δώσε project για portfolio.");
    }

    if (type === "career") {
        sendMessage("Βοήθησέ με με καριέρα.");
    }

    if (type === "content") {
        sendMessage("Δώσε content ideas.");
    }
}

/* ---------- CLEAR ---------- */
function clearChat() {
    document.getElementById("chatbox").innerHTML = "";
}