import { useWeb3React } from '@web3-react/core'
import { UserRejectedRequestError } from '@web3-react/injected-connector'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { injected } from '../connectors'
import useContract from '../hooks/useContract'
import useENSName from '../hooks/useENSName'
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding'
import bettingAbi from '../contracts/bettingAbi'
import addresses from '../contracts/addresses'
import { sendData } from 'next/dist/server/api-utils'
import React from 'react'
const abi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [],
    name: 'contractAdd',
    outputs: [{ internalType: 'contract Betting', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string[]', name: '_cars', type: 'string[]' },
      { internalType: 'address[]', name: '_mem', type: 'address[]' },
    ],
    name: 'createNewRace',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getEth',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getWinner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'running',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
]

type AccountProps = {
  triedToEagerConnect: boolean
}

type TransactionData = {
  fileNameHash: string
  dataHash: String
}

const Participate = ({ triedToEagerConnect, data }) => {
  const { active, error, activate, chainId, account, setError } = useWeb3React()
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const contract = new ethers.Contract(addresses.mainContract, abi, signer)
  var [alreadParticipated, setAlreadyParticipated] = useState(false)
  var [parts, setParts] = useState([])
  var [cars, setCars] = useState([])
  var carsHt = []
  var [loaded, setLoaded] = useState(false)
  var [bettingContractAd, setBettingContractAd] = useState('')
  var [voted, setVoted] = useState(false)
  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
  } = useMetaMaskOnboarding()

  async function SendData() {
    const ad = await contract.contractAdd()
    setBettingContractAd(ad)
    console.log(ad)
    const bettingContract = new ethers.Contract(ad, bettingAbi, signer)
    const parts = await bettingContract.getParticipants()
    setParts(parts)
    for (const x in parts) {
      if (parts[x] == account) {
        setAlreadyParticipated(true)
      }
    }
    const voteVal = await checkIfVoted()
    //console.log(voteVal);
    if (!voteVal) {
      const _cars = await bettingContract.getCars()
      var arCars = [];
      for (const x in _cars) {
        arCars.push(_cars[x])
        carsHt.push(
          <button
            onClick={() => {
              voteCar(_cars[x])
            }}
          >
            {_cars[x]}
          </button>,
        )
      }
      setCars(arCars);
    }
  }

  if (!loaded) {
    SendData()
    setLoaded(true)
  }

  var voteCar = async (carName) => {
    const bettingContract = new ethers.Contract(
      bettingContractAd,
      bettingAbi,
      signer,
    )
    const voteTx = bettingContract.voteWinner(carName)
    console.log(voteTx)
  }

  async function checkIfVoted() {
    const ad = await contract.contractAdd()
    const bettingContract = new ethers.Contract(ad, bettingAbi, signer)
    const voteTx = await bettingContract.voted(account.toString())
    console.log('voted', voteTx)
    setVoted(voteTx)
    return voteTx
  }
  async function getWinner() {
    await contract.getWinner()
  }

  async function enterRace(carName) {
    const bettingAdd = await contract.contractAdd()
    const bettingContract = new ethers.Contract(bettingAdd, bettingAbi, signer)
    const options = { value: ethers.utils.parseEther('0.1') }
    const reciept = await bettingContract.participate(carName, options)
  }
  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false)
  useEffect(() => {
    if (active || error) {
      setConnecting(false)
      stopOnboarding()
    }
  }, [active, error, stopOnboarding])

  if (error) {
    return null
  }

  if (!triedToEagerConnect) {
    return null
  }

  if (typeof account !== 'string') {
    return (
      <div>
        {isWeb3Available ? (
          <button
            disabled={connecting}
            onClick={() => {
              setConnecting(true)
              activate(injected, undefined, true).catch((error) => {
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false)
                } else {
                  setError(error)
                }
              })
            }}
          >
            {isMetaMaskInstalled ? 'Connect to MetaMask' : 'Connect to Wallet'}
          </button>
        ) : (
            <div>
                <input></input>
          <button onClick={startOnboarding}>Install Metamask</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {
        !voted ?
        (alreadParticipated ? (
          cars.map((x) => (
            <button
              className="bg-blue-700 p-5 m-7 px-7"
              key={x}
              onClick={() => {
                voteCar(x)
              }}
            >
                Vote for {x}
            </button>
          ))
        ) : (
        cars.map((x) => (
            <button
                className="bg-blue-700 p-5 m-7 px-7"
                key={x}
                onClick={() => {
                enterRace(x)
                }}
            >
                Bet On {x}
            </button>
            ))
        )): (
            <button onClick={getWinner}>Get Winner</button>
        )
    }
    </div>
  )
}

export default Participate
