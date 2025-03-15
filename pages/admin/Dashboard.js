import React , {useContext} from 'react'
import RequireAdmin from '../protectingRoutes/RequireAdmin'
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
    const {  logout } = useContext(AuthContext);
  return (
    <RequireAdmin>
        <div><h1>DASHBOARD</h1></div>
        <button className='gradient-border-button' onClick={logout}>Log out</button>
    </RequireAdmin>
    
  )
}

export default Dashboard