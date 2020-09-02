import React, {useState} from 'react';
import TimerBlock from './TimerBlock';
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Modal from 'react-bootstrap/Modal'
import {Row, Col} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'

import {hasUnplayedStrategies} from './Utils';

import './StatusBoard.css';
import TechPanel from './TechPanel';

const USED_STRATEGY_COLOUR = "grey";

function StatusBoard(props) {
    const [showEndRoundModal, setShowEndRoundModal] = useState(false);

    let players = props.players.slice();
    players.sort((a, b) => 
        (a.isNaaluTelepathic ? 0 : a.strategies[0].strategyCard.number) - (b.isNaaluTelepathic ? 0 : b.strategies[0].strategyCard.number));

    let playerCards = players.map(
        (player) => 
        <Col key={player.playerNumber}>
            <PlayerCard 
                key={player.playerNumber} 
                player={player}
                playerTimer={props.playerTimers[player.playerNumber]}
                onEndTurn={() => props.onEndTurn()}
                onVictoryPointsClick={e => props.onVictoryPointsClick(e, JSON.stringify(player))}
                onStrategyCardClick={(strategyCardNumber) => props.onStrategyCardClick(strategyCardNumber, JSON.stringify(player))}
                onPassButtonClick={() => props.onPassButtonClick(JSON.stringify(player))}
                onTechClick={(techDefinition) => props.onTechClick(techDefinition, player)}
                onSpeakerButtonClick={props.onSpeakerButtonClick}
                onNaaluInitiativeButtonClick={props.onNaaluInitiativeButtonClick}
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
    let playerBackgroundColour = player.colour ? player.colour.colour : null;
    let playerTextColour = player.colour ? player.colour.textColour : null;

    let playerButtons = player.strategies.map((strategy) =>
        <Col key={"strategy" + strategy.strategyCard.number + "Col"}>
            <button
            key={strategy.strategyCard.number} 
            className="strategyCardButton" 
            type="button"
            style={{backgroundColor: strategy.isUsed ? USED_STRATEGY_COLOUR : strategy.strategyCard.colour,}}
            onClick={() => props.onStrategyCardClick(strategy.strategyCard.number)}
            >
                {strategy.strategyCard.number}
            </button>
        </Col>
    );

    if (player.isSpeaker) {
        playerButtons.push(
            <Col key="speakerTokenCol">
                <button
                    className="speakerToken"
                    onClick={props.onSpeakerButtonClick}
                />
            </Col>
        )
    }

    if (player.isNaaluTelepathic) { 
        playerButtons.push(
            <Col key="naaluInitiativeTokenCol">
                <button
                    className="naaluInitiative"
                    onClick={props.onNaaluInitiativeButtonClick}
                />
            </Col>
        )
    }

    return (
        <Card className="border-0">
            <h6 
                className={`rounded currentPlayerBlock ${player.isActivePlayer ? "activePlayerBlock" : player.isPassed ? "passedPlayerBlock" : ""}`}
                onClick={props.onEndTurn}
            >
                {player.isActivePlayer ? "Current Player" : player.isPassed ? "Passed" : ""}
            </h6>
            <Card className="playerCard">
                <Row noGutters style={{ 
                    backgroundColor: playerBackgroundColour, 
                    color: playerTextColour,
                }}>
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
                                ${hasUnplayedStrategies(player) ? "invisible" : 
                                player.isPassed ? "passButtonPassed" : ""}`
                            }
                            onClick={props.onPassButtonClick}
                            disabled={hasUnplayedStrategies(player)}
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
                    {playerButtons}
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
