import React from 'react';
import Button from 'react-bootstrap/Button';
import {Row, Col} from 'react-bootstrap';

import './PlayerSelect.css';

import faction_store from './data/factions.json';
import tech_store from './data/technologies.json';
import properties from './data/properties.json';
import colour_store from './data/colours.json';

const PLAYER_NUMBER_INDEX_OFFSET = 3; //player 3 is array index 0
//TODO: this should instead come from a user controlled setting, not a properties file
const MAX_PLAYER_NUMBER = properties.enableProphecyOfKings ? 8 : 6;

class PlayerSelect extends React.Component {
    constructor(props) {
        super(props);

        let playerDetails = Array(MAX_PLAYER_NUMBER);
        for (let i = 0; i < MAX_PLAYER_NUMBER; i++) {
            playerDetails[i] = this.createPlayer(i);
        }

        this.state = {
            selectedNumberOfPlayers: MAX_PLAYER_NUMBER,
            playerDetails: playerDetails,
        };
    }

    createPlayer(playerNumber) {
        let playerDetail = {
            playerName: "Player " + (playerNumber + 1),
            playerNumber: playerNumber,
            faction: properties.testMode ? faction_store[playerNumber] : null,
            colour: properties.testMode ? colour_store[playerNumber] : null,
            strategies: [],
            victoryPoints: 0,
            isSpeaker: playerNumber === 0 ? true : false,
            isActivePlayer: playerNumber === 0 ? true : false,
            isPassed: false,
            isNaaluTelepathic: false,
            availableVotes: 0,
            spentVotes: 0,
        }
        return playerDetail;
    }

    playerNumberButtonHandleClick(playerNumber) {
        this.setState({
            selectedNumberOfPlayers: playerNumber,
        });
    }

    determineSelection() {
        let playerNumberSelections = Array(MAX_PLAYER_NUMBER).fill(false);
        if (this.state.selectedNumberOfPlayers !== null) {
            playerNumberSelections[this.state.selectedNumberOfPlayers - PLAYER_NUMBER_INDEX_OFFSET] = true;
        }

        return playerNumberSelections;
    }

    handlePlayerNameChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        playerDetails[playerNumber].playerName = e.target.value;
        this.setState ({
            playerDetails: playerDetails,
        });
    }

    handlePlayerFactionChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        playerDetails[playerNumber].faction = JSON.parse(e.target.value);
        this.setState ({
            playerDetails: playerDetails,
        });
    }
    
    handlePlayerColourChange(e, playerNumber) {
        let playerDetails = this.state.playerDetails.slice();
        playerDetails[playerNumber].colour = JSON.parse(e.target.value);
        this.setState ({
            playerDetails: playerDetails,
        });
    }

    handleStartGame() {
        let finalPlayerDetails = this.state.playerDetails.slice(0, this.state.selectedNumberOfPlayers)
        finalPlayerDetails = this.initialiseTechnologies(finalPlayerDetails);

        return this.props.onStartGame(finalPlayerDetails);
    }

    initialiseTechnologies(finalPlayerDetails) {
        let playerDetails = finalPlayerDetails.map((player) => {
            let newPlayer = {...player};
            let techSets = [];
            techSets.push(this.createPlayerTechnologies(tech_store.Biotic));
            techSets.push(this.createPlayerTechnologies(tech_store.Warfare));
            techSets.push(this.createPlayerTechnologies(tech_store.Propulsion));
            techSets.push(this.createPlayerTechnologies(tech_store.Cybernetic));
            techSets.push(this.createPlayerTechnologies(tech_store[newPlayer.faction.shortName]));
            techSets.push(this.createPlayerTechnologies(tech_store.Ship));
            techSets.push(this.createPlayerTechnologies(tech_store.Unit));
            techSets.push(this.createPlayerTechnologies(tech_store.Warsun));
            newPlayer.techs = techSets;
            return newPlayer;
        });

        return playerDetails;
    }

    createPlayerTechnologies(techSet) {
        let playerTechs = techSet.map((techDefinition) => {
            return {
                techDefinition: techDefinition,
                isResearched: false,
            };
        });

        return playerTechs;
    }

    isGameReady() {
        if (!this.state.selectedNumberOfPlayers) {
            return true;
        }
        
        let selectedFactions = [];
        let selectedColours = [];
        let selectedNames = [];
        for (let i = 0; i < this.state.selectedNumberOfPlayers; i++) {
            let player = this.state.playerDetails[i];
            if (!player.faction || !player.colour || !player.playerName ||
                    selectedColours.includes(player.colour.description) ||
                    selectedFactions.includes(player.faction.shortName) || 
                    selectedNames.includes(player.playerName)) {
                return true;
            }
            selectedFactions[i] = player.faction.shortName;
            selectedColours[i] = player.colour.description;
            selectedNames[i] = player.playerName;
        }


        return false;
    }

    render() {
        const playerNumberSelections = this.determineSelection();

        return (
            <Row>
                <Col xs={12} xl={{span: 8, offset: 2}}> 
                    <div>
                        <h1>Number of Players</h1>
                        <PlayerNumberSelect 
                            playerNumberSelections={playerNumberSelections}
                            onClick={playerNumber => this.playerNumberButtonHandleClick(playerNumber)}
                        />
                    </div>
                    <form>
                        <PlayerDetailForm 
                            numberOfPlayers={this.state.selectedNumberOfPlayers} 
                            playerDetails={this.state.playerDetails}
                            onPlayerNameChange={(e, playerNumber) => this.handlePlayerNameChange(e, playerNumber)}
                            onPlayerFactionChange={(e, playerNumber) => this.handlePlayerFactionChange(e, playerNumber)}
                            onPlayerColourChange={(e, playerNumber) => this.handlePlayerColourChange(e, playerNumber)}
                        />
                        <Button type="button" disabled= {this.isGameReady()} onClick={() => this.handleStartGame()}>
                            Start Game
                        </Button>
                    </form>
                </Col>
            </Row>
        )
    }
}


function PlayerNumberSelect(props) {
    let playerNumberButtons = Array(MAX_PLAYER_NUMBER - PLAYER_NUMBER_INDEX_OFFSET + 1);
    for (let i = 0; i < playerNumberButtons.length; i++) {
        let isSelected = props.playerNumberSelections[i];
        playerNumberButtons[i] = generatePlayerNumberButton(i + PLAYER_NUMBER_INDEX_OFFSET, isSelected, props.onClick);
    }

    return (
        <Row>
            {playerNumberButtons}
        </Row>
    );
}

function generatePlayerNumberButton(playerNumber, isSelected, onClick) {
    return (
        <PlayerNumberButton
            key={playerNumber} 
            value={playerNumber}
            selected={isSelected}
            onClick={() => onClick(playerNumber)}
        />
    );
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


function PlayerDetailForm(props) {
    let playerDetailEntries = Array(props.numberOfPlayers);
    for (let i = 0; i < props.numberOfPlayers; i++) {
        playerDetailEntries[i] = <PlayerDetailEntry 
            key={i}
            playerDetail={props.playerDetails[i]}
            onPlayerNameChange={e => props.onPlayerNameChange(e, i)}
            onFactionChange={e => props.onPlayerFactionChange(e, i)}
            onColourChange={e => props.onPlayerColourChange(e, i)}
        />;
    }

    return (
        <div>
            {playerDetailEntries}
        </div>
    );
}


function PlayerDetailEntry(props) {
    let factionElements = [<option key="unselected" value={null} hidden/>]
    factionElements = factionElements.concat(faction_store.map((faction) => 
        <option key={faction.shortName} value={JSON.stringify(faction)}>
            {faction.fullName}
        </option>));

    let playerFaction = props.playerDetail.faction ? JSON.stringify(props.playerDetail.faction) : undefined;

    let factionList = 
        <select 
            id="factions" 
            required 
            value={playerFaction}
            onChange={props.onFactionChange}
        >
            {factionElements}
        </select>;

    let colourElements = [<option key="unselected" value={null} hidden/>]
    colourElements = colourElements.concat(colour_store.map((colour) => {
        //TODO: this should instead come from a user controlled setting, not a properties file
        if (properties.enableProphecyOfKings || !colour.expansionPok) { 
            return (
                <option key={colour.description} value={JSON.stringify(colour)}>
                    {colour.description}
                </option>
            )
        }
        return null;
    }));

    let playerColour = props.playerDetail.colour ? JSON.stringify(props.playerDetail.colour) : undefined;

    let colourList =
        <select 
            id="colours" 
            required 
            defaultValue={playerColour} 
            onChange={props.onColourChange}
        >
            {colourElements}
        </select>;

    return (
        <Row>
            <Col xs={{span: 2, offset: 0}} xl={{span: 1, offset: 1}}>
                <button className={`speakerToken ${props.playerDetail.isSpeaker ? "" : "invisible"} disabled`}/>
            </Col>
            <Col xs={4}>
                <input 
                    type="text"
                    defaultValue={props.playerDetail.playerName} 
                    onChange={props.onPlayerNameChange}
                />
            </Col>
            <Col xs={4}>
                {factionList}
            </Col>
            <Col xs={2}>
                {colourList}
            </Col>
        </Row>
    );
}

export default PlayerSelect;