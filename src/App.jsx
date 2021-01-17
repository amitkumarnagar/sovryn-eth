// /* global BigInt */
import { useCallback, useEffect, useState } from 'react';
import './App.css';

import Web3 from 'web3';
import WeenusTokenABIJson from './WeenusTokenABI.json';
import TransferForm from './TransactionForm';

const WEENUS_TOKEN_ADDRESS = '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA';

// const transformBalance = (balance, decimals = 18) => BigInt(balance) / BigInt(10 ** decimals - 1);
const transformBalance = (balance, decimals = 18) =>
  balance / 10 ** decimals - 1;

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [accounts, setAccounts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [ethereumBalance, setEthereumBalance] = useState(0);
  const [weenusTokenBalance, setWeenusTokenBalance] = useState();

  const getAccountInfo = async account => {
    try {
      return await window.web3.eth.getBalance(account);
    } catch (e) {
      console.log('UNABLE TO GET BALANCE: ', e);
    }
  };

  const requestAccounts = useCallback(async () => {
    try {
      const accounts = await window.web3.eth.requestAccounts();
      const defaultAccount = accounts?.[0];
      if (defaultAccount) {
        window.web3.eth.defaultAccount = accounts?.[0];
        setSelectedAddress(defaultAccount);
        const ethBalance = await getAccountInfo(defaultAccount);
        setEthereumBalance(transformBalance(ethBalance));
        const weenusBalance = await getAccountInfo(WEENUS_TOKEN_ADDRESS);
        setWeenusTokenBalance(weenusBalance);
        initContract();
      }
      setAccounts(accounts);
    } catch (e) {
      console.log('Can not connect to ethereum: ', e);
    }
  }, []);

  const initContract = async () => {
    const contract = await new window.web3.eth.Contract(
      WeenusTokenABIJson,
      WEENUS_TOKEN_ADDRESS
    );
    window.contract = contract;
    console.log('contract ', contract);
  };

  const initEth = useCallback(async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      requestAccounts();
      window.ethereum.autoRefreshOnNetworkChange = false;
      window.ethereum.on('accountsChanged', async accounts => {
        if (accounts?.length) {
          getAccountInfo(accounts[0]);
        } else {
          setSelectedAddress(null);
          setIsConnected(false);
          setEthereumBalance(0);
        }
      });

      window.ethereum.on('chainChanged', chainId => {
        console.log('CHAIN CHANGED => ', chainId);
        window.location.reload();
      });
      window.ethereum.on('connect', chainId =>
        console.log('CONNECTED CHAIN ID: ', chainId)
      );
      window.ethereum.on('disconnect', chainId =>
        console.log('CONNECTED CHAIN ID: ', chainId)
      );
      window.ethereum.on('message', message =>
        console.log('NEW MESSAGE: ', message)
      );
      setIsConnected(true);
      return true;
    }
    alert(
      'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
    );
    return false;
  }, [requestAccounts]);

  useEffect(() => {
    initEth();
  }, [initEth]);

  useEffect(() => {
    if (selectedAddress) getAccountInfo(selectedAddress);
  }, [selectedAddress]);

  const onTransactionSubmitted = async () => {
    const updatedBalance = await getAccountInfo(selectedAddress);
    setEthereumBalance(updatedBalance);
  };

  return (
    <div className="App">
      {isConnected ? (
        <>
          <h4>Ethereum wallet connected: {selectedAddress}</h4>
          <h4>rETH balance: {ethereumBalance}</h4>
          <h4>Weenus token balance: {weenusTokenBalance}</h4>
          <TransferForm
            accountBalance={ethereumBalance}
            myAccount={selectedAddress}
            onTransactionSubmitted={onTransactionSubmitted}
          />
        </>
      ) : (
          <button className="btn" onClick={initEth}>
            Connect to MetaMask
          </button>
        )}
    </div>
  );
};

export default App;
