let currentMode = "general";

/* ---------- MODE ---------- */
function setMode(mode, element) {
    currentMode = mode;
    document.getElementById("mode").value = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("active");
        if (mode === "coding") {
    showGuide("Είσαι στο Coding Mode. Πες μου τι project θέλεις να φτιάξουμε.");
    highlightElement(".input-area", 4000);
}

if (mode === "career") {
    showGuide("Εδώ θα βρούμε τι σου ταιριάζει. Πες μου τι σου αρέσει.");
    highlightElement(".input-area", 4000);
}

if (mode === "creator") {
    showGuide("Θες ιδέες για content; Πες μου πλατφόρμα και κοινό.");
    highlightElement(".input-area", 4000);
}
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
/* ---------- 3D SPACE BACKGROUND ---------- */

const canvas = document.getElementById("spaceCanvas");

if (canvas && typeof THREE !== "undefined") {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.position.z = 7;

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1300;
    const starPositions = [];

    for (let i = 0; i < starCount; i++) {
        starPositions.push(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
    }

    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Red stars
    const redStarGeometry = new THREE.BufferGeometry();
    const redStarPositions = [];

    for (let i = 0; i < 350; i++) {
        redStarPositions.push(
            (Math.random() - 0.5) * 70,
            (Math.random() - 0.5) * 70,
            (Math.random() - 0.5) * 70
        );
    }

    redStarGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(redStarPositions, 3)
    );

    const redStarMaterial = new THREE.PointsMaterial({
        color: 0xff2222,
        size: 0.055,
        transparent: true,
        opacity: 0.75
    });

    const redStars = new THREE.Points(redStarGeometry, redStarMaterial);
    scene.add(redStars);

    // Main red planet
    const planetGeometry = new THREE.SphereGeometry(1.45, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b0000,
        roughness: 0.45,
        metalness: 0.15,
        emissive: 0x2b0000
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(3.7, 1.2, -1);
    scene.add(planet);

    // Planet glow
    const glowGeometry = new THREE.SphereGeometry(1.65, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.12
    });

    const planetGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    planetGlow.position.copy(planet.position);
    scene.add(planetGlow);

    // Small planet
    const smallPlanetGeometry = new THREE.SphereGeometry(0.55, 32, 32);
    const smallPlanetMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a0000,
        emissive: 0x160000
    });

    const smallPlanet = new THREE.Mesh(smallPlanetGeometry, smallPlanetMaterial);
    smallPlanet.position.set(-3.7, -1.7, -2.5);
    scene.add(smallPlanet);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff0000, 2.2, 20);
    redLight.position.set(4, 4, 5);
    scene.add(redLight);

    const whiteLight = new THREE.PointLight(0xffffff, 0.8, 20);
    whiteLight.position.set(-3, 2, 4);
    scene.add(whiteLight);

    // Shooting stars
    const shootingStars = [];

    function createShootingStar() {
        const geo = new THREE.BufferGeometry();
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-0.8, -0.35, 0)
        ];

        geo.setFromPoints(points);

        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

        const line = new THREE.Line(geo, mat);
        line.position.set(
            Math.random() * 8 - 4,
            5,
            Math.random() * -6
        );

        scene.add(line);
        shootingStars.push(line);
    }

    setInterval(createShootingStar, 1800);

    function animate() {
        requestAnimationFrame(animate);

        stars.rotation.y += 0.00045;
        redStars.rotation.y -= 0.00025;

        planet.rotation.y += 0.004;
        planetGlow.rotation.y += 0.003;
        smallPlanet.rotation.y -= 0.005;

        planet.position.y = 1.2 + Math.sin(Date.now() * 0.001) * 0.08;
        planetGlow.position.copy(planet.position);

        shootingStars.forEach((star, index) => {
            star.position.x -= 0.08;
            star.position.y -= 0.045;

            if (star.position.y < -5) {
                scene.remove(star);
                shootingStars.splice(index, 1);
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
/* ---------- LIVE 3D SPACE BACKGROUND ---------- */

const spaceCanvas = document.getElementById("spaceCanvas");

if (spaceCanvas && typeof THREE !== "undefined") {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        canvas: spaceCanvas,
        antialias: true,
        alpha: false
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 8;

    /* αστέρια άσπρα */
    function createStars(count, color, size, spread) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < count; i++) {
            positions.push(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: 0.9
        });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);
        return stars;
    }

    const whiteStars = createStars(1800, 0xffffff, 0.035, 90);
    const redStars = createStars(650, 0xff2020, 0.055, 75);
    const dimStars = createStars(900, 0x777777, 0.025, 100);

    /* κόκκινο νεφέλωμα σαν background glow */
    const nebulaGeometry = new THREE.PlaneGeometry(26, 14);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.10
    });

    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(3, 0.6, -8);
    scene.add(nebula);

    /* μεγάλος κόκκινος πλανήτης δεξιά */
    const planetGeometry = new THREE.SphereGeometry(1.75, 96, 96);
    const planetMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b0000,
        roughness: 0.52,
        metalness: 0.1,
        emissive: 0x220000
    });

    const bigPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
    bigPlanet.position.set(5.2, 1.25, -1.4);
    scene.add(bigPlanet);

    const bigPlanetGlow = new THREE.Mesh(
        new THREE.SphereGeometry(2.05, 96, 96),
        new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.13
        })
    );
    bigPlanetGlow.position.copy(bigPlanet.position);
    scene.add(bigPlanetGlow);

    /* μικρός πλανήτης πάνω δεξιά */
    const smallPlanet = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 48, 48),
        new THREE.MeshStandardMaterial({
            color: 0x330000,
            emissive: 0x110000,
            roughness: 0.6
        })
    );
    smallPlanet.position.set(2.4, 3.1, -2.2);
    scene.add(smallPlanet);

    /* μικρός πλανήτης κάτω αριστερά */
    const lowerPlanet = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 48, 48),
        new THREE.MeshStandardMaterial({
            color: 0x780000,
            emissive: 0x180000,
            roughness: 0.55
        })
    );
    lowerPlanet.position.set(-5.2, -2.9, -2);
    scene.add(lowerPlanet);

    /* φώτα */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff0000, 3.4, 30);
    redLight.position.set(5, 4, 6);
    scene.add(redLight);

    const softWhite = new THREE.PointLight(0xffffff, 0.7, 30);
    softWhite.position.set(-4, 2, 5);
    scene.add(softWhite);

    /* πεφταστέρια */
    const shootingStars = [];

    function createShootingStar() {
        const geometry = new THREE.BufferGeometry();

        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-1.4, -0.55, 0)
        ];

        geometry.setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        const star = new THREE.Line(geometry, material);

        star.position.set(
            Math.random() * 10 - 2,
            5.2,
            Math.random() * -4
        );

        star.userData.speed = 0.045 + Math.random() * 0.045;

        scene.add(star);
        shootingStars.push(star);
    }

    setInterval(createShootingStar, 1300);

    /* mouse parallax */
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
    });

    function animateSpace() {
        requestAnimationFrame(animateSpace);

        whiteStars.rotation.y += 0.00035;
        redStars.rotation.y -= 0.00025;
        dimStars.rotation.x += 0.00012;

        nebula.rotation.z += 0.0007;
        nebula.material.opacity = 0.09 + Math.sin(Date.now() * 0.001) * 0.025;

        bigPlanet.rotation.y += 0.0035;
        bigPlanet.position.y = 1.25 + Math.sin(Date.now() * 0.0008) * 0.08;
        bigPlanetGlow.position.copy(bigPlanet.position);

        smallPlanet.rotation.y -= 0.004;
        lowerPlanet.rotation.y += 0.0025;

        camera.position.x += (mouseX - camera.position.x) * 0.025;
        camera.position.y += (-mouseY - camera.position.y) * 0.025;
        camera.lookAt(scene.position);

        shootingStars.forEach((star, index) => {
            star.position.x -= star.userData.speed * 2.8;
            star.position.y -= star.userData.speed;

            if (star.position.y < -5 || star.position.x < -8) {
                scene.remove(star);
                shootingStars.splice(index, 1);
            }
        });

        renderer.render(scene, camera);
    }

    animateSpace();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
function showGuide(text) {
    const guide = document.getElementById("aiGuide");
    const guideText = document.getElementById("guideText");

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
    }, 6000);
}
window.addEventListener("load", () => {
    setTimeout(() => {
        showGuide("Καλώς ήρθες. Διάλεξε ένα mode ή γράψε κατευθείαν κάτι εδώ κάτω.");
        highlightElement(".mode-grid", 4500);
        highlightElement(".input-area", 4500);
    }, 3000);
});
function highlightElement(selector, time = 4000) {
    const element = document.querySelector(selector);

    if (!element) return;

    element.classList.add("guide-highlight");

    setTimeout(() => {
        element.classList.remove("guide-highlight");
    }, time);
}
function showGuide(text) {
    speakGuide(text);

    const guide = document.getElementById("aiGuide");
    const guideText = document.getElementById("guideText");

    ...
}