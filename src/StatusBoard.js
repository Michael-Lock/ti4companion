import React from 'react';
import TimerBlock from './TimerBlock';
// import './PlayerSelect.css';


class StatusBoard extends React.Component {
    handleEndRound() {
        if (this.props.onEndRound) {
            return () => this.props.onEndRound()
        }
    }

    render() {
        return (
            <div>
                <div>
                    <label className="timerLabel">{"Round: " + this.props.roundNumber}</label>
                    <TimerBlock id="turnTimer" label="Turn Time" baseSeconds={0} currentSeconds={0} isCounting={true}/>
                    <TimerBlock id="turnTimer" label="Total Game Time" baseSeconds={0} currentSeconds={0} isCounting={true}/>
                </div>
                <div>
                    <button type="button" onClick={this.handleEndRound()}>
                        End Round
                    </button>
                </div>
            </div>
        )
    }
}


export default StatusBoard;