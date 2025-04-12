const editor = document.getElementById("dbmlInput");
const lineNumbers = document.getElementById("lineNumbers");

function updateLineNumbers() {
    const lines = editor.value.split("\n").length;
    lineNumbers.innerHTML = "";
    for (let i = 1; i <= lines; i++) {
        const lineElement = document.createElement("div");
        lineElement.textContent = i;
        lineNumbers.appendChild(lineElement);
    }
}

editor.addEventListener("input", updateLineNumbers);
editor.addEventListener("scroll", () => {
    lineNumbers.scrollTop = editor.scrollTop;
});

editor.addEventListener("click", () => {
    const lines = lineNumbers.children;
    const cursorPos = editor.selectionStart;
    const textBeforeCursor = editor.value.substring(0, cursorPos);
    const currentLine = textBeforeCursor.split("\n").length;

    Array.from(lines).forEach(line => line.classList.remove("active"));
    if (lines[currentLine - 1]) {
        lines[currentLine - 1].classList.add("active");
    }
});

// Khởi tạo số dòng ban đầu
updateLineNumbers();
