// function openPopup() {
//     fetch("html/untitled.html") // Load nội dung từ file popup.html
//         .then(response => response.text())
//         .then(html => {
//             document.getElementById("popup-content").innerHTML = html;
//             document.getElementById("popup").style.display = "flex";
//         })
//         .catch(error => console.error("Lỗi khi tải popup:", error));
// }

// function closePopup() {
//     document.getElementById("popup").style.display = "none";
// }

// function openPopup() {
//     document.getElementById("popupOverlay").classList.add("active");
//     document.getElementById("popupContainer").classList.add("active");
// }

// function closePopup() {
//     document.getElementById("popupOverlay").classList.remove("active");
//     document.getElementById("popupContainer").classList.remove("active");
// }
// function openPopup() {
   
//     fetch("html/untitled.html")
//     .then(response => response.text())
//     .then(data => {
//         document.getElementById("popupContainerHere").innerHTML = data;
//         document.getElementById("popupOverlay").classList.add("active");
//         document.getElementById("popupContainer").classList.add("active");
//     });
// }

// function closePopup() {
//     document.getElementById("popupOverlay").classList.remove("active");
//     document.getElementById("popupContainer").classList.remove("active");
// }
function openPopup() {
    document.getElementById("popupOverlay").classList.add("active");
    document.getElementById("popupContainer").classList.add("active");
}

function closePopup() {
    document.getElementById("popupOverlay").classList.remove("active");
    document.getElementById("popupContainer").classList.remove("active");
}


function toggleDropdown() {
    document.getElementById("dropdownMenu").classList.toggle("active");
}

document.addEventListener("click", function (event) {
    // Lặp qua tất cả các menu và đóng lại nếu nhấn ra ngoài
    document.querySelectorAll(".action-menu").forEach(menu => {
        if (!menu.contains(event.target) && !menu.previousElementSibling.contains(event.target)) {
            menu.style.display = "none";
        }
    });
});

function toggleActionMenu(button) {
    let menu = button.nextElementSibling;
    let isOpen = menu.style.display === "block";

    // Đóng tất cả menu trước khi mở cái mới
    document.querySelectorAll(".action-menu").forEach(m => (m.style.display = "none"));

    // Nếu menu chưa mở thì mở nó
    if (!isOpen) {
        menu.style.display = "block";
    }
}

// function deleteRow(button) {
//     let row = button.closest("tr");
//     row.remove();
// }

function searchTable() {
    let input = document.getElementById("searchInput");
    let filter = input.value.toLowerCase();
    let table = document.querySelector(".table-file tbody");
    let rows = table.getElementsByTagName("tr");

    for (let row of rows) {
        let firstCell = row.getElementsByTagName("td")[0]; // Cột Name
        if (firstCell) {
            let textValue = firstCell.textContent || firstCell.innerText;
            row.style.display = textValue.toLowerCase().includes(filter) ? "" : "none";
        }
    }
}



