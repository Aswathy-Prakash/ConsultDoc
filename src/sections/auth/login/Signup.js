import React, { useState } from 'react';
import Web3 from 'web3';
import Main2 from './Main2'
import candreg from '../../../abis/CandReg.json'

// ----------------------------------------------------------------------
 

class Signup extends React.Component {
  constructor(props) {
  super(props);
  this.state = {
    account: '',
    userCount: 0,
    users: [], 
    loading: true
  };
  this.createUser = this.createUser.bind(this);
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
    this.setState({ candireg });
    const userCount = await candireg.methods.userCount().call();
    this.setState({ userCount});

    
    // Load products
    const users = await Promise.all(
      Array.from({ length: userCount }, (value, index) =>
        candireg.methods.users(index + 1).call()
      )
    );
    // end
    this.setState({ users, loading: false });
  } else {
    window.alert('Candidate contract not deployed to detected network.');
  }
}

createUser(fullname, email2, upassword, cupassword){
    this.setState({ loading: true });
    this.state.candireg.methods
      .createUser(fullname, email2, upassword, cupassword)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      });
  }

render() {
    return (
       <Main2
          users={this.state.users}
          createUser={this.createUser}
          userCount={this.state.userCount}
          loading={this.state.loading}
         />
        
        );
    }
  }
export default Signup;
