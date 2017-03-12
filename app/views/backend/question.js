import React from 'react';
import {Table, FormControl, Button, Checkbox} from 'react-bootstrap';
import $ from 'jquery';

function isEdit(question) {
    return !(question.isEdit === undefined ||
    question.isEdit === false);
}

export default class Questions extends React.Component {

    constructor() {
        super();
        this.state = {
            questions: [],
            categories: [],
            newQuestion: {
                text: '',
                answers: [
                    {
                        id: 0,
                        text: '',
                        correct: 0,
                        question_id: 0
                    },
                    {
                        id: 1,
                        text: '',
                        correct: 0,
                        question_id: 0
                    },
                    {
                        id: 2,
                        text: '',
                        correct: 0,
                        question_id: 0
                    },
                    {
                        id: 3,
                        text: '',
                        correct: 0,
                        question_id: 0
                    }
                ],
                category_id: 0
            },
            edited: {}
        };
        this.onAdd = this.onAdd.bind(this);
        this.onLoadQuestion = this.onLoadQuestion.bind(this);
        this.onLoadCategories = this.onLoadCategories.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onEdit = this.onEdit.bind(this);
        $.get('http://localhost/?table=questions', this.onLoadQuestion);
        $.get('http://localhost/?table=categories', this.onLoadCategories);
    }

    onLoadQuestion(data) {
        this.setState({
            questions: data
        });
    }

    onLoadCategories(data) {
        this.setState({
            categories: data
        })
    }

    onEdit() {
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'categories',
                operation: 'edit',
                id: this.state.edited.id,
                text: this.state.edited.text,
                answers: this.state.edited.answers,
                category_id: this.state.edited.category_id
            }),
            dataType: 'json',
            success: function (data, status, request) {
                console.log(status);
                console.log(data);
                let questions = this.state.questions;
                let edited = this.state.edited;
                edited.isEdit = false;
                this.setState({
                    questions: questions,
                    edited: edited
                });
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this),
            type: 'POST',
            url: 'http://localhost/'
        })
    }

    onDelete(question) {
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'questions',
                operation: 'delete',
                id: question.id
            }),
            dataType: 'json',
            success: function (data, status, request) {
                console.log(status);
                console.log(data);
                let cats = this.state.questions;
                cats.splice(cats.indexOf(question), 1);
                this.setState({
                    questions: cats,
                });
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this),
            type: 'POST',
            url: 'http://localhost/'
        })
    }

    onAdd() {
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'questions',
                operation: 'add',
                text: this.state.newQuestion.text,
                answers: this.state.newQuestion.answers,
                category_id: this.state.newQuestion.category_id
            }),
            dataType: 'json',
            success: function (data) {
                let questions = this.state.questions;
                let cat = {};
                this.state.categories.forEach((category) => {
                    if (category.id === this.state.newQuestion.question_id)
                        cat = category;
                });
                questions.push({
                    id: data,
                    text: this.state.newQuestion.text,
                    answers: this.state.newQuestion.answers,
                    category: cat
                });
                this.setState({
                    questions: questions,
                    newQuestion: {
                        text: '',
                        answers: [
                            {
                                id: 0,
                                text: '',
                                correct: 0,
                                question_id: 0
                            },
                            {
                                id: 1,
                                text: '',
                                correct: 0,
                                question_id: 0
                            },
                            {
                                id: 2,
                                text: '',
                                correct: 0,
                                question_id: 0
                            },
                            {
                                id: 3,
                                text: '',
                                correct: 0,
                                question_id: 0
                            }
                        ],
                        category_id: 0
                    }
                });
            }.bind(this),
            type: 'POST',
            url: 'http://localhost/'
        });
    }

    render() {
        return (
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th width='0'>#</th>
                    <th>Text</th>
                    <th>Category</th>
                    <th width='0'/>
                    <th width='0'/>
                </tr>
                </thead>
                <tbody>
                {this.state.questions.map((question) => {
                    let qHTML;
                    let aHTML;
                    if (isEdit(question)) {
                        qHTML = (
                            <tr key={question.id}>
                                <td width='1'>{question.id}</td>
                                <td><FormControl value={question.text} onChange={(e) => {
                                    question.text = e.target.value;
                                    this.setState({edited: question});
                                }}/></td>
                                <td><select
                                    className="form-control"
                                    value={question.category_id}
                                    onChange={(e) => {
                                        question.category_id = e.target.value;
                                        this.setState({edited: question});
                                    }}>
                                    {this.state.categories.map((category) => {
                                        return (
                                            <option
                                                key={category.id}
                                                value={category.id}>{category.name}</option>
                                        )
                                    })}
                                </select></td>
                                <td width='1'><Button bsStyle="success" onClick={this.onEdit}>Save</Button>
                                </td>
                                <td width='1'><Button bsStyle="danger" onClick={this.onDelete.bind(this, question)}>Delete</Button>
                                </td>
                            </tr>);
                        aHTML = (
                            <tr>
                                <td>Answers</td>
                                {question.answers.map((answer) => {
                                    return (
                                        <td key={answer.id}><FormControl value={answer.text} onChange={e => {
                                            answer.text = e.target.value;
                                            this.setState({edited: question});
                                        }}/></td>
                                    )
                                })}
                            </tr>);
                    } else {
                        qHTML = (
                            <tr key={question.id}>
                                <td width='1'>{question.id}</td>
                                <td>{question.text}</td>
                                <td>{question.category.name}</td>
                                <td width='1'><Button bsStyle="success" onClick={() => {
                                    question.isEdit = true;
                                    this.setState({edited: question});
                                }}>Edit</Button>
                                </td>
                                <td width='1'><Button bsStyle="danger" onClick={this.onDelete.bind(this, question)}>Delete</Button>
                                </td>
                            </tr>);
                        aHTML = (
                            <tr style={{borderBottom: '2px black solid'}}>
                                <td>Answers</td>
                                {question.answers.map((answer) => {
                                    return (
                                        <td key={answer.id}>{answer.text}</td>
                                    )
                                })}
                            </tr>);
                    }
                    return [qHTML, aHTML];
                })}
                <tr/>
                <tr>
                    <td/>
                    <td>
                        <FormControl
                            placeholder="Question text"
                            value={this.state.newQuestion.text}
                            type="text"
                            onChange={(e) => {
                                let question = this.state.newQuestion;
                                question.text = e.target.value;
                                this.setState({newQuestion: question})
                            }}
                        />
                    </td>
                    <td>
                        <select
                            value={this.state.newQuestion.category_id}
                            className="form-control"
                            onChange={(e) => {
                                let question = this.state.newQuestion;
                                question.category_id = e.target.value;
                                this.setState({newQuestion: question});
                            }}>
                            {this.state.categories.map((category) => {
                                return (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                )
                            })}
                        </select>
                    </td>
                    <td width='1'>
                        <Button onClick={this.onAdd} bsStyle="success">Save</Button>
                    </td>
                    <td width='1'/>
                </tr>
                <tr>
                    <td>Answers</td>
                    {this.state.newQuestion.answers.map((answer) => {
                        return (
                            <td width='1000' key={answer.id}><FormControl value={answer.text} onChange={e => {
                                let newQ = this.state.newQuestion;
                                answer.text = e.target.value;
                                this.setState({newQuestion: newQ});
                            }}/></td>
                        )
                    })}
                </tr>
                </tbody>
            </Table>
        )
    }
}