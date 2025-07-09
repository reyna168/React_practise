import { useState } from 'react';
import "./styles.css";

import PersonOne from "./components/PersonOne";
import PersonTwo from "./components/PersonTwo";
import PersonThree from "./components/PersonThree";

// import "./style.css";

function App() {
  // 宣告一個 state（狀態變數）：count
    return(<div className="App">
      <h2>建立第一個 Function Component</h2>
      <PersonOne />
      <h2>建立一個可傳入自定義參數的 Function Component</h2>
      <PersonTwo name="Mark" age="27" />
      <h2>建立一個可傳入自定義參數的 Class-based Component</h2>
      <PersonThree name="Terry" age="17" />
    </div>
  );
}

export default App;
