import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NanCafe } from "../typechain-types";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

function getMerkelRoot(addresses: string[]) {
  const leafNodes = addresses.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });
  return "0x" + merkleTree.getRoot().toString("hex");
}

function getMerkelProof(addresses: string[], address: string) {
  const leafNodes = addresses.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });
  return merkleTree.getHexProof(keccak256(address));
}

const whitelistAddresses = [
  // Hardhat test addresses...
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
  "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
  "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
  "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
  "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
  "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
  "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
  "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
  "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
  "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
  "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
];

const allowlists = {
  potlist: {
    root: "0x5814de1b89090e9533bdca95fa4f228fa13200abbac742bdc04d043cacdf5e50",
    amount: 3,
    wallets: whitelistAddresses,
  },
  whitelist: {
    root: "0x2a03e37d836f8d1fbb5c1a8cfb1b4198bbc576c4408a77a6974ef8f559e7c062",
    amount: 2,
    wallets: whitelistAddresses,
  },
  cupzlist: {
    root: "0x4b9bb26bc6acf5444bd5b604afa01815cec9de50df4a9b945cd751c1e506ab58",
    amount: 1,
    wallets: whitelistAddresses,
  },
};

describe("NanCafe", function () {
  let nanCafe: NanCafe;

  let owner!: SignerWithAddress;
  let whitelistedUser!: SignerWithAddress;
  let holder!: SignerWithAddress;
  let externalUser!: SignerWithAddress;

  before(async function () {
    [owner, whitelistedUser, holder, externalUser] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const NanCafe = await ethers.getContractFactory("NanCafe");
    nanCafe = await NanCafe.deploy(
      "NanCafe",
      "NC",
      getMerkelRoot(allowlists.potlist.wallets),
      getMerkelRoot(allowlists.whitelist.wallets),
      getMerkelRoot(allowlists.cupzlist.wallets),
      "https://example.com/",
      ".json",
      737
    );
  });

  // Start writing tests here

  it("Should deploy the contract correctly", async function () {
    expect(await nanCafe.name()).to.equal("NanCafe");
    expect(await nanCafe.symbol()).to.equal("NC");
    expect(await nanCafe.baseUri()).to.equal("https://example.com/");
    expect(await nanCafe.uriSuffix()).to.equal(".json");
    expect(await nanCafe.maxSupply()).to.equal(737);
    expect(await nanCafe.maxPerWalletPotlist()).to.equal(
      allowlists.potlist.amount
    );
    expect(await nanCafe.maxPerWalletWhitelist()).to.equal(
      allowlists.whitelist.amount
    );
    expect(await nanCafe.maxPerWalletCupzlist()).to.equal(
      allowlists.cupzlist.amount
    );
  });

  it("Contract is paused", async function () {
    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          allowlists.potlist.amount,
          0,
          getMerkelProof(
            allowlists.potlist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Pausable: paused");
  });

  it("Not whitelisted address should not mint", async function () {
    await nanCafe.connect(owner).unpause();

    await expect(
      nanCafe
        .connect(externalUser)
        .whitelistMint(
          3,
          0,
          getMerkelProof(
            allowlists.potlist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Invalid Merkle proof");
  });

  it("Potlisted address should mint 3", async function () {
    await nanCafe.connect(owner).unpause();

    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          allowlists.potlist.amount + 1,
          0,
          getMerkelProof(
            allowlists.potlist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Mint limit reached for wallet");

    await nanCafe
      .connect(whitelistedUser)
      .whitelistMint(
        allowlists.potlist.amount,
        0,
        getMerkelProof(
          allowlists.potlist.wallets,
          await whitelistedUser.getAddress()
        )
      );

    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          1,
          0,
          getMerkelProof(
            allowlists.potlist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Mint limit reached for wallet");
  });

  it("Whitelisted address should mint 2", async function () {
    await nanCafe.connect(owner).unpause();

    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          allowlists.whitelist.amount + 1,
          1,
          getMerkelProof(
            allowlists.whitelist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Mint limit reached for wallet");

    await nanCafe
      .connect(whitelistedUser)
      .whitelistMint(
        allowlists.whitelist.amount,
        1,
        getMerkelProof(
          allowlists.whitelist.wallets,
          await whitelistedUser.getAddress()
        )
      );

    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          1,
          1,
          getMerkelProof(
            allowlists.whitelist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Mint limit reached for wallet");
  });

  it("Cupzlisted address should mint 1", async function () {
    await nanCafe.connect(owner).unpause();

    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          allowlists.cupzlist.amount + 1,
          2,
          getMerkelProof(
            allowlists.cupzlist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Mint limit reached for wallet");

    await nanCafe
      .connect(whitelistedUser)
      .whitelistMint(
        allowlists.cupzlist.amount,
        2,
        getMerkelProof(
          allowlists.cupzlist.wallets,
          await whitelistedUser.getAddress()
        )
      );

    await expect(
      nanCafe
        .connect(whitelistedUser)
        .whitelistMint(
          1,
          2,
          getMerkelProof(
            allowlists.cupzlist.wallets,
            await whitelistedUser.getAddress()
          )
        )
    ).to.be.revertedWith("Mint limit reached for wallet");
  });

  // Other tests can follow...
});
