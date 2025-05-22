import React from "react";
import { CButton, CCard, CCardBody, CCardImage, CCardText, CCardTitle } from "@coreui/react";

export const Card = ({ name, desc, imageAdd, onClick, age, voteCount }) => {
  return (
    <CCard 
      className="w-80 h-[600px] shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg overflow-hidden" 
      style={{ backgroundColor: "#3A2663" }}
    >
      <div className="h-96 overflow-hidden">
        <CCardImage 
          orientation="top" 
          src={imageAdd} 
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      
      <CCardBody className="p-6 flex flex-col justify-between h-[calc(500px-18rem)]">
        <div>
          <CCardTitle style={{ color: "#FFFFFF" }} className="text-xl font-semibold">
            {name}
          </CCardTitle>
          <CCardText 
            style={{ color: "#FFFFFF" }} 
            className="text-sm mt-2 line-clamp-3" 
          >
            {desc}
          </CCardText>
          {age && (
            <CCardText style={{ color: "#FFFFFF" }} className="text-sm mt-2">
              Age: {age}
            </CCardText>
          )}
          {voteCount && (
            <CCardText style={{ color: "#FFFFFF" }} className="text-sm mt-2">
              Votes: {voteCount}
            </CCardText>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <CButton onClick={onClick} className="gradient-border-button">
            See More
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};