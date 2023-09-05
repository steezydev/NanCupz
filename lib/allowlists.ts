import cupzlist from "./lists/cupzlist.json";
import potlist from "./lists/potlist.json";
import whitelist from "./lists/whitelist.json";

const allowlists = {
  potlist: {
    amount: 3,
    wallets: potlist,
  },
  whitelist: {
    amount: 2,
    wallets: whitelist,
  },
  cupzlist: {
    amount: 1,
    wallets: cupzlist,
  },
};

export default allowlists;
