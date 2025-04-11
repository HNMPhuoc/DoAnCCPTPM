<?php
require __DIR__ . "/../config/database.php";
require __DIR__ . "/../controllers/AuthController.php";



$db = (new Database())->getConnection();
$authController = new AuthController($db);




$request_uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$method = $_SERVER["REQUEST_METHOD"];

$json = file_get_contents("php://input");
$data = json_decode($json, true) ?? [];

// Thiết lập CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Xử lý đăng ký và đăng nhập (không cần token)
if ($request_uri === "/register" && $method === "POST") {
    echo json_encode($authController->register($data));
    exit();
}
