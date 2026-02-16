import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-white">
            <Sidebar />
            <main className="ml-64 p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
