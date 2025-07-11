from flask import Flask, render_template, request, session, redirect, url_for, jsonify, Response
from datetime import datetime
from soal import questions
from config import init_db, check_login, create_user, save_score, get_scores, get_answers_and_explanations, render_dashboard, QUIZ_START_TIME, load_questions, user_has_finished_quiz, xss_payloads, file_contents
import config

app = Flask(__name__)
app.secret_key = 'ctf_secret'

@app.route('/')
def index():
    return redirect(url_for('dashboard') if 'user' in session else 'login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    message = ''
    if request.method == 'POST':
        if check_login(request.form['username'], request.form['password']):
            session['user'] = request.form['username']
            return redirect(url_for('dashboard'))
        else:
            message = 'Username atau password salah.'
    return render_template('login.html', message=message)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    message = ''
    if request.method == 'POST':
        success, message = create_user(request.form['username'], request.form['password'])
    return render_template('signup.html', message=message)

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return config.render_dashboard()

@app.route('/sql_injection', methods=['GET', 'POST'])
def sql_injection():
    message = ''
    if request.method == 'POST':
        message = "Login berhasil!" if request.form['username'] == "admin' --" else "Login gagal!"
    return render_template('sql_injection.html', message=message)

@app.route('/xss', methods=['GET', 'POST'])
def xss():
    comment = request.form['comment'] if request.method == 'POST' else ""
    return render_template('xss.html', comment=comment, payloads=xss_payloads)

@app.route("/lfi")
def lfi():
    return render_template("lfi.html", file_contents=file_contents)

@app.route('/submit_score', methods=['POST'])
def submit_score():
    try:
        data = request.get_json()
        username = session.get('user')
        if data.get('score') is not None and username:
            save_score(username, data['score'])
            return jsonify({'message': 'Skor berhasil disimpan!'})
        return jsonify({'error': 'Skor atau user tidak valid'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/quiz")
def quiz():
    now = datetime.now()
    tab = request.args.get("tab", "quiz")

    questions = load_questions()
    answers, explanations = get_answers_and_explanations(questions)
    scores = get_scores()

    return render_template("quiz.html",
        user=session.get("user"),
        questions=questions,
        answers=answers,
        explanations=explanations,
        scores=scores,
        quiz_start=QUIZ_START_TIME.isoformat(),
        server_now=now.isoformat(),
        quiz_done=user_has_finished_quiz(session.get("user")),
        quiz_allowed = now >= QUIZ_START_TIME,
        default_tab = tab
    )

@app.route('/config.js')
def serve_config():
    now = datetime.now()
    questions = load_questions()
    answers, explanations = get_answers_and_explanations(questions)
    scores = get_scores()
    username = session.get("user")

    return Response(
        render_template('config.js.j2',
            quiz_allowed = now >= QUIZ_START_TIME,
            quiz_start = QUIZ_START_TIME.isoformat(),
            server_now = now.isoformat(),
            answers = answers,
            explanations = explanations,
            scores = scores,
            quiz_done = user_has_finished_quiz(username)
        ),
        mimetype='application/javascript'
    )

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.after_request
def apply_csp(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    return response

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host="0.0.0.0")
