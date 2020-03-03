import React from 'react';
import Button from 'react-bootstrap/Button';

import './PlayerSelect.css';

import faction_store from './data/factions.json';

const PLAYER_NUMBER_INDEX_OFFSET = 3; //player 3 is array index 0
const MAX_PLAYER_NUMBER = 6;

// const FACTIONS = [
//     {fullName: "Arborec", shortName: "Arborec"},
//     {fullName: "Barony of Letnev", shortName: "Letnev"},
//     {fullName: "Clan of Saar", shortName: "Saar"},
//     {fullName: "Embers of Muaat", shortName: "Muaat"},
//     {fullName: "Emirates of Hacan", shortName: "Hacan"},
//     {fullName: "Federation of Sol", shortName: "Sol"},
//     {fullName: "Ghosts of Creuss", shortName: "Creuss"},
//     {fullName: "L1Z1X Mindnet", shortName: "L1Z1X"},
//     {fullName: "Mentak Coalition", shortName: "Mentak"},
//     {fullName: "Naalu Collective", shortName: "Naalu"},
//     {fullName: "Nekro Virus", shortName: "Nekro"},
//     {fullName: "Sardakk N’orr", shortName: "N'orr"},
//     {fullName: "Universities of Jol-Nar", shortName: "Jol-Nar"},
//     {fullName: "Winnu", shortName: "Winnu"},
//     {fullName: "Xxcha Kingdom", shortName: "Xxcha"},
//     {fullName: "Yin Brotherhood", shortName: "Yin"},
//     {fullName: "Yssaril Tribes", shortName: "Yssaril"},    
// ]

const COLOURS = [
    {description: null, colour: null},
    {description: "Red", colour: "red"},
    {description: "Blue", colour: "blue"},
    {description: "Green", colour: "green"},
    {description: "Yellow", colour: "yellow"},
    {description: "Purple", colour: "purple"},
    {description: "Black", colour: "black"},
]

class PlayerSelect extends React.Component {
    constructor(props) {
        super(props);

        let playerDetails = Array(MAX_PLAYER_NUMBER);
        for (let i = 0; i < MAX_PLAYER_NUMBER; i++) {
            playerDetails[i] = this.createPlayer(i);
        }

        this.state = {
            selectedNumberOfPlayers: null,
            playerDetails: playerDetails,
        };
    }

    createPlayer(playerNumber) {
        var playerDetail = {
            playerName: "Player " + (playerNumber + 1),
            playerNumber: playerNumber,
            faction: null,
            colour: null,
            victoryPoints: 0,
            isSpeaker: playerNumber === 0 ? true : false,
            isActivePlayer: playerNumber === 0 ? true : false,
            isPassed: false,
        }
        return playerDetail;
    }

    playerNumberButtonHandleClick(playerNumber) {
        //if the existing option is selected, deselect it
        let deselected = this.state.selectedNumberOfPlayers === playerNumber

        this.setState({
            selectedNumberOfPlayers: deselected ? null : playerNumber,
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
        if (this.props.onStartGame) {
            let finalPlayerDetails = this.state.playerDetails.slice(0, this.state.selectedNumberOfPlayers)

            return () => this.props.onStartGame(finalPlayerDetails)
        }
    }

    render() {
        const playerNumberSelections = this.determineSelection();

        return (
            <div>
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
                    <Button type="button" onClick={this.handleStartGame()}>
                        Start Game
                    </Button>
                </form>
            </div>
        )
    }
}


class PlayerNumberSelect extends React.Component {
    renderPlayerNumberButton(playerNumber) {
        const isSelected = this.props.playerNumberSelections[playerNumber - PLAYER_NUMBER_INDEX_OFFSET];

        return (<PlayerNumberButton
            value={playerNumber}
            selected={isSelected}
            onClick={() => this.props.onClick(playerNumber)}
        />);
    }

    render() {
        return (
            <div>
                { this.renderPlayerNumberButton(3) }
                { this.renderPlayerNumberButton(4) }
                { this.renderPlayerNumberButton(5) }
                { this.renderPlayerNumberButton(6) }
            </div>
        );
    }
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


class PlayerDetailForm extends React.Component {
    renderPlayerDetailEntries() {
        let playerDetailEntries = Array(this.props.numberOfPlayers);
        for (let i = 0; i < this.props.numberOfPlayers; i++) {
            playerDetailEntries[i] = <PlayerDetailEntry 
                key={i}
                playerDetail={this.props.playerDetails[i]}
                onPlayerNameChange={e => this.props.onPlayerNameChange(e, i)}
                onFactionChange={e => this.props.onPlayerFactionChange(e, i)}
                onColourChange={e => this.props.onPlayerColourChange(e, i)}
            />;
        }

        return (<div>
            {playerDetailEntries}
        </div>);
    }

    render() {
        return (
            <div>
                {this.renderPlayerDetailEntries()}
            </div>
        );
    }
}


class PlayerDetailEntry extends React.Component {
    //TODO: could have a list of unselected factions passed down to prevent duplicates
    //TODO: work out a better way of recording all the faction details (enum equivalent?)
    getFactionList() {
        let factionElements = Array(1);
        factionElements[0] = <option key="unselected" value={null} hidden/>
        
        factionElements = factionElements.concat(faction_store.map((faction) => 
            <option key={faction.shortName} value={JSON.stringify(faction)}>
                {faction.fullName}
            </option>));

        //TODO: consider a datalist instead. Allows type-ahead but clearing is clunky
        return <select 
            id="factions" 
            required 
            defaultValue={this.props.playerDetail.faction}
            onChange={this.props.onFactionChange}
        >
            {factionElements}
        </select>;
    }

    getColourList() {
        let colourElements = COLOURS.map((colour) => 
        <option key={colour.description} value={JSON.stringify(colour)}>
            {colour.description}
        </option>);

        let playerColour = this.props.playerDetail.colour ? this.props.playerDetail.colour.colour : null;

        return <select 
            id="colours" 
            required 
            defaultValue={playerColour} 
            onChange={this.props.onColourChange}
        >
            {colourElements}
        </select>;
    }

    render() {
        return (
            <div>
                <input 
                    type="text"
                    defaultValue={this.props.playerDetail.playerName} 
                    onChange={this.props.onPlayerNameChange}
                />
                {this.getFactionList()}
                {this.getColourList()}
            </div>
        );
    }
}

export default PlayerSelect;