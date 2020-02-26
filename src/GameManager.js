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
                currentSeconds: 0,
                countStartTime: Date.now(),
                isCounting: false,
            },
            currentTurnTimer: {
                baseSeconds: 0,
                currentSeconds: 0,
                countStartTime: Date.now(),
                isCounting: false,
            },
        };
    }

    //#region Event Handlers
    handleStartGame(playerDetails) {
        this.setState ({
            playerDetails: playerDetails,
            gameMode: MODE_STRATEGY,
        });
        
        this.startGameTimer();
    }

    handlePlayerStrategyChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        playerDetails[playerNumber].strategy = e.target.value;
        this.setState ({
            playerDetails: playerDetails,
        });
    }

    handleStartRound() {
        this.setState ({
            gameMode: MODE_STATUS_BOARD,
        });

        this.startGameTimer();
        this.startTurnTimers();
    }

    handleTurnTimerClicked() {
        if (this.state.currentTurnTimer.isCounting) {
            this.stopTurnTimers();
        }
        else {
            this.startTurnTimers();
            this.startGameTimer(); //if turn timers are running, the game timer should be as well
        }
    }

    handleGameTimerClicked() {
        if (this.state.totalGameTimer.isCounting) {
            this.stopGameTimer();
            this.stopTurnTimers(); //if the game timer is stopped, all timers should be stopped
        }
        else {
            this.startGameTimer();
        }
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

        this.stopTurnTimers(true); //turns aren't occurring between rounds
        this.startGameTimer(); //activity means the game timer should almost certainly be on
    }

    handleToggleTimers() {
        if (this.state.totalGameTimer.isCounting) {
            this.stopGameTimer();
            this.stopTurnTimers();
        }
        else {
            this.startGameTimer();
            this.state.gameMode === MODE_STATUS_BOARD && this.startTurnTimers();
        }
    }

    handleEndTurn() {
        this.restartTurnTimers();
    }
    //#endregion

    //#region Commands
    recalculateGameTime() {
        let timer = {...this.state.totalGameTimer};
        timer.currentSeconds = timer.baseSeconds + Math.floor((Date.now() - timer.countStartTime) / 1000);
        
        this.setState({
            totalGameTimer: timer,
        });
    }

    recalculateTurnTime() {
        let timer = {...this.state.currentTurnTimer};
        timer.currentSeconds = timer.baseSeconds + Math.floor((Date.now() - timer.countStartTime) / 1000);
        
        this.setState({
            currentTurnTimer: timer,
        });
    }

    startTurnTimers() {
        if (this.state.currentTurnTimer.isCounting) {
            return; //do nothing if already counting
        }
        //TODO: Needs to start the active player turn timer as well
        let timer = {...this.state.currentTurnTimer};
        timer.isCounting = true;
        timer.countStartTime = Date.now();
        timer.interval = setInterval(() => {this.recalculateTurnTime()}, 1000);

        this.setState({
            currentTurnTimer: timer
        })
    }
    
    stopTurnTimers(resetCurrentTurn) {
        if (!this.state.currentTurnTimer.isCounting) {
            return; //do nothing if already stopped
        }
        //TODO: Needs to stop the active player turn timer as well
        let timer = {...this.state.currentTurnTimer};
        timer.isCounting = false;
        if (resetCurrentTurn) {
            timer.baseSeconds = 0;
            timer.currentSeconds = 0;
        }
        else {
            timer.baseSeconds = timer.currentSeconds;
        }

        this.setState({
            currentTurnTimer: timer
        })
        
        clearInterval(this.state.currentTurnTimer.interval);
    }

    restartTurnTimers() {
        //TODO needs to stop the ending player's turn timer and start the next one as well
        let timer = {
            baseSeconds: 0,
            currentSeconds: 0,
            countStartTime: Date.now(),
            isCounting: true,
        };

        this.setState({
            currentTurnTimer: timer
        })
    }

    startGameTimer() {
        if (this.state.totalGameTimer.isCounting) {
            return; //do nothing if already counting
        }
        let timer = {...this.state.totalGameTimer};
        timer.isCounting = true;
        timer.countStartTime = Date.now();
        timer.interval = setInterval(() => {this.recalculateGameTime()}, 1000);

        this.setState({
            totalGameTimer: timer
        })
    }
    
    stopGameTimer() {
        if (!this.state.totalGameTimer.isCounting) {
            return; //do nothing if already stopped
        }
        let timer = {...this.state.totalGameTimer};
        timer.baseSeconds = timer.currentSeconds;
        timer.isCounting = false;

        this.setState({
            totalGameTimer: timer
        })
        
        clearInterval(this.state.totalGameTimer.interval);
    }
    //#endregion

    //#region Rendering methods
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
                <PlayerSelect onStartGame={playerDetails => this.handleStartGame(playerDetails)}/>
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
                    isGameActive = {this.state.totalGameTimer.isCounting}
                    onToggleTimers = {() => this.handleToggleTimers()}
                    onStartRound={() => this.handleStartRound()}
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
                    isGameActive = {this.state.totalGameTimer.isCounting}
                    onEndTurn = {() => this.handleEndTurn()}
                    onToggleTimers = {() => this.handleToggleTimers()}
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
            onTurnTimerClick = {() => this.handleTurnTimerClicked()}
            onGameTimerClick = {() => this.handleGameTimerClicked()}
        />
    }
    //#endregion

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
            currentSeconds={props.currentTurnTimer.currentSeconds}
            onClick={() => props.onTurnTimerClick()}
        /> :
        null;

    return (
        <div>
            <label className="timerLabel">{"Round: " + props.roundNumber}</label>
            {turnTimer}
            <TimerBlock
                id="turnTimer"
                label="Total Game Time"
                currentSeconds={props.totalGameTimer.currentSeconds}
                onClick={() => props.onGameTimerClick()}
            />
        </div>
    );
}

export default GameManager;
