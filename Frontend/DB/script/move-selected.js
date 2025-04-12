let diagrama = document.getElementById("diagram");
let selectionBox = null;
let startaX, startaY;
let isSelecting = false;
let selectedElements = [];
let isDragginga = false;
let offsetXa, offsetYa;

// Bắt đầu chọn khi nhấn chuột
diagrama.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isSelecting = true;
    startaX = e.clientX;
    startaY = e.clientY;

    // Xóa vùng chọn cũ
    selectedElements.forEach(el => el.classList.remove("selected"));
    selectedElements = [];

    // Tạo vùng chọn
    selectionBox = document.createElement("div");
    selectionBox.classList.add("selection-box");
    selectionBox.style.left = `${startaX}px`;
    selectionBox.style.top = `${startaY}px`;
    document.body.appendChild(selectionBox);
});

// Khi kéo chuột để mở rộng vùng chọn
document.addEventListener("mousemove", (e) => {
    if (isSelecting) {
        let width = Math.abs(e.clientX - startaX);
        let height = Math.abs(e.clientY - startaY);
        let left = Math.min(e.clientX, startaX);
        let top = Math.min(e.clientY, startaY);

        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
    }
});

// Khi nhả chuột để kết thúc vùng chọn
document.addEventListener("mouseup", (e) => {
    if (isSelecting) {
        isSelecting = false;

        let boxRect = selectionBox.getBoundingClientRect();
        document.body.removeChild(selectionBox);
        selectionBox = null;

        // Kiểm tra phần tử nằm trong vùng chọn
        document.querySelectorAll(".box").forEach(box => {
            let boxRectCheck = box.getBoundingClientRect();
            if (
                boxRectCheck.left >= boxRect.left &&
                boxRectCheck.right <= boxRect.right &&
                boxRectCheck.top >= boxRect.top &&
                boxRectCheck.bottom <= boxRect.bottom
            ) {
                box.classList.add("selected");
                selectedElements.push(box);
            }
        });

        if (selectedElements.length > 0) {
            isDragginga = true;
            offsetXa = e.clientX;
            offsetYa = e.clientY;
        }
    }
});

// Di chuyển nhóm khi kéo
document.addEventListener("mousemove", (e) => {
    if (isDragginga && selectedElements.length > 0) {
        let dx = e.clientX - offsetXa;
        let dy = e.clientY - offsetYa;
        selectedElements.forEach(el => {
            let left = parseInt(el.style.left) || 0;
            let top = parseInt(el.style.top) || 0;
            el.style.left = left + dx + "px";
            el.style.top = top + dy + "px";
        });
        offsetXa = e.clientX;
        offsetYa = e.clientY;
    }
});

// Khi thả chuột, ngừng kéo nhóm
document.addEventListener("mouseup", () => {
    isDragging = false;
});