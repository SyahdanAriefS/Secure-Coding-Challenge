import sqlite3
from flask import render_template, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from soal import questions

QUIZ_START_TIME = datetime.now() + timedelta(seconds=10)
#QUIZ_START_TIME = datetime.strptime("2025-07-12 14:30:00", "%Y-%m-%d %H:%M:%S")

DB_PATH = 'vuln.db'

def load_questions():
    return questions

def user_has_finished_quiz(username):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT finished FROM results WHERE username = ?", (username,))
    result = c.fetchone()
    conn.close()
    return result and result[0] == 1

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    score INTEGER,
    finished INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    conn.close()

def check_login(username, password):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE username = ?", (username,))
    result = c.fetchone()
    conn.close()
    return result and check_password_hash(result[0], password)

def create_user(username, password):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        hashed = generate_password_hash(password)
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed))
        conn.commit()
        return True, "Pendaftaran berhasil!"
    except sqlite3.IntegrityError:
        return False, "Username sudah terdaftar."
    except Exception as e:
        return False, f"Error: {e}"
    finally:
        conn.close()

def render_dashboard():
    from flask import session

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM results WHERE score IS NOT NULL")
    completed = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]
    quiz_finished = completed >= total_users
    conn.close()

    now = datetime.now()
    remaining_time = max(0, int((QUIZ_START_TIME - now).total_seconds()))
    allow_start = remaining_time == 0

    return render_template(
        "dashboard.html",
        user=session.get('user'),
        quiz_finished=quiz_finished,
        countdown=remaining_time,
        allow_start=allow_start
    )

def get_scores():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT username, score, timestamp FROM results WHERE score IS NOT NULL ORDER BY score DESC, timestamp ASC")
    scores = [{'name': r[0], 'score': r[1], 'timestamp': r[2]} for r in c.fetchall()]
    conn.close()
    return scores

def get_answers_and_explanations(questions):
    answers = { f"q{q['number']}": q['answer'] for q in questions }
    explanations = {
        f"q{q['number']}": q.get('explanation', 'Penjelasan belum tersedia.')
        for q in questions
    }
    return answers, explanations

def save_score(username, score):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM results WHERE username = ?", (username,))
    if c.fetchone():
        c.execute("UPDATE results SET score = ?, finished = 1, timestamp = CURRENT_TIMESTAMP WHERE username = ?", (score, username))
    else:
        c.execute("INSERT INTO results (username, score, finished) VALUES (?, ?, 1)", (username, score))
    conn.commit()
    conn.close()

xss_payloads = {
    "reflected": [
        {
            "title": "Basic Alert Payload",
            "payload": "<script>alert('XSS Attack!')</script>"
        },
        {
            "title": "Cookie Stealing",
            "payload": "<script>alert('Cookie: ' + document.cookie)</script>"
        },
        {
            "title": "Image Tag XSS",
            "payload": "<img src='x' onerror='alert(\"XSS via img tag\")'>"
        }
    ],
    "stored": [
        {
            "title": "Persistent Alert",
            "name": "Hacker",
            "comment": "<script>alert('Stored XSS!');</script>"
        },
        {
            "title": "Keylogger Simulation",
            "name": "Keylogger",
            "comment": "<script>document.onkeypress = function(e) { alert('Key: ' + e.key); };</script>"
        }
    ],
    "dom": [
        {
            "title": "Basic DOM XSS",
            "hash": "name=<script>alert('DOM XSS!')</script>"
        },
        {
            "title": "IMG Tag DOM XSS",
            "hash": "name=<img src=x onerror=alert('DOM-XSS')>"
        },
        {
            "title": "JavaScript URL",
            "hash": "name=<a href=\"javascript:alert('Clicked!')\">Click me</a>"
        }
    ]
}

file_contents = {
    "home.txt": "Selamat datang di halaman utama!\n\nIni adalah konten halaman home yang aman dan normal.",
    "about.txt": "Tentang Kami\n\nKami adalah perusahaan teknologi yang fokus pada keamanan cyber.",
    "contact.txt": "Kontak Kami\n\nEmail: info@example.com\nTelepon: +62-21-12345678",
    "../etc/passwd": "# /etc/passwd - User account information\nroot:x:0:0:root:/root:/bin/bash\n...",
    "../../etc/shadow": "# /etc/shadow - Protected password file\nroot:$6$randomsalt$hashedpassword:...",
    "../../../windows/system32/drivers/etc/hosts": "# Windows hosts file\n127.0.0.1       localhost\n...",
    "php://filter/convert.base64-encode/resource=config.php": "PD9waHAKLy8gRGF0YWJhc2UgY29uZmlndXJhdGlvbg..."
}

