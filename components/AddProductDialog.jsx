"use client";

import { Button, Modal, TextInput, Label } from "flowbite-react";
import { useState } from "react";

export function AddProductDialog() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <button className="gradient-border-button-black" onClick={() => setOpenModal(true)}>Add Candidate</button>

{/* Modal with Glassmorphism Effect */}
 <Modal
  show={openModal}
  onClose={() => setOpenModal(false)}
  size="xl"
>
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg">
    {/* Modal Content */}
    <div className="bg-[#3A2663] backdrop-blur-2xl p-8 rounded-lg shadow-2xl border border-black/20 w-full max-w-lg">
      <Modal.Header>
        <h2 className="text-2xl font-semibold text-white text-center mb-2">Add a New Candidate</h2>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-5">
          {/* Candidate Name */}
          <div className="flex flex-col">
            <Label htmlFor="productName" value="Candidate Name" className="text-white text-sm font-medium mb-1" />
            <input
              id="productName"
              placeholder="Enter Candidate name"
              required
              className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Age */}
          <div className="flex flex-col">
            <Label htmlFor="price" value="Age" className="text-white text-sm font-medium mb-1" />
            <input
              id="price"
              placeholder="Enter Age"
              required
              className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <Label htmlFor="description" value="Description" className="text-white text-sm font-medium mb-1" />
            <textarea
                id="description"
                placeholder="Enter product description"
                required
                rows="4"
                className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black resize-none"
            />
          </div>
          {/* File Upload */}
            <div className="flex flex-col">
            <Label htmlFor="fileUpload" value="Upload File" className="text-white text-sm font-medium mb-1" />
            <input
                id="fileUpload"
                type="file"
                className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"
            />
            </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-end space-x-3">
        <button onClick={() => setOpenModal(false)} className="gradient-border-button">
          Add Candidate
        </button>
      </Modal.Footer>
    </div>
  </div>
</Modal>

    </>
  );
}