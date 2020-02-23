import React from 'react';
import TimerBlock from './TimerBlock';
import PlayerSelect from './PlayerSelect';

const MODE_PLAYER_SELECT = 1;
const MODE_STRATEGY = 2;
const MODE_STATUS_BOARD = 3;

class GameManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerDetails: null,
            gameMode: MODE_PLAYER_SELECT,
        };
    }

    handleGameStart(playerDetails) {
        this.setState ({
            playerDetails: playerDetails,
            gameMode: MODE_STRATEGY,
        });
        console.log(playerDetails);
    }

    renderGameComponent() {
        switch (this.state.gameMode) {
            case MODE_PLAYER_SELECT: 
                return this.renderPlayerSelect();
            case MODE_STRATEGY:
                return this.renderStrategy();
            case MODE_STATUS_BOARD:
                return this.renderStatusBoard();
            default:
                return null;
        }
    }

    renderPlayerSelect() {
        return (
            <div>
                <PlayerSelect onStartGame={playerDetails => this.handleGameStart(playerDetails)}/>
            </div>
        );
    }

    renderStrategy() {
        return (
            <div>
                <h1>Strategy Phase</h1>
                <TimerBlock id="totalTimer" label="Total Time" baseSeconds={5500} currentSeconds={0} isCounting={true}/>
                <TimerBlock id="turnTimer" label="Turn Time" baseSeconds={0} currentSeconds={0} isCounting={false}/>
            </div>
        );
    }

    renderStatusBoard() {
        return (
            <div>
                <h1>Status Board</h1>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderGameComponent()}
            </div>
        );
    }
}

export default GameManager;
