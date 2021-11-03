import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';
import Token from './artifacts/contracts/Token.sol/Token.json';

import './App.css';

interface CustomWindow extends Window {
  ethereum?: any;
}

const customWindow: CustomWindow = window;

function App() {
  const [greeting, setGreeting] = useState('');
  const [updatingGreeting, setUpdatingGreeting] = useState(false);
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('');
  const [sendingCoin, setSendingCoin] = useState(false);

  // request access to the user's MetaMask account
  async function requestAccount() {
    await customWindow.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getBalance() {
    if (typeof customWindow.ethereum !== 'undefined') {
      const [account] = await customWindow.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const provider = new ethers.providers.Web3Provider(customWindow.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_TOKEN_ADDRESS!,
        Token.abi,
        provider
      );
      const balance = await contract.balanceOf(account);
      setBalance(
        Number(balance).toLocaleString('en-US', {
          style: 'currency',
          currency: 'JBT',
        })
      );
    }
  }

  async function sendCoins(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      if (typeof customWindow.ethereum !== 'undefined') {
        setSendingCoin(true);
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(
          customWindow.ethereum
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.REACT_APP_TOKEN_ADDRESS!,
          Token.abi,
          signer
        );
        const transation = await contract.transfer(userAccount, amount);
        await transation.wait();
        setSendingCoin(false);
        getBalance();
        alert(`${amount} Coins successfully sent to ${userAccount}`);
      }
    } catch (error) {
      setSendingCoin(false);
    }
  }

  async function fetchGreeting() {
    if (typeof customWindow.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(customWindow.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_GREETER_ADDRESS!,
        Greeter.abi,
        provider
      );
      try {
        const data = await contract.greet();
        setGreeting(data);
      } catch (err) {
        console.log('Error: ', err);
      }
    }
  }

  // call the smart contract, send an update
  async function updateGreeting() {
    if (!greeting) return;
    if (typeof customWindow.ethereum !== 'undefined') {
      setUpdatingGreeting(true);
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(customWindow.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_GREETER_ADDRESS!,
        Greeter.abi,
        signer
      );
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      setUpdatingGreeting(false);
      alert('Greeting text updated');
      fetchGreeting();
    }
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateGreeting();
  }

  useEffect(() => {
    fetchGreeting();
    getBalance();
  }, []);

  return (
    <div className='App'>
      <p>{greeting || 'Add a greeting'}</p>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor='greeting'>Enter greeting</label>
        <input
          type='text'
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          required
          id='greeting'
        />
        <button disabled={updatingGreeting} type='submit'>
          {updatingGreeting ? 'Saving...' : 'Save new greeting'}
        </button>
      </form>
      <hr />
      <form onSubmit={sendCoins}>
        <legend>Balance: {balance}</legend>
        <label htmlFor='amount'>Enter amount to transfer</label>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          id='amount'
        />
        <input
          type='text'
          value={userAccount}
          onChange={(e) => setUserAccount(e.target.value)}
          required
          id='amount'
        />
        <button disabled={sendingCoin} type='submit'>
          {sendingCoin ? 'Sending coin..' : 'Send coin'}
        </button>
      </form>
    </div>
  );
}

export default App;
