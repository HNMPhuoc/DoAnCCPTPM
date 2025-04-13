<?php
require_once __DIR__ . '/../models/Comment.php';

class CommentController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    // Tạo comment mới
    public function create($data)
    {
        $comment = new Comment($this->db);

        $comment->product_id = $data["product_id"];
        $comment->user_id = $data["user_id"];
        $comment->parent_id = isset($data["parent_id"]) ? $data["parent_id"] : null;
        $comment->content = $data["content"];

        if ($comment->create()) {
            return ["message" => "Comment created successfully"];
        } else {
            return ["error" => "Failed to create comment"];
        }
    }

    // Lấy tất cả comment của 1 sản phẩm
    public function getCommentsByProduct($product_id)
    {
        $comment = new Comment($this->db);
        $result = $comment->getCommentsByProduct($product_id);

        if ($result) {
            return json_encode($result, JSON_UNESCAPED_UNICODE);
        } else {
            return ["message" => "No comments found"];
        }
    }

    // Xóa comment (và cả reply nếu có)
    public function delete($comment_id)
    {
        $comment = new Comment($this->db);

        if ($comment->delete($comment_id)) {
            return ["message" => "Comment deleted successfully"];
        } else {
            return ["error" => "Failed to delete comment"];
        }
    }
}
