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
import TokenAssignModal from './TokenAssignModal';

import {hasUnplayedStrategies} from './Utils';

import './GameManager.css';

//game modes
const MODE_PLAYER_SELECT = 1;
const MODE_STRATEGY = 2;
const MODE_STATUS_BOARD = 3;
const MODE_AGENDA = 4;

//assign token owner modes
const MODE_NO_ASSIGN = 0;
const MODE_ASSIGN_SPEAKER = 1;
const MODE_ASSIGN_NAALU_INITIATIVE = 2;

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
            tokenAssignModalMode: MODE_NO_ASSIGN,

            //Temporary State
            selectedObjective: null,
            selectedObjectiveSelection: null, //used for the objective select modal to record the current selection
            selectedTokenOwnerNumber: null, //used for the token assignment modal to record the new owner selected
            currentTokenOwnerNumber: null, //used for the token assignment modal as an input identifying the current token owner
            tokenAssignModalTitle: null, //used to set the title of the token assignment modal
            selectedAgenda: null,

            //Game Details
            playerDetails: null,
            playerTimers: null,
            roundNumber: 1,
            isNaaluTelepathicActive: false,
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

        let isNaaluTelepathicActive = false;
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].faction.isNaaluTelepathic) {
                isNaaluTelepathicActive = true;
                playerDetails[i].isNaaluTelepathic = true;
            }
        }

        this.setState({
            playerDetails: playerDetails,
            playerTimers: playerTimers,
            gameMode: MODE_STRATEGY,
            isNaaluTelepathicActive: isNaaluTelepathicActive,
        });

        this.startGameTimer();
    }

    handlePlayerStrategyChange(e, playerNumber, strategyNumber) {
        let playerDetails = this.state.playerDetails.slice();
        let newStrategy = {
            strategyCard: JSON.parse(e.target.value),
            isUsed: false,
        }
        playerDetails[playerNumber].strategies[strategyNumber] = newStrategy

        this.setState({
            playerDetails: playerDetails,
        });
    }

    //TODO Review the function name as it's likely to become confusing once strategy cards area added to the strategy select view. 
    // This one relates to clicking the card on the Status Board to indicate that the strategy has been played
    handleStrategyCardClicked(strategyCardNumber, playerString) {
        let player = JSON.parse(playerString);
        if (player.isPassed) {
            return; //can't toggle strategy card if already passed
        }

        let isPlayingPolitics = false;

        let newStrategies = [];
        for (let i = 0; i < player.strategies.length; i++) {
            newStrategies[i] = {...player.strategies[i]};
            if (newStrategies[i].strategyCard.number === strategyCardNumber) {
                newStrategies[i].isUsed = !newStrategies[i].isUsed;
                if (strategyCardNumber === POLITICS_CARD_NUMBER && newStrategies[i].isUsed) {
                    isPlayingPolitics = true;
                }
            }
        }
        
        let newPlayer = {...player}; 
        newPlayer.strategies = newStrategies;

        let newPlayerDetails = this.state.playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        
        this.setState({
            playerDetails: newPlayerDetails,
        });
        
        if (isPlayingPolitics) {
            this.handleSpeakerButtonClicked();
        }
    }

    handlePassButtonClicked(playerString) {
        let player = JSON.parse(playerString);
        if (!player.isPassed && hasUnplayedStrategies(player)) {
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
            let player = this.state.playerDetails[i];
            let playerStrategies = player.strategies.sort((a, b) => a.strategyCard.number - b.strategyCard.number);
            let playerInitiative = player.isNaaluTelepathic ? 0 : playerStrategies[0].strategyCard.number; 
            if (playerInitiative <= lowestInitiative) {
                lowestInitiative = playerInitiative;
            }
        }

        let newPlayerDetails = this.state.playerDetails.map((player) => {
            let newPlayer = {...player};
            newPlayer.strategies = player.strategies.sort((a, b) => a.strategyCard.number - b.strategyCard.number);
            let playerInitiative = newPlayer.isNaaluTelepathic ? 0 : newPlayer.strategies[0].strategyCard.number; 
            newPlayer.isActivePlayer = playerInitiative === lowestInitiative;
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


    handleAvailableVotesClick(e, playerString, delta) {
        let player = JSON.parse(playerString);
        let newPlayerDetails = this.state.playerDetails.slice();
        let newAvailableVotes = player.availableVotes;

        if (e.nativeEvent.which === LEFT_CLICK) {
            newAvailableVotes = Math.min(99, player.availableVotes + delta);
        }
        else if (e.nativeEvent.which === RIGHT_CLICK) {
            newAvailableVotes = Math.max(0, player.availableVotes - delta);
        }
        
        let newPlayer = {...player};
        newPlayer.availableVotes = newAvailableVotes;
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        this.setState({
            playerDetails: newPlayerDetails,
        });
    }

    handleSpentVotesClick(e, playerString, delta) {
        let player = JSON.parse(playerString);
        let newPlayerDetails = this.state.playerDetails.slice();
        let newSpentVotes = player.spentVotes;

        if (e.nativeEvent.which === LEFT_CLICK) {
            newSpentVotes = Math.min(player.availableVotes, player.spentVotes + delta);
        }
        else if (e.nativeEvent.which === RIGHT_CLICK) {
            newSpentVotes = Math.max(0, player.spentVotes - delta);
        }
        
        let newPlayer = {...player};
        newPlayer.spentVotes = newSpentVotes;
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        this.setState({
            playerDetails: newPlayerDetails,
        });
    }

    handleVoteTargetChange(e, playerString) {
        let player = JSON.parse(playerString);
        let newPlayerDetails = this.state.playerDetails.slice();
        let newVoteTarget = e.target.value;

        let newPlayer = {...player};
        newPlayer.voteTarget = newVoteTarget;
        if (newVoteTarget === "Abstain") {
            newPlayer.spentVotes = 0;
        }
        
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        this.setState({
            playerDetails: newPlayerDetails,
        });
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

    handleNextAgenda() {
        let newPlayerDetails = this.state.playerDetails.slice();
        for (let i = 0; i < newPlayerDetails.length; i++) {
            let player = {...newPlayerDetails[i]};
            player.availableVotes = player.availableVotes - player.spentVotes;
            player.spentVotes = 0;
            player.voteTarget = null;
            newPlayerDetails[i] = player;
        }

        this.setState({
            playerDetails: newPlayerDetails,
        });
    }

    handleEndAgenda() {
        let newPlayerDetails = this.state.playerDetails.slice();
        for (let i = 0; i < newPlayerDetails.length; i++) {
            let player = {...newPlayerDetails[i]};
            player.availableVotes = 0;
            player.spentVotes = 0;
            player.voteTarget = null;
            newPlayerDetails[i] = player;
        }

        this.setState({
            gameMode: MODE_STRATEGY,
            selectedAgenda: null,
            playerDetails: newPlayerDetails,
        });
    }

    handleSpeakerButtonClicked() {
        let speakerNumber = null;
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            if (this.state.playerDetails[i].isSpeaker) {
                speakerNumber = this.state.playerDetails[i].playerNumber;
            }
        }
        this.setState({ 
            tokenAssignModalMode: MODE_ASSIGN_SPEAKER,
            currentTokenOwnerNumber: speakerNumber,
            tokenAssignModalTitle: "Select new speaker",
        });
    }

    handleNaaluInitiativeButtonClicked() {
        let naaluTelepathicPlayerNumber = null;
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            if (this.state.playerDetails[i].isNaaluTelepathic) {
                naaluTelepathicPlayerNumber = this.state.playerDetails[i].playerNumber;
            }
        }
        this.setState({ 
            tokenAssignModalMode: MODE_ASSIGN_NAALU_INITIATIVE,
            currentTokenOwnerNumber: naaluTelepathicPlayerNumber,
            tokenAssignModalTitle: "Select new telepath",
        });
    }

    handleTokenOwnerChange(e) {
        let newTokenOwnerNumber = e.target.value;
        this.setState({
            selectedTokenOwnerNumber: newTokenOwnerNumber,
        });
    }

    handleCloseTokenAssignModal(isConfirmed) {
        if(isConfirmed && this.state.selectedTokenOwnerNumber) {
            let newPlayerDetails = this.state.playerDetails.slice();
            let oldOwner = {...newPlayerDetails[this.state.currentTokenOwnerNumber]}
            let newOwner = {...newPlayerDetails[this.state.selectedTokenOwnerNumber]};

            switch (this.state.tokenAssignModalMode) {
                case MODE_ASSIGN_SPEAKER:
                    oldOwner.isSpeaker = false;
                    newOwner.isSpeaker = true;
                    break;
                case MODE_ASSIGN_NAALU_INITIATIVE:
                    oldOwner.isNaaluTelepathic = false;
                    newOwner.isNaaluTelepathic = true;
                    break;
                default:
                    break;
            }

            newPlayerDetails[oldOwner.playerNumber] = oldOwner;
            newPlayerDetails[newOwner.playerNumber] = newOwner;

            this.setState({
                playerDetails: newPlayerDetails,
            });
        }

        this.setState({
            tokenAssignModalMode: MODE_NO_ASSIGN,
            selectedTokenOwnerNumber: null,
            currentTokenOwnerNumber: null,
            tokenAssignModalTitle: null,
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
        let nextPlayer = activePlayer;
        //TODO Make Naalu initiative account for it being held my non-Naalu players
        let activePlayerInitiative = activePlayer.isNaaluTelepathic ? 0 : activePlayer.strategies[0].strategyCard.number;
        let initiativeRange = NUMBER_STRATEGIES + (this.state.isNaaluTelepathicActive ? 1 : 0);
        // determine the highest initiative number that could possibly be next. Offset by the number of strategies to allow it to loop back;
        let highestInitiativeNumber = activePlayerInitiative + initiativeRange - 1;
        for (let i = 0; i < this.state.playerDetails.length; i++) {
            let player = this.state.playerDetails[i];
            if (!player.isActivePlayer && !player.isPassed) {
                // determine the player initiative number, offset by the number of strategies to allow it to loop back
                let playerInitiativeNumber = player.isNaaluTelepathic ? 0 : player.strategies[0].strategyCard.number;
                if (playerInitiativeNumber < activePlayerInitiative) {
                    playerInitiativeNumber += initiativeRange;
                }
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
                            onPlayerStrategyChange={(e, playerNumber, strategyNumber) => this.handlePlayerStrategyChange(e, playerNumber, strategyNumber)}
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
                            onStrategyCardClick={(strategyCardNumber, playerString) => this.handleStrategyCardClicked(strategyCardNumber, playerString)}
                            onPassButtonClick={(playerString) => this.handlePassButtonClicked(playerString)}
                            onEndRound={() => this.handleEndRound()}
                            onTechClick={(techDefinition, player) => this.handleTechClicked(techDefinition, player)}
                            onSpeakerButtonClick={() => this.handleSpeakerButtonClicked()}
                            onNaaluInitiativeButtonClick={() => this.handleNaaluInitiativeButtonClicked()}
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
                            onNextAgenda={() => this.handleNextAgenda()}
                            onEndAgenda={() => this.handleEndAgenda()}
                            onAvailableVotesClick={(e, playerString, delta) => this.handleAvailableVotesClick(e, playerString, delta)}
                            onSpentVotesClick={(e, playerString, delta) => this.handleSpentVotesClick(e, playerString, delta)}
                            onVoteTargetChange={(e, playerString) => this.handleVoteTargetChange(e, playerString)}
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
                <TokenAssignModal
                    showModal={this.state.tokenAssignModalMode !== MODE_NO_ASSIGN}
                    title={this.state.tokenAssignModalTitle}
                    players={this.state.playerDetails}
                    currentTokenOwnerNumber={this.state.currentTokenOwnerNumber}
                    selectedTokenOwnerNumber={this.state.selectedTokenOwnerNumber}
                    onConfirmModal={() => this.handleCloseTokenAssignModal(true)}
                    onCloseModal={() => this.handleCloseTokenAssignModal()}
                    onTokenOwnerChange={e => this.handleTokenOwnerChange(e)}
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
