let currentMode = "general";

/* ---------- MODE ---------- */
function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    const oldModeMessage = document.getElementById("modeIntroMessage");
    if (oldModeMessage) oldModeMessage.remove();

    let botIntro = "";

    if (mode === "general") {
        botIntro = "🧠 Μπήκαμε σε General AI Mode.\n\nΡώτα με οτιδήποτε.";
    }

    if (mode === "career") {
        botIntro = "🎯 Μπήκαμε σε Career Mode.\n\nΠες μου για σένα και θα σου προτείνω ΜΟΝΟ ένα πράγμα.";
    }

    if (mode === "coding") {
        botIntro = "💻 Μπήκαμε σε Coding Mode.\n\nΦτιάχνουμε projects και διορθώνουμε code.";
    }

    if (mode === "creator") {
        botIntro = "🎥 Μπήκαμε σε Creator Mode.\n\nΒρίσκουμε ιδέες για content.";
    }

    const msg = addMessage(botIntro, "bot");
    msg.id = "modeIntroMessage";
}

/* ---------- ADD MESSAGE ---------- */
function addMessage(text, type) {
    const chatbox = document.getElementById("chatbox");

    const div = document.createElement("div");
    div.className = type === "user" ? "user-message" : "bot-message";
    div.innerText = text;

    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;

    return div;
}

/* ---------- TYPING EFFECT ---------- */
function typeText(element, text) {
    element.innerText = "";
    let i = 0;

    function typing() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            setTimeout(typing, 12);
        }
    }

    typing();
}

/* ---------- SEND MESSAGE ---------- */
function sendMessage() {
    const input = document.getElementById("message");
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    const loading = addMessage("● ● ●", "bot");

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
        typeText(loading, data.reply);
    })
    .catch(() => {
        loading.innerText = "❌ Error. Δοκίμασε ξανά.";
    });
}

/* ---------- VOICE INPUT ---------- */
function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "el-GR";

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        document.getElementById("message").value = text;
    };

    recognition.start();
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
            `<div class="bot-message">Έγινε logout.</div>`;
    });
}

/* ---------- ENTER SEND ---------- */
document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

/* ---------- CURSOR GLOW ---------- */
const cursorGlow = document.getElementById("cursorGlow");

document.addEventListener("mousemove", function(e) {
    if (cursorGlow) {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
    }
});

/* ---------- LOADER ---------- */
window.addEventListener("load", function() {
    const loader = document.getElementById("loader");

    setTimeout(() => {
        if (loader) loader.classList.add("hidden");
    }, 2500);
});