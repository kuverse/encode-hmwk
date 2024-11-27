// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;
    mapping(address => uint256) public votePowerSpent;

    constructor(
        bytes32[] memory _proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IMyToken(_tokenContract);

        require(
            _targetBlockNumber < block.number,
            string.concat(
                "Target block must be in the past, current block number is: ",
                Strings.toString(block.number),
                " and target block number is: ",
                Strings.toString(_targetBlockNumber)
            )
        );
        targetBlockNumber = _targetBlockNumber;

        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposal, uint amount) external {
        uint256 votingPower = getVotingPower(msg.sender);
        require(
            votingPower >= amount,
            "Error: trying to vote with more votes than available"
        );
        votePowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function getVotingPower(address voter) public view returns (uint256) {
        return
            tokenContract.getPastVotes(voter, targetBlockNumber) -
            votePowerSpent[voter];
    }

    function winningProposal()
        public
        view
        returns (uint winningProposal_, bool hasTie)
    {
        uint winningVoteCount = 0;
        hasTie = false;

        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
                hasTie = false;
            } else if (proposals[p].voteCount == winningVoteCount) {
                hasTie = true;
            }
        }

        return (winningProposal_, hasTie);
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        (uint winner, bool hasTie) = winningProposal();
        if (hasTie) {
            return bytes32("No Winner - TIE");
        }
        winnerName_ = proposals[winner].name;
        return winnerName_;
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }
}
