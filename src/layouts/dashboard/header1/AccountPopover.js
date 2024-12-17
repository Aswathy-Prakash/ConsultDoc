import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Divider, Typography, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Web3 from 'web3';
// import account from '../../../_mock/account';
// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => { 
    if (web3 && account) {
      try {
        await web3.eth.accounts.wallet.clear();
        setAccount(null);
        console.log('Logged out successfully');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    } 
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) { 
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setWeb3(web3);
        setAccount(accounts[0]);
        console.log('Connected to wallet:', accounts[0]);
      } else {
        console.error('No ethereum provider found');
      }
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
    } 
  };

  return ( 
    <>
      {account ? (
        <IconButton onClick={handleOpen} 
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}>
        <Avatar src={account.photoURL} alt="photoURL" />
         
        </IconButton>
      ) : (
        <IconButton onClick={connectWallet}>
          <Avatar src="/static/icons/ic_wallet.svg" alt="wallet" />
        </IconButton>
      )}

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        {account && (
          <Box sx={{ my: 1.5, px: 2.5 }}>
            <Typography variant="subtitle2" noWrap>
              {account}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {account.email}
          </Typography>
          </Box>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
