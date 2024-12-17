import React, { useState } from 'react';
import Web3 from 'web3';
import Main1 from './Main1'
import candreg from '../../../abis/CandReg.json'

// ----------------------------------------------------------------------
 

class Signup2 extends React.Component {
  constructor(props) {
  super(props);
  this.state = {
     account: '',
    loading: true
  };
  this.loadWeb3 = this.loadWeb3.bind(this); // bind loadWeb3
  this.loadBlockchainData = this.loadBlockchainData.bind(this);
}
 
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await this.window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData () {
  const web3 = window.web3;
  // Load account
  const accounts = await web3.eth.getAccounts();
  this.setState({ account: accounts[0] });
  const networkId = await web3.eth.net.getId();
  const networkData = candreg.networks[networkId];
  if (networkData) {
    const candireg = web3.eth.Contract(candreg.abi, networkData.address);
  } else {
    window.alert('Candidate contract not deployed to detected network.');
  }
}


render() {
    return (
       <Main1
          loading={this.state.loading}
          account={this.state.account}
         />
        
        );
    }
  }
export default Signup2;
