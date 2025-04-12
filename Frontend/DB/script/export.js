document.getElementById("generateSQL").addEventListener("click", function (event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>
    const dbml = document.getElementById("dbmlInput").value


    const sqlCode = convertDBMLToSQL(dbml); // Gọi hàm chuyển đổi DBML sang SQL
    downloadSQLFile(sqlCode);
});

function convertDBMLToSQL(dbml) {
    let sqlStatements = [];

    // Regex tìm bảng
    const tableRegex = /Table (\w+) \{([\s\S]*?)\}/g;
    // Regex tìm các cột trong bảng
    const fieldRegex = /(\w+) (\w+(?:\(\d+\))?)(?: \[(.*?)\])?/g;

    let match;
    while ((match = tableRegex.exec(dbml)) !== null) {
        let tableName = match[1];
        let fields = match[2];

        let createTableSQL = `CREATE TABLE ${tableName} (\n`;
        let primaryKeys = [];
        let foreignKeys = [];

        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(fields)) !== null) {
            let fieldName = fieldMatch[1];
            let fieldType = fieldMatch[2];
            let constraints = fieldMatch[3] ? fieldMatch[3].split(", ") : [];

            let sqlField = `  ${fieldName} ${convertType(fieldType)}`;

            constraints.forEach(constraint => {
                if (constraint === "primary key") {
                    primaryKeys.push(fieldName);
                }
                if (constraint === "unique") {
                    sqlField += " UNIQUE";
                }
                if (constraint === "not null") {
                    sqlField += " NOT NULL";
                }
                if (constraint.startsWith("default ")) {
                    let defaultValue = constraint.replace("default ", "");
                    sqlField += ` DEFAULT ${formatDefaultValue(defaultValue)}`;
                }
                if (constraint.startsWith("ref: >")) {
                    let refParts = constraint.split(" ");
                    if (refParts.length === 3) {
                        let refTable = refParts[2].split(".")[0]; // Lấy tên bảng
                        let refColumn = refParts[2].split(".")[1] || "id"; // Mặc định là id nếu không có cột chỉ định
                        foreignKeys.push(`  FOREIGN KEY (${fieldName}) REFERENCES ${refTable}(${refColumn}) ON DELETE CASCADE`);
                    }
                }
            });

            createTableSQL += sqlField + ",\n";
        }

        if (primaryKeys.length > 0) {
            createTableSQL += `  PRIMARY KEY (${primaryKeys.join(", ")})`;
        }

        if (foreignKeys.length > 0) {
            if (primaryKeys.length > 0) createTableSQL += ",\n";
            createTableSQL += foreignKeys.join(",\n");
        }

        createTableSQL = createTableSQL.replace(/,\n$/, "\n"); // Xóa dấu phẩy cuối dòng
        createTableSQL += "\n);\n";
        sqlStatements.push(createTableSQL);
    }

    return sqlStatements.join("\n");
}

// Chuyển đổi kiểu dữ liệu DBML → MySQL
function convertType(dbmlType) {
    const enumRegex = /enum\((.*?)\)/i;
    const match = dbmlType.match(enumRegex);
    if (match) {
        return `ENUM(${match[1].split(",").map(v => `'${v.trim()}'`).join(", ")})`;
    }

    switch (dbmlType.toLowerCase()) {
        case "int": return "INT";
        case "bigint": return "BIGINT";
        case "float": return "FLOAT";
        case "double": return "DOUBLE";
        case "decimal": return "DECIMAL(10,2)";
        case "boolean": return "TINYINT(1)";
        case "uuid": return "CHAR(36)";
        case "varchar": return "VARCHAR(255)";
        case "text": return "TEXT";
        case "timestamp": return "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
        case "date": return "DATE";
        case "datetime": return "DATETIME";
        case "time": return "TIME";
        case "enum": return "ENUM('value1', 'value2')"; // Cần thay giá trị phù hợp
        default:
            return dbmlType.includes("varchar") ? dbmlType.toUpperCase() : dbmlType;
    }
}


// Định dạng giá trị mặc định (ví dụ: chuỗi cần thêm dấu nháy đơn)
function formatDefaultValue(value) {
    if (/^\d+(\.\d+)?$/.test(value)) {
        return value; // Số giữ nguyên
    }
    return `'${value}'`; // Chuỗi cần dấu nháy đơn
}





function downloadSQLFile(sql) {
    const blob = new Blob([sql], { type: "text/sql" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "database_schema.sql";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}