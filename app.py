from flask import Flask, render_template, request, jsonify, session
from groq import Groq
from dotenv import load_dotenv
import sqlite3
import os
import uuid

load_dotenv()

app = Flask(__name__)
app.secret_key = "kyriazidis_super_secret_key"

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def db():
    return sqlite3.connect("database.db")


def init_db():
    conn = db()
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        conversation_id TEXT,
        role TEXT,
        message TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        username TEXT,
        title TEXT
    )
    """)

    conn.commit()
    conn.close()


init_db()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"status": "error", "message": "Συμπλήρωσε όλα τα πεδία."})

    try:
        conn = db()
        c = conn.cursor()
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Ο λογαριασμός δημιουργήθηκε."})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Αυτό το username υπάρχει ήδη."})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn = db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = c.fetchone()
    conn.close()

    if user:
        session["username"] = username
        session["conversation_id"] = None
        return jsonify({"status": "success", "message": f"Καλώς ήρθες, {username}!"})

    return jsonify({"status": "error", "message": "Λάθος username ή password."})


@app.route("/new_chat", methods=["POST"])
def new_chat():
    username = session.get("username", "guest")
    conversation_id = str(uuid.uuid4())
    session["conversation_id"] = conversation_id

    conn = db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO conversations (id, username, title) VALUES (?, ?, ?)",
        (conversation_id, username, "Νέα συνομιλία")
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "conversation_id": conversation_id})


@app.route("/conversations", methods=["GET"])
def conversations():
    username = session.get("username", "guest")

    conn = db()
    c = conn.cursor()
    c.execute(
        "SELECT id, title FROM conversations WHERE username=? ORDER BY rowid DESC",
        (username,)
    )
    rows = c.fetchall()
    conn.close()

    return jsonify([
        {"id": row[0], "title": row[1]}
        for row in rows
    ])


@app.route("/load_chat/<conversation_id>", methods=["GET"])
def load_chat(conversation_id):
    username = session.get("username", "guest")
    session["conversation_id"] = conversation_id

    conn = db()
    c = conn.cursor()
    c.execute(
        "SELECT role, message FROM chats WHERE username=? AND conversation_id=? ORDER BY id ASC",
        (username, conversation_id)
    )
    rows = c.fetchall()
    conn.close()

    return jsonify([
        {"role": row[0], "message": row[1]}
        for row in rows
    ])


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        mode = data.get("mode", "general")

        if not user_message:
            return jsonify({"reply": "Γράψε κάτι για να απαντήσω."}), 400

        username = session.get("username", "guest")

        if not session.get("conversation_id"):
            conversation_id = str(uuid.uuid4())
            session["conversation_id"] = conversation_id

            conn = db()
            c = conn.cursor()
            c.execute(
                "INSERT INTO conversations (id, username, title) VALUES (?, ?, ?)",
                (conversation_id, username, user_message[:35])
            )
            conn.commit()
            conn.close()

        conversation_id = session["conversation_id"]

        mode_prompts = {
            "general": "Απάντα σαν γενικός AI assistant.",
            "career": "Λειτούργησε σαν career advisor. Κάνε ερωτήσεις και στο τέλος πρότεινε ΜΟΝΟ ΕΝΑ πράγμα.",
            "coding": "Λειτούργησε σαν coding assistant. Εξήγησε καθαρά και πρακτικά.",
            "creator": "Λειτούργησε σαν content creator coach. Δώσε ιδέες για περιεχόμενο."
        }

        system_prompt = f"""
Είσαι το Kyriazidis AI, ένα premium AI assistant φτιαγμένο από τον Κυριαζίδη.

Πρέπει να απαντάς στα ελληνικά, εκτός αν ο χρήστης ζητήσει άλλη γλώσσα.
Αν ο χρήστης γράψει με λάθη ή greeklish, προσπάθησε να καταλάβεις τι εννοεί.
Να απαντάς καθαρά, φυσικά, έξυπνα και φιλικά.
Απάντα σε οτιδήποτε γράφει ο χρήστης.

Mode:
{mode_prompts.get(mode, mode_prompts["general"])}
"""

        conn = db()
        c = conn.cursor()

        c.execute(
            "SELECT role, message FROM chats WHERE username=? AND conversation_id=? ORDER BY id ASC LIMIT 20",
            (username, conversation_id)
        )
        old_messages = c.fetchall()

        history = [{"role": role, "content": msg} for role, msg in old_messages]
        history.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": system_prompt}] + history,
            temperature=0.3
        )

        bot_reply = response.choices[0].message.content

        c.execute(
            "INSERT INTO chats (username, conversation_id, role, message) VALUES (?, ?, ?, ?)",
            (username, conversation_id, "user", user_message)
        )

        c.execute(
            "INSERT INTO chats (username, conversation_id, role, message) VALUES (?, ?, ?, ?)",
            (username, conversation_id, "assistant", bot_reply)
        )

        conn.commit()
        conn.close()

        return jsonify({"reply": bot_reply})

    except Exception as e:
        print("CHAT ERROR:", e)
        return jsonify({"reply": "Έγινε σφάλμα: " + str(e)}), 500


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(debug=True)