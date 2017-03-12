<?php
require 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
switch ($_SERVER['REQUEST_METHOD']){
    case 'POST':
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        $operation = $data['operation'];
        $table = $data['table'];
        unset($data['operation']);
        unset($data['table']);

        switch ($operation){
            case 'add':
                if($table == 'questions'){
                    $answers = $data['answers'];
                    unset($data['answers']);
                    $db->insert($table, $data);
                    $id = $db->id();
                    foreach ($answers as $answer){
                        $answer['question_id'] = $id;
                        unset($answer['id']);
                        $db->insert('answers', $answer);
                    }
                } else {
                    $db->insert($table, $data);
                    $id = $db->id();
                }
                echo $id;
                break;
            case 'edit':
                if($table == 'questions'){
                    $answers = $data['answers'];
                    unset($data['answers']);
                    $db->update($table, $data, ['id' => $data['id']]);
                    $id = $db->id();
                    foreach ($answers as $answer){
                        $db->update('answers', $answer, ['id' => $answer['id']]);
                    }
                } else {
                    $db->update($table, $data, ['id' => $data['id']]);
                    $id = $db->id();
                }
                echo $id;
                break;
            case 'delete':
                $db->delete($table, ['id' => $data['id']]);
                echo $db->id();
                break;
        }
        break;
    case 'GET':
        $table = $_GET['table'];
        if($table == "questions") {
            $data = $db->select('questions', '*');
            for ($i = 0; $i < sizeof($data); $i++) {
                $data[$i]['answers'] = $db->select('answers', '*', ['question_id' => $data[$i]['id']]);
                $data[$i]['category'] = $db->select('categories', '*', ['id' => $data[$i]['category_id']])[0];
            }
            echo json_encode($data);
        } else {
            $data = $db->select($table, '*');
            echo json_encode($data);
        }
}
