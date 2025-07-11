document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.vulnerability-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    const ctfCard = document.querySelector('.ctf-card');
    if (ctfCard) {
        ctfCard.style.opacity = '0';
        ctfCard.style.transform = 'translateY(30px)';
        setTimeout(() => {
            ctfCard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            ctfCard.style.opacity = '1';
            ctfCard.style.transform = 'translateY(0)';
        }, 100);
    }

    const scoreboardPreview = document.querySelector('.scoreboard-preview');
    if (scoreboardPreview) {
        scoreboardPreview.style.opacity = '0';
        scoreboardPreview.style.transform = 'translateY(30px)';
        setTimeout(() => {
            scoreboardPreview.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            scoreboardPreview.style.opacity = '1';
            scoreboardPreview.style.transform = 'translateY(0)';
        }, 300);
    }

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        if (finalValue.includes('%')) {
            animateCounter(stat, 0, parseInt(finalValue), '%');
        } else if (finalValue.includes('$')) {
            stat.textContent = finalValue; 
        } else if (finalValue.includes('hari')) {
            animateCounter(stat, 0, parseInt(finalValue), ' hari');
        }
    });

    const countdownEl = document.getElementById('countdown-timer');
    const startBtn = document.querySelector('.ctf-btn.primary');

    let countdown = parseInt(countdownEl.textContent);

    function formatCountdown(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0 || h > 0) parts.push(`${m}m`);
        parts.push(`${s}s`);
        return parts.join(' ');
    }

    if (!isNaN(countdown) && countdown > 0) {
        countdownEl.textContent = formatCountdown(countdown);
        const interval = setInterval(() => {
            countdown--;
            countdownEl.textContent = formatCountdown(countdown);

            if (countdown <= 0) {
                clearInterval(interval);
                countdownEl.textContent = "Mulai!";
                startBtn.classList.remove("disabled");
            }
        }, 1000);
    }
});

function animateCounter(element, start, end, suffix = '') {
    let current = start;
    const increment = end / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 20);
}
