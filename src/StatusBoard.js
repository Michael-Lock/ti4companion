import React from 'react';
import TimerBlock from './TimerBlock';
import Button from 'react-bootstrap/Button'
import {Row, Col} from 'react-bootstrap'

import './StatusBoard.css';

class StatusBoard extends React.Component {
    render() {
        let playerCards = this.props.players.map(
            (player) => 
            <Col key={player.playerNumber}>
                <PlayerCard 
                    key={player.playerNumber} 
                    player={player} 
                    onEndTurn={() => this.props.onEndTurn()}
                    onVictoryPointsClick={e => this.props.onVictoryPointsClick(e, JSON.stringify(player))}
                />
            </Col>
        );

        return (
            <Row className="d-flex flex-column">
                <Row>
                    {playerCards}
                </Row>
                <Row className="d-flex align-items-end">
                    <Col s={{ span: 3, offset: 1}}>
                        <Button variant="success" type="button" onClick={() => this.props.onEndTurn()}>
                            End Turn
                        </Button>
                    </Col>
                    <Col s={{ span: 3, offset: 1}}>
                        <Button variant="light" type="button" onClick={() => this.props.onToggleTimers()}>
                            {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                        </Button>
                    </Col>
                    <Col s={{ span: 3, offset: 1}}>
                        <Button type="button" onClick={() => this.props.onEndRound()}>
                            End Round
                        </Button>
                    </Col>
                </Row>
            </Row>
        )
    }
}


function PlayerCard(props) {
    const player = props.player;
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
                onClick={props.onEndTurn}
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
                <button 
                    className="victoryPointButton" 
                    type="button" 
                    onClick={props.onVictoryPointsClick}
                    onContextMenu={props.onVictoryPointsClick}
                >
                    {player.victoryPoints}
                </button>
                <hr className="playerCardDivider"/>
                {playerStrategyButton}
            </div>
        </div>
    )
}


export default StatusBoard;