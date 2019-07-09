pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract Parliament is AragonApp {
  //Events
  event NewDiscussion(uint256 voteID);
  event Comment(address sender, uint256 voteID, uint256 commentID, uint256 parentID, bytes32 digest, uint8 hashFunction, uint8 size);

  //Roles
  bytes32 constant public CREATE_ROLE = keccak256('CREATE_ROLE');

  //Storage
  address public voting;
  uint256 public count;

  //Functions
  function initialize(address _voting) onlyInit public {
    initialized();
    voting = _voting;
    count = 0;
  }

  function newDiscussion(uint256 _voteID) external auth(CREATE_ROLE) {
    emit NewDiscussion(_voteID);
  }

  function comment(uint256 _voteID, uint256 _parentID, bytes32 _digest, uint8 _hashFunction, uint8 _size) external auth(CREATE_ROLE) {
    count++;
    emit Comment(tx.origin, _voteID, count, _parentID, _digest, _hashFunction, _size);
  }
}
