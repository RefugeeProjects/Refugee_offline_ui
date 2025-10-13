//صفحة ملغاة
import React, { useCallback, useContext, useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Card,
  Grid,
  TextField,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  Box,
  FormGroup,
  Button,
  InputLabel,
  Divider,
} from '@mui/material';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { useApi } from '../../../utils';
import { appContext } from '../../../context/appContext';
import { NotificationMsg, DangerMsg } from '../../../components/NotificationMsg';
const styleBox = {
  bgcolor: 'background.paper',
  border: '2px solid #555',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

const styleGrid = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

const Addcharacterlocation = ({ open, handleToggle, modalProps, fetchData }) => {
  const { user } = useContext(appContext);
  const api = useApi();
  const [dataBody, SetData] = useState({
    letterID: '',
    reviewsitID: '',
  });

  // close modal event
  const onCloseModal = () => {
    SetData({
      letterID: '',
      reviewsitID: '',
    });
    handleToggle();
  };

  const addData = async () => {
    try {
      let payload = dataBody;

      const { success, data } = await api('POST', `mains/characterlocation`, payload);
      if (!success) {
        DangerMsg('اشعارت الاضافة', ' خطأ في اضافة البيانات');
        return;
      }
      // SetData([...data])
      fetchData();
      NotificationMsg('اشعارات الاضافة', 'تم الاضافة بنجاح');
      handleToggle();
      onCloseModal();
      // console.log("addData", data)
    } catch (err) {
      DangerMsg('اشعارت الاضافة', ' خطأ في اضافة البيانات');
      console.error(err);
    }
  };

  const saveClick = (e) => {
    e.preventDefault();

    addData();
  };
  const [letter, setLetter] = useState([]);
  const Letterfn = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/lettertype`);
      if (!success) {
        DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
        return;
      }
      setLetter(data?.records);
    } catch (err) {
      DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Letterfn();
  }, [Letterfn]);
  const [governs, setGoverns] = useState([]);
  const Governsfn = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/governs`);
      if (!success) {
        DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
        return;
      }
      setGoverns(data?.records);
    } catch (err) {
      DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);
  const [location, setLocation] = useState([]);
  const Locationfn = useCallback(async (id) => {
    try {
      const { success, data } = await api('GET', `mains/reviewsit/"governsID"/${id}`);
      if (!success) {
        DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
        return;
      }
      setLocation(data?.records);
    } catch (err) {
      DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Governsfn();
  }, [Governsfn]);
  return (
    <div>
      <Modal
        open={open}
        // onBackdropClick ={()=> console.log("opendModal")}
        onClose={() => handleToggle()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid container>
          <Grid
            item
            xs={12}
            sm={8}
            lg={6}
            xl={4}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
            }}
          >
            <Box sx={styleBox}>
              <div>
                <IconButton
                  aria-label="close"
                  color="default"
                  sx={{ position: 'fixed', left: '10px', top: '10px' }}
                  onClick={() => {
                    onCloseModal();
                  }}
                >
                  <Close />
                </IconButton>
                <FormGroup>
                  <Typography id="modal-modal-title" variant="h4" component="h2" mb={2}>
                    {modalProps === null ? 'اضافة جديد' : 'تعديل  التصنيف'}
                  </Typography>
                  <Grid container columnSpacing={2} rowSpacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                      {/* findingsID */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl fullWidth className="rtl leftSvgIcon">
                          <InputLabel id="findingsID-select-standard-label"> الحرف *</InputLabel>
                          <Select
                            labelId="findingsID-select-standard-label"
                            id="findingsID-select-standard"
                            value={dataBody?.governsID}
                            onChange={(e) => {
                              SetData({ ...dataBody, letterID: e.target.value || null });
                            }}
                            label="الحرف*"
                            variant="standard"
                          >
                            {letter?.map((finds, i) => {
                              return (
                                <MenuItem key={i} value={finds.id}>
                                  {finds.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      {/* findingsID */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl fullWidth className="rtl leftSvgIcon">
                          <InputLabel id="findingsID-select-standard-label"> المحافظة *</InputLabel>
                          <Select
                            labelId="findingsID-select-standard-label"
                            id="findingsID-select-standard"
                            // value={dataBody?.governsID}
                            onChange={(e) => {
                              Locationfn(e.target.value);
                            }}
                            label="المحافظة*"
                            variant="standard"
                          >
                            {governs?.map((finds, i) => {
                              return (
                                <MenuItem key={i} value={finds.id}>
                                  {finds.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      {/* findingsID */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl fullWidth className="rtl leftSvgIcon">
                          <InputLabel id="findingsID-select-standard-label"> موقع المراجعة *</InputLabel>
                          <Select
                            labelId="findingsID-select-standard-label"
                            id="findingsID-select-standard"
                            // value={dataBody?.governsID}
                            onChange={(e) => {
                              SetData({ ...dataBody, reviewsitID: e.target.value || null });
                            }}
                            label="موقع المراجعة*"
                            variant="standard"
                          >
                            {location?.map((finds, i) => {
                              return (
                                <MenuItem key={i} value={finds.id}>
                                  {finds.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>

                    <Grid
                      container
                      justifyContent={'center'}
                      columnSpacing={2}
                      rowSpacing={4}
                      sx={{ my: 2, mb: 0, ml: 'auto' }}
                    >
                      <Grid display={'flex'} justifyContent={'center'} item xs={6} pl={'initial !important'}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          sx={{ mx: 10, fontSize: '16px', mx: 0 }}
                          disabled={!(dataBody?.letterID && dataBody?.reviewsitID)}
                          onClick={(e) => {
                            saveClick(e);
                            onCloseModal();
                          }}
                        >
                          {modalProps === null ? 'اضافة جديد' : 'تعديل المعلومات'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </FormGroup>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Modal>
    </div>
  );
};

export default Addcharacterlocation;
