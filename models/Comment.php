<?php
require_once __DIR__ . '/../config/database.php';

class Comment
{
    private $conn;
    private $table_name = "comments";

    public $id;
    public $product_id;
    public $user_id;
    public $parent_id;
    public $content;
    public $created_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Tạo comment mới
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " 
            (product_id, user_id, parent_id, content, created_at) 
            VALUES (:product_id, :user_id, :parent_id, :content, NOW())";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":product_id", $this->product_id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":parent_id", $this->parent_id);
        $stmt->bindParam(":content", $this->content);

        return $stmt->execute();
    }

    // Lấy tất cả comment cho 1 product (bao gồm cả comment cha và con)
    public function getCommentsByProduct($product_id)
    {
        $query = "SELECT c.id, c.product_id, c.user_id, c.parent_id, c.content, c.created_at, u.username
                  FROM " . $this->table_name . " c
                  JOIN users u ON c.user_id = u.id
                  WHERE c.product_id = :product_id
                  ORDER BY c.created_at ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":product_id", $product_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Xóa comment (và tất cả reply liên quan)
    public function delete($comment_id)
    {
        // Xóa reply trước
        $queryReplies = "DELETE FROM " . $this->table_name . " WHERE parent_id = :parent_id";
        $stmtReplies = $this->conn->prepare($queryReplies);
        $stmtReplies->bindParam(":parent_id", $comment_id);
        $stmtReplies->execute();

        // Xóa comment chính
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $comment_id);

        return $stmt->execute();
    }
}
