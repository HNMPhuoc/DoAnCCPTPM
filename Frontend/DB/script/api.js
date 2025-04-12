let token = localStorage.getItem("token") || "";
console.log("Loaded token:", token);
let user = JSON.parse(localStorage.getItem("user") || "{}");

console.log("Loaded user:", user);
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

console.log("📩 Full Response:", data);  // Kiểm tra phản hồi từ API

if (data && data.token) {
localStorage.setItem("token", data.token);
console.log("✅ Token đã lưu:", localStorage.getItem("token"));
} else {
    console.error("❌ Không tìm thấy token. Response:", data);
}

document.getElementById("login-result").innerText = JSON.stringify(data, null, 2);
}



// ✅ Lấy tất cả user (cần token)
async function getAllUsers() {
let data = await fetchData("http://localhost:8000/users", "GET", null, true);
document.getElementById("all-users").innerText = JSON.stringify(data, null, 2);
}

// ✅ Tìm user theo tên
async function getUserByName() {
let username = document.getElementById("search-username").value;
let data = await fetchData(`http://localhost:8000/users?username=${username}`, "GET", null, true);
document.getElementById("user-result").innerText = JSON.stringify(data, null, 2);
}

// ✅ Tạo danh mục (cần token)
async function createCategory() {
let data = await fetchData("http://localhost:8000/category", "POST", {
    name: document.getElementById("cat-name").value
}, true);

document.getElementById("cat-result").innerText = JSON.stringify(data, null, 2);
}

// ✅ Lấy tất cả danh mục
async function getAllCategories() {
let data = await fetchData("http://localhost:8000/category", "GET", null, true);
document.getElementById("all-categories").innerText = JSON.stringify(data, null, 2);
}

// ✅ Tìm danh mục theo tên
async function getCategoryByName() {
let name = document.getElementById("search-category").value;
let data = await fetchData(`http://localhost:8000/category?name=${name}`, "GET", null, true);
document.getElementById("category-result").innerText = JSON.stringify(data, null, 2);
}

async function createProduct() {
let data = await fetchData("http://localhost:8000/product", "POST", {
    name: document.getElementById("prod-name").value,
    category_id: document.getElementById("prod-category").value,
    detail: document.getElementById("dbmlInput").value
}, true);

getAllProducts();
}

// ✅ Cập nhật sản phẩm
async function updateProduct() {
let data = await fetchData(`http://localhost:8000/product/${document.getElementById("update-prod-id").value}`, "PUT", {
    name: document.getElementById("update-prod-name").value,
    category_id: document.getElementById("update-prod-category").value
}, true);

document.getElementById("update-prod-result").innerText = JSON.stringify(data, null, 2);
}


// ✅ Lấy toàn bộ sản phẩm
async function getAllProducts() {
    let data = await fetchData(`http://localhost:8000/productuser/${user.user_id}`, "GET", null, true);

    let share = await fetchData(`http://localhost:8000/shared/user/${user.user_id}`, "GET", null, true);

    
    console.log("Dữ liệu trả về từ API share:", share);
    console.log("Kiểu dữ liệu của share:", Array.isArray(share) ? "Mảng" : "Không phải mảng");

    let productbyshareduser = [];

    // Nếu share là mảng và có phần tử
    if (Array.isArray(share) && share.length > 0) {
        let sharedPromises = [];
    
        share.forEach(item => {
            let promise = fetchData(`http://localhost:8000/product/${item.product_id}`, "GET", null, true)
                .then(products => {
                    console.log("product shared");
                    console.log(products);
    
                    if (typeof products === "string") {
                        try {
                            products = JSON.parse(products);
                        } catch (err) {
                            console.error("❌ Lỗi JSON.parse:", err);
                            products = [];
                        }
                    }
    
                    // Đảm bảo là mảng (có thể API trả về 1 object thay vì mảng)
                    if (!Array.isArray(products)) {
                        products = [products];
                    }
    
                    // Gắn thêm source rồi trả về
                    return products.map(product => ({ ...product, source: "Shared User" }));
                });
    
            sharedPromises.push(promise);
        });
    
        // Đợi tất cả fetch hoàn tất
        let sharedResults = await Promise.all(sharedPromises);
    
        // Gộp tất cả mảng nhỏ thành 1 mảng lớn
        productbyshareduser = sharedResults.flat();
    }
    
    // Nếu data là string, parse về object
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (err) {
            console.error("❌ Lỗi JSON.parse data:", err);
            data = [];
        }
    }

    // Gắn thêm thuộc tính source cho data gốc
    data = data.map(product => ({ ...product, source: "My Product" }));

    // Gộp tất cả sản phẩm
    let allProducts = [...data, ...productbyshareduser];

    // Kiểm tra tbody
    let tableBody = document.getElementById("products-table-body");
    if (!tableBody) {
        console.error("❌ Không tìm thấy tbody #products-table-body!");
        return;
    }

    tableBody.innerHTML = ""; // 🧹 Xóa dữ liệu cũ trước khi cập nhật

    // 🔹 Duyệt qua từng sản phẩm để thêm vào bảng
    allProducts.forEach(product => {
        let row = document.createElement("tr"); // ⚡️ Tạo thẻ <tr> thay vì `innerHTML`
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.source}</td>
            <td>${product.created_at}</td>
            <td>${product.updated_at}</td>
            <td>
              
                <button class="action-btn" onclick="toggleActionMenu(this)">⋮</button>
                <ul class="action-menu" id="untitled-ul">
                    <button onclick="deleteRow(this,${product.id})">Deletet</button>
                    <button onclick="getProductById(${product.id})">Xem chi tiết</button>
                    <button onclick="showShareForm()">Chia sẽ</button>

                        <!-- Form chia sẻ (ẩn mặc định) -->
                        <div id="share-form-container" style="display: none;">
                            <input type="text" id="shared-user-invt" placeholder="Nhập email người dùng">
                            <br>
                            <select id="shared-permision">
                                <option value="view">View</option>
                                <option value="edit">Edit</option>
                            </select>
                            <br>
                            <button onclick="createShared(${product.id})">Gửi</button>
                            <button onclick="closeShareForm()">Hủy</button>
                        </div>
                </ul>
            </td>
        `;
        tableBody.appendChild(row); // ⚡️ Thêm hàng vào bảng
    });
}

// ✅ Hàm lấy sản phẩm theo ID và hiển thị lên HTML
async function getProductById(productId) {
    let data = await fetchData(`http://localhost:8000/product/${productId}`, "GET", null, true);

    // Kiểm tra nếu có dữ liệu sản phẩm
    if (data.error) {
        alert("Không tìm thấy sản phẩm!");
        return;
    }

    // Gán dữ liệu vào các thẻ HTML
    // document.getElementById("product-name").innerText = data.name;
    // document.getElementById("product-category").innerText = data.category_id;
    // document.getElementById("product-created-by").innerText = data.created_by;
    // document.getElementById("product-created-at").innerText = data.created_at;
    // document.getElementById("product-updated-at").innerText = data.last_updated || "N/A";

    // // Hiển thị phần thông tin chi tiết (nếu đang ẩn)
    // document.getElementById("product-detail-container").style.display = "block";
    document.getElementById("dbmlInput").value = data.detail;
    document.getElementById("comment-open").value = data.id;
    renderDiagram();
}

    // ✅ Tìm sản phẩm theo tên
async function getProductByName() {
    let name = document.getElementById("search-product").value.trim();
    if (!name) {
        alert("Vui lòng nhập tên sản phẩm!");
        return;
    }
    let data = await fetchData(`http://localhost:8000/products?name=${name}`, "GET", null, true);
    document.getElementById("product-result").innerText = JSON.stringify(data, null, 2);
}


function deleteRow(button,productId) {
    let row = button.closest("tr");
    deleteProduct(productId);
    row.remove();
}

async function deleteProduct(productId) {
    // let productId = document.getElementById("delete-product-id").value.trim();
    if (!productId) {
        alert("Vui lòng nhập ID sản phẩm!");
        return;
    }

    // Sử dụng hàm fetchData để gửi yêu cầu DELETE
    await fetchData(`http://localhost:8000/product/${productId}`, "DELETE", null, true);

    getAllProducts();
}


async function createShared(productId) {
    // Gọi hàm getUserByName để lấy thông tin người dùng
    let email = document.getElementById("shared-user-invt").value;
    let permision = document.getElementById("shared-permision").value;
    let user = await fetchData(`http://localhost:8000/users?email=${email}`, "GET", null, true);
    let userData = JSON.parse (user);

    // Kiểm tra nếu dữ liệu người dùng tồn tại
    if (userData && userData.id) {
        // Gửi yêu cầu POST để tạo chia sẻ
        let data = await fetchData("http://localhost:8000/shared", "POST", {
            user_invt: userData.id,  // Sử dụng userId từ kết quả của getUserByName
            product_id: productId,
            permision: permision
        }, true);

        // Hiển thị kết quả chia sẻ
        // document.getElementById("shared-result").innerText = JSON.stringify(data, null, 2);
        getAllProducts();
    } else {
        // Hiển thị thông báo lỗi nếu không tìm thấy người dùng
        // document.getElementById("shared-result").innerText = "User not found.";
        console.log("user not found");
    }
}

function showShareForm() {
    document.getElementById("share-form-container").style.display = "block";
    document.getElementById("shared-user-invt").value = '';  // Xóa trường input
    document.getElementById("shared-permision").value = 'view';  // Chọn quyền mặc định là 'view'
}

// Đóng form chia sẻ
function closeShareForm() {
    document.getElementById("share-form-container").style.display = "none";
}



// ✅ Gọi hàm lấy tất cả sản phẩm khi trang tải xong
document.addEventListener("DOMContentLoaded", getAllProducts);
