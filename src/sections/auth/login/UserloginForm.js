import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
// @mui
import { Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useAppContext, AppContext } from "../../../lib/contextLib";
import Iconify from '../../../components/iconify';
import CandReg from '../../../abis/CandReg.json';
// ----------------------------------------------------------------------

const UserloginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [CandRegContract, setCandRegContract] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, userHasAuthenticated  } = useAppContext();

  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3);
        } else if (window.web3) {
          const web3 = new Web3(window.web3.currentProvider);
          setWeb3(web3);
        } else {
          window.alert(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Load web3 only if it's not already loaded
    if (!web3) {
      loadWeb3();
    } else {
      // If web3 is already loaded, load account and contract
      const loadAccount = async () => {
        try {
          const accounts = await web3.eth.getAccounts();
          console.log("Accounts loaded successfully:", accounts);
          setAccount(accounts[0]);
        } catch (error) {
          console.error("Error loading accounts:", error);
        }
      };
  
      const loadContract = async () => {
        try {
          const networkId = await web3.eth.net.getId();
          const networkData = CandReg.networks[networkId];
          if (networkData) {
            const { abi } = CandReg;
            const { address } = networkData;
            const contract = new web3.eth.Contract(abi, address);
            console.log(contract);
            setCandRegContract(contract);
          } else {
            window.alert("Smart contract not deployed to detected network.");
          }
        } catch (error) {
          console.error("Error loading contract:", error);
        }
      };
  
      // Load account and contract only if web3 is loaded and they are not already loaded
      if (web3 && !account) {
        loadAccount();
      }
  
      if (web3 && !CandRegContract) {
        loadContract();
      }
    }
  }, [web3, account, CandRegContract]); // Dependency array includes web3, account, and candRegContract
  


  // const handleEmailChange = (event) => {
  //   setEmail(event.target.value);
  // }

  // const handlePasswordChange = (event) => {
  //   setPassword(event.target.value);
  // }

  const handleLogin = async () => {
    try {
      if (!CandRegContract) {
        alert('Smart contract not loaded yet. Please wait and try again.');
        return;
      }

      if (email.trim() === '' || password.trim() === '') {
        console.log("mmm",email);
        alert('Please enter email and password');
        return;
      }

      const result = await CandRegContract.methods.ulogin(email, password).call({ from: account });
      // console.log("results", result);
      // console.log("results", result[0]);
      // const uEmail = result[0];
      // const uPassword = result[1];
      // console.log("uEmail",uEmail);
      // console.log("uPassword:", uPassword);

      if (result) {
        userHasAuthenticated(true);
        navigate('/user/dashboard/app', { replace: true });
      } else {
        userHasAuthenticated(false);
        alert('Invalid email or password');
      }
    } catch (error) {
      console.log(error);
      alert('Error retrieving data from the blockchain');
    }
  };

  return (
    <>
      <Stack spacing={3}>

        <TextField name="email" label="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
        sx={{
          '& label': {
            color: 'teal', // Label color
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'teal', // Border color
            },
            '& input': {
              color: 'teal', // Text color
            },
            '&.Mui-focused fieldset': {
              borderColor: 'teal', // Border color when focused
            },
            '&.Mui-focused label': {
              color: 'teal', // Label color when focused
            },
          },
        }}
        InputLabelProps={{ style: { color: "teal" }}}/>
 
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& label': {
              color: 'teal', // Label color
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'teal', // Border color
              },
              '& input': {
                color: 'teal', // Text color
              },
              '&.Mui-focused fieldset': {
                borderColor: 'teal', // Border color when focused
              },
              '&.Mui-focused label': {
                color: 'teal', // Label color when focused
              },
            },
          }}
          InputLabelProps={{ style: { color: "teal" }}}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      
      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleLogin} style={{backgroundColor:'teal'}}>
        Login
      </LoadingButton></Stack>
    </> 
  );
}

export default UserloginForm;  