<?php
require_once 'config/database.php';

class Migration {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function run() {
        try {
            // Tạo bảng Users
            $this->conn->exec("
                CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");


            // Tạo bảng Categories
            $this->conn->exec("
                CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Tạo bảng Products
            $this->conn->exec("
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    category_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                )
            ");
            $this->conn->exec("
                ALTER TABLE categories ADD COLUMN created_by INT NULL AFTER name;
            ");
            $this->conn->exec("
                ALTER TABLE products ADD COLUMN created_by INT NULL AFTER category_id;
            ");
            $this->conn->exec("
                ALTER TABLE products DROP COLUMN price;
            ");

            $this->conn->exec("
                ALTER TABLE products ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;
            ");
            $this->conn->exec("
                ALTER TABLE products ADD COLUMN detail TEXT NULL AFTER name;
            ");




        //     echo "✅ Database tables created successfully!";
        // } catch (PDOException $e) {
        //     echo "❌ Migration failed: " . $e->getMessage();
        // }
        $this->conn->exec("
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user1 VARCHAR(50),
            user2 VARCHAR(50),
            sender VARCHAR(50),
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
             )
          ");
        
        $this->conn->exec("
        CREATE TABLE IF NOT EXISTS comments (
              id INT AUTO_INCREMENT PRIMARY KEY,
              product_id INT NOT NULL,
              user_id INT NOT NULL,
              parent_id INT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
          )
        ");
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS shared (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                user_invt INT NOT NULL,
                permision VARCHAR(50) NOT NULL DEFAULT 'view',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (user_invt) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

      
        return true;
    } catch (PDOException $e) {
        return false;
    }
    }
}

// Chạy migration
$migration = new Migration();
$migration->run();
?>
