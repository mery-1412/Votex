import React, { useEffect, useState ,useContext} from 'react'
import RequireAuth from './protectingRoutes/RequireAuth';
import { AuthContext } from "./context/AuthContext";

const HomeUser = ({userId}) => {
     const {  logout } = useContext(AuthContext);
  return (
    <RequireAuth>
        <div>USER ID{userId}</div>
        <button className='gradient-border-button' onClick={logout}>Log out</button>

    </RequireAuth>
    
  )
}

export async function getServerSideProps({ req }) {
    const sessionId = req.cookies?.sessionId; 

    if (!sessionId) {
        return { redirect: { destination: "/login", permanent: false } };
    }

    try {
        const res = await fetch("http://localhost:5000/api/test-users/getUser", {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": `sessionId=${sessionId}` 
            },
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const user = await res.json();
        return { props: { userId: user.idNumber } };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { redirect: { destination: "/login", permanent: false } };
    }
}


export default HomeUser


