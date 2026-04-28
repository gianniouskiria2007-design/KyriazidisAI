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
    const mode = document.getElementById("mode").value;
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    const loading = addMessage("● ● ●", "bot");

    fetch("/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message, mode})
    })
    .then(res => res.json())
    .then(data => {
        loading.innerText = data.reply;
        loadConversations();
    })
    .catch(error => {
        loading.innerText = "Κάτι πήγε στραβά.";
        console.error(error);
    });
}

function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
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
        document.getElementById("chatbox").innerHTML = "";
        document.getElementById("chatList").innerHTML = "";
        alert("Έγινε logout.");
    });
}

function newChat() {
    fetch("/new_chat", {method: "POST"})
    .then(res => res.json())
    .then(() => {
        document.getElementById("chatbox").innerHTML =
            `<div class="bot-message">Νέα συνομιλία. Τι θέλεις να κάνουμε;</div>`;
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