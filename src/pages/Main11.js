import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
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
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import CandReg from '../abis/CandReg.json';
import './styles.css';

// ----------------------------------------------------------------------

const ProductsPage = () => {

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
  const [patientDataArray, setPatientDataArray] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    prescribe: ''
  });
  const navigate = useNavigate();
  

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
            const doctorData1 = await contract.methods.getRecordsByRecipientAddress(accounts[0]).call();
            console.log('Doctor Data:', doctorData1); 
            setPatientDataArray(doctorData1);     

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

const flattenedDataWithId = patientDataArray.map((data, index) => ({
  id: index, 
  ...data,
}));

  const TABLE_HEAD = [
    { id: 'accno', label: 'Doctor Address', alignRight: false },
    { id: 'patacc', label: 'Patient Address', alignRight: false },
    { id: 'date', label: 'Prescription Date', alignRight: false },
    { id: 'time', label: 'Prescription Time', alignRight: false },
    { id: 'prescribe', label: 'Prescription', alignRight: false },
    { id: 'signature', label: 'Doctor Signature', alignRight: false },
    { id: 'pres', label: 'Print', alignRight: false },
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
        const biometricMatch = cndData?.date.toLowerCase().includes(normalizedQuery);
        const symptomsMatch = cndData?.prescribe.toLowerCase().includes(normalizedQuery);
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


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - patientDataArray.length) : 0;

  const flattenedDataWithIds = applySortFilter(flattenedDataWithId, getComparator(order, orderBy), filterName);

  const isNotFound = !flattenedDataWithIds?.length && !!filterName;
  const handleOpenForm = (event, rowData) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setFormData({
      ...formData,
      recipientAddress: rowData.senderAccount,
    });
    handlePrintPDF(rowData);
  };
  

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  
  const handlePrintPDF = (rowData) => {
    const content = TABLE_HEAD.slice(0, -1).map((headCell) => {
      const cellValue = `${headCell.label}: ${rowData[headCell.id]}\n`;
      return cellValue;
    }).join('');
  
    const currentDate = new Date();
    const formattedDate = `Printed on: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}\n`;
  
    const formattedContent = `Doctor Prescription:\n${content}${formattedDate}\n`;
  
    const pdfContent = document.createElement('div');
    pdfContent.innerText = formattedContent;
  
    html2pdf(pdfContent, {
      margin: 15,
      filename: `prescription_${rowData.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    });
  };

  const handleRowClick = (row, event) => {
    const isLastCell = event.target.tagName === 'BUTTON';
  
    if (!isLastCell) {
      setSelectedRow(row);
      setIsDialogOpen(true);
    }
  };
  

  const handleCloseDialog = () => {
    setSelectedRow(null);
    setIsDialogOpen(false);
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
                  onRequestSort={handleRequestSort}
                />
 
                <TableBody >

                {flattenedDataWithIds?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const { id, accno, patacc, date, time, prescribe, signature } = row;
                  return (
                    <TableRow hover key={id} id={`row-${id}`} onClick={(event) => handleRowClick(row, event)}>
                      <TableCell align="center" component="th" scope="row" padding="none">
                        <Typography variant="subtitle2" noWrap style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {accno}
                        </Typography>
                      </TableCell>

                      <TableCell align="left" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {patacc}
                      </TableCell>

                      <TableCell align="left" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {date}
                      </TableCell>

                      <TableCell align="left" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {time}
                      </TableCell>

                      <TableCell align="left" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prescribe}
                      </TableCell>

                      <TableCell align="left" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {signature}
                      </TableCell>

                      <TableCell align="left">
                      <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      onClick={(event) => handleOpenForm(event, row)}
                    >
                      Print
                    </LoadingButton>

                      </TableCell>
                    </TableRow>
                  );
                })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 10 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
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
            count={patientDataArray?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

        </Card>
      </Container>
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <form>
              {Object.keys(selectedRow).map((key) => {
                if (['id', 'accno', 'patacc', 'date', 'time', 'prescribe', 'signature'].includes(key)) {
                  return null;
                }
                let label = key;
                // Customize labels
                if (key === '0') label = 'Doctor Account';
                if (key === '1') label = 'Patient Account';
                if (key === '2') label = 'Prescription Date';
                if (key === '3') label = 'Prescription Time';
                if (key === '4') label = 'Prescription';
                if (key === '5') label = 'Doctor signature';
                return (
                  <TextField
                    key={key}
                    margin="normal"
                    fullWidth
                    label={label}
                    value={selectedRow[key]}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                );
              })}
            </form>
          )}
        </DialogContent>
      </Dialog>





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