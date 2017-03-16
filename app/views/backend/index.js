import React from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import {browserHistory} from 'react-router';
import style from './styles.sass';

export default class Backend extends React.Component{

    constructor(){
        super();
        this.onNavigationClick = this.onNavigationClick.bind(this);
    }

    onNavigationClick(route){
        browserHistory.push(route);
    }

    render(){
        return(
            <div className={style.body}>
                <Navbar fixedTop={true}>
                    <Nav>
                        <NavItem onClick={this.onNavigationClick.bind(this, '/')}>Main</NavItem>
                        <NavItem onClick={this.onNavigationClick.bind(this, '/backend/category')}>Categories</NavItem>
                        <NavItem onClick={this.onNavigationClick.bind(this, '/backend/question')}>Questions</NavItem>
                    </Nav>
                </Navbar>
                <div className="container" style={{marginTop: '100px'}}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}