import React from 'react'
import { Table, FormControl, Button, Checkbox } from 'react-bootstrap'
import $ from 'jquery'
import style from './styles.sass'

function isEdit (question) {
  return !(question.isEdit === undefined ||
    question.isEdit === false)
}

export default class Questions extends React.Component {

  constructor () {
    super()
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
      editedId: -1
    }
    this.edited = {}
    this.onAdd = this.onAdd.bind(this)
    this.onLoadQuestion = this.onLoadQuestion.bind(this)
    this.onLoadCategories = this.onLoadCategories.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onEdit = this.onEdit.bind(this)
    $.get('http://localhost:8001/?table=questions', this.onLoadQuestion)
    $.get('http://localhost:8001/?table=categories', this.onLoadCategories)
  }

  onLoadQuestion (data) {
    this.setState({
      questions: data
    })
  }

  onLoadCategories (data) {
    let newQ = this.state.newQuestion
    newQ.category_id = data[0].id
    this.setState({
      categories: data,
      newQuestion: newQ
    })
  }

  onEdit () {
    let answers = this.edited.answers
    for (let i = 0; i < answers.length; i++) {
      if (answers[i].text[0] === '*') {
        answers[i].correct = 1
        answers[i].text = answers[i].text.slice(1, answers[i].text.length)
      } else {
        answers[i].correct = 0
      }
    }
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'questions',
        operation: 'edit',
        id: this.edited.id,
        text: this.edited.text,
        answers: answers,
        category_id: this.edited.category_id
      }),
      dataType: 'json',
      success: function (data, status, request) {
        console.log(status)
        console.log(data)
        let questions = this.state.questions
        questions[this.state.editedId] = this.edited
        this.edited = {}
        this.setState({questions, editedId: -1})
      }.bind(this),
      error: function (request, status, error) {
        console.log(status)
        console.log(error)
      }.bind(this),
      type: 'POST',
      url: 'http://localhost:8001/'
    })
  }

  onDelete (question) {
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'questions',
        operation: 'delete',
        id: question.id
      }),
      dataType: 'json',
      success: function (data, status, request) {
        console.log(status)
        console.log(data)
        let cats = this.state.questions
        cats.splice(cats.indexOf(question), 1)
        this.setState({
          questions: cats,
        })
      }.bind(this),
      error: function (request, status, error) {
        console.log(status)
        console.log(error)
      }.bind(this),
      type: 'POST',
      url: 'http://localhost:8001/'
    })
  }

  onAdd () {
    let answers = this.state.newQuestion.answers
    for (let i = 0; i < answers.length; i++) {
      if (answers[i].text[0] === '*') {
        answers[i].correct = 1
        answers[i].text = answers[i].text.slice(1, answers[i].text.length)
        break
      }
    }
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'questions',
        operation: 'add',
        text: this.state.newQuestion.text,
        answers: answers,
        category_id: this.state.newQuestion.category_id
      }),
      dataType: 'json',
      success: function (data) {
        let questions = this.state.questions
        let cat = {}
        this.state.categories.forEach((category) => {
          if (category.id === this.state.newQuestion.question_id)
            cat = category
        })
        questions.push({
          id: data,
          text: this.state.newQuestion.text,
          answers: this.state.newQuestion.answers,
          category: cat
        })
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
        })
      }.bind(this),
      type: 'POST',
      url: 'http://localhost:8001/'
    })
  }

  render () {
    let num = 1
    return (
      <Table bordered condensed>
        <thead>
        <tr>
          <th width='0'>#</th>
          <th colSpan='3'>Text</th>
          <th>Category</th>
          <th width='0' colSpan='2'>Actions</th>
        </tr>
        </thead>
        <tbody>
        {this.state.questions.map((question, i) => {
          let qHTML
          let aHTML
          if (this.state.editedId === i) {
            let edited = this.edited
            qHTML = (
              <tr key={edited.id}>
                <td width='1' style={{padding: '11px'}}>{num++}</td>
                <td colSpan='3' style={{padding: 0}}>
                  <FormControl
                    className={style.input}
                    defaultValue={edited.text}
                    onChange={(e) => edited.text = e.target.value}
                  />
                </td>
                <td style={{padding: 0}}>
                  <select
                    className={s(['form-control', style.input])}
                    defaultValue={edited.category_id}
                    onChange={(e) => edited.category_id = e.target.value}>
                    {this.state.categories.map((category) => {
                      return (
                        <option
                          key={category.id}
                          value={category.id}>{category.name}</option>
                      )
                    })}
                  </select>
                </td>
                <td width='1' rowSpan='2' style={{verticalAlign: 'middle'}}>
                  <Button bsStyle="link"
                          onClick={this.onEdit}>Save</Button>
                </td>
                <td width='1' rowSpan='2' style={{verticalAlign: 'middle'}}>
                  <Button bsStyle="link"
                          onClick={this.onDelete.bind(this, question)}>Delete</Button>
                </td>
              </tr>)
            aHTML = (
              <tr style={{borderBottom: '1px black solid'}}>
                <td style={{padding: '11px'}}>Answers</td>
                {edited.answers.map((answer) => {
                  return (
                    <td key={answer.id} style={{padding: 0}}>
                      <FormControl
                        className={style.input}
                        defaultValue={answer.text}
                        onChange={e => answer.text = e.target.value}
                      />
                    </td>
                  )
                })}
              </tr>)
          } else {
            qHTML = (
              <tr key={question.id}>
                <td width='1' style={{padding: '11px'}}>{num++}</td>
                <td colSpan='3' style={{padding: '11px'}}>{question.text}</td>
                <td style={{padding: '11px'}}>{question.category.name}</td>
                <td width='1' rowSpan="2" style={{verticalAlign: 'middle'}}>
                  <Button bsStyle="link" onClick={() => {
                    let edited = JSON.parse(JSON.stringify(question));
                    for (let i = 0; i < question.answers.length; i++) {
                      if (edited.answers[i].correct === 1) {
                        edited.answers[i].text = '*' + edited.answers[i].text
                      }
                    }
                    this.edited = edited;
                    this.setState({editedId: i})
                  }}>Edit</Button>
                </td>
                <td width='1' rowSpan='2' style={{verticalAlign: 'middle'}}>
                  <Button bsStyle="link"
                          onClick={this.onDelete.bind(this, question)}>Delete</Button>
                </td>
              </tr>)
            aHTML = (
              <tr>
                <td style={{padding: '11px'}}>Answers</td>
                {question.answers.map((answer) => {
                  return (
                    <td key={answer.id} style={answer.correct === 1 ? {
                      fontWeight: 'bold',
                      padding: '11px',
                    } : {
                      padding: '11px',
                    }}>{answer.text}</td>
                  )
                })}
              </tr>)
          }
          return [qHTML, aHTML]
        })}
        <tr>
          <td style={{padding: '11px'}}>New</td>
          <td colSpan='3' style={{padding: 0}}>
            <FormControl
              className={style.input}
              placeholder="Question text"
              value={this.state.newQuestion.text}
              type="text"
              onChange={(e) => {
                let question = this.state.newQuestion
                question.text = e.target.value
                this.setState({newQuestion: question})
              }}
            />
          </td>
          <td style={{padding: 0}}>
            <select
              className={s(['form-control', style.input])}
              value={this.state.newQuestion.category_id}
              onChange={(e) => {
                let question = this.state.newQuestion
                question.category_id = e.target.value
                this.setState({newQuestion: question})
              }}>
              {this.state.categories.map((category) => {
                return (
                  <option key={category.id} value={category.id}>{category.name}</option>
                )
              })}
            </select>
          </td>
          <td width='1' style={{verticalAlign: 'middle', textAlign: 'center'}} colSpan='2' rowSpan='2'>
            <Button onClick={this.onAdd} bsStyle="link">Save</Button>
          </td>
        </tr>
        <tr>
          <td style={{padding: '11px'}}>Answers</td>
          {this.state.newQuestion.answers.map((answer) => {
            return (
              <td width='1000' key={answer.id} style={{padding: 0}}>
                <FormControl
                  className={style.input}
                  value={answer.text}
                  onChange={e => {
                    let newQ = this.state.newQuestion
                    answer.text = e.target.value
                    this.setState({newQuestion: newQ})
                  }}
                />
              </td>
            )
          })}
        </tr>
        </tbody>
      </Table>
    )
  }
}

function s (styles) {
  let styleString = ''
  styles.forEach(style => {
    if (style === null)
      return
    styleString += style + ' '
  })
  return styleString
}
