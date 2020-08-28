import React from 'react';
import PlayerSelect from './PlayerSelect';
import StrategySelect from './StrategySelect';
import StatusBoard from './StatusBoard';
import PlayAgenda from './PlayAgenda';
import TimerBlock from './TimerBlock';
import ObjectiveSelectModal from './ObjectiveSelectModal';
import ObjectivePanel from './ObjectivePanel';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import SpeakerChangeModal from './SpeakerChangeModal';

import './GameManager.css';

const MODE_PLAYER_SELECT = 1;
const MODE_STRATEGY = 2;
const MODE_STATUS_BOARD = 3;
const MODE_AGENDA = 4;

const NUMBER_STRATEGIES = 8;
const NUMBER_OBJECTIVES_STAGE_ONE = 5;
const NUMBER_OBJECTIVES_STAGE_TWO = 5;

const POLITICS_CARD_NUMBER = 3;

const LEFT_CLICK = 1; //native event constant for a left click
const RIGHT_CLICK = 3; //native event constant for the opening of the context menu (i.e. right click)


class GameManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //View controls
            gameMode: MODE_PLAYER_SELECT,
            showObjectiveSelectModal: false,
            showSpeakerChangeModal: false,

            //Temporary State
            selectedObjective: null,
            selectedObjectiveSelection: null, //used for the objective select modal to record the current selection
            selectedSpeakerNumber: null, //used for the speaker select modal to record the player selected
            selectedAgenda: null,

            //Game Details
            playerDetails: null,
            playerTimers: null,
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
        let playerTimers = Array(playerDetails.length);
        for (let i = 0; i < playerTimers.length; i++) {
            playerTimers[i] = {
                baseSeconds: 0,
                currentSeconds: 0,
                countStartTime: Date.now(),
                isCounting: false,
            }
        }

        this.setState({
            playerDetails: playerDetails,
            playerTimers: playerTimers,
            gameMode: MODE_STRATEGY,
        });

        this.startGameTimer();
    }

    handlePlayerStrategyChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        let newStrategy = {
            strategyCard: JSON.parse(e.target.value),
            isUsed: false,
        }
        playerDetails[playerNumber].strategy = newStrategy

        this.setState({
            playerDetails: playerDetails,
        });
    }

    //TODO Review the function name as it's likely to become confusing once strategy cards area added to the strategy select view
    handleStrategyCardClicked(playerString) {
        let player = JSON.parse(playerString);
        if (player.isPassed) {
            return; //can't toggle strategy card if already passed
        }

        let newStrategy = {...player.strategy};
        newStrategy.isUsed = !newStrategy.isUsed;
        
        let newPlayer = {...player};
        newPlayer.strategy = newStrategy;

        let newPlayerDetails = this.state.playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        
        this.setState({
            playerDetails: newPlayerDetails,
        });
        
        if (newPlayer.strategy.strategyCard.number === POLITICS_CARD_NUMBER && newPlayer.strategy.isUsed) {
            this.handleSpeakerButtonClicked();
        }
    }

    handlePassButtonClicked(playerString) {
        let player = JSON.parse(playerString);
        if (!player.isPassed && !player.strategy.isUsed) {
            return; //can't pass if strategy card is not yet played
        }

        let newPlayer = {...player};
        newPlayer.isPassed = !newPlayer.isPassed;

        let newPlayerDetails = this.state.playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;

        this.setState({
            playerDetails: newPlayerDetails,
        });
    }

    handleStartRound() {
        let lowestInitiative = NUMBER_STRATEGIES;
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            if (this.state.playerDetails[i].strategy.strategyCard.number <= lowestInitiative) {
                lowestInitiative = this.state.playerDetails[i].strategy.strategyCard.number;
            }
        }

        let newPlayerDetails = this.state.playerDetails.map((player) => {
            let newPlayer = {...player};
            newPlayer.isActivePlayer = newPlayer.strategy.strategyCard.number === lowestInitiative;
            return newPlayer;
        });

        this.setState({
            playerDetails: newPlayerDetails,
            gameMode: MODE_STATUS_BOARD,
        });

        this.startGameTimer();
        this.startTurnTimers();
    }

    handlePlayAgenda() {
        this.setState({
            gameMode: MODE_AGENDA,
        });
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
                isPassed: false,
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

    handleVictoryPointClick(e, playerString) {
        let player = JSON.parse(playerString);
        let newPlayerDetails = this.state.playerDetails.slice();
        let newVictoryPoints = player.victoryPoints;

        if (e.nativeEvent.which === LEFT_CLICK) {
            newVictoryPoints = player.victoryPoints + 1;
        }
        else if (e.nativeEvent.which === RIGHT_CLICK) {
            newVictoryPoints = player.victoryPoints - 1;
        }
        
        if (newVictoryPoints >= 0 && newVictoryPoints <= (this.state.maxVictoryPoints ? this.state.maxVictoryPoints : 10)) {
            let newPlayer = {...player};
            newPlayer.victoryPoints = newVictoryPoints;
            newPlayerDetails[newPlayer.playerNumber] = newPlayer;
            this.setState({
                playerDetails: newPlayerDetails,
            });
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

    handleObjectiveChange(e) {
        let newObjective = JSON.parse(e.target.value);
        this.setState({
            selectedObjectiveSelection: newObjective,
        });
    }

    handleCloseObjectiveSelectModal(isConfirmed) {
        if(isConfirmed && this.state.selectedObjectiveSelection && this.state.selectedObjective) {
            let newObjective = {...this.state.selectedObjectiveSelection};
            newObjective.isRevealed = true;
            newObjective.order = this.state.selectedObjective.order;

            let newPublicObjectives = this.state.publicObjectives.slice();
            newPublicObjectives[this.state.selectedObjective.order] = newObjective;
            
            this.setState({
                publicObjectives: newPublicObjectives,
            });
        }

        this.setState({
            showObjectiveSelectModal: false,
            selectedObjective: null,
            selectedObjectiveSelection: null,
        });
    }

    handleAgendaChange(e) {
        let newAgenda = JSON.parse(e.target.value);
        this.setState({
            selectedAgenda: newAgenda,
        });
    }

    handleEndAgenda() {
        this.setState({
            gameMode: MODE_STRATEGY,
            selectedAgenda: null,
        });
    }

    handleSpeakerButtonClicked() {
        this.setState({ 
            showSpeakerChangeModal: true,
        });
    }

    handleSpeakerChange(e) {
        let newSpeakerNumber = e.target.value;
        this.setState({
            selectedSpeakerNumber: newSpeakerNumber,
        });
    }

    handleCloseSpeakerChangeModal(isConfirmed) {
        if(isConfirmed && this.state.selectedSpeakerNumber) {
            let newPlayerDetails = this.state.playerDetails.slice();
            let oldSpeaker = null;
            for (let i = 0; i < newPlayerDetails.length; i++) {
                if (newPlayerDetails[i].isSpeaker) {
                    oldSpeaker = {...newPlayerDetails[i]}
                    oldSpeaker.isSpeaker = false;
                }
            }

            let newSpeaker = {...newPlayerDetails[this.state.selectedSpeakerNumber]};
            newSpeaker.isSpeaker = true;
            
            newPlayerDetails[oldSpeaker.playerNumber] = oldSpeaker;
            newPlayerDetails[newSpeaker.playerNumber] = newSpeaker;
            
            this.setState({
                playerDetails: newPlayerDetails,
            });
        }

        this.setState({
            showSpeakerChangeModal: false,
            selectedSpeakerNumber: null,
        });
    }

    handleTechClicked(techDefinition, player) {
        let newPlayer = {...player};
        let newTechSets = player.techs.slice();
        for (let i = 0; i < newTechSets.length; i++) {
            let newTechs = newTechSets[i].map(tech => {
                if (tech.techDefinition === techDefinition) {
                    let newTech = {...tech};
                    newTech.isResearched = !newTech.isResearched;
                    return newTech;
                }
                return tech;
            })
            newTechSets[i] = newTechs;
        }
        newPlayer.techs = newTechSets;

        let newPlayerDetails = this.state.playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        this.setState({
            playerDetails: newPlayerDetails,
        });
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

        let playerTimers = this.state.playerTimers.slice();
        const playerNumber = this.getActivePlayer().playerNumber;
        let playerTimer = {...playerTimers[playerNumber]};
        playerTimer.currentSeconds = playerTimer.baseSeconds + Math.floor((Date.now() - playerTimer.countStartTime) / 1000);
        playerTimers[playerNumber] = playerTimer;
        
        this.setState({
            currentTurnTimer: timer,
            playerTimers: playerTimers,
        });
    }

    startTurnTimers() {
        if (this.state.currentTurnTimer.isCounting) {
            return; //do nothing if already counting
        }
        let timer = { ...this.state.currentTurnTimer };
        timer.isCounting = true;
        timer.countStartTime = Date.now();

        let playerTimers = this.state.playerTimers.slice();
        const playerNumber = this.getActivePlayer().playerNumber;

        for (let i = 0; i < playerTimers.length; i++) {
            let playerTimer = {...playerTimers[i]};
            playerTimer.isCounting = i === playerNumber;
            playerTimer.countStartTime = Date.now();
            playerTimers[i] = playerTimer;
    
        }

        this.setState({
            currentTurnTimer: timer,
            playerTimers: playerTimers,
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

        let playerTimers = this.state.playerTimers.slice();
        const playerNumber = this.getActivePlayer().playerNumber;
        let playerTimer = {...playerTimers[playerNumber]};
        playerTimer.isCounting = false;
        playerTimer.baseSeconds = playerTimer.currentSeconds;
        playerTimers[playerNumber] = playerTimer;

        this.setState({
            currentTurnTimer: timer,
            playerTimers: playerTimers,
        })
    }

    restartTurnTimers() {
        let timer = {
            baseSeconds: 0,
            currentSeconds: 0,
            countStartTime: Date.now(),
            isCounting: true,
        };

        let playerDetails = this.state.playerDetails.slice();
        let playerTimers = this.state.playerTimers.slice();

        let currentPlayer = {...this.getActivePlayer()};
        let currentPlayerTimer = {...playerTimers[currentPlayer.playerNumber]};
        currentPlayerTimer.isCounting = false;
        currentPlayerTimer.baseSeconds = currentPlayerTimer.currentSeconds;
        currentPlayer.isActivePlayer = false;
        playerTimers[currentPlayer.playerNumber] = currentPlayerTimer;
        playerDetails[currentPlayer.playerNumber] = currentPlayer;

        let nextPlayer = this.getNextPlayer(currentPlayer)
        let nextPlayerTimer = {...playerTimers[nextPlayer.playerNumber]};
        nextPlayerTimer.isCounting = true;
        nextPlayerTimer.countStartTime = Date.now();
        nextPlayer.isActivePlayer = true;
        playerTimers[nextPlayer.playerNumber] = nextPlayerTimer;
        playerDetails[nextPlayer.playerNumber] = nextPlayer;
        
        this.setState({
            currentTurnTimer: timer,
            playerDetails: playerDetails,
            playerTimers: playerTimers,
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
        let highestInitiativeNumber = activePlayer.strategy.strategyCard.number + NUMBER_STRATEGIES - 1;
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            let player = this.state.playerDetails[i];
            if (!player.isActivePlayer && !player.isPassed) {
                // determine the player initiative number, offset by the number of strategies to allow it to loop back
                let playerInitiativeNumber =
                    player.strategy.strategyCard.number < activePlayer.strategy.strategyCard.number ?
                        player.strategy.strategyCard.number + NUMBER_STRATEGIES :
                        player.strategy.strategyCard.number;
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
            case MODE_AGENDA:
                return this.renderAgenda();
            default:
                return null;
        }
    }

    renderPlayerSelect() {
        return (
            <Container fluid={true}>
                <PlayerSelect onStartGame={playerDetails => this.handleStartGame(playerDetails)} />
            </Container>
        );
    }

    renderStrategy() {
        return (
            <Container fluid={true}>
                <Row>{this.renderGameHeader(false)}</Row>
                <Row>
                    <Col xs={4} md={2} xl={1}>
                        {this.renderObjectivePanel()}
                    </Col>
                    <Col>
                        <StrategySelect
                            playerDetails={this.state.playerDetails}
                            isGameActive={this.state.totalGameTimer.isCounting}
                            onToggleTimers={() => this.handleToggleTimers()}
                            onStartRound={() => this.handleStartRound()}
                            onPlayAgenda={() => this.handlePlayAgenda()}
                            onPlayerStrategyChange={(e, playerNumber) => this.handlePlayerStrategyChange(e, playerNumber)}
                            onSpeakerButtonClick={() => this.handleSpeakerButtonClicked()}
                            />
                    </Col>
                </Row>
            </Container>
        );
    }

    renderStatusBoard() {
        return (
            <Container fluid={true}>
                <Row>{this.renderGameHeader(true)}</Row>
                <Row>
                    <Col xs={4} md={2} xl={1}>
                        {this.renderObjectivePanel()}
                    </Col>
                    <Col>
                        <StatusBoard
                            roundNumber={this.state.roundNumber}
                            isGameActive={this.state.totalGameTimer.isCounting}
                            players={this.state.playerDetails}
                            playerTimers={this.state.playerTimers}
                            onEndTurn={() => this.handleEndTurn()}
                            onToggleTimers={() => this.handleToggleTimers()}
                            onVictoryPointsClick={(e, playerString) => this.handleVictoryPointClick(e, playerString)}
                            onStrategyCardClick={(playerString) => this.handleStrategyCardClicked(playerString)}
                            onPassButtonClick={(playerString) => this.handlePassButtonClicked(playerString)}
                            onEndRound={() => this.handleEndRound()}
                            onTechClick={(techDefinition, player) => this.handleTechClicked(techDefinition, player)}
                            onSpeakerButtonClick={() => this.handleSpeakerButtonClicked()}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    renderAgenda() {
        return (
            <Container fluid={true}>
                <Row>{this.renderGameHeader(false)}</Row>
                <Row>
                    <Col xs={4} md={2} xl={1}>
                        {this.renderObjectivePanel()}
                    </Col>
                    <Col>
                        <PlayAgenda
                            playerDetails={this.state.playerDetails}
                            selectedAgenda={this.state.selectedAgenda}
                            onAgendaChange={e => this.handleAgendaChange(e)}
                            onEndAgenda={() => this.handleEndAgenda()}
                        />
                    </Col>
                </Row>
            </Container>
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
            className="objectivePanel"
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
                    stage={this.state.selectedObjective ? this.state.selectedObjective.stage : null}
                    selectedObjectiveSelection={this.state.selectedObjectiveSelection}
                    onConfirmModal={() => this.handleCloseObjectiveSelectModal(true)}
                    onCloseModal={() => this.handleCloseObjectiveSelectModal()}
                    onObjectiveChange={e => this.handleObjectiveChange(e)}
                />
                <SpeakerChangeModal
                    showModal={this.state.showSpeakerChangeModal}
                    playerDetails={this.state.playerDetails}
                    selectedSpeakerNumber={this.state.selectedSpeakerNumber}
                    onConfirmModal={() => this.handleCloseSpeakerChangeModal(true)}
                    onCloseModal={() => this.handleCloseSpeakerChangeModal()}
                    onSpeakerChange={e => this.handleSpeakerChange(e)}
                />
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
