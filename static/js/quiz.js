const quizDuration = 30 * 60;
let quizInterval;
let countdownTarget;
let currentQuizScore = 0;
let currentQuizResults = null;

window.scoreboardData = window.scoreboardData || [];

function updateCountdownDisplay() {
    const now = Date.now();
    const remaining = countdownTarget - now;
    const seconds = Math.floor((remaining / 1000) % 60);
    const minutes = Math.floor((remaining / 1000 / 60) % 60);

    const countdownEl = document.getElementById('countdown');
    const quizTabBtn = document.getElementById('quizTabBtn');

    if (remaining <= 0) {
        countdownEl.textContent = "Quiz telah dimulai!";
        quizTabBtn.disabled = false;
        quizTabBtn.title = "";
        window.quizAllowed = true;
    } else {
        countdownEl.textContent = `Waktu tersisa: ${minutes}m ${seconds}s`;
        quizTabBtn.disabled = true;
        quizTabBtn.title = "Quiz belum dimulai";
    }
}

function updateQuizTabAccess() {
    const now = new Date();
    const quizTabBtn = document.getElementById('quizTabBtn');
    if (quizTabBtn) {
        quizTabBtn.disabled = now < quizStartTime;
        quizTabBtn.title = now < quizStartTime ? "Quiz belum dimulai" : "";
    }
}

function showTab(tabName, element = null) {
    if (tabName === 'quiz' && !window.quizAllowed) {
        alert("Quiz belum dimulai. Silakan tunggu hingga waktu mulai.");
        return;
    }

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    if (element) element.classList.add('active');

    if (tabName === 'scoreboard') loadScoreboard();
}

function startTimer(duration, display) {
    let timer = duration;

    quizInterval = setInterval(() => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');

        display.textContent = `${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(quizInterval);
            alert("⏰ Waktu habis! Jawaban Anda akan disubmit otomatis.");
            autoSubmitQuiz();
        }
    }, 1000);
}

function autoSubmitQuiz() {
    const form = document.getElementById("quizForm");
    if (!form) return;

    const formData = new FormData(form);
    let score = 0;
    const total = Object.keys(window.quizAnswers || {}).length;

    for (const [name, value] of formData.entries()) {
        const number = name.replace("q", "");
        if (value === window.quizAnswers?.[number]) score++;
    }

    const percent = Math.round((score / total) * 100);
    document.getElementById("finalScore").textContent = `Skor Anda: ${score}/${total} (${percent}%)`;
    document.getElementById("feedback").textContent = 
        percent === 100 ? "🔥 Sempurna!" : 
        percent >= 70 ? "✅ Hebat!" : "Perlu belajar lebih banyak tentang secure coding. Jangan menyerah! 💪";

    document.getElementById("scoreDisplay").style.display = "block";
    submitToScoreboard(score, percent);
    showTab("scoreboard", document.getElementById("scoreboardTabBtn"));
}

function submitToScoreboard(score, percent) {
    const name = document.getElementById("participantName")?.value || "Anonim";
    fetch("/submit_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, percentage: percent, timestamp: new Date().toISOString() })
    })
    .then(res => res.json())
    .then(data => console.log("✅ Otomatis submit:", data))
    .catch(err => console.error("❌ Gagal kirim:", err));
}

function displayScoreboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;

    if (scoreboardData.length === 0) {
        leaderboard.innerHTML = `
            <div class="empty-state">
                <h3>📋 Belum ada data</h3>
                <p>Scoreboard akan muncul setelah ada peserta yang menyelesaikan quiz.</p>
            </div>
        `;
        updateStats();
        return;
    }

    const sorted = [...scoreboardData].sort((a, b) => b.score - a.score || new Date(a.timestamp) - new Date(b.timestamp));
    leaderboard.innerHTML = sorted.map((p, i) => {
        const percent = Math.round((p.score / 20) * 100);
        const label = percent === 100 ? 'Perfect Score' : percent >= 80 ? 'Excellent' : percent >= 60 ? 'Good' : percent >= 40 ? 'Fair' : 'Needs Improvement';
        const medal = ['🥇', '🥈', '🥉'][i] || '🏅';
        const crown = i === 0 ? '<div class="crown">👑</div>' : '';
        const rankClass = ['first', 'second', 'third'][i] || '';

        return `
            <div class="winner ${rankClass}" data-index="${i}">
                ${crown}
                <div class="rank">${i + 1}</div>
                <div class="winner-info">
                    <div class="winner-name">${p.name}</div>
                    <div class="winner-score">Skor: ${p.score}/20</div>
                    <div class="winner-percentage">${label} - ${percent}%</div>
                </div>
                <div class="medal">${medal}</div>
            </div>
        `;
    }).join('');
    updateStats();
    animateLeaderboard();
}

function animateLeaderboard() {
    document.querySelectorAll('.winner').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 200);
    });
}

function updateStats() {
    const total = scoreboardData.length;
    const sum = scoreboardData.reduce((a, b) => a + b.score, 0);
    const avg = total ? Math.round((sum / total / 20) * 100) : 0;
    const perfect = scoreboardData.filter(p => p.score === 20).length;

    document.getElementById('totalParticipants').textContent = total;
    document.getElementById('averageScore').textContent = avg + '%';
    document.getElementById('perfectScores').textContent = perfect;
}

function confirmAddToScoreboard() {
    const name = document.getElementById('participantName')?.value.trim();
    if (!name) return alert("Mohon masukkan nama Anda!");
    if (name.length > 50) return alert("Nama terlalu panjang!");

    fetch('/submit_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: currentQuizScore }),
        credentials: 'include'
    })
    .then(res => res.ok ? res.json() : res.json().then(err => { throw err }))
    .then(data => {
        if (data.message) {
            alert(data.message);
            showTab("scoreboard");
        } else {
            alert("Gagal menyimpan skor!");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan skor.");
    });
}

function loadScoreboard() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'none';

    setTimeout(() => {
        displayScoreboard();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('leaderboard').style.display = 'block';
    }, 800);
}

function clearScoreboard() {
    if (confirm("Hapus semua data scoreboard?")) {
        scoreboardData = [];
        displayScoreboard();
    }
}

function exportScoreboard() {
    if (!scoreboardData.length) return alert("Tidak ada data untuk diekspor.");

    const csv = [
        ['Rank', 'Name', 'Score', 'Percentage', 'Timestamp'],
        ...scoreboardData.sort((a, b) => b.score - a.score || new Date(a.timestamp) - new Date(b.timestamp))
            .map((p, i) => [
                i + 1,
                p.name,
                `${p.score}/20`,
                `${Math.round((p.score / 20) * 100)}%`,
                new Date(p.timestamp).toLocaleString()
            ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ctf_scoreboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const timeDiff = window.quizStartTime - window.serverNow;
    countdownTarget = Date.now() + timeDiff;

    setInterval(updateCountdownDisplay, 1000);
    setInterval(updateQuizTabAccess, 1000);

    updateCountdownDisplay();
    updateQuizTabAccess();
    displayScoreboard();

    document.getElementById("quizTabBtn")?.addEventListener("click", function () {
        showTab("quiz", this);
    });
    document.getElementById("scoreboardTabBtn")?.addEventListener("click", function () {
        showTab("scoreboard", this);
    });
    document.getElementById("backToQuizBtn")?.addEventListener("click", function () {
        showTab("quiz", document.getElementById("quizTabBtn"));
    });
    document.getElementById("backToDashboardBtn")?.addEventListener("click", () => {
        window.location.href = "/dashboard";
    });

    document.getElementById("quizForm")?.addEventListener("submit", function (e) {
        e.preventDefault();
        const answers = window.quizAnswers || {};
        const explanations = window.quizExplanations || {};
        let score = 0;
        let results = {};

        for (let q in answers) {
            const selected = document.querySelector(`input[name="${q}"]:checked`);
            const correct = answers[q];
            const card = document.querySelector(`input[name="${q}"]`)?.closest('.question-card');
            let resultDiv = card?.querySelector('.result');

            results[q] = (selected?.value === correct) ? 'correct' : 'incorrect';
            if (!resultDiv) {
                resultDiv = document.createElement('div');
                resultDiv.className = 'result';
                card?.appendChild(resultDiv);
            }
            resultDiv.style.display = 'block';
            resultDiv.className = `result ${results[q]}`;
            resultDiv.innerHTML = results[q] === 'correct'
                ? `<strong>✅ Benar!</strong> ${explanations[q]}`
                : `<strong>❌ Salah.</strong> Jawaban yang benar: <strong>${correct.toUpperCase()}</strong><br>${explanations[q]}`;
            
            if (results[q] === 'correct') score++;
        }

        currentQuizScore = score;
        currentQuizResults = results;

        const percent = Math.round((score / Object.keys(answers).length) * 100);
        document.getElementById("finalScore").textContent = `Skor Anda: ${score}/${Object.keys(answers).length} (${percent}%)`;
        document.getElementById("feedback").textContent = 
            percent >= 80 ? 'Excellent! 🏆' :
            percent >= 60 ? 'Good job! 📚' :
            'Perlu belajar lebih banyak tentang secure coding. Jangan menyerah! 💪';
        document.getElementById("scoreDisplay").style.display = "block";
        document.getElementById("scoreDisplay").scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById("addToScoreboardBtn")?.addEventListener("click", confirmAddToScoreboard);
    document.getElementById("refreshScoreboardBtn")?.addEventListener("click", loadScoreboard);
    document.getElementById("clearScoreboardBtn")?.addEventListener("click", clearScoreboard);

    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'scoreboard') showTab('scoreboard', document.getElementById('scoreboardTabBtn'));
    else if (tab === 'quiz' && window.quizAllowed) {
        showTab('quiz', document.getElementById('quizTabBtn'));
        const display = document.getElementById("quizTime");
        if (display) startTimer(quizDuration, display);
    } else {
        showTab('quiz', document.getElementById('quizTabBtn'));
        const display = document.getElementById("quizTime");
        if (display) startTimer(quizDuration, display);
    }
});