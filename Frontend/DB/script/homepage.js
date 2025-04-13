let scale = 1;
let offsetX = 0, offsetY = 0;
let isDragging = false;
let isDraggingTable = false;
let startX, startY;
let activeTable = null;
let tableStartX, tableStartY; // Vị trí ban đầu của bảng khi kéo

const diagram = document.getElementById("diagram");
const container = document.querySelector(".diagram-container");
const connections = document.getElementById("connections");

/* Cập nhật transform */
/* Cập nhật transform */
function updateTransform() {
    diagram.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    connections.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

/* Cập nhật kích thước `#diagram` và đảm bảo mở rộng đều từ trung tâm */
function updateDiagramSize() {
    const containerRect = container.getBoundingClientRect();
    
    // Tính chiều rộng và chiều cao của diagram dựa trên kích thước của container và tỷ lệ scale
    let newWidth = containerRect.width / scale;
    let newHeight = containerRect.height / scale;

    // Đảm bảo diagram luôn có kích thước tối thiểu
    newWidth = Math.max(newWidth, 1000); // Ví dụ, chiều rộng tối thiểu là 1000px
    newHeight = Math.max(newHeight, 600); // Ví dụ, chiều cao tối thiểu là 600px

    // Cập nhật kích thước của diagram và connections
    diagram.style.width = `${newWidth}px`;
    diagram.style.height = `${newHeight}px`;
    connections.style.width = diagram.style.width;
    connections.style.height = diagram.style.height;

    // Giữ diagram luôn được căn giữa
    offsetX = (containerRect.width - newWidth * scale) / 2;
    offsetY = (containerRect.height - newHeight * scale) / 2;

    // Đảm bảo diagram luôn có kích thước đủ lớn để di chuyển
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;

    // Cập nhật transform lại sau khi thay đổi kích thước
    updateTransform();
}

/* Zoom In */
function zoomIn() {
    scale += 0.1;
    updateTransform();
    updateDiagramSize();
}

/* Zoom Out */
function zoomOut() {
    if (scale > 0.2) {
        scale -= 0.1;
        updateTransform();
        updateDiagramSize();
    }
}

/* Zoom to Fit */
function zoomToFit() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    updateTransform();
    updateDiagramSize();
}

/* Kéo sơ đồ bằng chuột */
// container.addEventListener("mousedown", (e) => {
//     if (e.target.closest(".table-box")) {
//         isDraggingTable = true;
//         activeTable = e.target.closest(".table-box");

//         // Lấy vị trí chính xác của bảng so với `container`
//         const rect = activeTable.getBoundingClientRect();
//         const containerRect = container.getBoundingClientRect();

//         startX = e.clientX;
//         startY = e.clientY;

//         // Lưu vị trí ban đầu của bảng (theo tỷ lệ scale)
//         tableStartX = (rect.left - containerRect.left) / scale;
//         tableStartY = (rect.top - containerRect.top) / scale;

//         return;
//     }

//     isDragging = true;
//     startX = e.clientX - offsetX;
//     startY = e.clientY - offsetY;
//     container.style.cursor = "grabbing";
// });

container.addEventListener("mousemove", (e) => {
    if (isDragging && !isDraggingTable) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        updateTransform();
    } else if (isDraggingTable && activeTable) {
        // Tính vị trí mới của bảng theo tỷ lệ scale để giữ đồng bộ với chuột
        let newX = tableStartX + (e.clientX - startX) / scale;
        let newY = tableStartY + (e.clientY - startY) / scale;

        activeTable.style.left = `${newX}px`;
        activeTable.style.top = `${newY}px`;
    }
});


container.addEventListener("mouseup", () => {
    isDragging = false;
    isDraggingTable = false;
    activeTable = null;
    container.style.cursor = "grab";
});

/* Zoom bằng chuột giữa */
container.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
});

/* Gọi cập nhật khi load */
window.addEventListener("resize", updateDiagramSize);

/* Chạy ngay khi mở trang */
updateDiagramSize();
