import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import objective_store from './data/objectives.json';

export default function ObjectiveSelectModal(props) {
    if (!props.showModal) {
        return null;
    }

    let selectedObjectives = props.objectives.map((objective) => objective.isRevealed ? objective : null);
    selectedObjectives = selectedObjectives.filter((objective) => objective !== null);

    let availableObjectives = objective_store.filter((objective) => objective.stage === props.stage);
    availableObjectives = availableObjectives.filter(
        (objective) => !selectedObjectives.some(
            function (selectedObjective) {
                return objective.id === selectedObjective.id;
            }
       )
    );

    let objectiveElements = Array(1);
    objectiveElements[0] = <option key="unselected" className="nullOption" value={null} hidden/>
    objectiveElements = objectiveElements.concat(availableObjectives.map(
        (objective) => <option key={objective.id} value={JSON.stringify(objective)}>
            {objective.name}
        </option>));
    
    let objectiveSelect = <select id="objectives" required onChange={props.onObjectiveChange}>
        {objectiveElements}
    </select>;

    return (
        <Modal show={props.showModal} onHide={props.onCloseModal} centered>
            <Modal.Header>
                <Modal.Title>Select Public Objective</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column">
                    {objectiveSelect}
                </div>
                <div className="d-flex flex-column">
                    <br/>
                    <p className="objectiveLongDescription">
                        {props.selectedObjectiveSelection ? props.selectedObjectiveSelection.longDescription : ""}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onCloseModal}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={props.onConfirmModal} disabled={!props.selectedObjectiveSelection}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
