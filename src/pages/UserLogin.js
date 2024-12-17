import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Link, Container, Typography } from '@mui/material';
import useResponsive from '../hooks/useResponsive';
import { UserloginForm } from '../sections/auth/login';

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

export default function UserLogin() {
  const mdUp = useResponsive('up', 'md');

  return (
    <>
      <Helmet>
        <title> User Login | Consult </title>
      </Helmet>

      <StyledRoot>
        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom style={{ color: 'teal', fontSize: '2rem' }}>
              Sign in as Patient
            </Typography>

            <Typography variant="body2" sx={{ mb: 5 }}>
              Don’t have an account?{' '}
              <Link component={RouterLink} to="/user/signup" variant="subtitle2" style={{color:'teal'}}>
                Create Account
              </Link>
            </Typography>

            <UserloginForm />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
