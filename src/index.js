import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider } from "@mui/material/styles";

import App from './App';

import './App.css';
import * as serviceWorker from './serviceWorker';
import reportWebVitals from './reportWebVitals';
import 'react-notifications-component/dist/theme.css'
// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(

    <BrowserRouter>
        {/* <StyledEngineProvider injectFirst> */}
            <App />
        {/* </StyledEngineProvider> */}
    </BrowserRouter>
);

// If you want to enable client cache, register instead.
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
