let currentMode = "general";

function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");
}

function addMessage(text, type) {
    const chatbox = document.getElementById("chatbox");

    const div = document.createElement("div");
    div.className = type === "user" ? "user-message" : "bot-message";
    div.innerText = text;

    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;

    return div;
}

function typeText(element, text) {
    element.innerText = "";
    let i = 0;

    function typing() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            chatbox.scrollTop = chatbox.scrollHeight;
            setTimeout(typing, 10);
        }
    }

    typing();
}

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

document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});