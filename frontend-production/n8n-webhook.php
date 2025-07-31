<?php
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    echo json_encode(["success" => true, "message" => "N8n webhook working", "timestamp" => date("c")]);
} else {
    echo json_encode(["status" => "N8n webhook active"]);
}
?>
