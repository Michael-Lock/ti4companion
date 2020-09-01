import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function TokenAssignModal(props) {
    if (!props.showModal) {
        return null;
    }

    let playerList = [<option key="unselected" value={null} hidden/>];
    for (let i = 0; i < props.players.length; i++) {
        let player = props.players[i];
        if (player.playerNumber !== props.currentTokenOwnerNumber) {
            playerList.push(
                <option key={player.playerNumber} value={player.playerNumber}>
                    {player.playerName + " - " + player.faction.shortName}
                </option>
            );
        }
    }

    let playerSelect = <select id="tokenOwnerCandidates" required onChange={props.onTokenOwnerChange}>
        {playerList}
    </select>


    return (
        <Modal show={props.showModal} onHide={props.onCloseModal} centered>
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column">
                    {playerSelect}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onCloseModal}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={props.onConfirmModal} disabled={!props.selectedTokenOwnerNumber}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
