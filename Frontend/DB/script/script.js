document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("button").addEventListener("click", renderDiagram);
});

let tables = [];

function renderDiagram() {
    const input = document.getElementById("dbmlInput").value;
    const diagramContainer = document.getElementById("diagram");
    diagramContainer.innerHTML = '<svg id="connections"></svg>';

    tables = parseDBML(input);

    tables.forEach((table, index) => {
        createTableElement(table, index * 250, 50);
    });

    drawRelations();
}

function parseDBML(dbml) {
    const tableRegex = /Table (\w+) {([\s\S]*?)}/g;
    let match;
    let tables = [];

    while ((match = tableRegex.exec(dbml)) !== null) {
        let tableName = match[1];
        let fields = match[2].trim().split("\n").map(field => field.trim());

        let table = {
            name: tableName,
            fields: [],
            relations: [],
            primaryKey: null
        };

        fields.forEach((field, index) => {
            let parts = field.split(" ");
            let fieldName = parts[0];
            let fieldType = parts[1];

            // Kiểm tra Primary Key
            if (field.includes("[primary key]")) {
                table.primaryKey = { name: fieldName, rowIndex: index };
            }

            // Kiểm tra Foreign Key
            let relation = field.match(/\[ref: > (\w+)\.(\w+)]/);
            if (relation) {
                table.relations.push({
                    field: fieldName,
                    refTable: relation[1],
                    refField: relation[2],
                    rowIndex: index,
                    relationshipType: "one-to-many" // giả định 1:n cho ví dụ
                });
            }

            table.fields.push({ name: fieldName, type: fieldType });
        });

        tables.push(table);
    }

    return tables;
}

function createTableElement(table, x, y) {
    const diagramContainer = document.getElementById("diagram");

    let tableDiv = document.createElement("div");
    tableDiv.classList.add("table-box");
    tableDiv.style.left = `${x}px`;
    tableDiv.style.top = `${y}px`;
    tableDiv.dataset.table = table.name;

    let title = document.createElement("h3");
    title.textContent = table.name;

    let fieldList = document.createElement("ul");
    table.fields.forEach((field, index) => {
        let li = document.createElement("li");

        // Nếu là ENUM, hiển thị danh sách giá trị
        if (field.type.startsWith("enum")) {
            let enumValues = field.type.match(/\((.*?)\)/); // Lấy nội dung bên trong enum()
            let displayText = enumValues ? `${field.name} ENUM [${enumValues[1]}]` : `${field.name} (${field.type})`;
            li.textContent = displayText;
            li.classList.add("enum-field"); // Thêm class để style riêng
        } else {
            li.textContent = `${field.name} (${field.type})`;
        }

        li.dataset.field = field.name;
        li.dataset.index = index;
        li.dataset.table = table.name;

        // Nếu là khóa chính (PK)
        if (table.primaryKey && table.primaryKey.name === field.name) {
            li.classList.add("primary-key");
            li.addEventListener("mouseenter", highlightRelation);
            li.addEventListener("mouseleave", resetHighlight);
        }

        // Nếu là khóa ngoại (FK)
        let relation = table.relations.find(r => r.field === field.name);
        if (relation) {
            li.classList.add("foreign-key");
            li.dataset.refTable = relation.refTable;
            li.dataset.refField = relation.refField;
            li.dataset.relationshipType = relation.relationshipType; // Thêm kiểu quan hệ

            li.addEventListener("mouseenter", highlightRelation);
            li.addEventListener("mouseleave", resetHighlight);
        }

        fieldList.appendChild(li);
    });

    tableDiv.appendChild(title);
    tableDiv.appendChild(fieldList);
    diagramContainer.appendChild(tableDiv);

    makeDraggable(tableDiv);
}


function highlightRelation(event) {
    let refTable = event.target.dataset.refTable;
    let refField = event.target.dataset.refField;

    let paths = document.querySelectorAll(".relation-path");
    paths.forEach(path => {
        if (path.dataset.fromTable === refTable || path.dataset.toTable === refTable) {
            path.classList.add("active");
            let fk = document.querySelector(`[data-field='${path.dataset.fromField}']`);
            let pk = document.querySelector(`[data-field='${path.dataset.toField}']`);
            if (fk) fk.classList.add("highlight-fk");
            if (pk) pk.classList.add("highlight-pk");
        }
    });
}

function resetHighlight() {
    document.querySelectorAll(".relation-path").forEach(path => {
        path.classList.remove("active");
    });
    document.querySelectorAll(".foreign-key, .primary-key").forEach(el => {
        el.classList.remove("highlight-fk", "highlight-pk");
    });
}


function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;

    element.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
            drawRelations();
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

function drawRelations() {
    const svg = document.getElementById("connections");
    svg.innerHTML = "";

    tables.forEach(table => {
        table.relations.forEach(relation => {
            const table1 = document.querySelector(`[data-table='${table.name}']`);
            const table2 = document.querySelector(`[data-table='${relation.refTable}']`);

            if (table1 && table2) {
                let field1 = table1.querySelector(`[data-field='${relation.field}']`);
                let field2 = table2.querySelector(`[data-field='${relation.refField}']`);

                if (!field1 || !field2) return;

                let rect1 = field1.getBoundingClientRect();
                let rect2 = field2.getBoundingClientRect();

                let x1 = table1.offsetLeft + rect1.left - table1.getBoundingClientRect().left + rect1.width + 10; // Đẩy ngang ra phải 30px
                let y1 = table1.offsetTop + rect1.top - table1.getBoundingClientRect().top + rect1.height / 2;

                let x2 = table2.offsetLeft + rect2.left - table2.getBoundingClientRect().left - 10; // Đẩy ngang ra trái 30px
                let y2 = table2.offsetTop + rect2.top - table2.getBoundingClientRect().top + rect2.height / 2;

                let midX = (x1 + x2) / 2; // Trung điểm giữa hai table

                let d = `M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`;

                let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", d);
                path.setAttribute("stroke-width", "2");
                path.setAttribute("fill", "none");
                path.classList.add("relation-path");

                // Kiểm tra kiểu quan hệ
                if (relation.relationshipType === "one-to-one") {
                    path.setAttribute("stroke", "blue");
                } else if (relation.relationshipType === "one-to-many") {
                    path.setAttribute("stroke", "green");
                } else if (relation.relationshipType === "many-to-many") {
                    path.setAttribute("stroke", "red");
                    path.setAttribute("stroke-dasharray", "5,5"); // Đường đứt khúc
                } else {
                    path.setAttribute("stroke", "black");
                }

                // Thêm vào SVG
                path.dataset.fromTable = table.name;
                path.dataset.toTable = relation.refTable;
                path.dataset.relationshipType = relation.relationshipType;

                svg.appendChild(path);

                // --- TẠO LABEL CHO QUAN HỆ ---
                
                // Hàm tạo label cho quan hệ
                function createRelationLabel(text, x, y) {
                    let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    label.setAttribute("x", x);
                    label.setAttribute("y", y);
                    label.setAttribute("font-size", "12");
                    label.setAttribute("fill", "#333");
                    label.textContent = text;

                    // Thiết lập z-index cho label thông qua thứ tự appendChild
                    label.style.zIndex = 10; // Gán z-index cao hơn để nhãn nổi lên
                    return label;
                }

                // Xác định label cho mỗi đầu
                let label1Text = relation.relationshipType === "one-to-one" ? "1" :
                                 relation.relationshipType === "one-to-many" ? "n" :
                                 relation.relationshipType === "many-to-many" ? "n" : "";

                let label2Text = relation.relationshipType === "one-to-one" ? "1" :
                                 relation.relationshipType === "one-to-many" ? "1" :
                                 relation.relationshipType === "many-to-many" ? "n" : "";

                // Tạo label tại vị trí gần đầu đường nối
                let label1 = createRelationLabel(label1Text, x1 + 40, y1 - 5);
                let label2 = createRelationLabel(label2Text, x2 - 40, y2 - 5);

                svg.appendChild(label1);
                svg.appendChild(label2);
            }
        });
    });
}










// tool bar - font sizesize
let currentFontSize = 16; // Kích thước mặc định

function updateFontSize() {
    let tableBoxes = document.querySelectorAll(".table-box"); // Lấy tất cả phần tử có class "table-box"
    let fontSizeDisplay = document.getElementById("fontSizeDisplay");

    if (!fontSizeDisplay) return; // Kiểm tra null tránh lỗi

    tableBoxes.forEach(tableBox => {
        tableBox.style.fontSize = currentFontSize + 'px';
    });

    fontSizeDisplay.textContent = currentFontSize  + 'px'; // Cập nhật kích thước hiển thị
}

function increaseFontSize() {
    currentFontSize += 2;
    updateFontSize();
}

function decreaseFontSize() {
    currentFontSize -= 2;
    updateFontSize();
}

window.onload = updateFontSize; // Chạy sau khi load trang

// tool bar - ẩn các phần tử, chừa lại tên với relationship
function filterListItems() {
    let tableBoxes = document.querySelectorAll(".table-box"); // Lấy tất cả phần tử có class "table-box"

    tableBoxes.forEach(tableBox => {
        let listItems = tableBox.querySelectorAll("li"); // Chỉ lấy <li> trong ".table-box"

        listItems.forEach(li => {
            if (!li.classList.length) { 
                li.style.display = "none"; // Ẩn các <li> không có class
            } else if (li.classList.contains("relation")) {
                li.style.display = "list-item"; // Giữ lại <li> có class "relation"
            }
        });
    });
}




