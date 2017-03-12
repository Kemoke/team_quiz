import React from 'react';
import ReactDOM from 'react-dom';
import Main from './views/main';
import Backend from './views/backend'
import Categories from './views/backend/categories'
import Questions from './views/backend/question'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path='/'>
            <IndexRoute component={Main}/>
            <Route path='backend' component={Backend}>
                <Route path='category' component={Categories}/>
                <Route path='question' component={Questions}/>
            </Route>
        </Route>
    </Router>
), document.getElementById('app'));
