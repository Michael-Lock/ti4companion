import React from 'react';
import ReactModal from 'react-modal';
import PlayerSelect from './PlayerSelect';
import StrategySelect from './StrategySelect';
import StatusBoard from './StatusBoard';
import TimerBlock from './TimerBlock';
import './GameManager.css';

import objective_store from './data/objectives.json';

const MODE_PLAYER_SELECT = 1;
const MODE_STRATEGY = 2;
const MODE_STATUS_BOARD = 3;

const NUMBER_STRATEGIES = 8;
const NUMBER_OBJECTIVES_STAGE_ONE = 5;
const NUMBER_OBJECTIVES_STAGE_TWO = 5;

ReactModal.setAppElement('#root');

class GameManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameMode: MODE_PLAYER_SELECT,
            showObjectiveSelectModal: false,
            selectedObjective: null,
            playerDetails: null,
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
            publicObjectives: this.fillPublicObjectives(),
        };
    }

    //#region Lifecycle
    componentDidMount() {
        this.heartbeat = setInterval(() => this.recalculateTimers(), 500);
    }

    componentWillUnmount() {
        clearInterval(this.heartbeat);
    }
    //#endregion

    //#region Event Handlers
    handleStartGame(playerDetails) {
        this.setState({
            playerDetails: playerDetails,
            gameMode: MODE_STRATEGY,
        });

        this.startGameTimer();
    }

    handlePlayerStrategyChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        playerDetails[playerNumber].strategy = JSON.parse(e.target.value);
        this.setState({
            playerDetails: playerDetails,
        });
    }

    handleStartRound() {
        this.setState({
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

        this.setState({
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
        this.startGameTimer();
        this.restartTurnTimers();
    }

    handleObjectiveCardClicked(index) {
        let objective = this.state.publicObjectives[index];
        if (!objective.isRevealed && objective.order === this.nextUnrevealedObjective()) {
            this.setState({ 
                showObjectiveSelectModal: true,
                selectedObjective: objective,
            });
        }
    }


    handleCloseObjectiveSelectModal(newObjective) {
        if(newObjective && this.state.selectedObjective) {
            newObjective.isRevealed = true;
            newObjective.order = this.state.selectedObjective.order;

            let newPublicObjectives = this.state.publicObjectives.slice();
            newPublicObjectives[this.state.selectedObjective.order] = newObjective;
            
            this.setState({
                publicObjectives: newPublicObjectives,
                showObjectiveSelectModal: false,
                selectedObjective: null,
            });
        }
    }
    //#endregion

    //#region Commands
    fillPublicObjectives() {
        let numberObjectives = NUMBER_OBJECTIVES_STAGE_ONE + NUMBER_OBJECTIVES_STAGE_TWO;
        let objectives = Array(numberObjectives);
        for (let i = 0; i < numberObjectives; i++) {
            objectives[i] = {
                id: null,
                order: i,
                stage: i < NUMBER_OBJECTIVES_STAGE_ONE ? 1 : 2,
                name: null,
                longDescription: null,
                shortDescription: null,
                isRevealed: false,
            }
        }
        return objectives;
    }

    nextUnrevealedObjective() {
        for (let i = 0; i < this.state.publicObjectives.length; i++) {
            if (!this.state.publicObjectives[i].isRevealed) {
                return this.state.publicObjectives[i].order;
            }
        }

        return null;
    }

    recalculateTimers() {
        if (this.state.totalGameTimer && this.state.totalGameTimer.isCounting) {
            this.recalculateGameTime();
        }
        if (this.state.currentTurnTimer && this.state.currentTurnTimer.isCounting) {
            this.recalculateTurnTime();
        }
    }

    recalculateGameTime() {
        let timer = { ...this.state.totalGameTimer };
        timer.currentSeconds = timer.baseSeconds + Math.floor((Date.now() - timer.countStartTime) / 1000);

        this.setState({
            totalGameTimer: timer,
        });
    }

    recalculateTurnTime() {
        let timer = { ...this.state.currentTurnTimer };
        timer.currentSeconds = timer.baseSeconds + Math.floor((Date.now() - timer.countStartTime) / 1000);

        let playerDetails = this.state.playerDetails.slice();
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isActivePlayer) {
                let playerTimer = {
                    ...playerDetails[i].timer,
                };
                playerTimer.currentSeconds = playerTimer.baseSeconds + Math.floor((Date.now() - playerTimer.countStartTime) / 1000);
                playerDetails[i].timer = playerTimer;
            }
        }

        this.setState({
            currentTurnTimer: timer,
            playerDetails: playerDetails,
        });
    }

    startTurnTimers() {
        if (this.state.currentTurnTimer.isCounting) {
            return; //do nothing if already counting
        }
        let timer = { ...this.state.currentTurnTimer };
        timer.isCounting = true;
        timer.countStartTime = Date.now();

        let playerDetails = this.state.playerDetails.slice();
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isActivePlayer) {
                let playerTimer = {
                    ...playerDetails[i].timer,
                    isCounting: true,
                    countStartTime: Date.now(),
                };

                let player = { ...playerDetails[i] };
                player.timer = playerTimer;
                playerDetails[i] = player;
            }
        }

        this.setState({
            currentTurnTimer: timer,
            playerDetails: playerDetails,
        })
    }

    stopTurnTimers(resetCurrentTurn) {
        if (!this.state.currentTurnTimer.isCounting) {
            return; //do nothing if already stopped
        }
        let timer = { ...this.state.currentTurnTimer };
        timer.isCounting = false;
        if (resetCurrentTurn) {
            timer.baseSeconds = 0;
            timer.currentSeconds = 0;
        }
        else {
            timer.baseSeconds = timer.currentSeconds;
        }

        let playerDetails = this.state.playerDetails.slice();
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isActivePlayer) {
                let playerTimer = {
                    ...playerDetails[i].timer,
                    isCounting: false,
                };
                playerTimer.baseSeconds = playerTimer.currentSeconds;

                let player = { ...playerDetails[i] };
                player.timer = playerTimer;
                playerDetails[i] = player;
            }
        }

        this.setState({
            currentTurnTimer: timer,
            playerDetails: playerDetails,
        })
    }

    restartTurnTimers() {
        //TODO needs to stop the ending player's turn timer and start the next one as well
        let timer = {
            baseSeconds: 0,
            currentSeconds: 0,
            countStartTime: Date.now(),
            isCounting: true,
        };

        let nextPlayer = this.getNextPlayer(this.getActivePlayer());
        let playerDetails = this.state.playerDetails.slice();
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isActivePlayer) {
                let playerTimer = {
                    ...playerDetails[i].timer,
                    isCounting: false,
                };
                playerTimer.baseSeconds = playerTimer.currentSeconds;

                let player = { ...playerDetails[i] };
                player.timer = playerTimer;
                player.isActivePlayer = false;
                playerDetails[i] = player;
            }
            else if (playerDetails[i].playerNumber === nextPlayer.playerNumber) {
                let playerTimer = {
                    ...playerDetails[i].timer,
                    isCounting: true,
                    countStartTime: Date.now(),
                };

                let player = { ...playerDetails[i] };
                player.timer = playerTimer;
                player.isActivePlayer = true;
                playerDetails[i] = player;
            }
        }

        this.setState({
            currentTurnTimer: timer,
            playerDetails: playerDetails,
        })
    }

    startGameTimer() {
        if (this.state.totalGameTimer.isCounting) {
            return; //do nothing if already counting
        }
        let timer = { ...this.state.totalGameTimer };
        timer.isCounting = true;
        timer.countStartTime = Date.now();

        this.setState({
            totalGameTimer: timer
        })
    }

    stopGameTimer() {
        if (!this.state.totalGameTimer.isCounting) {
            return; //do nothing if already stopped
        }
        let timer = { ...this.state.totalGameTimer };
        timer.baseSeconds = timer.currentSeconds;
        timer.isCounting = false;

        this.setState({
            totalGameTimer: timer
        })
    }

    getActivePlayer() {
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            if (this.state.playerDetails[i].isActivePlayer) {
                return this.state.playerDetails[i];
            }
        }
        return null;
    }

    getNextPlayer(activePlayer) {
        //TODO Factor in Naalu initiative (race or promissory)
        let nextPlayer = activePlayer;
        // determine the highest initiative number that could possibly be next. Offset by the number of strategies to allow it to loop back;
        let highestInitiativeNumber = activePlayer.strategy.number + NUMBER_STRATEGIES - 1;
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            let player = this.state.playerDetails[i];
            if (!player.isActivePlayer) {
                // determine the player initiative number, offset by the number of strategies to allow it to loop back
                let playerInitiativeNumber =
                    player.strategy.number < activePlayer.strategy.number ?
                        player.strategy.number + NUMBER_STRATEGIES :
                        player.strategy.number;
                if (playerInitiativeNumber < highestInitiativeNumber) {
                    highestInitiativeNumber = playerInitiativeNumber;
                    nextPlayer = player;
                }
            }
        }
        return nextPlayer;
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
                <PlayerSelect onStartGame={playerDetails => this.handleStartGame(playerDetails)} />
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
                    isGameActive={this.state.totalGameTimer.isCounting}
                    onToggleTimers={() => this.handleToggleTimers()}
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
                {this.renderObjectivePanel()}
                <h1>Status Board</h1>
                <StatusBoard
                    roundNumber={this.state.roundNumber}
                    isGameActive={this.state.totalGameTimer.isCounting}
                    players={this.state.playerDetails}
                    onEndTurn={() => this.handleEndTurn()}
                    onToggleTimers={() => this.handleToggleTimers()}
                    onEndRound={() => this.handleEndRound()}
                />
            </div>
        );
    }

    renderGameHeader(showTurnTimer) {
        return <GameHeader
            roundNumber={this.state.roundNumber}
            totalGameTimer={this.state.totalGameTimer}
            showTurnTimer={showTurnTimer}
            currentTurnTimer={this.state.currentTurnTimer}
            onTurnTimerClick={() => this.handleTurnTimerClicked()}
            onGameTimerClick={() => this.handleGameTimerClicked()}
        />
    }


    renderObjectivePanel() {
        return <ObjectivePanel
            objectives={this.state.publicObjectives}
            onObjectiveCardClick={(index) => this.handleObjectiveCardClicked(index)}
        />
    }
    //#endregion

    render() {
        return (
            <div>
                {this.renderGameComponent()}
                <ObjectiveSelectModal
                    showModal={this.state.showObjectiveSelectModal}
                    objectives={this.state.publicObjectives}
                    onCloseModal={(objective) => this.handleCloseObjectiveSelectModal(objective)}
                >
                    <p>Modal text!</p>
                    <button onClick={(objective) => this.handleCloseObjectiveSelectModal(objective)}>Close Modal</button>
                </ObjectiveSelectModal>
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


function ObjectivePanel(props) {
    let objectiveBlocks = Array(props.objectives.length);
    for (let i = 0; i < props.objectives.length; i++) {
        const objective = props.objectives[i];
        objectiveBlocks[i] = <ObjectiveCard
            key={objective.order}
            name={objective.name}
            stage={objective.stage}
            shortDescription={objective.shortDescription}
            isRevealed={objective.isRevealed}
            onObjectiveCardClick={() => props.onObjectiveCardClick(i)}
        />
    }

    return (
        <div>
            {objectiveBlocks}
        </div>
    );
}


function ObjectiveCard(props) {
    let cardDisplay = props.isRevealed ? props.shortDescription : props.stage;

    return (
        <div>
            <button
                type="button"
                className={`objectiveCard stage${props.stage} ${props.isRevealed ? "revealed" : ""}`}
                onClick={props.onObjectiveCardClick}
            >
                {cardDisplay}
            </button>
        </div>
    );
}



class ObjectiveSelectModal extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            selectedObjective: null,
        };
    }

    onObjectiveChange(e) {
        let newObjective = JSON.parse(e.target.value);
        this.setState({
            selectedObjective: newObjective,
        });
    }

    getObjectiveSelect() {
        let selectedObjectives = this.props.objectives.map((objective) => objective.isRevealed ? objective : null);
        selectedObjectives = selectedObjectives.filter((objective) => objective !== null);

        // let availableObjectives = objective_store.filter((objective) => objective.stage === this.props.stage);
        // availableObjectives = availableObjectives.filter(
        //     (objective) => !selectedObjectives.some(
        //         function(selectedObjective) {
        //             return objective.id === selectedObjective.id; 
        //         }
        //     )
        // );

        //TODO filter out based on current stage
        let availableObjectives = objective_store.filter(
            (objective) => !selectedObjectives.some(
                function(selectedObjective) {
                    return objective.id === selectedObjective.id; 
                }
            )
        );
        
        let objectiveElements = Array(1);
        objectiveElements[0] = <option 
            key="unselected"
            className="nullOption"
            value={null} 
            hidden={this.state.selectedObjective !== null}
        >
            {"Select..."}
        </option>;

        objectiveElements = objectiveElements.concat(availableObjectives.map((objective) =>
            <option key={objective.id} value={JSON.stringify(objective)}>
                {objective.name}
            </option>));

        return <select
            id="objectives"
            required
            onChange={(e) => this.onObjectiveChange(e)}
        >
            {objectiveElements}
        </select>;
    }

    render() {
        if (!this.props.showModal ) {
            return null;
        }

        return (
            <div>
                <ReactModal
                    isOpen={this.props.showModal}
                    contentLabel="Select Public Objective"
                    onRequestClose={() => this.props.onCloseModal(this.state.selectedObjective)}
                    className="Modal"
                    overlayClassName="Overlay"
                >
                    <p>Select Public Objective</p>
                    {this.getObjectiveSelect()}

                    <button onClick={() => this.props.onCloseModal(this.state.selectedObjective)}>Cancel</button>
                </ReactModal>
            </div>
        );
    }
}



export default GameManager;
