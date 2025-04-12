let form = document.getElementById("product-form");
let overlay = document.getElementById("popupOverlay");

function toggleForm() {
    form.style.display = (form.style.display === "none" || form.style.display === "") ? "block" : "none";
    if(form.style.display === "block" ){
        overlay.classList.add("active");
    }
    else{
        overlay.classList.remove("active");
    }
}
document.addEventListener("click", function (event) {
    let form = document.getElementById("product-form");
    let overlay = document.getElementById("popupOverlay");

    // Kiểm tra nếu nhấn ra ngoài form và overlay
    if (overlay.contains(event.target)) {
        form.style.display = "none";  // Ẩn form
        overlay.classList.remove("active");  // Tắt overlay
        document.getElementById("popupContainer").classList.remove("active");
    }
});

