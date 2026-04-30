function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    const oldModeMessage = document.getElementById("modeIntroMessage");
    if (oldModeMessage) {
        oldModeMessage.remove();
    }

    let botIntro = "";

    if (mode === "general") {
        botIntro = "🧠 Μπήκαμε σε General AI Mode.\n\nΕδώ μπορείς να με ρωτήσεις οτιδήποτε.";
    }

    if (mode === "career") {
        botIntro = "🎯 Μπήκαμε σε Career Advisor Mode.\n\nΕδώ θα μιλήσουμε για τα ενδιαφέροντά σου και θα σου προτείνω ΜΟΝΟ ένα πράγμα που σου ταιριάζει.";
    }

    if (mode === "coding") {
        botIntro = "💻 Μπήκαμε σε Coding Assistant Mode.\n\nΕδώ φτιάχνουμε projects, διορθώνουμε errors και κάνουμε τον κώδικα επαγγελματικό.";
    }

    if (mode === "creator") {
        botIntro = "🎥 Μπήκαμε σε Content Creator Mode.\n\nΕδώ βρίσκουμε ιδέες για TikTok, YouTube, branding και περιεχόμενο που τραβάει προσοχή.";
    }

    const messageDiv = addMessage(botIntro, "bot");
    messageDiv.id = "modeIntroMessage";
}
const cursorGlow = document.getElementById("cursorGlow");

document.addEventListener("mousemove", function(e) {
    if (cursorGlow) {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
    }
});