'use strict';

import React from 'react';
import style from '../style.sass';
import wrong from './wrong.mp3';
import correct from './correct.mp3';
import logo from './logo.png';
import $ from 'jquery';
import InfoBar from '../components/infobar'

const ESCAPE = 27;

function s(styles) {
    let styleString = '';
    styles.forEach(style => {
        if (style === null)
            return;
        styleString += style + " ";
    });
    return styleString;
}

export default class Main extends React.Component {

    constructor() {
        super();
        this.state = {
            categories: [],
            quizState: {
                round: -1,
                teams: [],
                currentQuestion: null,
                currentCategory: null,
                timerActive: false,
                overtime: false,
                final: false
            },
            correct: false,
            overlay: false,
            timer: 30,
            timeUp: false,
            answer: -1,
            winner: null
        };
        this.clicked = false;
        this.newState = null;
        this.history = [];
        this.timerID = 0;
        this.finalCategory = {};
        this.bindFunctions();
        $.get('http://localhost/?table=quiz', this.onLoad);
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
        this.loadOvertimeCategory = this.loadOvertimeCategory.bind(this);
        this.overtime = this.overtime.bind(this);
        this.final = this.final.bind(this);
    }

    loadOvertimeCategory(){
        let overtime = {
            name: 'Overtime',
            questions: []
        };
        this.state.categories.forEach(category => {
            category.questions.forEach(question => {
                if(!question.used)
                    overtime.questions.push(question);
            });
        });
        return overtime;
    }

    overtime(state){
        let overtimeCat = this.loadOvertimeCategory();
        let quizState = state.quizState;
        quizState.overtime = true;
        quizState.currentCategory = overtimeCat;
        quizState.round = 0;
        this.setState({
            categories: [],
            quizState: quizState
        });
    }

    final(state){
        let quizState = state.quizState;
        quizState.round = 0;
        quizState.overtime = false;
        quizState.final = true;
        quizState.currentCategory = this.finalCategory;
        quizState.teams[0].score = 0;
        quizState.teams[1].score = 0;
        this.setState({
            quizState: quizState,
            categories: []
        });
    }

    onLoadTeams(data) {
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
            this.onAnswer({correct: 0}, -1);
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
                if (this.newState !== null) {
                    if(this.newState.quizState.teams.length > 2){
                        if(!this.state.quizState.overtime)
                            this.overtime(this.newState);
                    } else {
                        if(!this.state.quizState.final)
                            this.final(this.newState);
                    }
                }
        }
    }

    onLoad(data) {
        data.map(data => {
            data.used = 0;
            return data;
        });
        this.finalCategory = data[data.length - 1];
        data.splice(data.length - 1, 1);
        this.setState({
            categories: data
        });
    }

    onCategorySelect(category) {
        let quizState = this.state.quizState;
        if (this.state.quizState.currentCategory === null) {
            category.used = 1;
            this.appendHistory('category', category);
            if (quizState.round === -1) {
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
        if (this.clicked)
            return;
        this.clicked = true;
        this.stopTimer();
        this.setState({
            answer: num
        });
        const timeout = num === -1 ? 0 : 3000;
        setTimeout(() => {
            let quizState = this.state.quizState;
            const round = quizState.round;
            quizState.currentQuestion.used = 1;
            this.setState({
                quizState: quizState,
            });
            if (answer.correct === 1) {
                this.appendHistory('answer', round % this.state.quizState.teams.length);
                quizState.teams[round % this.state.quizState.teams.length].score++;
                this.onCorrect();
            } else {
                this.appendHistory('answer', null);
                this.onWrong();
            }
        }, timeout);
    }

    onCorrect() {
        this.correct.play();
        this.setState({
            correct: true,
            overlay: true
        });
        setTimeout(() => {
            this.hideOverlay();
        }, 3000);
    }

    onWrong() {
        this.wrong.play();
        this.setState({
            correct: false,
            overlay: true
        });
        setTimeout(() => {
            this.hideOverlay();
        }, 3000);

    }

    getTeams() {
        let teams = [];
        let stateTeams = this.state.quizState.teams;
        stateTeams.sort((team1, team2) => {
            return team2.score - team1.score;
        });
        for (let i = 0; i < stateTeams.length; i++) {
            if (teams.length < 2) {
                teams.push(stateTeams[i]);
            } else {
                if (teams[i-1].score > stateTeams[i].score) {
                    break;
                } else {
                    teams.push(stateTeams[i]);
                }
            }
        }
        return teams;
    }

    hideOverlay() {
        this.clicked = false;
        let quizState = this.state.quizState;
        quizState.currentQuestion = null;
        quizState.round++;
        if (this.state.quizState.overtime) {
            const teams = quizState.teams.length;
            const divisor = this.state.round > 2 * teams ? teams : 2 * teams;
            if (quizState.round % divisor === 0) {
                let teams = this.getTeams();
                if (teams.length === 2) {
                    this.setState({
                        overlay: false,
                        answer: -1
                    });
                    this.newState = $.extend(true,{},this.state);
                    this.newState.quizState = $.extend(true,{},quizState);
                    this.newState.quizState.teams = teams;
                } else {
                    quizState.teams = teams;
                    this.setState({
                        overlay: false,
                        quizState: quizState,
                        answer: -1
                    });
                }
            } else {
                this.setState({
                    overlay: false,
                    quizState: quizState,
                    answer: -1
                });
            }
        } else if(quizState.final){
            const divisor = quizState.round > 20 ? 2 : 20;
            if(quizState.round % divisor === 0){
                if(quizState.teams[0].score > quizState.teams[1].score){
                    this.setState({
                        winner: quizState.teams[0]
                    });
                } else if (quizState.teams[0].score < quizState.teams[1].score) {
                    this.setState({
                        winner: quizState.teams[1]
                    });
                } else {
                    this.setState({
                        overlay: false,
                        quizState: quizState,
                        answer: -1
                    });
                }
            } else {
                this.setState({
                    overlay: false,
                    quizState: quizState,
                    answer: -1
                });
            }
        } else {
            if (quizState.round % 12 === 0)
                quizState.currentCategory = null;
            if (quizState.round / 12 >= 6) {
                this.newState = $.extend(true, {}, this.state);
                this.newState.quizState = $.extend(true, {}, quizState);
                this.newState.quizState.teams = this.getTeams();
                this.setState({
                    overlay: false,
                    answer: -1
                });
            } else {
                this.setState({
                    overlay: false,
                    quizState: quizState,
                    answer: -1
                });
            }
        }
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
            if (undoStep.object !== null)
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
        let teamNo = 0;
        let ans = 0;
        const letters = ['A', 'B', 'C', 'D'];
        const teamSize = this.state.quizState.teams.length * 2;
        const displayRound = this.state.quizState.final ?
            this.state.quizState.round + 1 :
            this.state.quizState.round === -1 ? 0 : ((this.state.quizState.round % teamSize) + 1);
        return (
            <div>
                <div className={style.infobg}> </div>
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
                        {this.state.quizState.currentCategory !== null ? this.state.quizState.currentCategory.questions.map(question => {
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
                        }) : ''}
                    </ul>
                </div>
                <div className={
                    this.state.quizState.currentQuestion === null ?
                        style.maintop :
                        s([style.maintop, style.active])
                }>
                    <p>
                        {this.state.quizState.currentQuestion !== null ?
                            this.state.quizState.currentQuestion.text : ''
                        }
                    </p>
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
                                        className={s([
                                            this.state.answer === ans ? style.active : null,
                                            this.state.overlay && answer.correct ? style.correct : null,
                                            this.state.overlay && this.state.answer === ans && !answer.correct ? style.incorrect : null
                                        ])}
                                    >
                                        <span>{letters[ans]}<div className={style.diamond}> </div></span>
                                        <a onClick={this.onAnswer.bind(this, answer, ans++)}>{answer.text}</a>
                                    </li>
                                )
                            }) :
                            ''
                        }
                    </ul>
                </div>
                <InfoBar round={displayRound}
                         timer={this.state.timer}
                         categoryName={
                             this.state.quizState.currentCategory !== null ?
                                 this.state.quizState.currentCategory.name :
                                 ''
                         }/>
                <div className={s([style.sidebar, style.teams])}>
                    <ul>
                        {this.state.quizState.teams.map(team => {
                            return (
                                <li key={team.id}
                                    className={
                                        this.state.quizState.round % this.state.quizState.teams.length === teamNo++ ?
                                            style.active : ''
                                    }>
                                    <a>{team.name}</a><span className={style.score}>{team.score}</span></li>
                            )
                        })}
                    </ul>
                </div>
                <div className={s([style.overlay, this.state.winner !== null ? style.active : null])}>
                    <div className={s([style.message, style.correct])}>
                        Winner: {this.state.winner !== null ? this.state.winner.name : ''}
                    </div>
                </div>
                <img src={logo} alt="logo" className={style.logo}/>
                <audio id="wrong" src={wrong} ref={(e) => this.wrong = e}/>
                <audio id="correct" src={correct} ref={(e) => this.correct = e}/>
            </div>
        )
    }
}