// 1. 建立組件 (通常在一個獨立的 .js 檔案中，例如: MyComponent.js)
function MyComponent() {
  return (
    <div>
      <h2>這是一個我的 React 組件</h2>
      <p>我負責顯示這段文字。</p>
    </div>
  );
}

// 2. 導出組件 (讓其他檔案可以引入並使用)
export default MyComponent;