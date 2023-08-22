// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract NanCafe is ERC721A, Pausable, Ownable {
    enum whitelistType {
        POTLIST,
        WHITELIST,
        CUPZLIST
    }

    bool public transfersPaused = false;

    string public uriSuffix;
    string public baseUri;
    uint256 public maxSupply;

    uint256 public maxPerWalletPotlist;
    uint256 public maxPerWalletWhitelist;
    uint256 public maxPerWalletCupzlist;

    // Merkle roots to handle different types of mint
    bytes32 public merkleRootPotlist;
    bytes32 public merkleRootWhitelist;
    bytes32 public merkleRootCupzlist;

    mapping(address => uint256) public mintedTokens;
    mapping(address => bool) public blockedOperators;

    modifier whitelistCompliance(
        bytes32[] calldata _merkleProof,
        whitelistType mintType
    ) {
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        bytes32 merkleRoot;

        if (mintType == whitelistType.POTLIST) {
            merkleRoot = merkleRootPotlist;
        } else if (mintType == whitelistType.WHITELIST) {
            merkleRoot = merkleRootWhitelist;
        } else if (mintType == whitelistType.CUPZLIST) {
            merkleRoot = merkleRootCupzlist;
        }

        require(
            MerkleProof.verify(_merkleProof, merkleRoot, node),
            "Invalid Merkle proof"
        );
        _;
    }

    modifier mintCompliance(uint256 quantity, whitelistType mintType) {
        require(_totalMinted() + quantity <= maxSupply, "Max supply reached");

        uint256 maxPerWallet = 0;

        if (mintType == whitelistType.POTLIST) {
            maxPerWallet = maxPerWalletPotlist;
        } else if (mintType == whitelistType.WHITELIST) {
            maxPerWallet = maxPerWalletWhitelist;
        } else if (mintType == whitelistType.CUPZLIST) {
            maxPerWallet = maxPerWalletCupzlist;
        }

        require(
            _numberMinted(msg.sender) + quantity <= maxPerWallet,
            "Mint limit reached for wallet"
        );
        _;
    }

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        bytes32 _merkleRootPotlist,
        bytes32 _merkleRootWhitelist,
        bytes32 _merkleRootCupzlist,
        string memory _baseUri,
        string memory _uriSuffix,
        uint256 _maxSupply
    ) ERC721A(_tokenName, _tokenSymbol) {
        pause();
        maxPerWalletPotlist = 3;
        maxPerWalletWhitelist = 2;
        maxPerWalletCupzlist = 1;
        merkleRootPotlist = _merkleRootPotlist;
        merkleRootWhitelist = _merkleRootWhitelist;
        merkleRootCupzlist = _merkleRootCupzlist;
        baseUri = _baseUri;
        uriSuffix = _uriSuffix;
        maxSupply = _maxSupply;
    }

    function whitelistMint(
        uint256 quantity,
        whitelistType mintType,
        bytes32[] calldata _merkleProof
    )
        external
        payable
        whitelistCompliance(_merkleProof, mintType)
        mintCompliance(quantity, mintType)
    {
        _mint(msg.sender, quantity);
    }

    // OWNER SECTION

    function setBaseUri(string calldata _baseUri) external onlyOwner {
        baseUri = _baseUri;
    }

    function setUriSuffix(string calldata _uriSuffix) external onlyOwner {
        uriSuffix = _uriSuffix;
    }

    function setMaxPerWalletPotlist(uint256 _maxPerWallet) external onlyOwner {
        maxPerWalletPotlist = _maxPerWallet;
    }

    function setMaxPerWalletWhitelist(
        uint256 _maxPerWallet
    ) external onlyOwner {
        maxPerWalletWhitelist = _maxPerWallet;
    }

    function setMaxPerWalletCupzlist(uint256 _maxPerWallet) external onlyOwner {
        maxPerWalletCupzlist = _maxPerWallet;
    }

    function setMerkleRootPotlist(bytes32 _merkleRoot) external onlyOwner {
        merkleRootPotlist = _merkleRoot;
    }

    function setMerkleRootWhitelist(bytes32 _merkleRoot) external onlyOwner {
        merkleRootWhitelist = _merkleRoot;
    }

    function setMerkleRootCupzlist(bytes32 _merkleRoot) external onlyOwner {
        merkleRootCupzlist = _merkleRoot;
    }

    function setTransfersPaused(bool _setPause) public onlyOwner {
        transfersPaused = _setPause;
    }

    function blockOperator(address _address) external onlyOwner {
        blockedOperators[_address] = true;
    }

    function airdropMint(
        address _address,
        uint256 quantity
    ) external onlyOwner {
        _mint(_address, quantity);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // OVERRIDES

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(_tokenId)) revert URIQueryForNonexistentToken();
        string memory baseURI = _baseURI();

        return
            bytes(baseURI).length != 0
                ? string(
                    abi.encodePacked(baseURI, _toString(_tokenId), uriSuffix)
                )
                : "";
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfers(from, to, tokenId, batchSize);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable virtual override {
        require(!transfersPaused, "Transfers paused");
        if (blockedOperators[msg.sender]) {
            revert("No transfer allowed");
        }
        safeTransferFrom(from, to, tokenId, "");
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }
}
