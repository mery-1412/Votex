// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Create {
    using Counters for Counters.Counter;
    
    Counters.Counter private _candidateId;
    uint256 public start_period;
    uint256 public end_period;
    address public deployer;
    address public organizer;
    address public votingOrganizer; // Now it will be properly set

    struct Candidate {
        uint256 candidateId;
        string age;
        string name;
        string image;
        string party;
        uint256 voteCount;
        address _address;
        string ipfs;
    }
    
    event CandidateCreate(
        uint256 indexed candidateId,
        string age,
        string name,
        string image,
        string party,
        uint256 voteCount,
        address _address,
        string ipfs
    );
    
    address[] public candidateAddress;
    mapping(address => Candidate) public candidates;
    
    address[] public votedVoters;
    mapping(address => bool) public hasVoted;

    constructor() {
        deployer = msg.sender; // Store the deployer's address
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can set the organizer");
        _;
    }

    function setOrganizer(address _organizer) external onlyDeployer {
        require(_organizer != address(0), "Invalid organizer address");
        organizer = _organizer;
        votingOrganizer = _organizer; // FIX: Set votingOrganizer properly
    }

    function setCandidate(
        address _address,
        string memory _age,
        string memory _name,
        string memory _image,
        string memory _party,
        string memory _ipfs
    ) public {
        require(votingOrganizer == msg.sender, "Only Organiser can add Candidates!");
        require(candidates[_address].candidateId == 0, "Candidate already exists!");

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
            ipfs: _ipfs
        });

        candidateAddress.push(_address); // Store unique address

        emit CandidateCreate(idNumber, _age, _name, _image, _party, 0, _address, _ipfs);
    }

    function setVotingPeriod(uint256 _start, uint256 _end) public {
        require(votingOrganizer == msg.sender, "Only the organizer can set the voting period!");
        require(_start < _end, "Start time must be before end time!");
        start_period = _start;
        end_period = _end;
    }

    function vote(address _candidateIdAddress) external {
        require(block.timestamp >= start_period, "Voting has not started yet!");
        require(block.timestamp <= end_period, "Voting period has ended!");
        require(!hasVoted[msg.sender], "You have already voted!");

        hasVoted[msg.sender] = true;
        votedVoters.push(msg.sender);

        candidates[_candidateIdAddress].voteCount += 1;
    }

    function getVotedVoterList() public view returns (address[] memory) {
        return votedVoters;
    }

    function getCandidate() public view returns (address[] memory) {
        return candidateAddress;
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
            address
        )
    {
        Candidate memory c = candidates[_address];
        return (c.age, c.name, c.candidateId, c.image, c.party, c.voteCount, c.ipfs, c._address);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        uint256 length = candidateAddress.length;
        Candidate[] memory allCandidates = new Candidate[](length);

        for (uint256 i = 0; i < length; i++) {
            allCandidates[i] = candidates[candidateAddress[i]];
        }

        return allCandidates;
    }
}
