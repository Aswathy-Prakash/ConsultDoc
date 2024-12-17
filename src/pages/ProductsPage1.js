import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Stack,
  Paper,
  Popover,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';
// import ipfs from 'ipfs-http-client';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

import firebase from '../firebase';

// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import CandReg from '../abis/CandReg.json';
import './styles.css';
// ----------------------------------------------------------------------
const forge = require('node-forge'); 



const ProductsPage1 = () => {

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [CandRegContract, setCandRegContract] = useState(null);
  const [cndData, setcndData] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('fullname');
  const [open, setOpen] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const dataFetched = useRef(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    biometric: '',
    medicationDetails: '',
    symptoms: '',
    image: null,
  });
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

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

    const fetchData = async () => {
      try {
        if (web3 && !dataFetched.current) {
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const networkData = CandReg.networks[networkId];
          if (networkData) {
            const { abi } = CandReg;
            const { address } = networkData;
            const contract = new web3.eth.Contract(abi, address);
            setCandRegContract(contract);

            const doctorData = await contract.methods.getDoctorData().call();
            setcndData(doctorData);
            console.log("Doctor Data from Smart Contract: ", doctorData);
            dataFetched.current = true;
          } else {
            window.alert("Smart contract not deployed to detected network.");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadWeb3();
    fetchData();
  }, [web3]);

  

  const handleImageChange = (e) => {
    // Handle image selection
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  // const handleUpload = () => {
  //   // Upload image to Firebase Storage
  //   const storageRef = firebase.storage().ref();
  //   const imageRef = storageRef.child(`images/${image.name}`);
  //   imageRef.put(image).then((snapshot) => {
  //     console.log('Image uploaded successfully!');
  //   });
  // };

  // const handleUpload = async () => {
  //   try {
  //     // Upload image to Firebase Storage
  //     const storageRef = firebase.storage().ref();
  //     const imageRef = storageRef.child(`images/${image.name}`);
  //     const snapshot = await imageRef.put(image);
  
  //     // Get download URL of the uploaded image
  //     const downloadURL = await snapshot.ref.getDownloadURL();
  
  //     // Log the download URL
  //     console.log('Image uploaded successfully. Download URL:', downloadURL);
  
  //     // Now you can use the downloadURL in your blockchain transaction
  //     // For example, you can set it in your formData for later use
  //     setFormData({
  //       ...formData,
  //       image: downloadURL,
  //     });
  
  //     // Continue with other logic or state updates
  
  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //   }
  // };
  

    // const handleSubmitForm = async (event) => {
    //   event.preventDefault();
    //   const Accountss = event.target.accno.value;
    //   const Biometrics = event.target.biometric.value;
    //   const Medication = event.target.medicationDetails.value;
    //   const Symptoms = event.target.symptoms.value;
    //   const RecipientMail = event.target.email.value;
    
    //   const db = firebase.database();
    //   const keyPairRef = db.ref('keypair');
    
    //   try {
    //     const snapshot = await keyPairRef.once('value');
    //     const publicKeyPem = snapshot.val()[0];
    //     const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    //     // Encrypt Biometrics, Medication, and Symptoms using the public key
    //     const encryptedBiometrics = publicKey.encrypt(Biometrics);
    //     const encryptedMedication = publicKey.encrypt(Medication);
    //     const encryptedSymptoms = publicKey.encrypt(Symptoms);
    //     const imageFile = formData.image;
    //   if (imageFile) {
    //     const reader = new FileReader();
    //     reader.onloadend = async () => {
    //       const imageBase64 = reader.result.split(',')[1];




    //       console.log('Image uploaded:', imageBase64);
    //     };

    //     reader.readAsDataURL(imageFile);
    //   }
    //     const message = {
    //       types: {
    //         Message: [
    //           { name: 'RecipientMail', type: 'string' },
    //           { name: 'Biometrics', type: 'string' },
    //           { name: 'Medication', type: 'string' },
    //           { name: 'Symptoms', type: 'string' },
    //         ],
    //       },
    //       primaryType: 'Message',
    //       domain: {
    //         name: 'CandReg',
    //         chainId: 0x539,
    //       },
    //       message: {
    //         RecipientMail,
    //         Biometrics: encryptedBiometrics,
    //         Medication: encryptedMedication,
    //         Symptoms: encryptedSymptoms,
    //       },
    //     };
    
    //     const signature = await window.ethereum.request({
    //       method: 'eth_signTypedData_v4',
    //       params: [account, JSON.stringify(message)],
    //     });
    
    //     const result = await CandRegContract.methods
    //       .addRecord(Accountss, encryptedBiometrics, encryptedMedication, encryptedSymptoms, imageBase64, RecipientMail, signature)
    //       .send({ from: account });
    
    //     navigate('/user/dashboard/app', { replace: true });
    //     console.log(result);
    //   } catch (error) {
    //     alert("Error: " );
    //   }
    // };
    

    const handleSubmitForm = async (event) => {
      event.preventDefault();
      const Accountss = event.target.accno.value;
      const Biometrics = event.target.biometric.value;
      const Medication = event.target.medicationDetails.value;
      const Symptoms = event.target.symptoms.value;
      const RecipientMail = event.target.email.value;
    
      const db = firebase.database();
      const keyPairRef = db.ref('keypair');
    
      let imageBase64; // Declare imageBase64 outside the reader.onloadend scope
    
      try {
        const snapshot = await keyPairRef.once('value');
        const publicKeyPem = snapshot.val()[0];
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
        // Encrypt Biometrics, Medication, and Symptoms using the public key
        const encryptedBiometrics = publicKey.encrypt(Biometrics);
        const encryptedMedication = publicKey.encrypt(Medication);
        const encryptedSymptoms = publicKey.encrypt(Symptoms);
        // const imageFile = formData.image;
    
        // if (imageFile) {
        //   const reader = new FileReader();
        //   reader.onloadend = async () => {
        //     imageBase64 = reader.result.split(',')[1];
        //     console.log('Image uploaded:', imageBase64);
        //   };
    
        //   reader.readAsDataURL(imageFile);
        // }

        const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`images/${image.name}`);
      const snapshot1 = await imageRef.put(image);
  
      // Get download URL of the uploaded image
      const downloadURL = await snapshot1.ref.getDownloadURL();
  
      // Log the download URL
      console.log('Image uploaded successfully. Download URL:', downloadURL);
  
      // Now you can use the downloadURL in your blockchain transaction
      // For example, you can set it in your formData for later use
      setFormData({
        ...formData,
        image: downloadURL,
      });
    
        const message = {
          types: {
            Message: [
              { name: 'RecipientMail', type: 'string' },
              { name: 'Biometrics', type: 'string' },
              { name: 'Medication', type: 'string' },
              { name: 'Symptoms', type: 'string' },
            ],
          },
          primaryType: 'Message',
          domain: {
            name: 'CandReg',
            chainId: 0x539,
          },
          message: {
            RecipientMail,
            Biometrics: encryptedBiometrics,
            Medication: encryptedMedication,
            Symptoms: encryptedSymptoms,
          },
        };
    
        const signature = await window.ethereum.request({
          method: 'eth_signTypedData_v4',
          params: [account, JSON.stringify(message)],
        });
    
        const result = await CandRegContract.methods
          .addRecord(Accountss, encryptedBiometrics, encryptedMedication, encryptedSymptoms, downloadURL, RecipientMail, signature)
          .send({ from: account });
    
        navigate('/user/dashboard/app', { replace: true });
        console.log(result);
      } catch (error) {
        console.error("Ethereum-related error:", error);
      }
    };
    



  const TABLE_HEAD = [
    { id: 'fullname', label: 'Name', alignRight: false },
    { id: 'email', label: 'Email', alignRight: false },
    { id: 'regnom', label: 'Registration Number', alignRight: false },
    { id: 'specialization', label: 'Specialization', alignRight: false },
    { id: 'msgbtn', label: 'Message', alignRight: false },
    // { id: 'callbtn', label: 'Call', alignRight: false },
  ];

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function applySortFilter(array, comparator, query) {
    const stabilizedThis = array?.map((el, index) => [el, index]);
    stabilizedThis?.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    if (query) {
      const normalizedQuery = query.toLowerCase();
      return filter(array, (cndData) => {
        const fullNameMatch = cndData?.fullname.toLowerCase().includes(normalizedQuery);
        const emailMatch = cndData?.email.toLowerCase().includes(normalizedQuery);
        const specializationMatch = cndData?.specialization.toLowerCase().includes(normalizedQuery);
        return fullNameMatch || emailMatch || specializationMatch;
      });
    }
    return stabilizedThis?.map((el) => el[0]);
  }



  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleLogin = async () => {
    const doctorData = await CandRegContract?.methods.getDoctorData().call();
    setcndData(doctorData);
    console.log("cnd", doctorData)
  }

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - cndData.length) : 0;

  const filteredUsers = applySortFilter(cndData, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers?.length && !!filterName;
  const handleOpenForm = (rowData) => {
    setFormData({
      ...formData,
      recipientMail: rowData.email, // Access email property of the clicked row
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData({
      ...formData,
      image: file,
    });
  };

  

  return ( 
    <>
      <Helmet>
        <title> Chat | Consult  </title>
      </Helmet>


      <Container >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom style={{ color: 'teal' }}>
            Chat
          </Typography>

        </Stack>
        <Card>
          <UserListToolbar filterName={filterName} onFilterName={handleFilterByName} />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table style={{ backgroundColor: 'rgba(0, 128, 128, 0.09)' }}>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={cndData?.length}
                  isShowCheckbox={false}
                  onRequestSort={handleRequestSort}
                />

                <TableBody >
                  {filteredUsers?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, fullname, email, regnom, specialization } = row;
                    // const selectedUser = selected.indexOf(fname) !== -1;
                    return (
                      <TableRow hover key={id} >

                        <TableCell align="center" component="th" scope="row" padding="none">

                          <Typography variant="subtitle2" noWrap>
                            {fullname}
                          </Typography>

                        </TableCell>

                        <TableCell align="left">{email}</TableCell>

                        <TableCell align="left">{regnom}</TableCell>

                        <TableCell align="left">{specialization}</TableCell>

                        <TableCell align="left">
                          <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={() => handleOpenForm(row)}>
                            Message
                          </LoadingButton>

                        </TableCell>

                      </TableRow>
                    )
                  }
                  )
                  }
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 10 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                <Dialog open={isFormOpen} onClose={handleCloseForm}>
                  <DialogTitle>Message</DialogTitle>
                  <DialogContent>
                    <form onSubmit={handleSubmitForm}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Account Number of Sender"
                        required
                        value={account}
                        id="accno"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="EmailId of Receiver"
                        required
                        value={formData.recipientMail}
                        id="email"
                        InputProps={{
                          readOnly: true,
                        }}
                        onClick={() => handleOpenForm(formData.recipientMail)}
                      />

                      <TextField
                        fullWidth
                        margin="normal"
                        label="Name, Age, Gender and Bloodgroup"
                        name="biometric"
                        value={formData.biometric}
                        onChange={handleFormChange}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Previous Medication Details"
                        name="medicationDetails"
                        value={formData.medicationDetails}
                        onChange={handleFormChange}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Symptoms"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleFormChange}
                      />
                      <input type="file" onChange={handleImageChange} style={{ marginBottom: '20px' }}/>
      {/* <button onClick={handleUpload}>Upload Image</button> */}
                      <LoadingButton fullWidth size="large" type="submit" variant="contained" >
                        Send
                      </LoadingButton>
                    </form>
                  </DialogContent>
                </Dialog>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}

              </Table>
            </TableContainer>
          </Scrollbar>
          

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={cndData?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

        </Card>
      </Container>
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>


    </>
  );
}



export default ProductsPage1;