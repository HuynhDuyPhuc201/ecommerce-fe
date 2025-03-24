import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            {/* <Provider store={store}> */}
            <App />
            {/* <ReactQueryDevtools initialIsOpen={false} />  */}
            {/* </Provider> */}
        </QueryClientProvider>
    </BrowserRouter>,
    // </React.StrictMode>
);
