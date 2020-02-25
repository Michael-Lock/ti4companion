import React from 'react';
// import TimerBlock from './TimerBlock';


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