import logo from './logo.webp';
import XTerminal from './components/Terminal';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Шалость удалась) */}
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <main>
       <div>
        <XTerminal />
       </div>
      </main>

      
    </div>
  );
}

export default App;
