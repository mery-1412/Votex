import React, { useEffect, useState } from 'react'

const HomeUser = ({userId}) => {
  return (
    <div>USER ID{userId}</div>
  )
}

export async function getServerSideProps({ req }) {
    const token = req.cookies?.token;           
    console.log("cookies", req.cookies);

    if (!token) {
        return { redirect: { destination: "/login", permanent: false } };
    }

    try {
        const res = await fetch("http://localhost:5000/api/test-users/getUser", { 
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                Cookie: `token=${token}` ,

            },
            credentials: "include", 
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const user = await res.json();
        console.log("user", user);

        return { props: { userId: user.idNumber } };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { redirect: { destination: "/login", permanent: false } };
    }
}

export default HomeUser


