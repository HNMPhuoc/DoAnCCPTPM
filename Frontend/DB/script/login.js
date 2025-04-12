let token = localStorage.getItem("token") || "";
console.log("Loaded token:", token);

async function fetchData(url, method = "GET", body = null, auth = false) {
    let headers = { "Content-Type": "application/json" };
    let savedToken = localStorage.getItem("token");
    if (auth && savedToken) headers["Authorization"] = "Bearer " + savedToken;

    let options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log("🛠 Sending Request:", { url, method, headers, body });

    try {
        let res = await fetch(url, options);

        if (!res.ok) {
            console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
            return { error: `HTTP Error ${res.status}` };
        }

        // ✅ Chuyển sang await res.json() để đảm bảo dữ liệu không bị rỗng
        let data = await res.json();

        console.log("📩 Response (Parsed):", data);

        return data;
    } catch (err) {
        console.error("❌ Request failed:", err);
        return { error: "Request failed" };
    }
}

// ✅ Đăng ký
async function register() {
    let data = await fetchData("http://localhost:8000/register", "POST", {
        username: document.getElementById("reg-username").value,
        email: document.getElementById("reg-email").value,
        password: document.getElementById("reg-password").value
    });

    document.getElementById("reg-result").innerText = JSON.stringify(data, null, 2);
}

// ✅ Đăng nhập
async function login() {
    let data = await fetchData("http://localhost:8000/login", "POST", {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value
    });

    if (data && data.token) {
        localStorage.setItem("token", data.token);
		localStorage.setItem("user", JSON.stringify(data.session));
		let user = JSON.parse(localStorage.getItem("user"));
		console.log("User ID:", user.user_id);  // In ra user_id
		console.log("User Email:", user.email);  // In ra emai
        // Lấy thông tin người dùng sau khi lưu token
        // let user = await getCurrentUser();

        if (user && user.id) {
            localStorage.setItem("user", JSON.stringify(data.session));
            console.log("✅ User đã lưu:", user);
        }

        console.log("📩 Full Response:", data);
        console.log("📩 Current User:", user);

        // Kiểm tra và chuyển hướng
        if (data.token && user) {
            console.log("✅ Đăng nhập thành công");
            window.location.href = "../index.html";  // Chuyển hướng sau khi đăng nhập thành công
        } else {
            console.error("❌ Đăng nhập thất bại! Không tìm thấy user.");
            alert("Đăng nhập thất bại! Vui lòng kiểm tra email hoặc mật khẩu.");
        }
    } else {
        console.error("❌ Không tìm thấy token. Response:", data);
        alert("Đăng nhập thất bại! Vui lòng kiểm tra email hoặc mật khẩu.");
    }
}

// Lấy thông tin người dùng hiện tại
async function getCurrentUser() {
    let data = await fetchData("http://localhost:8000/users?current=true", "GET", null, true);
    return data;
}

function logout() {
    // Xóa token và user khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    console.log("🚪 Đã đăng xuất, token đã bị xóa.");

    // Chuyển hướng về trang đăng nhập
    window.location.href = "../html/login.html";
}

// Chuyển đổi giữa các trang đăng nhập và đăng ký
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});
