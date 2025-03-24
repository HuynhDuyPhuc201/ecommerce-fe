import { useRoutes } from 'react-router-dom';
import routers from './router';
import { Spin } from 'antd';
import { Suspense } from 'react';

function App() {
    const element = useRoutes(routers);

    return (
        <>
            <Suspense
                fallback={
                    <div className="flex justify-center items-center h-screen">
                        <Spin />
                    </div>
                }
            >
                {element}
            </Suspense>
        </>
    );
}

export default App;
