let currentMode = "general";

/* ---------- GUIDE ---------- */
function showGuide(text) {
    const guide = document.getElementById("aiGuide");
    const guideText = document.getElementById("guideText");

    if (!guide || !guideText) return;

    guideText.innerText = "";
    guide.classList.remove("hidden");

    let i = 0;
    function typing() {
        if (i < text.length) {
            guideText.innerText += text.charAt(i);
            i++;
            setTimeout(typing, 15);
        }
    }

    typing();

    setTimeout(() => {
        guide.classList.add("hidden");
    }, 5000);
}

/* ---------- HIGHLIGHT ---------- */
function highlightElement(selector, time = 4000) {
    const element = document.querySelector(selector);
    if (!element) return;

    element.classList.add("guide-highlight");

    setTimeout(() => {
        element.classList.remove("guide-highlight");
    }, time);
}

/* ---------- MODE ---------- */
function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    if (mode === "coding") {
        showGuide("Είσαι στο Coding Mode. Πες μου τι project θέλεις να φτιάξουμε.");
        highlightElement(".input-area");
    }

    if (mode === "career") {
        showGuide("Εδώ θα βρούμε τι σου ταιριάζει. Πες μου τι σου αρέσει.");
        highlightElement(".input-area");
    }

    if (mode === "creator") {
        showGuide("Θες ιδέες για content; Πες μου πλατφόρμα και κοινό.");
        highlightElement(".input-area");
    }
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

/* ---------- AUTO GUIDE ON LOAD ---------- */
window.addEventListener("load", () => {
    setTimeout(() => {
        showGuide("Καλώς ήρθες. Διάλεξε mode ή γράψε κάτι.");
        highlightElement(".mode-grid", 4000);
        highlightElement(".input-area", 4000);
    }, 2500);
});