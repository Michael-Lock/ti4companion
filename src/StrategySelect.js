import React from 'react';
import Button from 'react-bootstrap/Button';
import {Row, Col} from 'react-bootstrap';

import strategy_card_store from './data/strategy-cards.json';

const SECOND_STRATEGY_THRESHOLD = 4; //the maximum number of players (inclusive) before only a single strategy is picked per player 

class StrategySelect extends React.Component {
    handleStartRound() {
        if (this.props.onStartRound) {
            return () => this.props.onStartRound()
        }
    }

    handlePlayAgenda() {
        if (this.props.onPlayAgenda) {
            return () => this.props.onPlayAgenda()
        }
    }

    isRoundReady() {
        let strategiesPerPlayer = this.props.playerDetails.length <= SECOND_STRATEGY_THRESHOLD ? 2 : 1;
        let selectedStrategyCards = [];

        for (let i = 0; i < this.props.playerDetails.length; i++) {
            let player = this.props.playerDetails[i];
            if (player.strategies.length < strategiesPerPlayer) {
                return false;
            }
            for (let strategyIndex = 0; strategyIndex < player.strategies.length; strategyIndex++) {
                if (selectedStrategyCards.includes(player.strategies[strategyIndex].strategyCard.number)) {
                    return false;
                }
                selectedStrategyCards.push(player.strategies[strategyIndex].strategyCard.number);
            }
        }

        return true;
    }

    render() {
        return (
            <div>
                <Row>
                    {/*TODO: add strategy cards */}
                </Row>
                <Row>
                    <PlayerStrategyForm
                        playerDetails={this.props.playerDetails}
                        onPlayerStrategyChange={(e, playerNumber, strategyNumber) => this.props.onPlayerStrategyChange(e, playerNumber, strategyNumber)}
                        onSpeakerButtonClick={this.props.onSpeakerButtonClick}
                    />
                </Row>
                <Row>
                    <Col>
                        <Button variant="light" type="button" onClick={() => this.props.onToggleTimers()}>
                            {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                        </Button>
                    </Col>
                    <Col>
                        <Button type="button" onClick={this.handlePlayAgenda()}>
                            Play Agenda
                        </Button>
                    </Col>
                    <Col>
                        <Button type="button" disabled={!this.isRoundReady()} onClick={this.handleStartRound()}>
                            Start Round
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }
}


class PlayerStrategyForm extends React.Component {
    renderPlayerStrategyEntries() {
        const players = this.props.playerDetails.slice();
        var speakerIndex = 0;
        for (let i = 0; i < players.length; i++) {
            speakerIndex = players[i].isSpeaker ? i : speakerIndex;
        }

        let strategiesPerPlayer = this.props.playerDetails.length <= SECOND_STRATEGY_THRESHOLD ? 2 : 1;

        let playerStrategyEntries = Array(players.length).fill(null);
        for (let i = 0; i < players.length; i++) {
            let destinationIndex = (((i - speakerIndex) % players.length) + players.length) % players.length;
            playerStrategyEntries[destinationIndex] =
                <PlayerStrategyEntry
                    key={players[i].playerNumber}
                    playerDetail={players[i]}
                    strategiesPerPlayer={strategiesPerPlayer}
                    onStrategyChange={(e, strategyNumber) => this.props.onPlayerStrategyChange(e, players[i].playerNumber, strategyNumber)}
                    onSpeakerButtonClick={this.props.onSpeakerButtonClick}
                />
        }
            
        return (<Col>
            {playerStrategyEntries}
        </Col>);
    }

    render() {
        return (
            this.renderPlayerStrategyEntries()
        );
    }
}


class PlayerStrategyEntry extends React.Component {
    getStrategyLists() {
        let strategyLists = [];
        for (let i = 0; i < this.props.strategiesPerPlayer; i++) {
            let strategyElements = [<option key="unselected" value={null} hidden/>]
            strategyElements = strategyElements.concat(strategy_card_store.map((strategy) => 
                <option key={strategy.name} value={JSON.stringify(strategy)}>
                    {strategy.name}
                </option>));

            strategyLists[i] = <select 
                key={i}
                required 
                onChange={(e) => this.props.onStrategyChange(e, i)}
            >
                {strategyElements}
            </select>;   
        }
        return strategyLists;
    }


    render() {
        return (
            <Row>
                <Col xs={2} xl={1}>
                    <button 
                        className={`speakerToken ${this.props.playerDetail.isSpeaker ? "" : "invisible"}`}
                        onClick={this.props.onSpeakerButtonClick} 
                    />
                </Col>
                <Col xs={10} xl={11}>
                    <input
                        key="playerName"
                        type="text"
                        defaultValue={this.props.playerDetail.playerName}
                        disabled
                    />
                {/* </Col> */}
                {/* <Col xs={3}> */}
                    <input
                        key="playerFaction"
                        type="text"
                        defaultValue={this.props.playerDetail.faction && this.props.playerDetail.faction.fullName}
                        disabled
                    />
                {/* </Col> */}
                {/* <Col xs={4}> */}
                    {this.getStrategyLists()}
                </Col>
            </Row>
        );
    }
}


export default StrategySelect;