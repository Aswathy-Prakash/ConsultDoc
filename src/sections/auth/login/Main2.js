import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import { Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../components/iconify';
import CandReg from '../../../abis/CandReg.json'


// ----------------------------------------------------------------------
const Main2 = (props) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [CandRegContract, setCandReg] = useState(CandReg);
  const [showPassword, setshowPassword] = useState(false);
  const [showPassword1, setshowPassword1] = useState(false);
  const navigate = useNavigate();

 useEffect(() => {
  const loadWeb3 = async () => {
    try {
      // Load Web3
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }

      // Load Account
      const accounts = await window.web3.eth.getAccounts();
      setAccount(accounts[0]);

      // Load Smart Contract
      const networkId = await window.web3.eth.net.getId();
      const networkData = CandRegContract?.networks[networkId];
      if (networkData) {
        const abi = CandReg.abi;
        const address = networkData.address;
        const contract = new window.web3.eth.Contract(abi, address);
        setCandReg(contract);
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }
    } catch (error) {
      console.error(error);
    }
  };

    loadWeb3();
  }, [web3]);

  
  const setShowPassword = () => {
    // this.setState(prevState => ({showPassword: !prevState.showPassword}));
    setshowPassword(!showPassword);
  }

  const setShowPassword1 = () => {
    // this.setState(prevState => ({showPassword: !prevState.showPassword}));
    setshowPassword1(!showPassword1);
  }



  const handleSubmit = async (event) => { 
    event.preventDefault();
    const Fullname = event.target.fullname.value;
    const Email2 = event.target.email2.value;
    const Upassword = event.target.upassword.value;
    const Ucpassword = event.target.ucpassword.value;
    if (Upassword !== Ucpassword) {
      alert("Passwords do not match. Please enter matching passwords.");
      return;
    }
    const message = {
    types: {
      SignUp: [
        { name: 'Fullname', type: 'string' },
        { name: 'Email2', type: 'string' },
      ],
    },
    primaryType: 'SignUp',
    domain: {
      name: 'CandReg',
      chainId: 0x539,
    },
    message: {
      Fullname,
      Email2,
    },

  };
   const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [account, JSON.stringify(message)],
    });
    
    createUser(Fullname, Email2, Upassword, signature);
  };

  const createUser = async (Fullname, Email2, Upassword, signature) => {

    function isStrongPassword(password) {
  // Check that the password is at least 8 characters long
  if (password.length < 8) {
    return false;
  }

  // Check that the password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check that the password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check that the password contains at least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // Check that the password contains at least one special character
  if (!/[!@#$%^&*]/.test(password)) {
    return false;
  }

  return true;
}

    try {
      const isPasswordStrong = isStrongPassword(Upassword);

    if (!isPasswordStrong) {
      // Password is not strong enough, display error message
      alert("Password is not strong enough! Check that the password is at least 8 characters long and contains at least one uppercase letter, lowercase letter, number and special character");
      return;
    }
    const hashedPassword = window.web3.utils.keccak256(Upassword);
      const result = await CandRegContract.methods
        .createUser(Fullname, Email2, hashedPassword, signature)
        .send({ from: account });
        navigate('/user', { replace: true });
      console.log(result);
     // history.push('/user');
    } catch (error) {
      alert("User already exists. Try login in with your registered mailid and password.");
    }
  };

  return (
    <>
       
      <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField name="fullname" label="Full name" sx={{
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

        <TextField name="email2" label="Email address" sx={{
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
          name="upassword"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <Iconify
                icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                sx={{ cursor: 'pointer' }}
                onClick={setShowPassword}
              />
            ),
          }} 
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
        />
 
        <TextField
          name="ucpassword"
          label="Confirm Password"
          type={showPassword1 ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <Iconify
                icon={showPassword1 ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                sx={{ cursor: 'pointer' }}
                onClick={setShowPassword1}
              />  
              ),
          }}
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
        />

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onSubmit={handleSubmit} style={{backgroundColor:'teal'}} >
        Create Account
      </LoadingButton>
      </Stack>
     
      </form>
      
    </>
   );
}


// export default withRouter(Main2);
export default Main2;