// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Create {
    using Counters for Counters.Counter;

    Counters.Counter private _candidateId;
    Counters.Counter private sessionCounter;
    address public deployer;
    address public organizer;
    address public votingOrganizer;

    // Session structure
    struct Session {
        uint256 sessionId;
        uint256 startPeriod;
        uint256 endPeriod;
        uint256 totalVotes;
        address[] sessionCandidates;
        mapping(uint256 => uint256) votesPerMinute; // minute timestamp => vote count
        bool isActive; // Flag to track if session is active
    }

    struct Candidate {
        uint256 candidateId;
        string age;
        string name;
        string image;
        string party;
        uint256 voteCount;
        address _address;
        string ipfs;
        uint256 sessionId;
        bool isArchived; // Flag to track archived candidates
    }

    event CandidateCreate(
        uint256 indexed candidateId,
        string age,
        string name,
        string image,
        string party,
        uint256 voteCount,
        address _address,
        string ipfs,
        uint256 sessionId
    );

    // Event for session creation
    event SessionCreated(
        uint256 indexed sessionId,
        uint256 startPeriod,
        uint256 endPeriod
    );

    // Event for session end - candidates archived
    event SessionEnded(
        uint256 indexed sessionId,
        uint256 endPeriod,
        uint256 totalVotes
    );

    // Event for vote tracking
    event VoteCast(
        address indexed voter,
        address indexed candidate,
        bytes32 indexed userIdHash,
        uint256 sessionId,
        uint256 timestamp
    );

    // Event for white vote tracking
    event WhiteVoteCast(
        address indexed voter,
        uint256 sessionId,
        uint256 timestamp
    );

    // Event for multiple vote tracking
    event MultipleVoteCast(
        address indexed voter,
        address[] candidates,
        uint256 sessionId,
        uint256 timestamp
    );

    mapping(uint256 => Session) private sessions;
    uint256 public currentSessionId;
    bool public isVotingActive; // Flag to track if voting is currently active

    address[] public candidateAddress;
    mapping(address => Candidate) public candidates;
    address[] public activeCandiates; // Track non-archived candidates

    address[] public votedVoters;
    mapping(address => bool) public hasVoted;

    // Track voting by user ID (hashed)
    mapping(bytes32 => bool) public idHasVoted;
    bytes32[] public votedIdHashes;

    constructor() {
        deployer = msg.sender; // Store the deployer's address
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can set the organizer");
        _;
    }

    modifier onlyOrganizer() {
        require(msg.sender == votingOrganizer, "Only organizer can perform this action");
        _;
    }

    function setOrganizer(address _organizer) external onlyDeployer {
        require(_organizer != address(0), "Invalid organizer address");
        organizer = _organizer;
        votingOrganizer = _organizer;
    }

    function setCandidate(
        address _address,
        string memory _age,
        string memory _name,
        string memory _image,
        string memory _party,
        string memory _ipfs
    ) public onlyOrganizer {
        require(candidates[_address].candidateId == 0, "Candidate already exists!");
        require(!isVotingActive, "Cannot add candidates during active voting period");

        _candidateId.increment();
        uint256 idNumber = _candidateId.current();

        candidates[_address] = Candidate({
            candidateId: idNumber,
            age: _age,
            name: _name,
            image: _image,
            party: _party,
            voteCount: 0,
            _address: _address,
            ipfs: _ipfs,
            sessionId: 0, // Will be set when voting period starts
            isArchived: false
        });

        candidateAddress.push(_address);
        activeCandiates.push(_address);

        emit CandidateCreate(idNumber, _age, _name, _image, _party, 0, _address, _ipfs, 0);
    }

    // Function to set the voting period and create a new session
    function setVotingPeriod(uint256 _start, uint256 _end) public onlyOrganizer {
        require(_start < _end, "Start time must be before end time!");
        require(!isVotingActive, "A voting period is already active");
        require(block.timestamp <= _start, "Start time must be in the future");
        require(activeCandiates.length > 0, "No active candidates to include in voting session");

    
        sessionCounter.increment(); // Increment the session counter
        uint256 newSessionId = sessionCounter.current(); // Get the current session ID
        currentSessionId = newSessionId;
        isVotingActive = true;

        Session storage newSession = sessions[newSessionId];
        newSession.sessionId = newSessionId;
        newSession.startPeriod = _start;
        newSession.endPeriod = _end;
        newSession.totalVotes = 0;
        newSession.isActive = true;

        // Add all active candidates to this session
        for (uint256 i = 0; i < activeCandiates.length; i++) {
            address candidateAddr = activeCandiates[i];
            newSession.sessionCandidates.push(candidateAddr);
            candidates[candidateAddr].sessionId = newSessionId; // Assign candidates to this session
        }

        emit SessionCreated(newSessionId, _start, _end);
    }

    // Private function to archive candidates from previous session
    function _archivePreviousSessionCandidates() private {
        uint256 previousSessionId = currentSessionId;
        address[] memory previousCandidates = sessions[previousSessionId].sessionCandidates;
        
        // Mark all candidates from previous session as archived
        for (uint256 i = 0; i < previousCandidates.length; i++) {
            address candidateAddr = previousCandidates[i];
            candidates[candidateAddr].isArchived = true;
        }
        
        // Clear the active candidates list
        delete activeCandiates;
        
        sessions[previousSessionId].isActive = false;
        
        emit SessionEnded(previousSessionId, sessions[previousSessionId].endPeriod, sessions[previousSessionId].totalVotes);
    }

    // Function to check if session has ended and archive candidates
    function checkSessionStatus() public returns (bool) {
        if (!isVotingActive || currentSessionId == 0) {
            return false;
        }
        
        if (block.timestamp > sessions[currentSessionId].endPeriod) {
            _archivePreviousSessionCandidates();
            isVotingActive = false;
            return true;
        }
        
        return false;
    }

    // Standard vote function (updated for sessions)
    function vote(address _candidateIdAddress) external {
        // First check if we need to end the session
        checkSessionStatus();
        
        require(isVotingActive, "No active voting period");
        require(currentSessionId > 0, "No active session");
        require(block.timestamp >= sessions[currentSessionId].startPeriod, "Voting has not started yet!");
        require(block.timestamp <= sessions[currentSessionId].endPeriod, "Voting period has ended!");
        require(!hasVoted[msg.sender], "You have already voted!");
        require(candidates[_candidateIdAddress].sessionId == currentSessionId, "Candidate not in current session");
        require(!candidates[_candidateIdAddress].isArchived, "Candidate is archived");

        hasVoted[msg.sender] = true;
        votedVoters.push(msg.sender);

        candidates[_candidateIdAddress].voteCount += 1;
        sessions[currentSessionId].totalVotes += 1;

        // Track votes per minute
        uint256 currentMinute = (block.timestamp / 60) * 60; // Round down to nearest minute
        sessions[currentSessionId].votesPerMinute[currentMinute]++;

        emit VoteCast(msg.sender, _candidateIdAddress, bytes32(0), currentSessionId, block.timestamp);
    }

    // Function to cast a white vote
    function whiteVote() external {
        // First check if we need to end the session
        checkSessionStatus();
        
        require(isVotingActive, "No active voting period");
        require(currentSessionId > 0, "No active session");
        require(block.timestamp >= sessions[currentSessionId].startPeriod, "Voting has not started yet!");
        require(block.timestamp <= sessions[currentSessionId].endPeriod, "Voting period has ended!");
        require(!hasVoted[msg.sender], "You have already voted!");

        hasVoted[msg.sender] = true;
        votedVoters.push(msg.sender);

        sessions[currentSessionId].totalVotes += 1;

        emit WhiteVoteCast(msg.sender, currentSessionId, block.timestamp);
    }

    // Function to cast multiple votes
    function multipleVote(address[] memory _candidateAddresses) external {
        // First check if we need to end the session
        checkSessionStatus();
        
        require(isVotingActive, "No active voting period");
        require(currentSessionId > 0, "No active session");
        require(block.timestamp >= sessions[currentSessionId].startPeriod, "Voting has not started yet!");
        require(block.timestamp <= sessions[currentSessionId].endPeriod, "Voting period has ended!");
        require(!hasVoted[msg.sender], "You have already voted!");
        require(_candidateAddresses.length > 1, "Must vote for more than one candidate");

        hasVoted[msg.sender] = true;
        votedVoters.push(msg.sender);

        for (uint256 i = 0; i < _candidateAddresses.length; i++) {
            address candidateAddress = _candidateAddresses[i];
            require(candidates[candidateAddress].sessionId == currentSessionId, "Candidate not in current session");
            require(!candidates[candidateAddress].isArchived, "Candidate is archived");

            candidates[candidateAddress].voteCount += 1;
        }

        sessions[currentSessionId].totalVotes += _candidateAddresses.length;

        emit MultipleVoteCast(msg.sender, _candidateAddresses, currentSessionId, block.timestamp);
    }

    // Enhanced vote function with ID verification (updated for sessions)
    function voteWithId(address _candidateIdAddress, bytes32 _userIdHash) external {
        // First check if we need to end the session
        checkSessionStatus();
        
        require(isVotingActive, "No active voting period");
        require(currentSessionId > 0, "No active session");
        require(block.timestamp >= sessions[currentSessionId].startPeriod, "Voting has not started yet!");
        require(block.timestamp <= sessions[currentSessionId].endPeriod, "Voting period has ended!");
        require(!hasVoted[msg.sender], "This wallet has already voted!");
        require(!idHasVoted[_userIdHash], "This ID has already been used to vote!");
        require(candidates[_candidateIdAddress].sessionId == currentSessionId, "Candidate not in current session");
        require(!candidates[_candidateIdAddress].isArchived, "Candidate is archived");

        // Mark both wallet and ID as having voted
        hasVoted[msg.sender] = true;
        idHasVoted[_userIdHash] = true;

        // Record the vote
        votedVoters.push(msg.sender);
        votedIdHashes.push(_userIdHash);
        candidates[_candidateIdAddress].voteCount += 1;
        sessions[currentSessionId].totalVotes += 1;

        // Track votes per minute
        uint256 currentMinute = (block.timestamp / 60) * 60; // Round down to nearest minute
        sessions[currentSessionId].votesPerMinute[currentMinute]++;

        // Emit event for tracking
        emit VoteCast(msg.sender, _candidateIdAddress, _userIdHash, currentSessionId, block.timestamp);
    }

    // Check if an ID has already voted
    function hasIdVoted(bytes32 _userIdHash) external view returns (bool) {
        return idHasVoted[_userIdHash];
    }

    // Get list of all ID hashes that have voted
    function getVotedIdList() public view returns (bytes32[] memory) {
        return votedIdHashes;
    }

    function getVotedVoterList() public view returns (address[] memory) {
        return votedVoters;
    }

    // Get current session candidates that aren't archived
    function getCurrentSessionCandidates() public view returns (address[] memory) {
        if (currentSessionId == 0 || !isVotingActive) {
            address[] memory empty;
            return empty;
        }
        
        // First count how many non-archived candidates we have
        address[] memory allCandidates = sessions[currentSessionId].sessionCandidates;
        uint256 nonArchivedCount = 0;
        
        for (uint256 i = 0; i < allCandidates.length; i++) {
            if (!candidates[allCandidates[i]].isArchived) {
                nonArchivedCount++;
            }
        }
        
        // Create array of the right size
        address[] memory nonArchivedCandidates = new address[](nonArchivedCount);
        
        // Fill array with non-archived candidates
        uint256 j = 0;
        for (uint256 i = 0; i < allCandidates.length; i++) {
            if (!candidates[allCandidates[i]].isArchived) {
                nonArchivedCandidates[j] = allCandidates[i];
                j++;
            }
        }
        
        return nonArchivedCandidates;
    }

    // This function will always return candidates for a session regardless of voting status
    function getSessionCandidates(uint256 sessionId) public view returns (address[] memory) {
        require(sessionId > 0 && sessionId <= sessionCounter.current(), "Invalid session ID");
        return sessions[sessionId].sessionCandidates;
    }

    // Get active candidates that are not archived
    function getActiveCandidates() public view returns (address[] memory) {
        return activeCandiates;
    }

    function getCandidateLength() public view returns (uint256) {
        return candidateAddress.length;
    }

    function getCandidateData(address _address)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            string memory,
            string memory,
            uint256,
            string memory,
            address,
            uint256,
            bool
        )
    {
        Candidate memory c = candidates[_address];
        return (c.age, c.name, c.candidateId, c.image, c.party, c.voteCount, c.ipfs, c._address, c.sessionId, c.isArchived);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        uint256 length = candidateAddress.length;
        Candidate[] memory allCandidates = new Candidate[](length);

        for (uint256 i = 0; i < length; i++) {
            allCandidates[i] = candidates[candidateAddress[i]];
        }

        return allCandidates;
    }

    // Get voting period info
    function getVotingPeriod() public view returns (uint256 start, uint256 end, bool active) {
        if (currentSessionId == 0) {
            return (0, 0, false);
        }
        
        Session storage currentSession = sessions[currentSessionId];
        return (currentSession.startPeriod, currentSession.endPeriod, isVotingActive);
    }

    // Function for line chart - votes per minute in current session
    function getVotesPerMinute(uint256 sessionId) public view returns (uint256[] memory timePoints, uint256[] memory voteCounts) {
        require(sessionId > 0 && sessionId <= sessionCounter.current(), "Invalid session ID");

        // Calculate number of minutes in the voting period
        uint256 startMinute = (sessions[sessionId].startPeriod / 60) * 60;
        uint256 endMinute = ((sessions[sessionId].endPeriod + 59) / 60) * 60; // Round up to include the last minute
        uint256 minuteCount = (endMinute - startMinute) / 60 + 1;

        timePoints = new uint256[](minuteCount);
        voteCounts = new uint256[](minuteCount);

        for (uint256 i = 0; i < minuteCount; i++) {
            uint256 minuteTimestamp = startMinute + (i * 60);
            timePoints[i] = minuteTimestamp;
            voteCounts[i] = sessions[sessionId].votesPerMinute[minuteTimestamp];
        }

        return (timePoints, voteCounts);
    }

    // Function for bar chart - total votes per session year
    function getAllSessionsVotesByYear() public view returns (uint256[] memory yeers, uint256[] memory totalVotes) {
        uint256 sessionCount = sessionCounter.current();
        yeers = new uint256[](sessionCount);
        totalVotes = new uint256[](sessionCount);

        for (uint256 i = 1; i <= sessionCount; i++) {
            // Convert timestamp to year
            uint256 startTimestamp = sessions[i].startPeriod;
            uint256 year = getYearFromTimestamp(startTimestamp);

            yeers[i - 1] = year;
            totalVotes[i - 1] = sessions[i].totalVotes;
        }

        return (yeers, totalVotes);
    }

    // Helper function to convert a timestamp to a year
    function getYearFromTimestamp(uint256 timestamp) internal pure returns (uint256) {
        uint256 secondsPerDay = 86400;
        uint256 epoch = 1970;

        uint256 daysFromEpoch = timestamp / secondsPerDay;
        uint256 wholeFourYearPeriods = daysFromEpoch / 1461; // 365.25 * 4 = 1461
        uint256 yearsSinceEpoch = (wholeFourYearPeriods * 4) + ((daysFromEpoch % 1461) / 365);
        return epoch + yearsSinceEpoch;
    }

    // Function to get the winner of the current session
    function getCurrentSessionWinner() public view returns (
        string memory name,
        address winnerAddress,
        uint256 voteCount,
        string memory party,
        string memory image
    ) {
        require(currentSessionId > 0, "No active session");
        Session storage currentSession = sessions[currentSessionId];
        require(block.timestamp > currentSession.endPeriod, "Current session has not ended yet");

        address[] memory sessionCands = currentSession.sessionCandidates;
        require(sessionCands.length > 0, "No candidates in the current session");

        address winningCandidate = sessionCands[0];
        uint256 highestVotes = candidates[winningCandidate].voteCount;

        for (uint256 i = 1; i < sessionCands.length; i++) {
            if (candidates[sessionCands[i]].voteCount > highestVotes) {
                highestVotes = candidates[sessionCands[i]].voteCount;
                winningCandidate = sessionCands[i];
            }
        }

        Candidate memory winner = candidates[winningCandidate];
        return (
            winner.name,
            winner._address,
            winner.voteCount,
            winner.party,
            winner.image
        );
    }

    // Function to get detailed session data
    function getSessionData(uint256 _sessionId) public view returns (
        uint256 year,
        string[] memory candidateNames,
        uint256[] memory voteCounts,
        string memory winnerName,
        address winnerAddress,
        uint256 winnerVoteCount
    ) {
        require(_sessionId > 0 && _sessionId <= sessionCounter.current(), "Invalid session ID");

        // Get session year
        uint256 startTimestamp = sessions[_sessionId].startPeriod;
        year = getYearFromTimestamp(startTimestamp);

        // Get candidates and their vote counts
        address[] memory sessionCands = sessions[_sessionId].sessionCandidates;
        uint256 length = sessionCands.length;

        candidateNames = new string[](length);
        voteCounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            Candidate storage cand = candidates[sessionCands[i]];
            candidateNames[i] = cand.name;
            voteCounts[i] = cand.voteCount;
        }

        // Determine the winner
        address winningCandidate = sessionCands[0];
        uint256 highestVotes = candidates[winningCandidate].voteCount;

        for (uint256 i = 1; i < sessionCands.length; i++) {
            if (candidates[sessionCands[i]].voteCount > highestVotes) {
                highestVotes = candidates[sessionCands[i]].voteCount;
                winningCandidate = sessionCands[i];
            }
        }

        Candidate memory winner = candidates[winningCandidate];
        winnerName = winner.name;
        winnerAddress = winner._address;
        winnerVoteCount = winner.voteCount;

        return (year, candidateNames, voteCounts, winnerName, winnerAddress, winnerVoteCount);
    }

    function getSession(uint256 sessionId) public view returns (
        uint256 sessionId_,
        uint256 startPeriod,
        uint256 endPeriod,
        uint256 totalVotes,
        address[] memory sessionCandidates,
        bool isActive
    ) {
        require(sessionId > 0 && sessionId <= sessionCounter.current(), "Invalid session ID");

        Session storage session = sessions[sessionId];
        return (
            session.sessionId,
            session.startPeriod,
            session.endPeriod,
            session.totalVotes,
            session.sessionCandidates,
            session.isActive
        );
    }
}