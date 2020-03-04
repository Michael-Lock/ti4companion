import React from 'react';
import TimerBlock from './TimerBlock';
import Button from 'react-bootstrap/Button'
import {Row, Col} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'

import './StatusBoard.css';
import TechPanel from './TechPanel';

class StatusBoard extends React.Component {
    render() {
        let players = this.props.players.slice();
        players.sort((a, b) => a.strategy.number - b.strategy.number);

        let playerCards = players.map(
            (player) => 
            <Col key={player.playerNumber}>
                <PlayerCard 
                    key={player.playerNumber} 
                    player={player}
                    playerTimer={this.props.playerTimers[player.playerNumber]}
                    onEndTurn={() => this.props.onEndTurn()}
                    onVictoryPointsClick={e => this.props.onVictoryPointsClick(e, JSON.stringify(player))}
                    onStrategyCardClick={() => this.props.onStrategyCardClick(JSON.stringify(player))}
                    onPassButtonClick={() => this.props.onPassButtonClick(JSON.stringify(player))}
                    onTechClick={(techDefinition) => this.props.onTechClick(techDefinition, player)}
                />
            </Col>
        );

        return (
            <Row className="d-flex flex-column">
                <Row>
                    {playerCards}
                </Row>
                <Row className="d-flex align-items-end">
                    <Col xs={{ span: 3, offset: 1}}>
                        <Button variant="success" type="button" onClick={() => this.props.onEndTurn()}>
                            End Turn
                        </Button>
                    </Col>
                    <Col xs={{ span: 3, offset: 1}}>
                        <Button variant="light" type="button" onClick={() => this.props.onToggleTimers()}>
                            {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                        </Button>
                    </Col>
                    <Col xs={{ span: 3, offset: 1}}>
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
            style={{backgroundColor: playerStrategy.isUsed ? "grey" : playerStrategy.colour,}}
            onClick={props.onStrategyCardClick}
        >
            {playerStrategy.number}
        </button> : 
        null;

    return (
        <Card className="border-0">
            <h6 
                className={`rounded currentPlayerBlock ${player.isActivePlayer ? "activePlayerBlock" : player.isPassed ? "passedPlayerBlock" : ""}`}
                onClick={props.onEndTurn}
            >
                {player.isActivePlayer ? "Current Player" : player.isPassed ? "Passed" : ""}
            </h6>
            <Card className="playerCard">
                <Row noGutters style={{ backgroundColor: playerColour, }}>
                    <Col xs={2}>
                        {/* TODO: Add faction icon */}
                    </Col>
                    <Col>
                        <div>{player.playerName}</div>
                        <div>{player.faction && player.faction.shortName}</div>
                    </Col>
                    <Col xs={2}>
                        <button 
                            className={
                                `rounded passButton 
                                ${!player.strategy.isUsed ? "invisible" : 
                                player.isPassed ? "passButtonPassed" : ""}`
                            }
                            onClick={props.onPassButtonClick}
                            disabled={!player.strategy.isUsed}
                        />
                    </Col>
                </Row>
                <Row noGutters className="flex-column">
                    <TimerBlock currentSeconds={props.playerTimer.currentSeconds} disabled={true} />
                </Row>
                <Row noGutters>
                    <Col>
                        <button
                            className="victoryPointButton"
                            type="button"
                            onClick={props.onVictoryPointsClick}
                            onContextMenu={props.onVictoryPointsClick}
                        >
                            {player.victoryPoints}
                        </button>
                    </Col>
                </Row>
                <Row noGutters className="flex-column">
                    <hr className="playerCardDivider" />
                </Row>
                <Row noGutters>
                    <Col>
                        {playerStrategyButton}
                    </Col>
                </Row>
                <Row noGutters className="flex-column">
                    <hr className="playerCardDivider" />
                </Row>
            <TechPanel techs={player.techs} onTechClick={(techDefinition) => props.onTechClick(techDefinition)}/>
            </Card>
        </Card>
    )
}

export default StatusBoard;