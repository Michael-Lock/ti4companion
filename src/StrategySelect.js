import React from 'react';
// import './PlayerSelect.css';

const STRATEGIES = [
    {name: "", number: null, colour: null},
    {name: "Leadership", number: 1, colour: "red"},
    {name: "Diplomacy", number: 2, colour: "orange"},
    {name: "Politics", number: 3, colour: "yellow"},
    {name: "Construction", number: 4, colour: "dark-green"},
    {name: "Trade", number: 5, colour: "light-green"},
    {name: "Warfare", number: 6, colour: "cyan"},
    {name: "Technology", number: 7, colour: "dark-blue"},
    {name: "Imperial", number: 8, colour: "purple"},
];

class StrategySelect extends React.Component {
    handleStartRound() {
        if (this.props.onStartRound) {
            return () => this.props.onStartRound()
        }
    }

    render() {
        return (
            <div>
                <div>

                </div>
                <form>
                    <PlayerStrategyForm
                        playerDetails={this.props.playerDetails}
                        onPlayerStrategyChange={(e, playerNumber) => this.props.onPlayerStrategyChange(e, playerNumber)}
                    />
                    <button type="button" onClick={() => this.props.onToggleTimers()}>
                        {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                    </button>
                    <button type="button" onClick={this.handleStartRound()}>
                        Start Round
                    </button>
                </form>
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
        let strategyElements = STRATEGIES.map((strategy) => 
            <option key={strategy.name} value={strategy.name}>
                {strategy.name}
            </option>);

        return <select 
            id="strategies" 
            required 
            defaultValue={this.props.playerDetail.strategy} 
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
                    defaultValue={this.props.playerDetail.faction} 
                    disabled
                />
                {this.getStrategyList()}
            </div>
        );
    }
}


export default StrategySelect;