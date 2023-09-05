import { MerkleTree } from "merkletreejs";
import allowlists from "./allowlists";
import keccak256 from "keccak256";

function getMerkelRoot(addresses: string[]) {
  const leafNodes = addresses.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });
  return "0x" + merkleTree.getRoot().toString("hex");
}

export const TOKEN_NAME = "Nan Cupz";
export const TOKEN_SYMBOL = "Cupz";
export const MERKLE_ROOT_POTLIST = getMerkelRoot(allowlists.potlist.wallets);
export const MERKLE_ROOT_WHITELIST = getMerkelRoot(
  allowlists.whitelist.wallets
);
export const MERKLE_ROOT_CUPZLIST = getMerkelRoot(allowlists.cupzlist.wallets);
export const BASE_URI = "https://mybaseuri.com/";
export const URI_SUFFIX = ".json";
export const UNREVEALED_URI = "https://myunrevealeduri.com/placeholder.json";
export const MAX_SUPPLY = 737; // for instance

// DEPLOYED CONTRACT ADDRESS AND NAME FOR VERIFICATION
export const DEPLOYED_CONTRACT_ADDRESS =
  "0xD366ab46e2ff64954de28354380f5C4a32825B4E";
export const CONTRACT_NAME = "NanCupz";
