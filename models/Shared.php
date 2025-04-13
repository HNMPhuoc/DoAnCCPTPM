<?php
require_once __DIR__ . '/../config/database.php';

class Shared {
    private $conn;
    private $table_name = "shared";

    public $id;
    public $product_id;
    public $user_invt;
    public $permision;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (product_id, user_invt, permision, created_at) 
                  VALUES (:product_id, :user_invt, :permision, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":product_id", $this->product_id);
        $stmt->bindParam(":user_invt", $this->user_invt);
        $stmt->bindParam(":permision", $this->permision);
        return $stmt->execute();
    }

    // Read all shared
    public function getAllShared() {
        $query = "SELECT * FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Read by ID
    public function getSharedById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Read by Product ID
    public function getSharedByProductId($product_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE product_id = :product_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":product_id", $product_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSharedByUserInvt($user_invt) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_invt = :user_invt";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_invt", $user_invt);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Delete
    public function delete($id) {
        // Xây dựng câu truy vấn DELETE
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
    
        // Chuẩn bị câu lệnh SQL
        $stmt = $this->conn->prepare($query);
    
        // Gắn tham số
        $stmt->bindParam(":id", $id);
    
        // Kiểm tra trước khi thực thi
        if ($stmt->execute()) {
            return true;  // Xóa thành công
        } else {
            // Log lỗi nếu không xóa thành công
            error_log("Error executing delete for id " . $id);
            return false; // Thất bại
        }
    }
    
    
}