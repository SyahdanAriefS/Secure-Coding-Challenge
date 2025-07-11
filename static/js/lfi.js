document.addEventListener('DOMContentLoaded', () => {
    const fileContents = JSON.parse(document.getElementById('file-contents-json').textContent);

    function loadFileDemo() {
        const select = document.getElementById('file');
        const file = select.value;
        const resultDiv = document.getElementById('result-message');
        
        if (!file) {
            resultDiv.innerHTML = '<div class="error">Silakan pilih file yang ingin dimuat.</div>';
            return;
        }

        resultDiv.innerHTML = '<div class="message">Loading file: ' + file + '...</div>';

        setTimeout(() => {
            if (fileContents[file]) {
                let messageClass = 'success';
                let messageText = 'File berhasil dimuat';

                if (file.includes('../') || file.includes('..\\') || file.includes('php://')) {
                    messageClass = 'error';
                    messageText = '🚨 LFI Attack Detected! File sistem berhasil diakses (dalam simulasi)';
                }

                let content = fileContents[file];

                if (file.includes('php://filter/convert.base64-encode')) {
                    try {
                        content = atob(content);
                        messageText += ' - File PHP source code berhasil dibaca melalui PHP wrapper!';
                    } catch (e) {
                        content = 'Error decoding base64: ' + content;
                    }
                }

                resultDiv.innerHTML = `
                    <div class="${messageClass}">${messageText}</div>
                    <div class="file-content">${content}</div>
                `;
            } else {
                resultDiv.innerHTML = '<div class="error">File tidak ditemukan atau tidak dapat diakses.</div>';
            }
        }, 1000);
    }

    function loadCustomFile() {
        const input = document.getElementById('custom-path');
        const select = document.getElementById('file');

        if (input.value) {
            select.value = '';
            const resultDiv = document.getElementById('result-message');

            resultDiv.innerHTML = `
                <div class="error">🚨 Custom Path Detected: ${input.value}</div>
                <div class="file-content">Simulasi: Dalam aplikasi nyata, path ini bisa digunakan untuk:
- Mengakses file konfigurasi (/etc/passwd, config.php)
- Membaca log file (/var/log/apache2/access.log)
- Mengakses file sensitif lainnya
- Melakukan directory traversal attack

Path yang Anda masukkan: ${input.value}

Ini menunjukkan betapa berbahayanya LFI vulnerability!</div>
            `;
        }
    }

    document.getElementById('file').addEventListener('change', function () {
        if (this.value) {
            document.getElementById('custom-path').value = '';
        }
        loadFileDemo();
    });

    document.getElementById('custom-path').addEventListener('change', function () {
        loadCustomFile();
    });

    document.getElementById('load-button').addEventListener('click', function () {
        loadFileDemo();
    });
});
