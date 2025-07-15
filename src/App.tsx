import './App.css'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import AadhaarOCR from './components/aadhaarOCR'
import ViewAllOcr from './components/viewAllOcrs'
import { Toaster } from 'sonner'

function App() {

  return (
    <>
    <Toaster richColors position="top-right" />
     <Router>
      <Routes>
        <Route path="/"element={<AadhaarOCR/>}/>
       <Route path='/ocr' element={<ViewAllOcr/>}/>
      </Routes>
     </Router>
    </>
  )
}

export default App
