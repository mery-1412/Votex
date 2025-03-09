import React, { useEffect, useState } from 'react'

const HomeUser = ({userId}) => {
  return (
    <div>USER ID{userId}</div>
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


