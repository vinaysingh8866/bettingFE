import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Account from "../components/Account";
import NewRace from "../components/NewRace";
import useEagerConnect from "../hooks/useEagerConnect";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import Participate from "../components/Participate";
import addresses from "../contracts/addresses";
const abi =[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"contractAdd","outputs":[{"internalType":"contract Betting","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string[]","name":"_cars","type":"string[]"},{"internalType":"address[]","name":"_mem","type":"address[]"}],"name":"createNewRace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"running","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}] 
const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";



type TransactionData = {
  fileNameHash:string,
  dataHash:String
};

const Home = () => {
  var [data, setdata] = useState({
    fileNameHash:"No file Selected",
    dataHash:""
  });

  var [runningBool, setRunningBool] = useState(false);
  const { active, error, activate, chainId, account, setError,library } = useWeb3React();

  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
  } = useMetaMaskOnboarding();

  function modifyData(fileNameHash, dataHash){
   
   setdata({
     fileNameHash : fileNameHash, 
     dataHash : dataHash
    });
  }
  
  useEffect(() => {
    isRunning();
  }, []);

  async function isRunning(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const contract = new ethers.Contract(
        addresses.mainContract,
        abi,
        signer
    );
    const tx = await contract.running();
    console.log(tx);
    setRunningBool(tx);
    return tx;
    //
  }

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;
  
  return (
    <div className="bg-blue-100 main-page">
      <Head>
        <title>Mediatimestamp Hash</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            
              <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
               
                <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex gap-x-96 items-stretch justify-start">
              <div className="flex items-stretch text-white text-2xl">
              Mediatimestamp Hash
              </div>
              <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4 text-yellow-300">
                <Account triedToEagerConnect={triedToEagerConnect} />
                </div>
              </div> 
            </div>
           
          </div>
        </div>

        
      </nav>
        
      </header>

      <main className="">
        {runningBool ? 
          <div><Participate triedToEagerConnect={triedToEagerConnect} data={""}></Participate></div>
          :
          <div><NewRace triedToEagerConnect={triedToEagerConnect} data={""}></NewRace></div>
        }
        
      </main>

      {/* <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
      `}</style> */}
    </div>
  );
}

export default Home;
