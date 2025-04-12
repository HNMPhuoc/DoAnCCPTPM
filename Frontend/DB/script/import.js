document.getElementById("mysqlToDbml").addEventListener("click", function() {
    document.getElementById("sqlFileInput").click(); // Mở hộp thoại chọn file
});

document.getElementById("sqlFileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const sqlContent = e.target.result;
            const dbml = convertSQLToDBML(sqlContent);
            document.getElementById("dbmlInput").value = dbml; // Hiển thị kết quả
        };
        reader.readAsText(file);
    }
});

function convertSQLToDBML(sql) {
    const dbmlTables = [];
    const primaryKeys = new Map(); // Lưu khóa chính của từng bảng
    const foreignKeys = []; // Danh sách khóa ngoại

    const tableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
    const fieldRegex = /(\w+) (\w+(?:\(\d+\))?)(.*?),/g;
    const pkRegex = /PRIMARY KEY \((.*?)\)/;
    const fkRegex = /FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\)(?: ON DELETE CASCADE)?/g;
    const enumRegex = /(\w+) ENUM\((.*?)\)/g;

    let match;
    while ((match = tableRegex.exec(sql)) !== null) {
        let tableName = match[1];
        let fields = match[2];

        let dbmlTable = `Table ${tableName} {\n`;

        // Xử lý khóa chính
        let pkMatch = pkRegex.exec(fields);
        if (pkMatch) {
            let pkColumns = pkMatch[1].split(",").map(c => c.trim());
            primaryKeys.set(tableName, pkColumns);
        }

        // Xử lý từng cột trong bảng
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(fields)) !== null) {
            let fieldName = fieldMatch[1];
            let fieldType = fieldMatch[2];
            let constraints = fieldMatch[3];

            let dbmlField = `  ${fieldName} ${convertSQLType(fieldType)}`;

            if (primaryKeys.get(tableName)?.includes(fieldName)) dbmlField += " [primary key]";
            if (constraints.includes("UNIQUE")) dbmlField += " [unique]";
            if (constraints.includes("NOT NULL")) dbmlField += " [not null]";
            if (/DEFAULT ('.*?'|\d+)/.test(constraints)) {
                let defaultValue = constraints.match(/DEFAULT ('.*?'|\d+)/)[1];
                dbmlField += ` [default ${defaultValue}]`;
            }
            if (constraints.includes("AUTO_INCREMENT")) dbmlField += " [auto increment]";

            dbmlTable += dbmlField + "\n";
        }

        dbmlTable += "}\n";
        dbmlTables.push(dbmlTable);

        // Xử lý khóa ngoại
        let fkMatch;
        while ((fkMatch = fkRegex.exec(fields)) !== null) {
            let column = fkMatch[1];
            let refTable = fkMatch[2];
            let refColumn = fkMatch[3];

            foreignKeys.push({ tableName, column, refTable, refColumn });
        }

        // Xử lý ENUM
        let enumMatch;
        while ((enumMatch = enumRegex.exec(fields)) !== null) {
            let column = enumMatch[1];
            let enumValues = enumMatch[2].replace(/'/g, "").split(",").map(v => `'${v.trim()}'`).join(", ");
            dbmlTables[dbmlTables.length - 1] = dbmlTables[dbmlTables.length - 1].replace(
                new RegExp(`  ${column} (.*?)\n`), 
                `  ${column} enum(${enumValues})\n`
            );
        }
    }

    // Gán khóa ngoại vào đúng cột
    foreignKeys.forEach(({ tableName, column, refTable, refColumn }) => {
        for (let i = 0; i < dbmlTables.length; i++) {
            if (dbmlTables[i].includes(`Table ${tableName} {`)) {
                dbmlTables[i] = dbmlTables[i].replace(
                    new RegExp(`  ${column} (.*?)\n`), 
                    `  ${column} $1 [ref: > ${refTable}.${refColumn}]\n`
                );
                break;
            }
        }
    });

    return dbmlTables.join("\n");
}

function convertSQLType(sqlType) {
    const typeMap = {
        "INT": "int",
        "BIGINT": "bigint",
        "FLOAT": "float",
        "DOUBLE": "double",
        "DECIMAL": "decimal",
        "TINYINT(1)": "boolean",
        "CHAR(36)": "uuid",
        "VARCHAR": "varchar(255)",
        "TEXT": "text",
        "TIMESTAMP": "timestamp",
        "DATE": "date",
        "DATETIME": "datetime",
        "TIME": "time"
    };

    const baseType = sqlType.split("(")[0].toUpperCase();
    return typeMap[baseType] || sqlType.toLowerCase();
}
