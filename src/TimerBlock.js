import React from 'react';
import './TimerBlock.css';

const secondsInMinute = 60;
const secondsInHour = 60 * 60;

function Timer(props) {
    return (
        <button className="timer" onClick={props.onClick}>
            {props.time}
        </button>
    );
}

class TimerBlock extends React.Component {
    render() {
        const time = parseTime(this.props.currentSeconds);

        return (
            <span className="Timer">
                <label className="timerLabel">{this.props.label}</label>
                <Timer time={time} onClick={() => this.props.onClick(this.props.currentSeconds)} />
            </span>
        );
    }
}

//-------------------------------------------

function parseTime(totalSeconds) {
    if (!totalSeconds) {
        return "00:00";
    }

    const hours = Math.floor(totalSeconds / secondsInHour);
    const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
    const seconds = totalSeconds % secondsInMinute;

    var time = hours > 0 ? hours + ":" : "";
    time += (minutes < 10 ? "0" + minutes : minutes) + ":";
    time += seconds < 10 ? "0" + seconds : seconds;

    return time;
}

export default TimerBlock;