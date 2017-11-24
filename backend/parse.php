<?php
ini_set('max_execution_time', 300);
require_once 'db.php';
$file = fopen('questions.txt', 'r');
$questions = [];
$category = 0;
while($line = trim(fgets($file))){
    if($line[0] != '?') {
        $db->insert('categories', ['name' => $line]);
        $category = $db->id();
        $line = trim(fgets($file));
    }
    $question = [];
    $question['category_id'] = $category;
    $question['text'] = substr($line, 1, strlen($line)-1);
    $question['answers'] = [];
    for ($i = 0; $i < 4; $i++){
        $answer = [];
        $line = trim(fgets($file));
        if($line[0] == '*') {
            $answer['correct'] = 1;
            $answer['text'] = substr($line, 1, strlen($line)-1);
        } else {
            $answer['text'] = $line;
        }
        array_push($question['answers'], $answer);
    }
    array_push($questions, $question);
}
echo json_encode($questions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK | JSON_UNESCAPED_SLASHES);
foreach ($questions as $question){
    $answers = $question['answers'];
    unset($question['answers']);
    $db->insert('questions', $question);
    $id = $db->id();
    foreach ($answers as $answer){
        $answer['question_id'] = $id;
        $db->insert('answers', $answer);
    }
}