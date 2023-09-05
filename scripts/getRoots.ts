import {
  MERKLE_ROOT_CUPZLIST,
  MERKLE_ROOT_POTLIST,
  MERKLE_ROOT_WHITELIST,
} from "../lib/contractArguments";

async function main() {
  console.log("Potlist root: ", MERKLE_ROOT_POTLIST);
  console.log("Whitelist root: ", MERKLE_ROOT_WHITELIST);
  console.log("Cupzlist root: ", MERKLE_ROOT_CUPZLIST);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
