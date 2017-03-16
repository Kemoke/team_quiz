import React from 'react';
import {Table, FormControl, Button, Checkbox} from 'react-bootstrap';
import $ from 'jquery';

function isEdit(category){
    return !(category.isEdit === undefined ||
    category.isEdit === false);
}

export default class Categories extends React.Component{

    constructor(){
        super();
        this.state = {
            categories: [],
            newName: '',
            edited: {}
        };
        this.onAdd = this.onAdd.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onEdit = this.onEdit.bind(this);
        $.get('http://localhost/?table=categories', this.onLoad);
    }

    onLoad(data){
        this.setState({
            categories: data
        });
    }

    onEdit(){
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'categories',
                operation: 'edit',
                id: this.state.edited.id,
                name: this.state.edited.name
            }),
            dataType: 'json',
            success: function (data, status, request) {
                console.log(status);
                console.log(data);
                let cats = this.state.categories;
                let edited = this.state.edited;
                edited.isEdit = false;
                this.setState({
                    categories: cats,
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

    onDelete(category){
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'categories',
                operation: 'delete',
                id: category.id
            }),
            dataType: 'json',
            success: function (data, status, request) {
                console.log(status);
                console.log(data);
                let cats = this.state.categories;
                cats.splice(cats.indexOf(category), 1);
                this.setState({
                    categories: cats,
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
    
    onAdd(){
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                table: 'categories',
                operation: 'add',
                name: this.state.newName
            }),
            dataType: 'json',
            success: function (data) {
                let cats = this.state.categories;
                cats.push({
                    id: data,
                    name: this.state.newName
                });
                this.setState({
                    categories: cats,
                    newName: ''
                });
            }.bind(this),
            type: 'POST',
            url: 'http://localhost/'
        });
    }

    render(){
        let num = 1;
        return(
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th width='0'>#</th>
                    <th>Name</th>
                    <th width='0' colSpan='2'>Actions</th>
                </tr>
                </thead>
                <tbody>
                {this.state.categories.map((category) => {
                    if(isEdit(category)){
                        return(
                            <tr key={category.id}>
                                <td width='1'>{category.id}</td>
                                <td><FormControl value={category.name} onChange={(e) => {
                                    category.name = e.target.value;
                                    this.setState({edited: category});
                                }}/></td>
                                <td width='1'><Button bsStyle="link" onClick={this.onEdit}>Save</Button></td>
                                <td width='1'><Button bsStyle="link" onClick={this.onDelete.bind(this, category)}>Delete</Button></td>
                            </tr>
                        )
                    } else {
                        return(
                            <tr key={category.id}>
                                <td width='1' style={{padding: '11px'}}>{category.id}</td>
                                <td style={{padding: '11px'}}>{category.name}</td>
                                <td width='1'><Button bsStyle="link" onClick={() => {
                                    category.isEdit = true;
                                    this.setState({edited: category});
                                }}>Edit</Button>
                                </td>
                                <td width='1'><Button bsStyle="link" onClick={this.onDelete.bind(this, category)}>Delete</Button></td>
                            </tr>
                        )
                    }

                })}
                <tr>
                    <td style={{padding: '11px'}}>New</td>
                    <td>
                        <FormControl
                            placeholder="Category Name"
                            value={this.state.newName}
                            type="text"
                            onChange={(e) => {this.setState({newName: e.target.value})}}
                        />
                    </td>
                    <td width='1' colSpan='2' style={{textAlign: 'center'}}>
                        <Button onClick={this.onAdd} bsStyle="link">Save</Button>
                    </td>
                </tr>
                </tbody>
            </Table>
        )
    }
}