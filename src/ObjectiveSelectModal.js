import React from 'react';
import ReactModal from 'react-modal';
import Button from 'react-bootstrap/Button'

import objective_store from './data/objectives.json';

export function ObjectiveSelectModal(props) {
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
    objectiveElements[0] = 
        <option key="unselected" className="nullOption" value={null} hidden>
            {"Select..."}
        </option>;
    objectiveElements = objectiveElements.concat(availableObjectives.map(
        (objective) => <option key={objective.id} value={JSON.stringify(objective)}>
            {objective.name}
        </option>));
    
    let objectiveSelect = <select id="objectives" required onChange={props.onObjectiveChange}>
        {objectiveElements}
    </select>;

    return (
        <div>
            <ReactModal 
                isOpen={props.showModal} 
                contentLabel="Select Public Objective" 
                onRequestClose={props.onCloseModal} 
                className="Modal" 
                overlayClassName="Overlay"
            >
                <div>
                    <p>Select Public Objective</p>
                    {objectiveSelect}
                </div>
                <div>
                    <p className="objectiveLongDescription">
                        {props.selectedObjectiveSelection ? props.selectedObjectiveSelection.longDescription : ""}
                    </p>
                </div>
                <div>
                    <Button onClick={props.onConfirmModal} disabled={!props.selectedObjectiveSelection}>Confirm</Button>
                    <Button variant="Secondary" onClick={props.onCloseModal}>Cancel</Button>
                </div>
            </ReactModal>
        </div>
    );
}
