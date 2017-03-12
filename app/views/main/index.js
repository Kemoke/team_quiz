import React from 'react';
import style from './style.sass'
import $ from 'jquery'

export default class Main extends React.Component{

    constructor(){
        super();
        this.state = {
            categories: []
        };
        this.onClick = this.onClick.bind(this);
        this.onLoad = this.onLoad.bind(this);
        $.get('http://localhost/?table=categories', this.onLoad);
    }

    onLoad(data){
        this.setState({
            categories: data
        });
    }

    onClick(){
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'categories',
                operation: 'add',
                name: 'uwewewe'
            }),
            dataType: 'json',
            success: function (data) {
                let cats = this.state.categories;
                cats.push({
                    id: data,
                    name: 'uwewewe'
                });
                this.setState({
                    categories: cats
                });
            }.bind(this),
            type: 'POST',
            url: 'http://localhost/'
        });
    }

    render(){
        return(
            <div>
                <div className={style.sidebar}>
                    <ul className={style.categories}>
                        {this.state.categories.map((category) =>{
                            return(
                                <li key={category.id}><a href="javascript:">{category.name}</a></li>
                        )})}
                    </ul>
                </div>
                <div className={style.teambar}>

                </div>
            </div>
        )
    }
}