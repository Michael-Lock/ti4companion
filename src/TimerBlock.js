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
    constructor(props) {
        super(props);
        this.state = {
            baseTime: Date.now(),
            currentSeconds: props.baseSeconds,
        };
    }

    componentDidMount() {
        if (this.props.isCounting) {
            this.startTimer(true);
        } else {
            this.recalculateTime();
        }
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    componentDidUpdate(prevProps) {
        if (this.props.isCounting !== prevProps.isCounting) {
            if (this.props.isCounting) {
                this.startTimer();
            } 
            else {
                clearInterval(this.interval);
            }
        }
    }

    recalculateTime() {
        const time = this.props.baseSeconds + Math.floor((Date.now() - this.state.baseTime) / 1000);
        this.setState({
            currentSeconds: time
        });
        return time;
    }

    startTimer() {
        this.setState({
            baseTime: Date.now(),
        });
        this.interval = setInterval(() => this.recalculateTime(), 1000);
    }

    render() {
        const time = parseTime(this.state.currentSeconds);

        return (
            <span className="Timer">
                <label className="timerLabel">{this.props.label}</label>
                <Timer time={time} onClick={() => this.props.onClick(this.state.currentSeconds)} />
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