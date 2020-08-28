import React from 'react';
import Button from 'react-bootstrap/Button';
import {Row, Col} from 'react-bootstrap';

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


class AgendaForm extends React.Component {
    render() {
        return (
            <div>
                <Row>
                    <AgendaSelector
                        selectedAgenda={this.props.selectedAgenda}
                        onAgendaChange={this.props.onAgendaChange}
                    />
                </Row>
                <Row>
                    <PlayerVotePanel/>
                </Row>
            </div>
        );
    }
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




class PlayerVotePanel extends React.Component {
    render() {
        return (
            <div>

            </div>
        );
    }
}


function AgendaCard(props) {
    let agenda = props.agenda;
    console.log(agenda);
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

export default PlayAgenda;