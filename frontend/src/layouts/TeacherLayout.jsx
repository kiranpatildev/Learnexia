import { Outlet } from 'react-router-dom';
import { TeacherSidebar } from '../components/teacher/TeacherSidebar';

export function TeacherLayout() {
    return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
            {/* Fixed Sidebar - 240px width */}
            <TeacherSidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-[240px]">
                <div className="p-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
