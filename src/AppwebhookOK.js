import { useState, useEffect, useContext, createContext, useRef, useReducer, useMemo, useCallback, useLayoutEffect, forwardRef, useImperativeHandle, memo } from "react";

// ---------- useContext ----------
const ThemeContext = createContext("light");
function ThemeDisplay() {
  const theme = useContext(ThemeContext);
  return <p className="mb-4">目前主題：{theme}</p>;
}

// ---------- useState ----------
function StateCounter() {
  const [count, setCount] = useState(0);
  return (
    <div className="mb-4">
      <p>useState 計數：{count}</p>
      <button onClick={() => setCount(count + 1)}>加一</button>
    </div>
  );
}

// ---------- useEffect ----------
function EffectTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p className="mb-4">useEffect 計時：{seconds} 秒</p>;
}

// ---------- useRef ----------
function RefInput() {
  const inputRef = useRef(null);
  return (
    <div className="mb-4">
      <input ref={inputRef} placeholder="點按鈕聚焦" />
      <button onClick={() => inputRef.current.focus()}>聚焦輸入</button>
    </div>
  );
}

// ---------- useReducer ----------
function reducer(state, action) {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    default: return state;
  }
}
function ReducerCounter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <div className="mb-4">
      <p>useReducer：{state.count}</p>
      <button onClick={() => dispatch({ type: "inc" })}>+1</button>
      <button onClick={() => dispatch({ type: "dec" })}>-1</button>
    </div>
  );
}

// ---------- useMemo ----------
function ExpensiveCalc({ num }) {
  const result = useMemo(() => {
    console.log("計算中...");
    return num * 1000;
  }, [num]);
  return <p>useMemo 結果：{result}</p>;
}

// ---------- useCallback ----------
const Child = memo(({ onClick }) => {
  console.log("Child 渲染");
  return <button onClick={onClick}>useCallback 按我</button>;
});
function CallbackDemo() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    console.log("子元件點擊");
  }, []);
  return (
    <div className="mb-4">
      <p>父元件：{count}</p>
      <button onClick={() => setCount(count + 1)}>父加一</button>
      <Child onClick={handleClick} />
    </div>
  );
}

// ---------- useLayoutEffect ----------
function LayoutEffectBox() {
  const boxRef = useRef();
  useLayoutEffect(() => {
    boxRef.current.style.backgroundColor = "lightblue";
  }, []);
  return <div ref={boxRef} className="mb-4 p-2 border">useLayoutEffect Box</div>;
}

// ---------- useImperativeHandle ----------
const MyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
  }));
  return <input ref={inputRef} placeholder="子元件 input" />;
});
function ImperativeDemo() {
  const inputRef = useRef();
  return (
    <div className="mb-4">
      <MyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>聚焦子元件</button>
    </div>
  );
}

// ---------- App 整合 ----------
export default function App() {
  const [number, setNumber] = useState(1);

  return (
    <ThemeContext.Provider value="dark">
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">🔧 React Hook 示範整合</h1>
        <ThemeDisplay />
        <StateCounter />
        <EffectTimer />
        <RefInput />
        <ReducerCounter />
        <div>
          <input
            type="number"
            value={number}
            onChange={e => setNumber(Number(e.target.value))}
          />
          <ExpensiveCalc num={number} />
        </div>
        <CallbackDemo />
        <LayoutEffectBox />
        <ImperativeDemo />
      </div>
    </ThemeContext.Provider>
  );
}
