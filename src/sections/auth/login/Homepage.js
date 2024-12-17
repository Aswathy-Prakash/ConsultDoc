import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function Homepage() {
  const navigate = useNavigate();

  // const [showPassword, setShowPassword] = useState(false);

  const handleUserLoginClick = () => {
    navigate('/user', { replace: true });
  };

  const handleAdminLoginClick = () => {
    navigate('/admin', { replace: true });
  };

  return (
    <>
      <Stack spacing={3}>
        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleAdminLoginClick} style={{ backgroundColor: 'teal' }}>
        Doctor Login
      </LoadingButton>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleUserLoginClick} style={{ backgroundColor: 'teal' }}>
        User Login
      </LoadingButton>
      </Stack>
    </>
  );
}
