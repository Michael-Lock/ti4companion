import React from 'react';
import {Row, Col} from 'react-bootstrap'

import './TechPanel.css';


export default function TechPanel(props) {
    let techSetGroups = [];
    for (let i = 0; i < props.techs.length; i++) {
        techSetGroups[i] = <TechSetGroup 
            key={i} 
            techSet={props.techs[i]} 
            className="techSetGroup" 
            onTechClick={(techDefinition) => props.onTechClick(techDefinition)} 
        />;
    }

    return (
        techSetGroups
    );
}


function TechSetGroup(props) {
    let techButtons = [];
    for (let i = 0; i < props.techSet.length; i++) {
        let span = 12 / props.techSet.length;
        techButtons[i] = 
            <Col key={i} xs={span}>
                <TechButton 
                    key={props.techSet[i].techDefinition.name} 
                    tech={props.techSet[i]} 
                    onTechClick={() => props.onTechClick(props.techSet[i].techDefinition)} 
                />
            </Col>
    }

    return (
        <Row>
            {techButtons}
        </Row>
    );
}


function TechButton(props) {
    return (
        <button 
            className={`rounded techButton ${props.tech.techDefinition.type} ${props.tech.isResearched ? "researched" : ""} `}
            onClick={props.onTechClick}
        >
            {props.tech.techDefinition.text}
        </button> 
    );
}
