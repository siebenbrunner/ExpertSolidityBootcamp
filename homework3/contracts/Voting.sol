//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./CloneFactory.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Voting is CloneFactory {
address public proposalContract;
mapping (uint => address) proposals;
uint public Id;

constructor(address _proposalContract) {
    proposalContract = _proposalContract;
}

function createProposal(string memory description) public returns(uint, address) {
    address proposal = createClone(proposalContract);
    Proposal(proposal).init(description, msg.sender);
    proposals[Id] = proposal;
    unchecked {
        Id++;
    }
    return (Id-1, proposal);
}

function vote(uint _Id, bool _accept) public {
    require(_Id < Id, "Unknown proposal");
    Proposal(proposals[_Id]).vote(_accept, msg.sender);
}

function closeProposal(uint _Id) public {
    require(_Id < Id, "Unknown proposal");
    Proposal(proposals[_Id]).closeProposal(msg.sender);
}

}

contract Proposal is AccessControl {
enum State{ Empty, Open, Accepted, Rejected }
uint private forVotes;
uint private againstVotes;
string public description;
mapping (address => bool) public hasVoted;

event Open(address indexed proposer, string description);
event Vote(address indexed voter, bool accept);
event Close(bool accept);

bytes32 public constant ADMIN = keccak256("ADMIN");
bytes32 public constant PROPOSER = keccak256("PROPOSER");
State public state;

function init(string memory _description, address _proposer) public {
    require(state == State.Empty);
    state = State.Open;
    _grantRole(ADMIN, msg.sender);
    _grantRole(PROPOSER, _proposer);
    description = _description;
    emit Open(_proposer, _description);
}

function vote(bool accept, address voter) public onlyRole(ADMIN) {
    require(!hasVoted[voter], "Already voted");
    require (state == State.Open, "Vote not open");
    hasVoted[voter] = true;
    if (accept) {
        unchecked {
            forVotes++;
        }
    } else {
        unchecked {
            againstVotes++;
        }
    }
    emit Vote(voter, accept);
}

function closeProposal(address sender) public onlyRole(ADMIN) {
    require (state == State.Open, "Vote not open");
    require (hasRole(PROPOSER, sender));
    if (forVotes >= againstVotes) {
        state = State.Accepted;
        emit Close(true);
    } else {
        state = State.Rejected;
        emit Close(false);
    }
}

}
