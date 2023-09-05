import { ethers } from "hardhat";
import {
  BASE_URI,
  MAX_SUPPLY,
  MERKLE_ROOT_CUPZLIST,
  MERKLE_ROOT_POTLIST,
  MERKLE_ROOT_WHITELIST,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  UNREVEALED_URI,
  URI_SUFFIX,
} from "../lib/contractArguments";

async function main() {
  const NanCafe = await ethers.getContractFactory("NanCupz");

  const nancafe = await NanCafe.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    MERKLE_ROOT_POTLIST,
    MERKLE_ROOT_WHITELIST,
    MERKLE_ROOT_CUPZLIST,
    BASE_URI,
    URI_SUFFIX,
    UNREVEALED_URI,
    MAX_SUPPLY
  );

  await nancafe.waitForDeployment();

  console.log("NanCafe deployed to:", nancafe.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
