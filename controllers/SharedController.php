<?php
require_once __DIR__ . '/../models/Shared.php';

class SharedController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Tạo chia sẻ mới
    public function create($data) {
        $shared = new Shared($this->db);
        $shared->product_id = $data["product_id"];
        $shared->user_invt = $data["user_invt"];
        $shared->permision = $data["permision"] ?? "view"; // default là view nếu không truyền

        return $shared->create() ? ["message" => "Shared created successfully"] : ["error" => "Failed to create shared"];
    }

    // Cập nhật chia sẻ
    public function update($id, $data) {
        $query = "UPDATE shared 
                  SET product_id = :product_id, user_invt = :user_invt, permision = :permision 
                  WHERE id = :id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":product_id", $data["product_id"]);
        $stmt->bindParam(":user_invt", $data["user_invt"]);
        $stmt->bindParam(":permision", $data["permision"]);

        if ($stmt->execute()) {
            return ["message" => "Shared updated successfully"];
        } else {
            return ["error" => "Failed to update shared"];
        }
    }

    // Lấy tất cả chia sẻ
    public function getShared() {
        $shared = new Shared($this->db);
        return json_encode($shared->getAllShared(), JSON_UNESCAPED_UNICODE);
    }

    // Lấy chia sẻ theo ID
    public function getSharedById($id) {
        $shared = new Shared($this->db);
        $result = $shared->getSharedById($id);
        return $result ? $result : ["error" => "Shared not found"];
    }

    // Lấy chia sẻ theo Product ID
    public function getSharedByProductId($product_id) {
        $shared = new Shared($this->db);
        $result = $shared->getSharedByProductId($product_id);
        return $result ? $result : ["message" => "No shares found for this product"];
    }

    // ✅ Lấy chia sẻ theo User Inviter
    public function getSharedByUserInvt($user_invt) {
        $shared = new Shared($this->db);
        $result = $shared->getSharedByUserInvt($user_invt);
        return $result ? $result : ["message" => "No shares found for this user"];
    }

    // Xoá chia sẻ
    public function delete($id) {
        $shared = new Shared($this->db);
        $result = $shared->delete($id);
        
        // Kiểm tra nếu xóa thành công
        return $result ? 
            ["message" => "Shared deleted successfully"] : 
            ["error" => "Failed to delete shared"];
    }
}