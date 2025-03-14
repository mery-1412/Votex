import React , {useContext} from 'react'
import RequireAdmin from '../protectingRoutes/RequireAdmin'
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '@/components/NavBar/AdminNavBar';

const Dashboard = () => {
    const {  logout } = useContext(AuthContext);
  return (
    <RequireAdmin>
<div className="dashboard-page">
        <AdminSidebar/>
  </div>  
    </RequireAdmin>
    
  )
}

export default Dashboard