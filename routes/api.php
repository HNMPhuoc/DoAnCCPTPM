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

if ($request_uri === "/register" && $method === "POST") {
    echo json_encode($authController->register($data));
    exit();
}elseif ($request_uri === "/login" && $method === "POST") {
    echo json_encode($authController->login($data));
    exit();
}

$headers = getallheaders();


$authHeader = $headers["Authorization"] ?? $headers["authorization"] ?? null;
if (!$authHeader || !str_starts_with($authHeader, "Bearer ")) {
    error_log("Token không tồn tại hoặc sai định dạng!");
    http_response_code(401);
    echo json_encode(["error" => "Token is missing"]);
    exit();
}


$token = str_replace("Bearer ", "", $authHeader);
error_log("Token nhận được: " . $token);


$user = $authMiddleware->validateToken($token);
error_log("Token giải mã: " . json_encode($user));
error_log("Token không tồn tại hoặc sai định dạng! $user->id");

if (!$user || !isset($user->id)) {
    error_log("Token không hợp lệ!");
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$data["created_by"] = $user->id;
$GLOBALS['currentUser'] = $user;