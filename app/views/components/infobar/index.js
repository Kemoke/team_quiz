import React from 'react'
import style from '../../style.sass'

export default class InfoBar extends React.Component {

    render() {
        return (
            <div className={style.infobar}>
                <div className={style.roundinfo}>
                    Round {this.props.round}
                </div>
                <div className={style.timer}>
                    00:{this.props.timer < 10 ? '0' : ''}{this.props.timer}
                </div>
                <div className={style.categoryinfo}>
                    {this.props.categoryName}
                </div>
            </div>
        )
    }
}