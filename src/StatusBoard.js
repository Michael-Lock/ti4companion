import React, {useState} from 'react';
import TimerBlock from './TimerBlock';
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Modal from 'react-bootstrap/Modal'
import {Row, Col} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'

import './StatusBoard.css';
import TechPanel from './TechPanel';

const USED_STRATEGY_COLOUR = "grey";

function StatusBoard(props) {
    const [showEndRoundModal, setShowEndRoundModal] = useState(false);

    let players = props.players.slice();
    players.sort((a, b) => a.strategy.strategyCard.number - b.strategy.strategyCard.number);

    let playerCards = players.map(
        (player) => 
        <Col key={player.playerNumber}>
            <PlayerCard 
                key={player.playerNumber} 
                player={player}
                playerTimer={props.playerTimers[player.playerNumber]}
                onEndTurn={() => props.onEndTurn()}
                onVictoryPointsClick={e => props.onVictoryPointsClick(e, JSON.stringify(player))}
                onStrategyCardClick={() => props.onStrategyCardClick(JSON.stringify(player))}
                onPassButtonClick={() => props.onPassButtonClick(JSON.stringify(player))}
                onTechClick={(techDefinition) => props.onTechClick(techDefinition, player)}
            />
        </Col>
    );

    const isAllPassed = isAllPlayersPassed(players);

    return (
        <div className="d-flex flex-column">
            <Row>
                {playerCards}
            </Row>
            <Row>
                <Col xs={{span:2, offset:1}}>
                    <Button variant="light" type="button" onClick={() => props.onToggleTimers()}>
                        {props.isGameActive ? "Pause Game" : "Resume Game"}
                    </Button>
                </Col>
                <Col xs={{span:3, offset:6}}>
                    <ButtonGroup>
                        <Button type="button" disabled={isAllPassed} onClick={() => props.onEndTurn()}>
                            End Turn
                        </Button>
                        {/* <Button type="button" disabled={!isAllPassed} onClick={() => props.onEndRound()}> */}
                        <Button type="button" disabled={!isAllPassed} onClick={() => setShowEndRoundModal(true)}>
                            End Round
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
            <EndRoundConfirmModal 
                showModal={showEndRoundModal}
                onConfirmModal={() => props.onEndRound()}
                onCloseModal={() => setShowEndRoundModal(false)}
            />
        </div>
    )
}


function PlayerCard(props) {
    const player = props.player;
    let playerColour = player.colour ? player.colour.colour : null;
    let playerStrategy = player.strategy;
    let playerStrategyButton = playerStrategy ? 
        <button 
            className="strategyCardButton" 
            type="button"
            style={{backgroundColor: playerStrategy.isUsed ? USED_STRATEGY_COLOUR : playerStrategy.strategyCard.colour,}}
            onClick={props.onStrategyCardClick}
        >
            {playerStrategy.strategyCard.number}
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

function EndRoundConfirmModal(props) {
    return (
        <Modal show={props.showModal} onHide={props.onCloseModal} centered>
            <Modal.Body>
                <h3>End the round?</h3>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onCloseModal}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={props.onConfirmModal}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StatusBoard;

//#region functions

function isAllPlayersPassed(players) {
    for (let i = 0; i < players.length; i++) {
        if (!players[i].isPassed) {
            return false;
        }
    }
    return true;
}


//#endregion
