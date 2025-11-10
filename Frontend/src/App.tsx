import { BrowserRouter } from 'react-router-dom'
import Home from './pages/home'

function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen">
        <Home />
      </div>
    </BrowserRouter>
  )
}

export default App