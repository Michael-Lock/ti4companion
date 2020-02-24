import React from 'react';
import PlayerSelect from './PlayerSelect';
import StrategySelect from './StrategySelect';
import StatusBoard from './StatusBoard';

const MODE_PLAYER_SELECT = 1;
const MODE_STRATEGY = 2;
const MODE_STATUS_BOARD = 3;

class GameManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerDetails: null,
            gameMode: MODE_PLAYER_SELECT,
            roundNumber: 0,
        };
    }

    handleGameStart(playerDetails) {
        this.setState ({
            playerDetails: playerDetails,
            gameMode: MODE_STRATEGY,
        });
        console.log(playerDetails);
    }

    handlePlayerStrategyChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        playerDetails[playerNumber].strategy = e.target.value;
        this.setState ({
            playerDetails: playerDetails,
        });
        console.log("New Strategy is " + playerDetails[playerNumber].strategy + " for index " + playerNumber);
    }

    handleRoundStart() {
        this.setState ({
            gameMode: MODE_STATUS_BOARD,
            roundNumber: this.state.roundNumber + 1,
        });
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
                <StrategySelect 
                    playerDetails={this.state.playerDetails} 
                    onStartRound={() => this.handleRoundStart()}
                    onPlayerStrategyChange={(e, playerNumber) => this.handlePlayerStrategyChange(e, playerNumber)}
                />
                {/* <TimerBlock id="totalTimer" label="Total Time" baseSeconds={5500} currentSeconds={0} isCounting={true}/>
                <TimerBlock id="turnTimer" label="Turn Time" baseSeconds={0} currentSeconds={0} isCounting={false}/> */}
            </div>
        );
    }

    renderStatusBoard() {
        return (
            <div>
                <h1>Status Board</h1>
                <StatusBoard roundNumber = {this.state.roundNumber}/>
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
