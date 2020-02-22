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
            label: props.label,
            baseSeconds: props.baseSeconds,
            baseTime: Date.now(),
            currentSeconds: props.currentSeconds,
            isCounting: props.isCounting
        };
    }

    componentDidMount() {
        if (this.state.isCounting) {
            this.startTimer(true);
        } else {
            this.recalculateTime();
        }
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    recalculateTime() {
        const time = this.state.baseSeconds + Math.floor((Date.now() - this.state.baseTime) / 1000);
        this.setState({
            currentSeconds: time
        });
        return time;
    }

    /**
    * Starts the timer count from the current time. baseSeconds should be the time that the timer stopped
    * and so the dynamic count while the timer is on should always start from the time it starts/resumes
    */
    startTimer() {
        this.setState({
            baseTime: Date.now(),
            isCounting: true,
        });
        this.interval = setInterval(() => this.recalculateTime(), 1000);
    }

    /**
    * Stops the timer count. Records the currentSeconds count as the new baseSeconds so that it can resume   * from this time
    */
    stopTimer() {
        //switch off; record current timer count as the new baseSeconds
        this.setState({
            baseSeconds: this.state.currentSeconds,
            isCounting: false,
        });
        clearInterval(this.interval);
    }

    handleClick() {
        if (this.state.isCounting) {
            this.stopTimer();
        } else {
            this.startTimer(false);
        }
    }

    render() {
        const time = parseTime(this.state.currentSeconds);

        return (
            <div className="Timer">
                <label className="timerLabel">{this.state.label}</label>
                <Timer time={time} onClick={() => this.handleClick()} />
            </div>
        );
    }
}

//-------------------------------------------

function parseTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / secondsInHour);
    const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
    const seconds = totalSeconds % secondsInMinute;

    var time = hours > 0 ? hours + ":" : "";
    time += (minutes < 10 ? "0" + minutes : minutes) + ":";
    time += seconds < 10 ? "0" + seconds : seconds;

    return time;
}

//--------------------------------------------

export default TimerBlock;

// ReactDOM.render(
//   <TimerBlock
//     label="Total Time"
//     baseSeconds={5500}
//     currentSeconds={0}
//     isCounting={true}
//   />,
//   document.getElementById("root")
// );