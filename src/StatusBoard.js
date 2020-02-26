import React from 'react';
// import TimerBlock from './TimerBlock';


class StatusBoard extends React.Component {
    render() {
        return (
            <div>
                <div>

                </div>
                <span>
                    <button type="button" onClick={() => this.props.onEndTurn()}>
                        End Turn
                    </button>
                    <button type="button" onClick={() => this.props.onToggleTimers()}>
                        {this.props.isGameActive ? "Pause Game" : "Resume Game"}
                    </button>
                    <button type="button" onClick={() => this.props.onEndRound()}>
                        End Round
                    </button>
                </span>
            </div>
        )
    }
}


export default StatusBoard;