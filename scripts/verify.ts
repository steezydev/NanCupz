import { run } from "hardhat";
import {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  MERKLE_ROOT_POTLIST,
  MERKLE_ROOT_WHITELIST,
  MERKLE_ROOT_CUPZLIST,
  BASE_URI,
  URI_SUFFIX,
  UNREVEALED_URI,
  MAX_SUPPLY,
  DEPLOYED_CONTRACT_ADDRESS,
  CONTRACT_NAME,
} from "../lib/contractArguments";

async function main() {
  console.log(`Verifying ${CONTRACT_NAME} at ${DEPLOYED_CONTRACT_ADDRESS}...`);

  // Parameters should be in the same order as the constructor's
  await run("verify:verify", {
    address: DEPLOYED_CONTRACT_ADDRESS,
    constructorArguments: [
      TOKEN_NAME,
      TOKEN_SYMBOL,
      MERKLE_ROOT_POTLIST,
      MERKLE_ROOT_WHITELIST,
      MERKLE_ROOT_CUPZLIST,
      BASE_URI,
      URI_SUFFIX,
      UNREVEALED_URI,
      MAX_SUPPLY,
    ],
  });

  console.log(`${CONTRACT_NAME} verified successfully!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
