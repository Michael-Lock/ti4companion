import React from 'react';
import TimerBlock from './TimerBlock';
import './PlayerSelect.css';
import playerIcon from './assets/multiple-users-silhouette.svg';

const PLAYER_NUMBER_BUTTON_ARRAY_OFFSET = 3; //player 3 is array index 0

class PlayerSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedNumberOfPlayers: null,
        };
    }

    playerNumberButtonHandleClick(playerNumber) {
        this.setState({
            selectedNumberOfPlayers: this.state.selectedNumberOfPlayers === playerNumber ? null : playerNumber, //select new or deselect if existing
        });
    }

    determineSelection() {
        let playerNumberSelections = Array(4).fill(false);
        if (this.state.selectedNumberOfPlayers !== null) {
            playerNumberSelections[this.state.selectedNumberOfPlayers - PLAYER_NUMBER_BUTTON_ARRAY_OFFSET] = true;
        }

        return playerNumberSelections;
    }

    render() {
        const playerNumberSelections = this.determineSelection();

        return (
            <div>
                <div>
                    <h1>Number of Players</h1>
                    <PlayerNumberSelect 
                        playerNumberSelections={playerNumberSelections}
                        onClick={playerNumber => this.playerNumberButtonHandleClick(playerNumber)}
                    />
                </div>
                <div>
                    <PlayerDetailEntry/>
                </div>
            </div>
        )
    }


}


class PlayerNumberSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    renderPlayerNumberButton(playerNumber) {
        const isSelected = this.props.playerNumberSelections[playerNumber - PLAYER_NUMBER_BUTTON_ARRAY_OFFSET];

        return (<PlayerNumberButton
            value={playerNumber}
            selected={isSelected}
            onClick={() => this.props.onClick(playerNumber)}
        />);
    }

    render() {
        return (
            <div>
                { this.renderPlayerNumberButton(3) }
                { this.renderPlayerNumberButton(4) }
                { this.renderPlayerNumberButton(5) }
                { this.renderPlayerNumberButton(6) }
            </div>
        );
    }
}


function PlayerNumberButton(props) {
    return (
        <button 
            className={`playerNumButton ${props.selected ? "selectedPlayerNumButton" : ""}`} 
            id={`${props.value}Player`} 
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}


class PlayerDetailEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerNumber: props.playerNumber,
            playerName: props.name,
            faction: props.faction,
            colour: props.colour,
        }
    }

    render() {
        return (
            <div>
                <input type={"text"}></input>
            </div>
        );
    }
}

export default PlayerSelect;