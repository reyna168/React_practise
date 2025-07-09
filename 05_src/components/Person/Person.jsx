import React from "react";
import "./person.css";

export default class Person extends React.Component {
  state = {
    person: [{ name: "Bill", age: "29" }],
    isBill: true, // 用于跟踪当前显示的人物
  };

  switchNameHandler = () => {
    this.setState((prevState) => ({
      person: [
        {
          name: prevState.isBill ? "Alex" : "Bill",
          age: prevState.isBill ? "25" : "29",
        },
      ],
      isBill: !prevState.isBill, // 切换标志
    }));
  };

  render() {
    const { person } = this.state;
    return (
      <div className="person">
        <h1>{person[0].name}</h1>
        <p>你的年龄: {person[0].age}</p>
        <button onClick={this.switchNameHandler}>切换姓名</button>
      </div>
    );
  }
}