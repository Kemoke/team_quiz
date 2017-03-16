import React from 'react';
import style from '../style.sass';
import $ from 'jquery';
import InfoBar from '../components/infobar'

const ESCAPE = 27;

function s(styles) {
    let styleString = '';
    styles.forEach(style => {
        styleString += style + " ";
    });
    return styleString;
}

export default class Main extends React.Component {

    constructor() {
        super();
        let questions = [];
        for (let i = 0; i < 20; i++) {
            questions.push({
                id: i,
                text: 'question' + i,
                used: 0,
                answers: [
                    {
                        id: 0,
                        text: 'answer1',
                        correct: 1,
                        question_id: 0
                    },
                    {
                        id: 1,
                        text: 'answer2',
                        correct: 0,
                        question_id: 0
                    },
                    {
                        id: 2,
                        text: 'answer3',
                        correct: 0,
                        question_id: 0
                    },
                    {
                        id: 3,
                        text: 'answer4',
                        correct: 0,
                        question_id: 0
                    }
                ],
            });
        }
        this.state = {
            categories: [],
            questions: questions,
            quizState: {
                round: 0,
                teams: [],
                currentQuestion: null,
                currentCategory: null,
                timerActive: false,
                overtime: false
            },
            correct: false,
            overlay: false,
            timer: 30,
            timeUp: false,
            answer: -1
        };
        this.newState = null;
        this.history = [];
        this.timerID = 0;
        this.bindFunctions = this.bindFunctions.bind(this);
        this.bindFunctions();
        $.get('http://localhost/?table=categories', this.onLoad);
        $.get('http://localhost/?table=teams', this.onLoadTeams);
    }

    bindFunctions() {
        this.onCategorySelect = this.onCategorySelect.bind(this);
        this.onQuestionSelect = this.onQuestionSelect.bind(this);
        this.onAnswer = this.onAnswer.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.onLoadTeams = this.onLoadTeams.bind(this);
        this.appendHistory = this.appendHistory.bind(this);
        this.undo = this.undo.bind(this);
        this.onCorrect = this.onCorrect.bind(this);
        this.onWrong = this.onWrong.bind(this);
        this.hideOverlay = this.hideOverlay.bind(this);
        this.timerTick = this.timerTick.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.getTeams = this.getTeams.bind(this);
    }

    onLoadTeams(data){
        let quizState = this.state.quizState;
        data = data.map(team => {
            team.score = 0;
            return team;
        });
        quizState.teams = data;
        this.setState({
            quizState: quizState
        });
    }

    timerTick() {
        let timer = this.state.timer;
        timer--;
        if (timer <= 0) {
            this.setState({
                timeUp: true,
                timer: timer
            });
            this.onAnswer({correct: 0});
        } else {
            this.setState({
                timer: timer
            });
        }
    }

    startTimer() {
        this.timerID = setInterval(this.timerTick, 1000);
        let quizState = this.state.quizState;
        quizState.timerActive = true;
        this.setState({
            quizState: quizState
        });
    }

    stopTimer() {
        clearInterval(this.timerID);
        let quizState = this.state.quizState;
        quizState.timerActive = false;
        this.setState({
            timer: 30,
            quizState: quizState
        });
    }

    componentWillMount() {
        window.addEventListener('keydown', this.onKeyPress.bind(this));
    }

    onKeyPress(event) {
        switch (event.keyCode) {
            case ESCAPE:
                console.log("a");
                this.undo();
                break;
            case 13:
                console.log("bee");
                if(this.newState !== null)
                    this.setState(this.newState);
        }
    }

    onLoad(data) {
        data.map(data => {
            data.used = 0;
            return data;
        });
        this.setState({
            categories: data
        });
    }

    onCategorySelect(category) {
        let quizState = this.state.quizState;
        if (this.state.quizState.currentCategory === null) {
            category.used = 1;
            this.appendHistory('category', category);
            if (quizState.round % 12 === 0) {
                quizState.round++;
            }
            quizState.currentCategory = category;
            this.setState({
                quizState: quizState
            });
        }
    }

    onQuestionSelect(question) {
        if (this.state.quizState.currentQuestion === null && question.used !== 1) {
            question.used = 1;
            this.appendHistory('question', question);
            let quizState = this.state.quizState;
            quizState.currentQuestion = question;
            this.setState({
                quizState: quizState,
                timeUp: false
            });
            this.startTimer();
        }
    }

    onAnswer(answer, num) {
        if(this.state.answer !== -1)
            return;
        this.stopTimer();
        this.setState({
            answer: num
        });
        setTimeout(() => {
            let quizState = this.state.quizState;
            const round = quizState.round;
            if (answer.correct === 1) {
                this.appendHistory('answer', (round % 6)-1);
                quizState.teams[(round % 6)-1].score++;
                this.onCorrect();
            } else {
                this.appendHistory('answer', null);
                this.onWrong();
            }
            quizState.currentQuestion.used = 1;
            this.setState({
                quizState: quizState,
            });
        }, 3000);
    }

    onCorrect() {
        this.setState({
            correct: true,
            overlay: true
        });
        setTimeout(() => {
            this.hideOverlay();
        }, 3000);
    }

    onWrong() {
        this.setState({
            correct: false,
            overlay: true
        });
        setTimeout(() => {
            this.hideOverlay();
        }, 3000);

    }

    getTeams(){
        let teams = [];
        let stateTeams = this.state.quizState.teams;
        stateTeams.sort((team1, team2) => {
            return team2.score - team1.score;
        });
        for (let i = 0; i < stateTeams.length; i++){
            if(teams.length < 2){
                teams.push(stateTeams[i]);
            } else {
                if (teams[1].score > stateTeams[i].score) {
                    break;
                } else {
                    teams.push(stateTeams[i]);
                }
            }
        }
        return teams;
    }

    hideOverlay() {
        let quizState = this.state.quizState;
        quizState.currentQuestion = null;
        quizState.round++;
        if (quizState.round % 12 === 0)
            quizState.currentCategory = null;
        if(quizState.round / 12 >= 5) {
            quizState.teams = this.getTeams();
            this.newState = this.state;
            this.newState.quizState = quizState;
            this.setState({
                overlay: false,
                answer: -1
            });
        }
        this.setState({
            overlay: false,
            quizState: quizState,
            answer: -1
        });
    }

    appendHistory(type, object) {
        let quizState = $.extend({}, this.state.quizState);
        this.history.push({
            type: type,
            state: quizState,
            object: object
        });
    }

    undo() {
        if (this.history.length === 0)
            return;
        let undoStep = this.history[this.history.length - 1];
        let quizState = undoStep.state;
        if (undoStep.type !== 'answer') {
            undoStep.object.used = 0;
        } else {
            if(undoStep.object !== null)
                quizState.teams[undoStep.object].score--;
        }
        if (this.state.quizState.timerActive && !quizState.timerActive) {
            this.stopTimer();
        }
        this.history.splice(this.history.length - 1, 1);
        this.setState({
            quizState: quizState
        });
    }

    render() {
        let i = 1;
        let teamNo = 1;
        let ans = 0;
        const letters = ['A', 'B', 'C', 'D'];
        return (
            <div>
                <div className={style.infobg}></div>
                <div className={s([style.sidebar, style.categories])}>
                    <ul>
                        {this.state.categories.map((category) => {
                            return (
                                <li key={category.id}
                                    className={category.used === 1 ? style.active : ''}>
                                    <a
                                        className={category.used === 1 ? style.active : ''}
                                        onClick={this.onCategorySelect.bind(this, category)}
                                    >{category.name}</a>
                                </li>
                            )
                        })}
                    </ul>
                    <ul className={this.state.quizState.currentCategory === null ? style.questions : s([style.questions, style.open])}>
                        {this.state.questions.map(question => {
                            return (
                                <li
                                    key={question.id}
                                    className={question.used === 1 ? style.active : ''}
                                ><a
                                    className={question.used === 1 ? style.active : ''}
                                    onClick={this.onQuestionSelect.bind(this, question)}
                                    onContextMenu={event => {
                                        event.preventDefault();
                                        if (question.used === 1)
                                            return;
                                        this.appendHistory('disable', question);
                                        let questions = this.state.questions;
                                        question.used = 1;
                                        this.setState({
                                            questions: questions
                                        });
                                    }}
                                >{i++}</a></li>
                            )
                        })}
                    </ul>
                </div>
                <div className={
                    this.state.quizState.currentQuestion === null ?
                        style.maintop :
                        s([style.maintop, style.active])
                }>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, repellendus.</p>
                </div>
                <div className={
                    this.state.quizState.currentQuestion === null ?
                        style.mainbottom :
                        s([style.mainbottom, style.active])
                }>
                    <ul>
                        {this.state.quizState.currentQuestion !== null ?
                            this.state.quizState.currentQuestion.answers.map(answer => {
                                return (
                                    <li
                                        key={answer.id}
                                        className={this.state.answer === ans ? style.active : ''}
                                    >
                                        <span>{letters[ans]}</span>
                                        <a onClick={this.onAnswer.bind(this, answer, ans++)}>{answer.text}</a>
                                    </li>
                                )
                            }) :
                            ''
                        }
                    </ul>
                </div>
                <InfoBar round={this.state.quizState.round % 12}
                         timer={this.state.timer}
                         categoryName={
                             this.state.quizState.currentCategory !== null ?
                                 this.state.quizState.currentCategory.name :
                                 ''
                         }/>
                <div className={s([style.sidebar, style.teams])}>
                    <ul>
                        {this.state.quizState.teams.map(team => {
                            return(
                                <li key={team.id} className={this.state.quizState.round % 6  === teamNo++ ? style.active : ''}><a>{team.name}</a><span className={style.score}>{team.score}</span></li>
                            )
                        })}
                    </ul>
                </div>
                <div
                    className={this.state.overlay ?
                        s([style.overlay, style.active]) :
                        style.overlay}>
                    <div className={s([style.message, this.state.correct ? style.correct : style.wrong])}>
                        {this.state.correct ? 'Correct answer' : this.state.timeUp ? 'Time is up' : 'Wrong answer'}
                    </div>
                </div>
            </div>
        )
    }
}