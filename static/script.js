let currentMode = "general";

function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    addMessage("Mode άλλαξε σε: " + element.innerText.trim(), "bot");
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
        loading.innerText = data.reply;
        loadConversations();
    })
    .catch(error => {
        loading.innerText = "Κάτι πήγε στραβά. Δοκίμασε ξανά.";
        console.error(error);
    });
}

function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);

        if (data.status === "success") {
            document.getElementById("userLabel").innerText = "Logged in as: " + username;
            loadConversations();
        }
    });
}

function logout() {
    fetch("/logout", {method: "POST"})
    .then(res => res.json())
    .then(() => {
        document.getElementById("userLabel").innerText = "Not logged in";
        document.getElementById("chatbox").innerHTML =
            `<div class="bot-message">Έγινε logout. Μπορείς να συνεχίσεις σαν guest.</div>`;
        document.getElementById("chatList").innerHTML = "";
        alert("Έγινε logout.");
    });
}

function newChat() {
    fetch("/new_chat", {method: "POST"})
    .then(res => res.json())
    .then(() => {
        document.getElementById("chatbox").innerHTML =
            `<div class="bot-message">Νέα συνομιλία 🚀 Τι θέλεις να κάνουμε;</div>`;
        loadConversations();
    });
}

function loadConversations() {
    fetch("/conversations")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("chatList");
        list.innerHTML = "";

        data.forEach(chat => {
            const btn = document.createElement("button");
            btn.className = "chat-btn";
            btn.innerText = chat.title;
            btn.onclick = () => loadChat(chat.id);
            list.appendChild(btn);
        });
    });
}

function loadChat(id) {
    fetch("/load_chat/" + id)
    .then(res => res.json())
    .then(messages => {
        const chatbox = document.getElementById("chatbox");
        chatbox.innerHTML = "";

        messages.forEach(msg => {
            addMessage(msg.message, msg.role === "user" ? "user" : "bot");
        });
    });
}

document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

window.addEventListener("load", () => {
    setTimeout(() => {
        addMessage("Το σύστημα είναι έτοιμο. Διάλεξε mode ή γράψε κατευθείαν την ερώτησή σου.", "bot");
    }, 700);
});