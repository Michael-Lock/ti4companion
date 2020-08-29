import React from 'react';
import Button from 'react-bootstrap/Button';
import {Row, Col, ButtonGroup} from 'react-bootstrap';

import './PlayAgenda.css';

import agenda_store from './data/agendas.json';

class PlayAgenda extends React.Component {
    handleNextAgenda() {
        if (this.props.onNextAgenda) {
            return () => this.props.onNextAgenda()
        }
    }

    handleEndAgenda() {
        if (this.props.onEndAgenda) {
            return () => this.props.onEndAgenda()
        }
    }


    render() {
        return (
            <div>
                <Row>
                    <AgendaForm
                        selectedAgenda={this.props.selectedAgenda}
                        onAgendaChange={this.props.onAgendaChange}
                        playerDetails={this.props.playerDetails}
                        onAvailableVotesClick={(e, playerString, delta) => this.props.onAvailableVotesClick(e, playerString, delta)}
                        onSpentVotesClick={(e, playerString, delta) => this.props.onSpentVotesClick(e, playerString, delta)}
                        onVoteTargetChange={(e, playerString) => this.props.onVoteTargetChange(e, playerString)}
                    />
                </Row>
                <Row>
                    <Col>
                        <Button type="button" onClick={this.handleNextAgenda()}>
                            Next Agenda
                        </Button>
                    </Col>
                    <Col>
                        <Button type="button" onClick={this.handleEndAgenda()}>
                            End Agenda Phase
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }
}


function AgendaForm(props) {
    let votePanel = props.selectedAgenda ? 
    <VotePanel
        playerDetails={props.playerDetails}
        selectedAgenda={props.selectedAgenda}
        onAvailableVotesClick={(e, playerString, delta) => props.onAvailableVotesClick(e, playerString, delta)}
        onSpentVotesClick={(e, playerString, delta) => props.onSpentVotesClick(e, playerString, delta)}
        onVoteTargetChange={(e, playerString) => props.onVoteTargetChange(e, playerString)}
    />
    : null

    let resultsPanel = props.selectedAgenda ? 
    <ResultsPanel
        playerDetails={props.playerDetails}
    />
    : null

    return (
        <div>
            <Row>
                <AgendaSelector
                    selectedAgenda={props.selectedAgenda}
                    onAgendaChange={props.onAgendaChange}
                />
            </Row>
            <Row>
                {votePanel}
            </Row>
            <Row>
                {resultsPanel}
            </Row>
        </div>
    );
}

class AgendaSelector extends React.Component {
    getAgendaList() {
        let agendaElements = [<option key="unselected" value={null} hidden/>]
        agendaElements = agendaElements.concat(agenda_store.map((agenda) => 
            <option key={agenda.name} value={JSON.stringify(agenda)}>
                {agenda.name}
            </option>));

        let selectedAgenda = this.props.selectedAgenda ? JSON.stringify(this.props.selectedAgenda) : undefined;

        return <select 
            className="agendaName"
            id="agendas" 
            required 
            defaultValue={selectedAgenda} 
            onChange={this.props.onAgendaChange}
        >
            {agendaElements}
        </select>;
    }


    render() {
        return (
            <div className="agendaCard">
                <Row>
                    {this.getAgendaList()}
                </Row>
                <Row>
                    <AgendaCard
                        agenda={this.props.selectedAgenda}
                    />
                </Row>
            </div>
        );
    }
}




function VotePanel(props) {
    const players = props.playerDetails.slice();
    var speakerIndex = 0;
    for (let i = 0; i < players.length; i++) {
        speakerIndex = players[i].isSpeaker ? i : speakerIndex;
    }

    let playerVotePanels = Array(players.length).fill(null);
    for (let i = 0; i < players.length; i++) {
        let destinationIndex = (((i - speakerIndex) % players.length) + players.length) % players.length;
        playerVotePanels[destinationIndex] =
        <PlayerVotePanel
            key={i}
            player={players[i]}
            onAvailableVotesClick={(e, playerString, delta) => props.onAvailableVotesClick(e, playerString, delta)}
            onSpentVotesClick={(e, playerString, delta) => props.onSpentVotesClick(e, playerString, delta)}
            onVoteTargetChange={(e, playerString) => props.onVoteTargetChange(e, playerString)}
        />
    }
        
    return (
        <Col>
            <Row>
                <Col xs={2} xl={1}/>
                <Col xs={4} xl={3}/>
                <Col xs={2} xl={2}>
                    <p className="columnHeader">
                        Available
                    </p>
                </Col>
                <Col xs={2} xl={2}>
                    <p className="columnHeader">
                        Assigned
                    </p>
                </Col>
            </Row>
            {playerVotePanels}
        </Col>
    );
}

function PlayerVotePanel(props) {
        
    
    return (
        <Row>
            <Col xs={2} xl={1}>
                <button 
                    className={`speakerToken ${props.player.isSpeaker ? "" : "invisible"}`}
                />
            </Col>
            <Col xs={4} xl={3}>
                <input
                    key="playerName"
                    type="text"
                    defaultValue={props.player.playerName}
                    disabled
                />
            </Col>
            <Col xs={2} xl={2}>
                <ButtonGroup>
                    <Button 
                        variant="light"
                        key="tens" 
                        className="digitButton tens"
                        onClick={e => props.onAvailableVotesClick(e, JSON.stringify(props.player), 10)}
                        onContextMenu={e => props.onAvailableVotesClick(e, JSON.stringify(props.player), 10)}
                    >
                        {props.player.availableVotes >= 10 ? Math.floor(props.player.availableVotes / 10) : ""}
                    </Button>
                    <Button 
                        variant="light"
                        key="ones" 
                        className="digitButton ones"
                        onClick={e => props.onAvailableVotesClick(e, JSON.stringify(props.player), 1)}
                        onContextMenu={e => props.onAvailableVotesClick(e, JSON.stringify(props.player), 1)}
                    >
                        {props.player.availableVotes % 10}
                    </Button>
                </ButtonGroup>
            </Col>
            <Col xs={2} xl={2}>
                <ButtonGroup>
                    <Button 
                        variant="light"
                        key="tens" 
                        className="digitButton tens"
                        onClick={e => props.onSpentVotesClick(e, JSON.stringify(props.player), 10)}
                        onContextMenu={e => props.onSpentVotesClick(e, JSON.stringify(props.player), 10)}
                    >
                        {props.player.spentVotes >= 10 ? Math.floor(props.player.spentVotes / 10) : ""}
                    </Button>
                    <Button 
                        variant="light"
                        key="ones" 
                        className="digitButton ones"
                        onClick={e => props.onSpentVotesClick(e, JSON.stringify(props.player), 1)}
                        onContextMenu={e => props.onSpentVotesClick(e, JSON.stringify(props.player), 1)}
                    >
                        {props.player.spentVotes % 10}
                    </Button>
                </ButtonGroup>
            </Col>
            <Col>
                <VoteTargetSelector
                    voteTarget={props.player.voteTarget}
                    selectedAgenda={props.selectedAgenda}
                    onVoteTargetChange={e => props.onVoteTargetChange(e, JSON.stringify(props.player))}
                />
            </Col>
        </Row>
    );
}


function AgendaCard(props) {
    let agenda = props.agenda;
    let agendaCardDisplay = <div/>
    if (agenda) {
        agendaCardDisplay = <div className="agendaCardDisplay">
            <p className="agendaType">
                {agenda.type}
            </p>
            <p className="agendaElectionTarget">
                {agenda.electionTarget ? "Elect " + agenda.electionTarget : null}
            </p>
            <p className="agendaEffect">
                <b>
                    {!agenda.electionTarget && "For: "}
                </b>
                {agenda.forEffect}
            </p>
            <p className="agendaEffect">
                <b>
                    {!agenda.electionTarget && "Against: "}
                </b>
                {agenda.electionTarget ? "" : agenda.againstEffect ? agenda.againstEffect : "No effect"}
            </p>
        </div>
    }
    
    return (
        agendaCardDisplay
    );
}

function VoteTargetSelector(props) {
    let voteOptions = [<option key="unselected" value={null}/>]
    voteOptions = voteOptions.concat(
        <option key={"For"} value={"For"}>
            For
        </option>
    );
    voteOptions = voteOptions.concat(
        <option key={"Against"} value={"Against"}>
            Against
        </option>
    );

    return <select 
        className="voteTargetSelector"
        required 
        defaultValue={props.voteTarget} 
        onChange={props.onVoteTargetChange}
    >
        {voteOptions}
    </select>;
}

function ResultsPanel(props) {
    let players = props.playerDetails;
    let resolutions = [];
    for (let i = 0; i < players.length; i++) {
        if (players[i].voteTarget && players[i].spentVotes > 0) {
            let existingResolution = null;
            for (let j = 0; j < resolutions.length; j++) {
                if (resolutions[j].resolution === players[i].voteTarget) {
                    existingResolution = j;
                }
            }
            if (existingResolution >= 0 && resolutions[existingResolution]) {
                resolutions[existingResolution] = {
                    resolution: resolutions[existingResolution].resolution,
                    votes: resolutions[existingResolution].votes + players[i].spentVotes,
                }
            }
            else {
                resolutions.push({
                    resolution: players[i].voteTarget, 
                    votes: players[i].spentVotes,
                })
            }
        }
    }

    let votedResolutions = null;
    if (resolutions.length > 0) {
        votedResolutions = [];
        for (let i = 0; i < resolutions.length; i++) {
            votedResolutions.push(
                <p className="votedResolution" key={i}>
                    {resolutions[i].resolution} - {resolutions[i].votes} votes
                </p>
            ); 
        }
    }

    return (
        <div>
            {votedResolutions}
        </div>
    );
}

export default PlayAgenda;