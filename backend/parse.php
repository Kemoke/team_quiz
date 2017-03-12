<?php
require_once 'db.php';

$file = fopen('questions.txt', 'r');
$questions = [];
$category = 0;
while($line = fgets($file)){
    if($line[0] != '?') {
        $category = $line;
        $line = fgets($file);
    }
    $question = [];
    $question['category_id'] = $category;
    $question['text'] = substr($line, 1, strlen($line)-1);
    $question['answers'] = [];
    for ($i = 0; $i < 4; $i++){
        $answer = [];
        $line = fgets($file);
        if($line[0] == '*')
            $answer['correct'] = 1;
        $answer['text'] = substr($line, 1, strlen($line)-1);
        array_push($question['answers'], $answer);
    }
    array_push($questions, $question);
}
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
echo 'kay';