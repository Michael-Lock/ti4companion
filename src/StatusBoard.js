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
                    <TimerBlock 
                        id="turnTimer" 
                        label="Turn Time" 
                        baseSeconds={this.props.currentTurnTimer.baseSeconds} 
                        isCounting={this.props.currentTurnTimer.isCounting}
                        onClick={(time) => this.props.onTurnTimerClick(time)}
                    />
                    <TimerBlock 
                        id="turnTimer" 
                        label="Total Game Time" 
                        baseSeconds={this.props.totalGameTimer.baseSeconds} 
                        isCounting={this.props.totalGameTimer.isCounting}
                        onClick={(time) => this.props.onGameTimerClick(time)}
                    />
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