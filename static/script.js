function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    const chatbox = document.getElementById("chatbox");

    let botIntro = "";

    if (mode === "general") {
        botIntro = "🧠 Μπήκαμε σε General AI Mode.\n\nΕδώ μπορείς να με ρωτήσεις οτιδήποτε: ιδέες, απορίες, βοήθεια, σχέδια, σχολείο, καθημερινά θέματα ή οτιδήποτε θες να οργανώσουμε.";
    }

    if (mode === "career") {
        botIntro = "🎯 Μπήκαμε σε Career Advisor Mode.\n\nΕδώ θα μιλήσουμε σοβαρά για το τι σου ταιριάζει. Θα κοιτάξουμε τα ενδιαφέροντά σου, τις συνήθειές σου, τα δυνατά σου σημεία και στο τέλος θα σου προτείνω ΜΟΝΟ ένα πράγμα που αξίζει να δουλέψεις.";
    }

    if (mode === "coding") {
        botIntro = "💻 Μπήκαμε σε Coding Assistant Mode.\n\nΕδώ θα φτιάχνουμε projects, θα διορθώνουμε errors, θα οργανώνουμε κώδικα και θα κάνουμε τις ιδέες σου να φαίνονται επαγγελματικές.";
    }

    if (mode === "creator") {
        botIntro = "🎥 Μπήκαμε σε Content Creator Mode.\n\nΕδώ θα δουλέψουμε πάνω σε ιδέες για TikTok, YouTube, branding, captions, σενάρια και περιεχόμενο που τραβάει προσοχή.";
    }

    const loading = addMessage("● ● ●", "bot");

    setTimeout(() => {
        loading.innerText = botIntro;
    }, 500);
}