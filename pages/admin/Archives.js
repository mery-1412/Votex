import React, { useState, useContext, useEffect } from 'react';
import { VotingContext } from '@/context/Voter';
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import RequireAdmin from '../protectingRoutes/RequireAdmin';
import axios from 'axios';

const Archives = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState('');
  const [archives, setArchives] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [latestSessionActive, setLatestSessionActive] = useState(false);
  const [hasArchivableSession, setHasArchivableSession] = useState(false);
  const { getSessionData, currentSessionId, connectSmartContract } = useContext(VotingContext);

  useEffect(() => {
    const checkLatestSession = async () => {
      try {
        const contract = await connectSmartContract();
        if (!contract) return;

        // Get current session ID
        const sessionId = await contract.currentSessionId();
        
        // If there's no session at all
        if (sessionId.toString() === "0") {
          setLatestSessionActive(false);
          setHasArchivableSession(false);
          return;
        }

        // Get session details
        const session = await contract.getSession(sessionId);
        
        // Check if this session is already archived
        const isArchived = archives.some(a => a.sessionId === sessionId.toString());
        
        // A session is archivable if:
        // 1. It exists
        // 2. It's not active (has ended)
        // 3. It hasn't been archived yet
        setHasArchivableSession(session && !session.isActive && !isArchived);
        setLatestSessionActive(session.isActive);

      } catch (error) {
        console.error('Error checking session status:', error);
        setHasArchivableSession(false);
        setLatestSessionActive(false);
      }
    };

    checkLatestSession();
  }, [archives]);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/archives', {
          withCredentials: true
        });
        
        if (response.data.success) {
          setArchives(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching archives:', error);
        setArchiveStatus('Error loading archives');
      }
    };

    fetchArchives();
  }, []);

  const handleArchive = async () => {
    try {
      setArchiveStatus('Archiving last session...');
      
      const contract = await connectSmartContract();
      if (!contract) {
        throw new Error("Failed to connect to smart contract");
      }

      const sessionId = await contract.currentSessionId();
      const session = await contract.getSession(sessionId);
      
      if (session.isActive) {
        throw new Error("Cannot archive an active session");
      }

      const sessionData = await getSessionData(sessionId);
      const newArchive = {
        sessionId: sessionId.toString(),
        year: sessionData.year.toString(),
        winnerName: sessionData.winnerName,
        totalVotes: sessionData.voteCounts.reduce((a, b) => parseInt(a) + parseInt(b), 0),
        details: {
          candidateNames: sessionData.candidateNames,
          voteCounts: sessionData.voteCounts,
          winnerAddress: sessionData.winnerAddress,
          winnerVoteCount: sessionData.winnerVoteCount,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime
        }
      };

      // Save to database
      const response = await axios.post('http://localhost:5000/api/archives', newArchive, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setArchives(prev => [...prev, response.data.data]);
        setArchiveStatus('Session archived successfully!');
        setHasArchivableSession(false);
      }
      
    } catch (error) {
      console.error('Error archiving session:', error);
      setArchiveStatus(`Error archiving session: ${error.message}`);
    }
  };

  const SessionDetailsModal = ({ session, onClose }) => {
    if (!session) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-purple-800">
              Session Details - Year {session.year}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Winner Section */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-purple-800 mb-4">Winner Information</h4>
              <div className="grid gap-3">
                <p><span className="font-medium">Name:</span> {session.details.winnerName}</p>
                <p><span className="font-medium">Address:</span> {session.details.winnerAddress}</p>
                <p><span className="font-medium">Vote Count:</span> {session.details.winnerVoteCount.toString()}</p>
              </div>
            </div>

            {/* All Candidates Section */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-purple-800 mb-4">All Candidates</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-200">
                      <th className="text-left py-2">Candidate</th>
                      <th className="text-right py-2">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.details.candidateNames.map((name, index) => (
                      <tr key={index} className="border-b border-purple-100">
                        <td className="py-2">{name}</td>
                        <td className="text-right py-2">{session.details.voteCounts[index].toString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RequireAdmin>
      <div className="dashboard-page flex h-screen">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-purple-800">Archives</h1>
              <button 
                onClick={handleArchive}
                disabled={!hasArchivableSession}
                className={`gradient-border-button-black ${
                  !hasArchivableSession 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-purple-700'
                }`}
                title={
                  !hasArchivableSession 
                    ? "No completed sessions available to archive" 
                    : "Archive Last Session"
                }
              >
                Archive Last Session
              </button>
            </div>

            {/* Status Messages */}
            {!hasArchivableSession && (
              <div className="bg-gray-100 text-gray-600 p-4 rounded-lg mb-6">
                {latestSessionActive 
                  ? "Cannot archive while the current session is active"
                  : "No completed sessions available to archive"}
              </div>
            )}

            {archiveStatus && (
              <div className={`p-4 rounded-lg mb-6 ${
                archiveStatus.includes('Error') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {archiveStatus}
              </div>
            )}

            {/* Archives Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Year</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Session ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Winner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Total Votes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {archives.map((archive) => (
                    <tr key={archive.sessionId} className="hover:bg-purple-50">
                      <td className="px-6 py-4">{archive.year}</td>
                      <td className="px-6 py-4">{archive.sessionId}</td>
                      <td className="px-6 py-4">{archive.winnerName}</td>
                      <td className="px-6 py-4">{archive.totalVotes}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedSession(archive);
                            setShowModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {archives.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No archived sessions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showModal && (
          <SessionDetailsModal
            session={selectedSession}
            onClose={() => {
              setShowModal(false);
              setSelectedSession(null);
            }}
          />
        )}
      </div>
    </RequireAdmin>
  );
};

export default Archives;
