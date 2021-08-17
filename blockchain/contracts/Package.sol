// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Package is ERC721, ERC721URIStorage, AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  using Counters for Counters.Counter;
  Counters.Counter private _packageIds;

  enum Stages {
    WaitingAtOrigin,
    PickedUpFromOrigin,
    InTransitToWarehouse,
    ReceivedAtWarehouse,
    DepositAtWarehouse,
    DepartedFromWarehouse,
    InTransitToDestination,
    ReceivedAtDestination
  }

  struct Update {
    uint256 packageId;
    Stages previousStage;
    Stages currentStage;
    uint256 updatedAt;
  }

  mapping(uint256 => Update[]) private updates;
  mapping(uint256 => address) private admins;

  event PackageUpdated(
    uint256 _tokenId,
    Update _update
  );

  constructor() ERC721("Package", "PAC") {
    _setupRole(MINTER_ROLE, msg.sender);
  }

  function safeMint(string memory _tokenURI, address _admin)
  public
  returns (uint256)
  {
    require(hasRole(MINTER_ROLE, msg.sender));
    _packageIds.increment();

    uint256 newPackageId = _packageIds.current();
    _safeMint(msg.sender, newPackageId);
    _setTokenURI(newPackageId, _tokenURI);

    updates[newPackageId].push(Update(newPackageId, Stages.WaitingAtOrigin, Stages.WaitingAtOrigin, block.timestamp));
    admins[newPackageId] = _admin;

    return newPackageId;
  }

  function addUpdateForPackage(uint256 _packageId, Stages _currentStage)
  public
  {
    require(
      msg.sender == admins[_packageId]
    );

    Stages _previousStage = updates[_packageId][(updates[_packageId].length - 1)].currentStage;
    updates[_packageId].push(Update(_packageId, _previousStage, _currentStage, block.timestamp));
    emit PackageUpdated(_packageId, updates[_packageId][(updates[_packageId].length - 1)]);
  }

  function getUpdatesForPackage(uint256 _packageId)
  public
  view
  returns (Update[] memory)
  {
    return updates[_packageId];
  }

  function _baseURI()
  internal
  pure
  override
  returns (string memory)
  {
    return 'https://package-nfts.s3.amazonaws.com/';
  }

  function tokenURI(uint256 tokenId)
  public
  view
  override(ERC721, ERC721URIStorage)
  returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function _burn(uint256 tokenId)
  internal
  override(ERC721, ERC721URIStorage)
  {
    super._burn(tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
  public
  view
  override(ERC721, AccessControl)
  returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
