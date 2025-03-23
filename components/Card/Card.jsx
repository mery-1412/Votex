import React from "react";
import { CButton, CCard, CCardBody, CCardImage, CCardText, CCardTitle } from "@coreui/react";

export const Card = ({ name, desc, imageAdd ,onClick}) => {
  return (
    <CCard className="w-80 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg " style={{ backgroundColor: "#3A2663"}}>
    <CCardImage orientation="top" src={imageAdd} className="rounded-t-lg" />
      <CCardBody className="p-6 min-h-[160px] flex flex-col justify-between">
        <div>
          <CCardTitle style={{ color: "#FFFFFF" }} className="text-xl font-semibold">
           {name}
          </CCardTitle>
          <CCardText style={{ color: "#FFFFFF" }} className="text-sm mt-2">
              {desc}
          </CCardText>
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
