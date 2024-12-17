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
// components
// import ipfs from 'ipfs-http-client';

import { LoadingButton } from '@mui/lab';

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



const ProductsPage = () => {

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [CandRegContract, setCandRegContract] = useState(null);
  const [cndData, setcndData] = useState(null);
  // const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('fullname');
  const [open, setOpen] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const dataFetched = useRef(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // const [patientData, setPatientData] = useState(null);
  const [patientDataArray, setPatientDataArray] = useState([]);
  const [decryptedData, setDecryptedData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    prescribe: '',
    date: new Date().toISOString().split('T')[0], // Set current date
    time: new Date().toTimeString().split(' ')[0], // Set current time
  });
  const [prescriptionStatus, setPrescriptionStatus] = useState({});
  const navigate = useNavigate();
  const [prescribedRows, setPrescribedRows] = useState({});


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
            const promises = [];
            for (let i = 0; i < doctorData.length; i += 1) {
              const currentDoctor = doctorData[i];
              const doctorOwnerAddress = currentDoctor.owner;
              if (doctorOwnerAddress.toLowerCase() === account.toLowerCase()) {
                const doctorEmail = currentDoctor.email;
                promises.push(contract.methods.getRecordsByRecipientEmail(doctorEmail).call());
              }
            }

            const filteredDoctors = doctorData.filter(currentDoctor => currentDoctor.owner.toLowerCase() === account.toLowerCase());
            console.log('Filtered Doctors:', filteredDoctors);

            const promises1 = filteredDoctors.map(currentDoctor => contract.methods.getRecordsByRecipientEmail(currentDoctor.email).call());
            console.log('Promises:', promises1);

            const patientDataArray = await Promise.all(promises);
            console.log('Patient Data Array:', patientDataArray);
            setPatientDataArray(patientDataArray);
            const flattenedArray = [];

            console.log(patientDataArray[0][0][0]);
            console.log(patientDataArray[0][0][1]);
            console.log(patientDataArray[0][0][2]);




            const db = firebase.database();
            const keyPairRef = db.ref('keypair');
            const decryptedArray = [];
            const decryptedDataArray = [];

            for (let i = 0; i < patientDataArray[0].length; i += 1) {
              const decryptedSubArray = [];

              for (let j = 0; j < patientDataArray[0][i].length; j += 1) {
                const isEncrypted = j < 3;

                if (isEncrypted) {
                  keyPairRef.once('value')
                    .then(snapshot => {
                      // Get the public key and private key from Firebase
                      const privateKeyPem = snapshot.val()[1];
                      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
                      const decryptedData = privateKey.decrypt(patientDataArray[0][i][j]);

                      decryptedSubArray.push(decryptedData);
                    });

                } else {
                  decryptedSubArray.push(patientDataArray[0][i][j]);
                }
              }

              decryptedDataArray.push(decryptedSubArray);
            }

            setDecryptedData(decryptedDataArray);
            console.log(decryptedDataArray);

          } else {
            window.alert("Smart contract not deployed to detected network.");
          }
          dataFetched.current = true;

        }
      } catch (error) {
        console.error(error);
      }
    };


    loadWeb3();
    fetchData();
  }, [web3]);

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    const Accountss = event.target.accno.value;
    const PatAccountss = event.target.patacc.value;
    const Date = event.target.date.value;
    const Time = event.target.time.value;
    const Prescribe = event.target.prescribe.value;

    const message = {
      types: {
        Message: [
          { name: 'Accountss', type: 'string' },

        ],
      },
      primaryType: 'Message',
      domain: {
        name: 'CandReg',
        chainId: 0x539,
      },
      message: {
        Accountss,

      },

    };
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [account, JSON.stringify(message)],
    });
    addPatientRecord(PatAccountss, Accountss, Date, Time, Prescribe, signature);
    setFormData({
      accno: '',
      patacc: '',
      prescribe: '',
    });
    handleCloseForm();

  };

  const addPatientRecord = async (PatAccountss, Accountss, Date, Time, Prescribe, signature) => {


    try {

      const result = await CandRegContract.methods
        .addPatientRecord(PatAccountss, Accountss, Date, Time, Prescribe, signature)
        .send({ from: account });
      navigate('/admin/dashboard/candidates', { replace: true });
      console.log(result);
      // history.push('/user');
    } catch (error) {
      alert("User already exists. Try login in with your registered mailid and password.");
    }
  };





  const flattenedData = patientDataArray.flat();
  const flattenedDataWithId = flattenedData.map((data, index) => ({
    id: index,
    ...data,
  }));





  const TABLE_HEAD = [
    { id: 'imag', label: 'Image', alignRight: false },
    { id: 'senderAccount', label: 'Patient Account Number', alignRight: false },
    
    { id: 'symptoms', label: 'Symptoms', alignRight: false },
    { id: 'medicationDetails', label: 'Medication Detials', alignRight: false },
    { id: 'biometric', label: 'Biometrics', alignRight: false },

    { id: 'pres', label: 'Prescribe', alignRight: false },
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
      return filter(array, (decryptedData) => {
        const biometricMatch = decryptedData?.biometric.toLowerCase().includes(normalizedQuery);
        const symptomsMatch = decryptedData?.symptoms.toLowerCase().includes(normalizedQuery);
        return biometricMatch || symptomsMatch;
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


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - decryptedData.length) : 0;

  const flattenedDataWithIds = applySortFilter(flattenedDataWithId, getComparator(order, orderBy), filterName);
  const isNotFound = !flattenedDataWithIds?.length && !!filterName;
  const handleOpenForm = (row) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    setFormData({
      ...formData,
      recipientAddress: row[1], // Update this line to access the sender account correctly
      date: currentDate,
      time: currentTime,
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title> Chat | Prescribe  </title>
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
                  // numSelected={selected?.length}
                  onRequestSort={handleRequestSort}
                // onSelectAllClick={handleSelectAllClick}
                />

                {/* <TableBody >
                  {decryptedData?.map((row, rowIndex) => (
                    <TableRow hover key={rowIndex}>
                      {row.map((value, colIndex) => (
                        // Skip elements at index 1 and 2
                        colIndex !== 1 && colIndex !== 2 && (
                          <TableCell key={colIndex} align="left">
                            <Typography variant="subtitle2" noWrap>
                              {value}
                            </Typography>
                          </TableCell>
                        )
                      ))}
                      <TableCell align="left">
                        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={() => handleOpenForm(row)} >
                          Message
                        </LoadingButton>



                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody> */}

{/* <TableBody>
        {decryptedData?.map((row, rowIndex) => (
          <TableRow hover key={rowIndex}>
            {row.map((value, colIndex) => (
              // Check if it's the 'img' field and render an image
              colIndex === 0 ? (
                <TableCell key={colIndex} align="left">
                  <img src={`data:image/jpeg;base64,${value}`} alt="Patient Biometric" />
                </TableCell>
              ) : (
                // Skip elements at index 1 and 2
                colIndex !== 1 && colIndex !== 2 && (
                  <TableCell key={colIndex} align="left">
                    <Typography variant="subtitle2" noWrap>
                      {value}
                    </Typography>
                  </TableCell>
                )
              )
            ))}
            <TableCell align="left">
              <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={() => handleOpenForm(row)}>
                Message
              </LoadingButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody> */}


<TableBody>
      {decryptedData?.map((row, rowIndex) => (
        <TableRow hover key={rowIndex}>
          {row.map((value, colIndex) => (
            // Check if it's the 'img' field and render an image
            colIndex === 0 ? (
              <TableCell key={colIndex} align="left">
  <div
    onClick={() => handleImageClick(value)}
    onKeyDown={(e) => e.key === 'Enter' && handleImageClick(value)}
    role="button"
    tabIndex={0}
    style={{ cursor: 'pointer' }}
  >
    <img
      src={value}
      alt="Patient Biometric"
      style={{ width: '100%', height: 'auto' }}
    />
  </div>
</TableCell>

            ) : (
              // Skip elements at index 1 and 2
              colIndex !== 1 && colIndex !== 2 && (
                <TableCell key={colIndex} align="left">
                  <Typography variant="subtitle2" noWrap>
                    {value}
                  </Typography>
                </TableCell>
              )
            )
          ))}
          <TableCell align="left">
            <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={() => handleOpenForm(row)}>
              Message
            </LoadingButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>

    {/* Dialog for displaying the larger image */}
    {/* <Dialog open={isImageDialogOpen} onClose={() => setIsImageDialogOpen(false)}>
      <DialogTitle>Image</DialogTitle>
      <DialogContent>
        {selectedImage && <img src={`data:image/jpeg;base64,${selectedImage}`} alt="" />}
      </DialogContent>
    </Dialog> */}

{/* <Dialog open={isImageDialogOpen} onClose={() => setIsImageDialogOpen(false)}>
  <DialogTitle>Image</DialogTitle>
  <DialogContent>
    {selectedImage && (
      <div>
        <img
          src={selectedImage} // Use the URL directly
          alt=""
          style={{ width: '100%', height: 'auto' }}
        />
        <div style={{ marginTop: '10px' }}>
          <a
            href={selectedImage} // Use the URL directly
            download="large_image.jpg"
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            Download Image
          </a>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog> */}


<Dialog open={isImageDialogOpen} onClose={() => setIsImageDialogOpen(false)}>
  <DialogTitle>Image</DialogTitle>
  <DialogContent>
    {selectedImage && (
      <div>
        <img
          src={selectedImage} // Use the URL directly
          alt=""
          style={{ width: '100%', height: 'auto' }}
        />
        <div style={{ marginTop: '10px' }}>
          <a
            href={selectedImage} // Use the URL directly
            download="large_image.jpg"
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={(e) => {
              e.preventDefault();
              // Open the download link in a new tab
              window.open(selectedImage, '_blank');
            }}
          >
            Download Image
          </a>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>



                <Dialog open={isFormOpen} onClose={handleCloseForm}>
                  <DialogTitle>Message</DialogTitle>
                  <DialogContent>
                    <form onSubmit={handleSubmitForm}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Your Account Number"
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
                        label="Patient's Account Number"
                        required
                        value={formData.recipientAddress}
                        id="patacc"
                        InputProps={{
                          readOnly: true,
                        }}
                        onClick={() => handleOpenForm(formData.senderAccount)}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Date"
                        type="date"
                        required
                        id="date"
                        InputLabelProps={{
                          shrink: true,
                          readOnly: true,
                        }}
                        value={formData.date}
                        onChange={handleFormChange}
                        name="date"
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Time"
                        type="time"
                        required
                        id="time"
                        InputLabelProps={{
                          shrink: true,
                          readOnly: true,
                        }}
                        inputProps={{
                          step: 300, // 5 minutes
                        }}
                        value={formData.time}
                        onChange={handleFormChange}
                        name="time"
                      />

                      <TextField
                        fullWidth
                        margin="normal"
                        label="Prescribe"
                        name="prescribe"
                        multiline
                        rows={10}
                        variant="filled"
                        value={formData.prescribe}
                        onChange={handleFormChange}
                      />
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
            count={decryptedData?.length}
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



export default ProductsPage;