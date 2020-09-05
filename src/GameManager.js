import React, { useState, useEffect } from 'react';
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


function GameManager(props) {
    
    //View controls
    const [gameMode, setGameMode] = useState(MODE_PLAYER_SELECT);
    const [showObjectiveSelectModal, setShowObjectiveSelectModal] = useState(false);
    const [tokenAssignModalMode, setTokenAssignModalMode] = useState(MODE_NO_ASSIGN);

    //Temporary State
    const [selectedObjective, setSelectedObjective] = useState(null);
    const [selectedObjectiveSelection, setSelectedObjectiveSelection] = useState(null); //used for the objective select modal to record the current selection
    const [selectedTokenOwnerNumber, setSelectedTokenOwnerNumber] = useState(null); //used for the token assignment modal to record the new owner selected
    const [currentTokenOwnerNumber, setCurrentTokenOwnerNumber] = useState(null); //used for the token assignment modal as an input identifying the current token owner
    const [tokenAssignModalTitle, setTokenAssignModalTitle] = useState(null); //used to set the title of the token assignment modal
    const [selectedAgenda, setSelectedAgenda] = useState(null);

    //Game Details
    const [playerDetails, setPlayerDetails] = useState(null);
    const [playerTimers, setPlayerTimers] = useState(null);
    const [roundNumber, setRoundNumber] = useState(1);
    const [maxVictoryPoints, setMaxVictoryPoints] = useState(10);
    const [isNaaluTelepathicActive, setIsNaaluTelepathicActive] = useState(false);
    const [totalGameTimer, setTotalGameTimer] = useState({
        baseSeconds: 0,
        currentSeconds: 0,
        countStartTime: Date.now(),
        isCounting: false,
    });
    const [currentTurnTimer, setCurrentTurnTimer] = useState({
        baseSeconds: 0,
        currentSeconds: 0,
        countStartTime: Date.now(),
        isCounting: false,
    });
    const [publicObjectives, setPublicObjectives] = useState(() => {
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
    });


    useEffect(() => {
        const heartbeat = setInterval(() => recalculateTimers(), 500);
        return () => clearInterval(heartbeat);
    });


    let handleStartGame = (playerDetails) => {
        let playerTimers = Array(playerDetails.length);
        for (let i = 0; i < playerTimers.length; i++) {
            playerTimers[i] = {
                baseSeconds: 0,
                currentSeconds: 0,
                countStartTime: Date.now(),
                isCounting: false,
            }
        }

        let newIsNaaluTelepathicActive = false;
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].faction.isNaaluTelepathic) {
                newIsNaaluTelepathicActive = true;
                playerDetails[i].isNaaluTelepathic = true;
            }
        }

        setPlayerDetails(playerDetails);
        setPlayerTimers(playerTimers);
        setGameMode(MODE_STRATEGY);
        setIsNaaluTelepathicActive(newIsNaaluTelepathicActive);

        startGameTimer();
    }

    let handlePlayerStrategyChange = (e, playerNumber, strategyNumber) => {
        let newPlayerDetails = playerDetails.slice();
        let newStrategy = {
            strategyCard: JSON.parse(e.target.value),
            isUsed: false,
        }
        newPlayerDetails[playerNumber].strategies[strategyNumber] = newStrategy

        setPlayerDetails(newPlayerDetails);
    }

    //TODO Review the function name as it's likely to become confusing once strategy cards area added to the strategy select view. 
    //FIXME Pass around player number instead of full copy?
    // This one relates to clicking the card on the Status Board to indicate that the strategy has been played
    let handleStrategyCardClicked = (strategyCardNumber, playerString) => {
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

        let newPlayerDetails = playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        
        setPlayerDetails(newPlayerDetails);
        
        if (isPlayingPolitics) {
            handleSpeakerButtonClicked();
        }
    }

    let handlePassButtonClicked = (playerString) => {
        let player = JSON.parse(playerString);
        if (!player.isPassed && hasUnplayedStrategies(player)) {
            return; //can't pass if strategy card is not yet played
        }

        let newPlayer = {...player};
        newPlayer.isPassed = !newPlayer.isPassed;

        let newPlayerDetails = playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;

        setPlayerDetails(newPlayerDetails);
    }

    let handleStartRound = () => {
        let lowestInitiative = NUMBER_STRATEGIES;
        for (let i = 0; i < playerDetails.length; i++) {
            let player = playerDetails[i];
            let playerStrategies = player.strategies.sort((a, b) => a.strategyCard.number - b.strategyCard.number);
            let playerInitiative = player.isNaaluTelepathic ? 0 : playerStrategies[0].strategyCard.number; 
            if (playerInitiative <= lowestInitiative) {
                lowestInitiative = playerInitiative;
            }
        }

        let newPlayerDetails = playerDetails.map((player) => {
            let newPlayer = {...player};
            newPlayer.strategies = player.strategies.sort((a, b) => a.strategyCard.number - b.strategyCard.number);
            let playerInitiative = newPlayer.isNaaluTelepathic ? 0 : newPlayer.strategies[0].strategyCard.number; 
            newPlayer.isActivePlayer = playerInitiative === lowestInitiative;
            return newPlayer;
        });

        setPlayerDetails(newPlayerDetails);
        setGameMode(MODE_STATUS_BOARD);

        startGameTimer();
        startTurnTimers();
    }

    let handlePlayAgenda = () => {
        setGameMode(MODE_AGENDA);
    }

    let handleTurnTimerClicked = () => {
        if (currentTurnTimer.isCounting) {
            stopTurnTimers();
        }
        else {
            startTurnTimers();
            startGameTimer(); //if turn timers are running, the game timer should be as well
        }
    }

    let handleGameTimerClicked = () => {
        if (totalGameTimer.isCounting) {
            stopGameTimer();
            stopTurnTimers(); //if the game timer is stopped, all timers should be stopped
        }
        else {
            startGameTimer();
        }
    }

    let handleEndRound = () => {
        let newPlayerDetails = playerDetails.map(
            player => ({
                ...player,
                strategy: null,
                isPassed: false,
            })
        );

        setGameMode(MODE_STRATEGY);
        setRoundNumber(roundNumber + 1)
        setPlayerDetails(newPlayerDetails);

        stopTurnTimers(true); //turns aren't occurring between rounds
        startGameTimer(); //activity means the game timer should almost certainly be on
    }

    let handleToggleTimers = () => {
        if (totalGameTimer.isCounting) {
            stopGameTimer();
            stopTurnTimers();
        }
        else {
            startGameTimer();
            if (gameMode === MODE_STATUS_BOARD) {
                startTurnTimers();
            }
        }
    }

    let handleVictoryPointClick = (e, playerString) => {
        let player = JSON.parse(playerString);
        let newPlayerDetails = playerDetails.slice();
        let newVictoryPoints = player.victoryPoints;

        if (e.nativeEvent.which === LEFT_CLICK) {
            newVictoryPoints = player.victoryPoints + 1;
        }
        else if (e.nativeEvent.which === RIGHT_CLICK) {
            newVictoryPoints = player.victoryPoints - 1;
        }
        
        if (newVictoryPoints >= 0 && newVictoryPoints <= maxVictoryPoints) {
            let newPlayer = {...player};
            newPlayer.victoryPoints = newVictoryPoints;
            newPlayerDetails[newPlayer.playerNumber] = newPlayer;
            setPlayerDetails(newPlayerDetails);
        }
    }

    let handleAvailableVotesClick = (e, playerString, delta) => {
        let player = JSON.parse(playerString);
        let newPlayerDetails = playerDetails.slice();
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
        setPlayerDetails(newPlayerDetails);
    }

    let handleSpentVotesClick = (e, playerString, delta) => {
        let player = JSON.parse(playerString);
        let newPlayerDetails = playerDetails.slice();
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
        setPlayerDetails(newPlayerDetails);
    }

    let handleVoteTargetChange = (e, playerString) => {
        let player = JSON.parse(playerString);
        let newPlayerDetails = playerDetails.slice();
        let newVoteTarget = e.target.value;

        let newPlayer = {...player};
        newPlayer.voteTarget = newVoteTarget;
        if (newVoteTarget === "Abstain") {
            newPlayer.spentVotes = 0;
        }
        
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        setPlayerDetails(newPlayerDetails);
    }

    let handleEndTurn = () => {
        startGameTimer();
        restartTurnTimers();
    }

    let handleObjectiveCardClicked = (index) => {
        let objective = publicObjectives[index];
        if (!objective.isRevealed && objective.order === getNextUnrevealedObjective()) {
            setShowObjectiveSelectModal(true);
            setSelectedObjective(objective);
        }
    }

    let handleObjectiveChange = (e) => {
        let newObjective = JSON.parse(e.target.value);
        setSelectedObjectiveSelection(newObjective);
    }

    let handleCloseObjectiveSelectModal = (isConfirmed) => {
        if(isConfirmed && selectedObjectiveSelection && selectedObjective) {
            let newObjective = {...selectedObjectiveSelection};
            newObjective.isRevealed = true;
            newObjective.order = selectedObjective.order;

            let newPublicObjectives = publicObjectives.slice();
            newPublicObjectives[selectedObjective.order] = newObjective;
            
            setPublicObjectives(newPublicObjectives);
        }

        setShowObjectiveSelectModal(false);
        setSelectedObjective(null);
        setSelectedObjectiveSelection(null);
    }

    let handleAgendaChange = (e) => {
        let newAgenda = JSON.parse(e.target.value);
        setSelectedAgenda(newAgenda);
    }

    let handleNextAgenda = () => {
        let newPlayerDetails = playerDetails.slice();
        for (let i = 0; i < newPlayerDetails.length; i++) {
            let player = {...newPlayerDetails[i]};
            player.availableVotes = player.availableVotes - player.spentVotes;
            player.spentVotes = 0;
            player.voteTarget = null;
            newPlayerDetails[i] = player;
        }

        setPlayerDetails(newPlayerDetails);
    }

    let handleEndAgenda = () => {
        let newPlayerDetails = playerDetails.slice();
        for (let i = 0; i < newPlayerDetails.length; i++) {
            let player = {...newPlayerDetails[i]};
            player.availableVotes = 0;
            player.spentVotes = 0;
            player.voteTarget = null;
            newPlayerDetails[i] = player;
        }

        setGameMode(MODE_STRATEGY);
        setSelectedAgenda(null);
        setPlayerDetails(newPlayerDetails);
    }

    let handleSpeakerButtonClicked = () => {
        let speakerNumber = null;
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isSpeaker) {
                speakerNumber = playerDetails[i].playerNumber;
            }
        }

        setTokenAssignModalMode(MODE_ASSIGN_SPEAKER);
        setCurrentTokenOwnerNumber(speakerNumber);
        setTokenAssignModalTitle("Select new speaker");
    }

    let handleNaaluInitiativeButtonClicked = () => {
        let naaluTelepathicPlayerNumber = null;
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isNaaluTelepathic) {
                naaluTelepathicPlayerNumber = playerDetails[i].playerNumber;
            }
        }

        setTokenAssignModalMode(MODE_ASSIGN_NAALU_INITIATIVE);
        setCurrentTokenOwnerNumber(naaluTelepathicPlayerNumber);
        setTokenAssignModalTitle("Select new telepath");
    }

    let handleTokenOwnerChange = (e) => {
        let newTokenOwnerNumber = e.target.value;
        setSelectedTokenOwnerNumber(newTokenOwnerNumber);
    }

    let handleCloseTokenAssignModal = (isConfirmed) => {
        if(isConfirmed && selectedTokenOwnerNumber) {
            let newPlayerDetails = playerDetails.slice();
            let oldOwner = {...newPlayerDetails[currentTokenOwnerNumber]}
            let newOwner = {...newPlayerDetails[selectedTokenOwnerNumber]};

            switch (tokenAssignModalMode) {
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

            setPlayerDetails(newPlayerDetails);
        }

        setTokenAssignModalMode(MODE_NO_ASSIGN);
        setSelectedTokenOwnerNumber(null);
        setCurrentTokenOwnerNumber(null);
        setTokenAssignModalTitle(null);
    }

    let handleTechClicked = (techDefinition, player) => {
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

        let newPlayerDetails = playerDetails.slice();
        newPlayerDetails[newPlayer.playerNumber] = newPlayer;
        setPlayerDetails(newPlayerDetails);
    }

    let getNextUnrevealedObjective = () => {
        for (let i = 0; i < publicObjectives.length; i++) {
            if (!publicObjectives[i].isRevealed) {
                return publicObjectives[i].order;
            }
        }

        return null;
    }

    let recalculateTimers = () => {
        if (totalGameTimer && totalGameTimer.isCounting) {
            recalculateGameTime();
        }
        if (currentTurnTimer && currentTurnTimer.isCounting) {
            recalculateTurnTime();
        }
    }

    let recalculateGameTime = () => {
        let timer = { ...totalGameTimer };
        timer.currentSeconds = timer.baseSeconds + Math.floor((Date.now() - timer.countStartTime) / 1000);

        setTotalGameTimer(timer);
    }

    let startGameTimer = () => {
        if (totalGameTimer.isCounting) {
            return; //do nothing if already counting
        }
        let timer = { ...totalGameTimer };
        timer.isCounting = true;
        timer.countStartTime = Date.now();

        setTotalGameTimer(timer);
    }

    let stopGameTimer = () => {
        if (!totalGameTimer.isCounting) {
            return; //do nothing if already stopped
        }
        let timer = { ...totalGameTimer };
        timer.baseSeconds = timer.currentSeconds;
        timer.isCounting = false;

        setTotalGameTimer(timer);
    }

    let recalculateTurnTime = () => {
        let timer = { ...currentTurnTimer };
        timer.currentSeconds = timer.baseSeconds + Math.floor((Date.now() - timer.countStartTime) / 1000);

        let newPlayerTimers = playerTimers.slice();
        const activePlayerNumber = getActivePlayer().playerNumber;
        let playerTimer = {...playerTimers[activePlayerNumber]};
        playerTimer.currentSeconds = playerTimer.baseSeconds + Math.floor((Date.now() - playerTimer.countStartTime) / 1000);
        newPlayerTimers[activePlayerNumber] = playerTimer;
        
        setCurrentTurnTimer(timer);
        setPlayerTimers(newPlayerTimers);
    }

    let startTurnTimers = () => {
        if (currentTurnTimer.isCounting) {
            return; //do nothing if already counting
        }
        let timer = { ...currentTurnTimer };
        timer.isCounting = true;
        timer.countStartTime = Date.now();

        let newPlayerTimers = playerTimers.slice();
        const activePlayerNumber = getActivePlayer().playerNumber;

        for (let i = 0; i < newPlayerTimers.length; i++) {
            let playerTimer = {...newPlayerTimers[i]};
            playerTimer.isCounting = i === activePlayerNumber;
            playerTimer.countStartTime = Date.now();
            newPlayerTimers[i] = playerTimer;
        }
        
        setCurrentTurnTimer(timer);
        setPlayerTimers(newPlayerTimers);
    }

    let stopTurnTimers = (resetCurrentTurn) => {
        if (!currentTurnTimer.isCounting) {
            return; //do nothing if already stopped
        }
        let timer = { ...currentTurnTimer };
        timer.isCounting = false;
        if (resetCurrentTurn) {
            timer.baseSeconds = 0;
            timer.currentSeconds = 0;
        }
        else {
            timer.baseSeconds = timer.currentSeconds;
        }

        let newPlayerTimers = playerTimers.slice();
        const activePlayerNumber = getActivePlayer().playerNumber;
        let playerTimer = {...newPlayerTimers[activePlayerNumber]};
        playerTimer.isCounting = false;
        playerTimer.baseSeconds = playerTimer.currentSeconds;
        newPlayerTimers[activePlayerNumber] = playerTimer;

        setCurrentTurnTimer(timer);
        setPlayerTimers(newPlayerTimers);
    }

    let restartTurnTimers = () => {
        let timer = {
            baseSeconds: 0,
            currentSeconds: 0,
            countStartTime: Date.now(),
            isCounting: true,
        };

        let newPlayerDetails = playerDetails.slice();
        let newPlayerTimers = playerTimers.slice();

        let currentPlayer = {...getActivePlayer()};
        let currentPlayerTimer = {...newPlayerTimers[currentPlayer.playerNumber]};
        currentPlayerTimer.isCounting = false;
        currentPlayerTimer.baseSeconds = currentPlayerTimer.currentSeconds;
        currentPlayer.isActivePlayer = false;
        newPlayerTimers[currentPlayer.playerNumber] = currentPlayerTimer;
        newPlayerDetails[currentPlayer.playerNumber] = currentPlayer;

        let nextPlayer = getNextPlayer(currentPlayer)
        let nextPlayerTimer = {...newPlayerTimers[nextPlayer.playerNumber]};
        nextPlayerTimer.isCounting = true;
        nextPlayerTimer.countStartTime = Date.now();
        nextPlayer.isActivePlayer = true;
        newPlayerTimers[nextPlayer.playerNumber] = nextPlayerTimer;
        newPlayerDetails[nextPlayer.playerNumber] = nextPlayer;
        
        setCurrentTurnTimer(timer);
        setPlayerTimers(newPlayerTimers);
        setPlayerDetails(newPlayerDetails);
    }

    let getActivePlayer = () => {
        for (let i = 0; i < playerDetails.length; i++) {
            if (playerDetails[i].isActivePlayer) {
                return playerDetails[i];
            }
        }
        return null;
    }

    let getNextPlayer = (activePlayer) => {
        let nextPlayer = activePlayer;
        //TODO Make Naalu initiative account for it being held my non-Naalu players
        let activePlayerInitiative = activePlayer.isNaaluTelepathic ? 0 : activePlayer.strategies[0].strategyCard.number;
        let initiativeRange = NUMBER_STRATEGIES + (isNaaluTelepathicActive ? 1 : 0);
        // determine the highest initiative number that could possibly be next. Offset by the number of strategies to allow it to loop back;
        let highestInitiativeNumber = activePlayerInitiative + initiativeRange - 1;
        for (let i = 0; i < playerDetails.length; i++) {
            let player = playerDetails[i];
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

    //#region Rendering methods
    let renderGameComponent = () => {
        switch (gameMode) {
            case MODE_PLAYER_SELECT:
                return renderPlayerSelect();
            case MODE_STRATEGY:
                return renderStrategy();
            case MODE_STATUS_BOARD:
                return renderStatusBoard();
            case MODE_AGENDA:
                return renderAgenda();
            default:
                return null;
        }
    }

    let renderPlayerSelect = () => {
        return (
            <Container fluid={true}>
                <PlayerSelect onStartGame={playerDetails => handleStartGame(playerDetails)} />
            </Container>
        );
    }

    let renderStrategy = () => {
        return (
            <Container fluid={true}>
                <Row>{renderGameHeader(false)}</Row>
                <Row>
                    <Col xs={4} md={2} xl={1}>
                        {renderObjectivePanel()}
                    </Col>
                    <Col>
                        <StrategySelect
                            playerDetails={playerDetails}
                            isGameActive={totalGameTimer.isCounting}
                            onToggleTimers={() => handleToggleTimers()}
                            onStartRound={() => handleStartRound()}
                            onPlayAgenda={() => handlePlayAgenda()}
                            onPlayerStrategyChange={(e, playerNumber, strategyNumber) => handlePlayerStrategyChange(e, playerNumber, strategyNumber)}
                            onSpeakerButtonClick={() => handleSpeakerButtonClicked()}
                            />
                    </Col>
                </Row>
            </Container>
        );
    }

    let renderStatusBoard = () => {
        return (
            <Container fluid={true}>
                <Row>{renderGameHeader(true)}</Row>
                <Row>
                    <Col xs={4} md={2} xl={1}>
                        {renderObjectivePanel()}
                    </Col>
                    <Col>
                        <StatusBoard
                            roundNumber={roundNumber}
                            isGameActive={totalGameTimer.isCounting}
                            players={playerDetails}
                            playerTimers={playerTimers}
                            onEndTurn={() => handleEndTurn()}
                            onToggleTimers={() => handleToggleTimers()}
                            onVictoryPointsClick={(e, playerString) => handleVictoryPointClick(e, playerString)}
                            onStrategyCardClick={(strategyCardNumber, playerString) => handleStrategyCardClicked(strategyCardNumber, playerString)}
                            onPassButtonClick={(playerString) => handlePassButtonClicked(playerString)}
                            onEndRound={() => handleEndRound()}
                            onTechClick={(techDefinition, player) => handleTechClicked(techDefinition, player)}
                            onSpeakerButtonClick={() => handleSpeakerButtonClicked()}
                            onNaaluInitiativeButtonClick={() => handleNaaluInitiativeButtonClicked()}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    let renderAgenda = () => {
        return (
            <Container fluid={true}>
                <Row>{renderGameHeader(false)}</Row>
                <Row>
                    <Col xs={4} md={2} xl={1}>
                        {renderObjectivePanel()}
                    </Col>
                    <Col>
                        <PlayAgenda
                            playerDetails={playerDetails}
                            selectedAgenda={selectedAgenda}
                            onAgendaChange={e => handleAgendaChange(e)}
                            onNextAgenda={() => handleNextAgenda()}
                            onEndAgenda={() => handleEndAgenda()}
                            onAvailableVotesClick={(e, playerString, delta) => handleAvailableVotesClick(e, playerString, delta)}
                            onSpentVotesClick={(e, playerString, delta) => handleSpentVotesClick(e, playerString, delta)}
                            onVoteTargetChange={(e, playerString) => handleVoteTargetChange(e, playerString)}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    let renderGameHeader = (showTurnTimer) => {
        return <GameHeader
            roundNumber={roundNumber}
            totalGameTimer={totalGameTimer}
            showTurnTimer={showTurnTimer}
            currentTurnTimer={currentTurnTimer}
            onTurnTimerClick={() => handleTurnTimerClicked()}
            onGameTimerClick={() => handleGameTimerClicked()}
        />
    }


    let renderObjectivePanel = () => {
        return <ObjectivePanel
            className="objectivePanel"
            objectives={publicObjectives}
            onObjectiveCardClick={(index) => handleObjectiveCardClicked(index)}
        />
    }

    return (
        <div>
            {renderGameComponent()}
            <ObjectiveSelectModal
                showModal={showObjectiveSelectModal}
                objectives={publicObjectives}
                stage={selectedObjective ? selectedObjective.stage : null}
                selectedObjectiveSelection={selectedObjectiveSelection}
                onConfirmModal={() => handleCloseObjectiveSelectModal(true)}
                onCloseModal={() => handleCloseObjectiveSelectModal()}
                onObjectiveChange={e => handleObjectiveChange(e)}
            />
            <TokenAssignModal
                showModal={tokenAssignModalMode !== MODE_NO_ASSIGN}
                title={tokenAssignModalTitle}
                players={playerDetails}
                currentTokenOwnerNumber={currentTokenOwnerNumber}
                selectedTokenOwnerNumber={selectedTokenOwnerNumber}
                onConfirmModal={() => handleCloseTokenAssignModal(true)}
                onCloseModal={() => handleCloseTokenAssignModal()}
                onTokenOwnerChange={e => handleTokenOwnerChange(e)}
            />
        </div>
    );
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
