import React from 'react';

function Greeting(props) { // 組件接收一個 props 物件作為參數
  return (
    <h2>Hello, {props.name}!</h2> 
  );
}

export default Greeting;