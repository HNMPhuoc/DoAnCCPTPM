<?php
require_once __DIR__ . "/../models/User.php";
require_once __DIR__ . '/../vendor/autoload.php';

class AuthController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function register()
    {
        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);

        // Lấy dữ liệu từ request body
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);

        if (!isset($data['username'], $data['email'], $data['password'])) {
            return json_encode(["message" => "missing something"], JSON_UNESCAPED_UNICODE);
        }

        $user->username = $data['username'];
        $user->email = $data['email'];
        $user->password = $data['password'];

        if ($user->register()) {
            return json_encode(["message" => "success"], JSON_UNESCAPED_UNICODE);
        } else {
            return json_encode(["message" => "fail"], JSON_UNESCAPED_UNICODE);
        }
    }
}
