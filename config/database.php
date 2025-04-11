<?php
if (!class_exists('Database')) {
    class Database
    {
        private $host = "localhost";
        private $db_name = "demo9";
        private $username = "root";
        private $password = "123456";
        public $conn;

        public function getConnection()
        {
            $this->conn = null;
            try {
                $pdo = new PDO("mysql:host=" . $this->host, $this->username, $this->password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Tạo database nếu chưa có
                $pdo->exec("CREATE DATABASE IF NOT EXISTS " . $this->db_name);
                $pdo->exec("USE " . $this->db_name);

                $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $exception) {
                echo "Connection error: " . $exception->getMessage();
            }
            return $this->conn;
        }
    }
}
