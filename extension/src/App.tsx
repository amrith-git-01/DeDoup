import { Provider} from 'react-redux'
import { BrowserRouter} from 'react-router-dom'
import {store} from './store/store'
import {AppRoutes} from './components/AppRoutes'

function App(){
  return (
    <Provider store = {store}>
      <BrowserRouter>
      <div className = 'w-full min-h-screen bg-gray-50'>
        <AppRoutes />
      </div>
      </BrowserRouter>
    </Provider>
  )
}
export default App;