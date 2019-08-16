pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract Parliament is AragonApp {
  //Events
  event Comment(address sender, uint256 voteID, uint256 commentID, uint256 parentID, bytes32 digest, uint8 hashFunction, uint8 size);
  event Points(uint256 commentID, int256 points);

  //Roles
  bytes32 constant public USER_ROLE = keccak256('USER_ROLE');

  //Storage
  address public voting;
  uint256 public count;
  mapping(uint256 => int256) public points;
  mapping(uint256 => mapping(address => int8)) public uservote;

  //Functions
  function initialize(address _voting) onlyInit public {
    initialized();
    voting = _voting;
    count = 0;
  }

  function comment(uint256 _voteID, uint256 _parentID, bytes32 _digest, uint8 _hashFunction, uint8 _size) external auth(USER_ROLE) {
    count++;
    emit Comment(tx.origin, _voteID, count, _parentID, _digest, _hashFunction, _size);
  }

  function upvote(uint256 _commentID) external auth(USER_ROLE) {
    require(_commentID <= count);
    require(uservote[_commentID][tx.origin] < 1);
    if(uservote[_commentID][tx.origin] == -1){
      points[_commentID] += 2;
    } else {
      points[_commentID] += 1;
    }
    uservote[_commentID][tx.origin] = 1;
    emit Points(_commentID, points[_commentID]);
  }

  function downvote(uint256 _commentID) external auth(USER_ROLE) {
    require(_commentID <= count);
    require(uservote[_commentID][tx.origin] > -1);
    if(uservote[_commentID][tx.origin] == 1){
      points[_commentID] -= 2;
    } else {
      points[_commentID] -= 1;
    }
    uservote[_commentID][tx.origin] = -1;
    emit Points(_commentID, points[_commentID]);
  }

  function undovote(uint256 _commentID) external auth(USER_ROLE) {
    require(_commentID <= count);
    require(uservote[_commentID][tx.origin] != 0);
    if(uservote[_commentID][tx.origin] == 1){
      points[_commentID] -= 1;
    } else {
      points[_commentID] += 1;
    }
    uservote[_commentID][tx.origin] = 0;
    emit Points(_commentID, points[_commentID]);
  }
}
