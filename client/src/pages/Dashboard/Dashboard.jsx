import { Outlet } from "react-router-dom"
import Sidebar from "../../components/Sidebar/Sidebar"
import './dashboard.less'

const Dashboard = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            <Outlet />
        </div>
    )
}

export default Dashboard