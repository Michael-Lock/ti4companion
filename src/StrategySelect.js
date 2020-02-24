import React from 'react';
// import './PlayerSelect.css';

const STRATEGIES = [
    {name: "", number: null, colour: null},
    {name: "Leadership", number: 1, colour: "red"},
    {name: "Diplomacy", number: 2, colour: "orange"},
];

class StrategySelect extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         selectedNumberOfPlayers: null,
    //         //TODO dynamically populate player number as index
    //         playerDetails: [
    //             this.createPlayer(0),
    //             this.createPlayer(1),
    //             this.createPlayer(2),
    //             this.createPlayer(3),
    //             this.createPlayer(4),
    //             this.createPlayer(5),
    //         ]
    //     };
    // }

    handlePlayerStrategyChange(e, playerNumber) {
        let playerDetails = this.props.playerDetails.slice();
        playerDetails[playerNumber].strategy = e.target.value;
        // this.setState ({
        //     playerDetails: playerDetails,
        // });
        console.log("New Strategy is " + playerDetails[playerNumber].strategy + " for index " + playerNumber);
    }
    
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
                        // onPlayerStrategyChange={(e, playerNumber) => this.handlePlayerStrategyChange(e, playerNumber)}
                        onPlayerStrategyChange={(e, playerNumber) => this.props.onPlayerStrategyChange(e, playerNumber)}
                    />
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
        let playerStrategyEntries = this.props.playerDetails.map(playerDetail => 
            <PlayerStrategyEntry
                key={playerDetail.playerNumber}
                playerDetail={playerDetail}
                onStrategyChange={e => this.props.onPlayerStrategyChange(e, playerDetail.playerNumber)}
            />);

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
                {/* <input 
                    type="text"
                    defaultValue={this.props.playerDetail.playerName} 
                    onChange={this.props.onPlayerNameChange}
                /> */}
                {this.getStrategyList()}
            </div>
        );
    }
}




export default StrategySelect;