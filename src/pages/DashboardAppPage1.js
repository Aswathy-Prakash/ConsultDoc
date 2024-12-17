import React, { useState } from 'react';
import Web3 from 'web3';
import Main11 from './Main11'
import candreg from '../abis/CandReg.json'
// ----------------------------------------------------------------------


class DashboardAppPage1 extends React.Component {
  constructor(props) {
  super(props);
  this.state = {
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
  
async loadBlockchainData() {
  const web3 = window.web3;
  let i; 
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const networkData = candreg.networks[networkId];
  if (networkData) {
    this.setState({ loading: false });
  } else {
    window.alert('Candidate contract not deployed to detected network.');
  }
}



render() {
    return (
       <Main11
          loading={this.state.loading}
         />
        
          );
  }
  }
export default DashboardAppPage1;