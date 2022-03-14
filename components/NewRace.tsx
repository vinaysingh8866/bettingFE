import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { injected } from "../connectors";
import useContract from "../hooks/useContract";
import useENSName from "../hooks/useENSName";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import addresses from "../contracts/addresses";
const abi =[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"contractAdd","outputs":[{"internalType":"contract Betting","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string[]","name":"_cars","type":"string[]"},{"internalType":"address[]","name":"_mem","type":"address[]"}],"name":"createNewRace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"running","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}] 
type AccountProps = {
  triedToEagerConnect: boolean;
};

type TransactionData = {
    fileNameHash:string,
    dataHash:String
};

const NewRace = ({ triedToEagerConnect, data }) => {

  const { active, error, activate, chainId, account, setError } = useWeb3React();

  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
  } = useMetaMaskOnboarding();

  async function SendData(){
    console.log(data)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const contract = new ethers.Contract(
        addresses.mainContract,
        abi,
        signer
    );
    const tx = await contract.createNewRace(["red", "blue", "pink"],[]);
    console.log(tx)
    //
  }

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  const ENSName = useENSName(account);

  if (error) {
    return null;
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== "string") {
    return (
      <div>
        {isWeb3Available ? (
          <button
            disabled={connecting}
            onClick={() => {
              setConnecting(true);

              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false);
                } else {
                  setError(error);
                }
              });
            }}
          >
            {isMetaMaskInstalled ? "Connect to MetaMask" : "Connect to Wallet"}
          </button>
        ) : (
          <button onClick={startOnboarding}>Install Metamask</button>
        )}
      </div>
    );
  }

  return (
    <button onClick={SendData}>
      New Race 
    </button>
  );
};

export default NewRace;



