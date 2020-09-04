import React from 'react';
import './TimerBlock.css';

const secondsInMinute = 60;
const secondsInHour = 60 * 60;

function Timer(props) {
    return (
        <button className="timer" onClick={props.onClick} disabled={props.disabled}>
            {props.time}
        </button>
    );
}

function TimerBlock(props) {
    const time = parseTime(props.currentSeconds);

    let interactive = props.onClick;

    return (
        <span className="Timer">
            <label className="timerLabel">{props.label}</label>
            <Timer time={time} disabled={props.disabled} onClick={interactive ? () => props.onClick(props.currentSeconds) : null} />
        </span>
    );
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