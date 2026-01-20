import { Provider} from 'react-redux'
import { HashRouter} from 'react-router-dom'
import {store} from './store/store'
import {AppRoutes} from './components/AppRoutes'

function App(){
  return (
    <Provider store = {store}>
      <HashRouter>
      <div className = 'w-full min-h-screen bg-gray-50'>
        <AppRoutes />
      </div>
      </HashRouter>
    </Provider>
  )
}
export default App;