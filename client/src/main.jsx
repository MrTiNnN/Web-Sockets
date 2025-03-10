import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.less'
import './globalStyling/variables.less'
import './globalStyling/components.less'
import './globalStyling/queries.less'

createRoot(document.getElementById('root')).render(
    <App />,
)
