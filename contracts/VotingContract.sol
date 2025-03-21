// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Create {
    using Counters for Counters.Counter;
    
    Counters.Counter private _candidateId;
    uint256 public start_period;
    uint256 public end_period;
    address public votingOrganizer;

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
        votingOrganizer = msg.sender;
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

        _candidateId.increment();
        uint256 idNumber = _candidateId.current();

        Candidate storage candidate = candidates[_address];
        candidate.age = _age;
        candidate.name = _name;
        candidate.candidateId = idNumber;
        candidate.image = _image;
        candidate.party = _party;
        candidate.voteCount = 0;
        candidate._address = _address;
        candidate.ipfs = _ipfs;

        candidateAddress.push(_address);
        
        emit CandidateCreate(idNumber, _age, _name, _image, _party, 0, _address, _ipfs);
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
}