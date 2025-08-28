import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Notification from './components/Notification';
import RoutesManage from './components/RoutesManage';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <RoutesManage/>
        <Notification/>
      </Provider>
    </div>
  );
}

export default App;
