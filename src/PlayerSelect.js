import React from 'react';
import TimerBlock from './TimerBlock';
import './PlayerSelect.css';
import playerIcon from './assets/multiple-users-silhouette.svg';

const PLAYER_NUMBER_BUTTON_ARRAY_OFFSET = -3; //player 3 is array index 0

class PlayerSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedNumberOfPlayers: null,
            //playerNumberButtons: Array(4).fill(null),
        };
    }

    renderPlayerNumberButton(playerNumber) {
        return <PlayerNumberButton 
            value={playerNumber} 
            onClick={() => this.playerNumberButtonHandleClick(playerNumber)}
        />
    }

    playerNumberButtonHandleClick(playerNumber) {
        this.setState({
            selectedNumberOfPlayers: playerNumber,
        });
    }

    render() {
        return (
            <div>
                <h1>Number of Players</h1>
                {this.renderPlayerNumberButton(3)}
                {this.renderPlayerNumberButton(4)}
                {this.renderPlayerNumberButton(5)}
                {this.renderPlayerNumberButton(6)}
            </div>
        )
    }


}

function PlayerNumberButton(props) {
    return (
        <button 
            className={`playerNumButton unselectedPlayerNumButton`} 
            id={`${props.value}Player`} 
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}


export default PlayerSelect;