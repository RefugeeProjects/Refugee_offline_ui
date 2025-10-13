//صفحة ملغاة
import React, { useContext, useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { Grid, FormGroup, TextField, Typography, IconButton } from '@mui/material';
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

const Addexception = ({ open, handleToggle, modalProps, fetchData }) => {
  const { user } = useContext(appContext);
  const api = useApi();
  const [dataBody, SetData] = useState({
    value: '',
  });

  // close modal event
  const onCloseModal = () => {
    SetData({
      value: '',
    });
    handleToggle();
  };

  const addData = async () => {
    try {
      let payload = dataBody;

      const { success, data } = await api('POST', `mains/exceptiontype`, payload);
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
                    {modalProps === null ? 'اضافة  نوع استثناء  جديد' : 'تعديل  التصنيف'}
                  </Typography>
                  <Grid container columnSpacing={2} rowSpacing={2} sx={{ mb: 2 }}>
                    {/* name ar*/}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <TextField
                          className="rtl largeText"
                          fullWidth
                          id="app_name"
                          label="نوع  الاستثناء  *"
                          value={dataBody?.value}
                          onChange={(e) => {
                            SetData({ ...dataBody, value: e.target.value || null });
                          }}
                          error={dataBody?.value === ''}
                          helperText={dataBody?.value === '' ? 'مطلوب' : ''}
                          variant="standard"
                        />
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
                          disabled={!dataBody?.value}
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

export default Addexception;
