import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import {Container, Typography } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
//  import Logo from '../components/logo';
// import Iconify from '../components/iconify';
// sections
import { Signup } from '../sections/auth/login';

// ----------------------------------------------------------------------


const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledRoot = styled('div')(({ theme }) => ({
  background: `url('/assets/illustrations/adminlogincover.jpg') no-repeat fixed`, // Set the background image
  // backgroundColor: 'rgba(255, 255, 255, 0.2)',
  backgroundSize: 'cover', // Scale the image to cover the container
  backgroundPosition: 'center', // Center the image both horizontally and vertically
  minHeight: '100vh', // Ensure the background covers the whole screen
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));



const StyledContent = styled('div')(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.0)', // Add a semi-transparent white background to make the content readable
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
}));


// ----------------------------------------------------------------------

export default function SignUpForm() {
  const navigate = useNavigate();
  const mdUp = useResponsive('up', 'md');

  const [showPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    navigate('/signup', { replace: true });
  };
 
  return (
    <>
    <Helmet>
        <title> User Signup | Consult  </title>
      </Helmet>

      <StyledRoot>

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom style={{ color: 'teal', fontSize: '2rem' }}>
              User Sign-Up
            </Typography>

            
         

            <Signup /> 
      
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
