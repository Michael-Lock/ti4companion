import React from 'react';
import TimerBlock from './TimerBlock';
import Button from 'react-bootstrap/Button'

import './StatusBoard.css';

class StatusBoard extends React.Component {
    render() {
        let playerCards = this.props.players.map(
            (player) => 
            <PlayerCard key={player.playerNumber} player={player} onEndTurn={() => this.props.onEndTurn()}/>
        );

        return (
            <div>
                <span>
                    {playerCards}
                </span>
                <div>
                    <Button variant="success" type="button" onClick={() => this.props.onEndTurn()}>
                        End Turn
                    </Button>
                    <Button variant="light" type="button" onClick={() => this.props.onToggleTimers()}>
                        {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                    </Button>
                    <Button type="button" onClick={() => this.props.onEndRound()}>
                        End Round
                    </Button>
                </div>
            </div>
        )
    }
}


class PlayerCard extends React.Component {
    render() {
        const player = this.props.player;
        let playerColour = player.colour ? player.colour.colour : null;
        let playerStrategy = player.strategy;
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
            <div className="playerCardColumn">
                <div 
                    className={`currentPlayerBlock${player.isActivePlayer ? " activePlayerBlock" : ""}`}
                    onClick={this.props.onEndTurn}
                >
                    {player.isActivePlayer ? "Current Player" : ""}
                </div>
                <div className="playerCard">
                    <div style={{backgroundColor: playerColour,}}>
                        <div>{player.playerName}</div>
                        <div>{player.faction}</div>
                    </div>
                    <div>
                        <TimerBlock currentSeconds={player.timer.currentSeconds} disabled={true}/>
                    </div>
                    <button className= "victoryPointButton" type="button">
                        {player.victoryPoints}
                    </button>
                    <hr className="playerCardDivider"/>
                    {playerStrategyButton}
                </div>
            </div>
        )
    }
}


export default StatusBoard;