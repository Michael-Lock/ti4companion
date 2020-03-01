import React from 'react';

export function ObjectivePanel(props) {
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
        />;
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
