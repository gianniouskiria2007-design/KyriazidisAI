let currentMode = "general";
let lastUserMessage = "";

/* ---------- MODE ---------- */
function setMode(mode, element) {
    currentMode = mode;

    const modeInput = document.getElementById("mode");
    if (modeInput) modeInput.value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    if (element) element.classList.add("active");
}

/* ---------- ADD MESSAGE ---------- */
function addMessage(text, type) {
    const chatbox = document.getElementById("chatbox");
    if (!chatbox) return null;

    const wrapper = document.createElement("div");
    wrapper.className = type === "user" ? "user-message" : "bot-message";

    const textDiv = document.createElement("div");
    textDiv.className = "message-text";
    textDiv.innerText = text;

    wrapper.appendChild(textDiv);

    if (type === "bot") {
        const tools = document.createElement("div");
        tools.className = "message-tools";

        const copyBtn = document.createElement("button");
        copyBtn.className = "mini-tool-btn";
        copyBtn.innerText = "Copy";
        copyBtn.onclick = () => copyText(textDiv.innerText);

        const regenBtn = document.createElement("button");
        regenBtn.className = "mini-tool-btn";
        regenBtn.innerText = "Regenerate";
        regenBtn.onclick = () => regenerateAnswer();

        tools.appendChild(copyBtn);
        tools.appendChild(regenBtn);
        wrapper.appendChild(tools);
    }

    chatbox.appendChild(wrapper);
    chatbox.scrollTop = chatbox.scrollHeight;

    return textDiv;
}

/* ---------- TYPING ---------- */
function typeText(element, text) {
    if (!element) return;

    const chatbox = document.getElementById("chatbox");
    element.innerText = "";

    let i = 0;

    function typing() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;

            if (chatbox) chatbox.scrollTop = chatbox.scrollHeight;

            setTimeout(typing, 10);
        }
    }

    typing();
}

/* ---------- THINKING ANIMATION ---------- */
function thinkingText(element) {
    let dots = 0;
    element.dataset.thinking = "true";

    const interval = setInterval(() => {
        if (element.dataset.thinking !== "true") {
            clearInterval(interval);
            return;
        }

        dots = (dots + 1) % 4;
        element.innerText = "AI is thinking" + ".".repeat(dots);
    }, 350);

    return interval;
}

/* ---------- SEND ---------- */
function sendMessage(customMessage = null) {
    const input = document.getElementById("message");
    if (!input) return;

    const message = customMessage || input.value.trim();
    if (!message) return;

    lastUserMessage = message;

    addMessage(message, "user");
    input.value = "";

    const loading = addMessage("AI is thinking...", "bot");
    thinkingText(loading);

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
        loading.dataset.thinking = "false";
        typeText(loading, data.reply || "Δεν υπάρχει απάντηση.");
    })
    .catch(() => {
        loading.dataset.thinking = "false";
        loading.innerText = "❌ Error. Δοκίμασε ξανά.";
    });
}

/* ---------- COPY ---------- */
function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert("Αντιγράφηκε!"))
        .catch(() => alert("Δεν έγινε αντιγραφή."));
}

/* ---------- REGENERATE ---------- */
function regenerateAnswer() {
    if (!lastUserMessage) {
        alert("Δεν υπάρχει προηγούμενο μήνυμα.");
        return;
    }

    sendMessage(lastUserMessage);
}

/* ---------- QUICK ACTIONS ---------- */
function quickAction(type) {
    let prompt = "";

    if (type === "idea") {
        prompt = "Δώσε μου 3 δυνατές startup ιδέες.";
    }

    if (type === "project") {
        prompt = "Δώσε μου ένα πλήρες project για portfolio με βήματα.";
    }

    if (type === "career") {
        prompt = "Βοήθησέ με να βρω την κατάλληλη καριέρα.";
    }

    if (type === "content") {
        prompt = "Δώσε μου ιδέες για viral TikTok και YouTube.";
    }

    sendMessage(prompt);
}

/* ---------- CLEAR CHAT ---------- */
function clearChat() {
    const chatbox = document.getElementById("chatbox");
    if (chatbox) chatbox.innerHTML = "";
}

/* ---------- AUTH ---------- */
function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);

        if (data.status === "success") {
            document.getElementById("userLabel").innerText = "Logged in as: " + username;
        }
    });
}

function logout() {
    fetch("/logout", { method: "POST" })
    .then(() => {
        document.getElementById("userLabel").innerText = "Not logged in";
        document.getElementById("chatbox").innerHTML =
            `<div class="bot-message"><div class="message-text">Έγινε logout.</div></div>`;
    });
}

/* ---------- ENTER SEND ---------- */
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("message");

    if (input) {
        input.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
    }

    const loader = document.getElementById("loader");

    setTimeout(() => {
        if (loader) {
            loader.classList.add("hidden");
            loader.style.display = "none";
        }
    }, 2000);
});