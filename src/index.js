import React from 'react';
import ReactDOM from 'react-dom';
import GameManager from './GameManager';
import * as serviceWorker from './serviceWorker';

// import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.scss';

// ReactDOM.render(
//     <TimerBlock label="Total Time" baseSeconds={5500} currentSeconds={0} isCounting={true}/>,
//     document.getElementById("root")
//   );

ReactDOM.render(
    <GameManager/>,
    document.getElementById("root")
  );


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

