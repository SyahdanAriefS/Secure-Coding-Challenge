function performSearch() {
        const searchInput = document.getElementById('search-input').value;
        const resultsDiv = document.getElementById('search-results');
        
        resultsDiv.innerHTML = `
            <div class="warning">🚨 XSS Vulnerability Detected!</div>
            <p><strong>Search results for:</strong> ${searchInput}</p>
            <p>This is a vulnerable implementation that directly injects user input into the DOM.</p>
        `;
        resultsDiv.className = 'output-box vulnerable-output';
    }
        function SafeSearch() {
            const searchInput = document.getElementById('search-input').value;
            const resultsDiv = document.getElementById('search-results');
            
            resultsDiv.innerHTML = `
                <div class="success">✅ Safe Implementation</div>
                <p><strong>Search results for:</strong> <span id="safe-search-term"></span></p>
                <p>This implementation safely handles user input by escaping HTML characters.</p>
            `;
            document.getElementById('safe-search-term').textContent = searchInput;
            resultsDiv.className = 'output-box safe-output';
        }

        function addComment() {
            const name = document.getElementById('comment-name').value || 'Anonymous';
            const comment = document.getElementById('comment-text').value;
            
            if (!comment.trim()) {
                alert('Please enter a comment!');
                return;
            }
            
            const commentsArea = document.getElementById('comments-area');
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-box';
            
            commentDiv.innerHTML = `
                <div class="comment-author">${name}</div>
                <div class="comment-content">${comment}</div>
            `;
            
            commentsArea.appendChild(commentDiv);
            
            document.getElementById('comment-name').value = '';
            document.getElementById('comment-text').value = '';
        }

        function addSafeComment() {
            const name = document.getElementById('comment-name').value || 'Anonymous';
            const comment = document.getElementById('comment-text').value;
            
            if (!comment.trim()) {
                alert('Please enter a comment!');
                return;
            }
            
            const commentsArea = document.getElementById('comments-area');
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-box';
            
            const authorDiv = document.createElement('div');
            authorDiv.className = 'comment-author';
            authorDiv.textContent = name;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'comment-content';
            contentDiv.textContent = comment;
            
            commentDiv.appendChild(authorDiv);
            commentDiv.appendChild(contentDiv);
            commentsArea.appendChild(commentDiv);
            
            document.getElementById('comment-name').value = '';
            document.getElementById('comment-text').value = '';
        }

        function clearComments() {
            const commentsArea = document.getElementById('comments-area');
            commentsArea.innerHTML = `
                <div class="comment-box">
                    <div class="comment-author">Admin</div>
                    <div class="comment-content">Selamat datang di sistem komentar kami!</div>
                </div>
            `;
        }

        function updateDOM() {
            const urlParam = document.getElementById('url-param').value;
            const welcomeDiv = document.getElementById('welcome-message');
            
            document.getElementById('current-url').textContent = `https://example.com/page.html#${urlParam}`;
            
            const params = new URLSearchParams(urlParam);
            const name = params.get('name') || 'Guest';
            
            welcomeDiv.innerHTML = `Welcome, ${name}!`;
        }

        function updateDOMSafe() {
            const urlParam = document.getElementById('url-param').value;
            const welcomeDiv = document.getElementById('welcome-message');
            
            document.getElementById('current-url').textContent = `https://example.com/page.html#${urlParam}`;
            
            const params = new URLSearchParams(urlParam);
            const name = params.get('name') || 'Guest';
            
            welcomeDiv.textContent = `Welcome, ${name}!`;
        }

function showTab(event, targetId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(targetId).classList.add('active');
    event.currentTarget.classList.add('active');
}

        window.onload = function () {
    updateDOM();

    const cookieDemo = document.getElementById('cookie-demo');
    if (cookieDemo) {
        cookieDemo.textContent = `Document.cookie: ${document.cookie}`;
    }

    document.getElementById('vuln-comment-btn')?.addEventListener('click', addComment);
    document.getElementById('safe-comment-btn')?.addEventListener('click', addSafeComment);
    document.getElementById('clear-comments-btn')?.addEventListener('click', clearComments);
    document.getElementById('search-btn')?.addEventListener('click', performSearch);
    document.getElementById('safe-search-btn')?.addEventListener('click', SafeSearch);
    document.getElementById('dom-btn')?.addEventListener('click', updateDOM);

    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', event => {
            const targetId = btn.dataset.target;
            showTab(event, targetId);
        });
    });

    document.querySelectorAll('.test-stored-payload').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('comment-name').value = btn.dataset.name;
            document.getElementById('comment-text').value = btn.dataset.comment;
            addComment();
        });
    });

    document.querySelectorAll('.test-dom-payload').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('url-param').value = btn.dataset.hash;
            updateDOM();
        });
    });

    document.querySelectorAll('.test-reflected-payload').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('search-input');
            const payload = btn.dataset.payload;
            input.value = payload;
            performSearch();
        });
    });

    const domBtn = document.getElementById('dom-btn');
    if (domBtn) domBtn.addEventListener('click', updateDOM);
};

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', event => {
    const targetId = btn.dataset.target;
    showTab(event, targetId);
  });
});