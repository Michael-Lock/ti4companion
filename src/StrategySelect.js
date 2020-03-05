import React from 'react';
import Button from 'react-bootstrap/Button';
import {Row, Col} from 'react-bootstrap';

import strategy_card_store from './data/strategy-cards.json';

class StrategySelect extends React.Component {
    handleStartRound() {
        if (this.props.onStartRound) {
            return () => this.props.onStartRound()
        }
    }

    isRoundReady() {
        let selectedStrategyCards = [];
        for (let i = 0; i < this.props.playerDetails.length; i++) {
            let player = this.props.playerDetails[i];
            if (!player.strategy || 
                    selectedStrategyCards.includes(player.strategy.strategyCard.number)) {
                return true;
            }
            selectedStrategyCards[i] = player.strategy.strategyCard.number;
        }

        return false;
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
                        onPlayerStrategyChange={(e, playerNumber) => this.props.onPlayerStrategyChange(e, playerNumber)}
                    />
                </Row>
                <Row>
                    <Col>
                        <Button variant="light" type="button" onClick={() => this.props.onToggleTimers()}>
                            {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                        </Button>
                    </Col>
                    <Col>
                        <Button type="button" disabled={this.isRoundReady()} onClick={this.handleStartRound()}>
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

        let playerStrategyEntries = Array(players.length).fill(null);
        for (let i = 0; i < players.length; i++) {
            let destinationIndex = (((i - speakerIndex) % players.length) + players.length) % players.length;
            playerStrategyEntries[destinationIndex] =
                <PlayerStrategyEntry
                    key={players[i].playerNumber}
                    playerDetail={players[i]}
                    onStrategyChange={e => this.props.onPlayerStrategyChange(e, players[i].playerNumber)}
                />
        }
            
        return (<div>
            {playerStrategyEntries}
        </div>);
    }

    render() {
        return (
            <div>
                {this.renderPlayerStrategyEntries()}
            </div>
        );
    }
}


class PlayerStrategyEntry extends React.Component {
    getStrategyList() {
        let strategyElements = [<option key="unselected" value={null} hidden/>]
        strategyElements = strategyElements.concat(strategy_card_store.map((strategy) => 
            <option key={strategy.name} value={JSON.stringify(strategy)}>
                {strategy.name}
            </option>));

        let playerStrategy = this.props.playerDetail.strategy ? JSON.stringify(this.props.playerDetail.strategy.strategyCard) : undefined;

        return <select 
            id="strategies" 
            required 
            value={playerStrategy} 
            onChange={this.props.onStrategyChange}
        >
            {strategyElements}
        </select>;
    }


    render() {
        return (
            <div>
                <input 
                    key="playerName"
                    type="text"
                    defaultValue={this.props.playerDetail.playerName} 
                    disabled
                />
                <input 
                    key="playerFaction"
                    type="text"
                    defaultValue={this.props.playerDetail.faction && this.props.playerDetail.faction.fullName} 
                    disabled
                />
                {this.getStrategyList()}
            </div>
        );
    }
}


export default StrategySelect;