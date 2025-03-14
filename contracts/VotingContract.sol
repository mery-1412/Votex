// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import  "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


contract Create {
using Counters for Counters.Counter;//to use increment()

Counters.Counter private _voterId;//to count voter id
Counters.Counter private _candidateId;

    address public votingOrganizer;


    struct Candidate {
        uint256 candidateId;
        string age ;
        string name ;
        string image ;
        string party ; // political party of the candidate
        uint256 voteCount ;
        address _address;
        string ipfs ;

 
    }
    //event to create candidate
  event CandidateCreate(
     uint256  indexed candidateId,
        string age ,
        string name ,
        string image ,
        string party,
        uint256 voteCount ,
        address _address,
        string ipfs 
  );
   
   address[] public candidateAddress;   ///search throuh table
   mapping(address=> Candidate ) public candidates; ///fast search through mapping

   //end of cand data 

   //Voter details 
   address[] public votedVoters;
   address[] public voterAdress;
   mapping(address=> Voter) public voters;

    struct Voter{
        uint256 voter_voterId;
        string voter_name ;
        string voter_image ;
        address voter_address;
        uint256 voter_allowed ;
        bool voter_voted;
        uint256 voter_vote ;
        string voter_ipfs ;

    }
     event VoterCreated(
        uint256 indexed voter_voterId,
        string voter_name ,
        string voter_image ,
        address voter_address,
        uint256 voter_allowed ,
        bool voter_voted ,
        uint256 voter_vote , //id du vote 
        string voter_ipfs 

     );
     //end voter data 
     
     
     constructor(){
        votingOrganizer= msg.sender;      //assign adress to the deployer (organizer in our case )
     }


function setCandidate(address _address,string memory _age,string memory _name,string memory _image ,string memory _party ,string memory _ipfs)  public {

        require(votingOrganizer==msg.sender,"Only Organiser can add Candidates!");

       _candidateId.increment();
       
       uint256 idNumber = _candidateId.current();

       Candidate storage candidate = candidates[_address];
       
         candidate.age= _age;
         candidate.name= _name;
         candidate.candidateId= idNumber;
         candidate.image= _image;
         candidate.party= _party;
         candidate.voteCount= 0;
         candidate._address= _address;
         candidate.ipfs= _ipfs;

        candidateAddress.push(_address); //adress are push to address[] public candidateAddress;

        
       emit CandidateCreate(
        idNumber,
        _age,
        _name,
        _image,
        _party,
        candidate.voteCount,
        _address,
        _ipfs
      );



    }
function getCandidate() public view returns (address[] memory){
      return candidateAddress;
    }

function getCandidateLenght() public view returns (uint256){
      return candidateAddress.length;

    }



function getCandidateData(address _address) public view returns (string memory,string memory,uint256,string memory,string memory,uint256,string memory,address) {
      return (
         candidates[_address].age,
         candidates[_address].name,
         candidates[_address].candidateId,
         candidates[_address].image,
         candidates[_address].party,
         candidates[_address].voteCount,
         candidates[_address].ipfs,
         candidates[_address]._address
      );
    }

//voter section
 //function to allow creation of voters to vote 

 function voterRight(address _address,string memory _name,string memory _image,string memory _ipfs ) public {
       
        require(votingOrganizer==msg.sender,"Only Organiser can add a Voter!");
     
       _voterId.increment();

       uint256 idNumber = _voterId.current();

       Voter storage voter = voters[_address];

       require( voter.voter_allowed == 0 ); // not allowed here 

       voter.voter_allowed = 1 ;
       voter.voter_name = _name ;
       voter.voter_image= _image ;
       voter.voter_address = _address ;
       voter.voter_voterId = idNumber ;
       voter.voter_vote = 1000 ;
       voter.voter_voted = false ;
       voter.voter_ipfs = _ipfs ;

       voterAdress.push(_address);

      emit VoterCreated(
         idNumber,
        _name,
        _image,
        _address,
        voter.voter_allowed,
        voter.voter_voted,
        voter.voter_vote, 
        _ipfs
       );

 }

function vote (address _candidateIdAddress, uint256 _candidateVoteId) external {
 
  Voter storage voter = voters[msg.sender]; //msg.sender to take adress of the one who calls the function 
  
  require(!voter.voter_voted,"You have already voted ha khayi!");
  require(voter.voter_allowed != 0 ,"You have no right to vote, nta machi bnadem.");
  
  voter.voter_voted=true ;
  voter.voter_vote = _candidateVoteId;

  votedVoters.push(msg.sender);

  candidates[_candidateIdAddress].voteCount += voter.voter_allowed;



}

function getVoterLenght () public view returns (uint256) {
  return voterAdress.length; 
}

function getVoterdata (address _address) public view returns(uint256, string memory,string memory,address,string memory,uint256,bool){
  return (
    voters[_address].voter_voterId,
    voters[_address].voter_name,
    voters[_address].voter_image,
    voters[_address].voter_address,
    voters[_address].voter_ipfs,
    voters[_address].voter_allowed,
    voters[_address].voter_voted
  );
}

function getVotedVoterList() public view returns (address[] memory){
  return votedVoters;
}

function getVoterList()  public view returns (address[] memory){
  return voterAdress;
    
}

}