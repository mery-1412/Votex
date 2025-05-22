import React, { useState, useContext } from 'react';
import { VotingContext } from '@/context/Voter';
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import RequireAdmin from '../protectingRoutes/RequireAdmin';

const Archives = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState('');
  const { getSessionData, currentSessionId } = useContext(VotingContext);

  const handleArchive = async () => {
    try {
      setArchiveStatus('Archiving session data...');
      
      // Get session data from smart contract
      const sessionData = await getSessionData(currentSessionId);
      
      // Format data for JSON
      const archiveData = {
        sessionId: currentSessionId,
        year: sessionData.year.toString(),
        candidates: sessionData.candidateNames.map((name, index) => ({
          name,
          voteCount: sessionData.voteCounts[index].toString()
        })),
        winner: {
          name: sessionData.winnerName,
          address: sessionData.winnerAddress,
          voteCount: sessionData.winnerVoteCount.toString()
        },
        archivedAt: new Date().toISOString()
      };

      // Create JSON blob
      const blob = new Blob([JSON.stringify(archiveData, null, 2)], {
        type: 'application/json'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voting-session-${currentSessionId}-${archiveData.year}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setArchiveStatus('Session archived successfully!');
    } catch (error) {
      console.error('Error archiving session:', error);
      setArchiveStatus('Error archiving session data');
    }
  };

  return (
    <RequireAdmin>
      <div className="dashboard-page flex h-screen">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-purple-800 mb-8">Archive Session Data</h1>
            
            {/* Archive Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Current Session Archive
              </h2>
              <p className="text-gray-600 mb-6">
                Archive the current session's voting data including results, 
                candidate information, and winner details.
              </p>
              
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={handleArchive}
                  className="gradient-border-button-black w-full md:w-auto"
                >
                  Archive Current Session
                </button>
                
                {archiveStatus && (
                  <div className={`p-4 rounded-lg ${
                    archiveStatus.includes('Error') 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {archiveStatus}
                  </div>
                )}
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
};

export default Archives;
