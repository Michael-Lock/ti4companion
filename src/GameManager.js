import React from 'react';
import PlayerSelect from './PlayerSelect';
import StrategySelect from './StrategySelect';
import StatusBoard from './StatusBoard';
import TimerBlock from './TimerBlock';

const MODE_PLAYER_SELECT = 1;
const MODE_STRATEGY = 2;
const MODE_STATUS_BOARD = 3;

class GameManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerDetails: null,
            gameMode: MODE_PLAYER_SELECT,
            roundNumber: 1,
            totalGameTimer: {
                baseSeconds: 0,
                isCounting: true,
            },
            currentTurnTimer: {
                baseSeconds: 0,
                isCounting: false,
            },
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
        });
    }

    handleTurnTimerClicked(time) {
        var timer;
        if (this.state.currentTurnTimer.isCounting) {
            timer = {
                baseSeconds: time,
                isCounting: false,
            }
        }
        else {
            timer = {
                ...this.state.currentTurnTimer,
                isCounting: true,
            }
        }

        this.setState({
            currentTurnTimer: timer
        })
    }

    handleGameTimerClicked(time) {
        var timer;
        if (this.state.totalGameTimer.isCounting) {
            timer = {
                baseSeconds: time,
                isCounting: false,
            }
        }
        else {
            timer = {
                ...this.state.totalGameTimer,
                isCounting: true,
            }
        }

        this.setState({
            totalGameTimer: timer
        })
    }

    handleEndRound() {
        let playerDetails = this.state.playerDetails.slice().map(
            player => ({
                ...player, 
                strategy: null,
            })
        );

        this.setState ({
            gameMode: MODE_STRATEGY,
            roundNumber: this.state.roundNumber + 1,
            playerDetails: playerDetails,
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
                {this.renderGameHeader(false)}
                <h1>Strategy Phase</h1>
                <StrategySelect 
                    playerDetails={this.state.playerDetails} 
                    onStartRound={() => this.handleRoundStart()}
                    onPlayerStrategyChange={(e, playerNumber) => this.handlePlayerStrategyChange(e, playerNumber)}
                />
            </div>
        );
    }

    renderStatusBoard() {
        return (
            <div>
                {this.renderGameHeader(true)}
                <h1>Status Board</h1>
                <StatusBoard 
                    roundNumber = {this.state.roundNumber}
                    totalGameTimer = {this.state.totalGameTimer}
                    currentTurnTimer = {this.state.currentTurnTimer}
                    onTurnTimerClick = {(time) => this.handleTurnTimerClicked(time)}
                    onGameTimerClick = {(time) => this.handleGameTimerClicked(time)}
                    onEndRound = {() => this.handleEndRound()}
                />
            </div>
        );
    }

    renderGameHeader(showTurnTimer) {
        return <GameHeader
            roundNumber = {this.state.roundNumber}
            totalGameTimer = {this.state.totalGameTimer}
            showTurnTimer = {showTurnTimer}
            currentTurnTimer = {this.state.currentTurnTimer}
            onTurnTimerClick = {(time) => this.handleTurnTimerClicked(time)}
            onGameTimerClick = {(time) => this.handleGameTimerClicked(time)}
        />
    }

    render() {
        return (
            <div>
                {this.renderGameComponent()}
            </div>
        );
    }
}


function GameHeader(props) {
    let turnTimer = props.showTurnTimer ? 
        <TimerBlock
            id="turnTimer"
            label="Turn Time"
            baseSeconds={props.currentTurnTimer.baseSeconds}
            isCounting={props.currentTurnTimer.isCounting}
            onClick={(time) => props.onTurnTimerClick(time)}
        /> :
        null;

    return (
        <div>
            <label className="timerLabel">{"Round: " + props.roundNumber}</label>
            {turnTimer}
            <TimerBlock
                id="turnTimer"
                label="Total Game Time"
                baseSeconds={props.totalGameTimer.baseSeconds}
                isCounting={props.totalGameTimer.isCounting}
                onClick={(time) => props.onGameTimerClick(time)}
            />
        </div>
    );
}

export default GameManager;
