import React from 'react';
import './StatusBoard.css';
// import TimerBlock from './TimerBlock';


class StatusBoard extends React.Component {
    render() {
        let playerCards = this.props.players.map((player) => <PlayerCard player={player}/>);

        return (
            <div>
                <span>
                    {playerCards}
                </span>
                <span>
                    <button type="button" onClick={() => this.props.onEndTurn()}>
                        End Turn
                    </button>
                    <button type="button" onClick={() => this.props.onToggleTimers()}>
                        {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                    </button>
                    <button type="button" onClick={() => this.props.onEndRound()}>
                        End Round
                    </button>
                </span>
            </div>
        )
    }
}


class PlayerCard extends React.Component {
    render() {
        let playerColour = this.props.player.colour ? this.props.player.colour.colour : null;
        let playerStrategy = this.props.player.strategy;
        let playerStrategyButton = playerStrategy ? 
            <button 
                className="strategyCardButton" 
                type="button"
                style={{backgroundColor: playerStrategy.colour,}}
            >
                {playerStrategy.number}
            </button> : 
            null;

        return (
            <span className="playerCardColumn">
                <div type="button" className={`currentPlayerBlock${this.props.player.isActivePlayer ? " activePlayerBlock" : ""}`}>
                    {this.props.player.isActivePlayer ? "Current Player" : ""}
                </div>
                <div className="playerCard">
                    <div style={{backgroundColor: playerColour,}}>
                        <div>{this.props.player.playerName}</div>
                        <div>{this.props.player.faction}</div>
                    </div>
                    <button className= "victoryPointButton" type="button">
                        {this.props.player.victoryPoints}
                    </button>
                    <hr className="playerCardDivider"/>
                    {playerStrategyButton}
                </div>
            </span>
        )
    }
}


export default StatusBoard;