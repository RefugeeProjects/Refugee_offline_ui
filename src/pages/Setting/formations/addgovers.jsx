//صفحة الاعدادات - اضافة وتعديل  تشكيل اضافي
import React, { useEffect, useState, useContext } from 'react';
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

const Add_Device = ({ open, handleToggle, modalProps, fetchData }) => {
  const api = useApi();
  const { user } = useContext(appContext);

  // حالة لتخزين البيانات في النموذج
  const [dataBody, setDataBody] = useState({
    name: '',
  });

  // تحميل البيانات من modalProps عند فتح النموذج
  useEffect(() => {
    if (modalProps) {
      setDataBody(modalProps); // تعبئة الحقول ببيانات الصف المحدد
    }
  }, [modalProps]);

  // معالجة تغييرات الحقول
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataBody((prev) => ({ ...prev, [name]: value }));
  };

  // إرسال التعديلات أو الإضافة إلى الخادم (API)
  const handleSubmit = async () => {
    try {
      // تحديد المسار بناءً على العملية
      const isEdit = !!modalProps; // إذا كانت العملية تعديل
      const endpoint = isEdit ? `PUT` : `POST`;

      const url = isEdit
        ? `mains/departments/id/${modalProps.id}` // مسار التعديل
        : `mains/departments`; // مسار الإضافة

      const { success } = await api(endpoint, url, dataBody);

      if (!success) {
        DangerMsg('اشعارات', 'خطأ في العملية');
        return;
      }

      NotificationMsg('اشعارات', isEdit ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
      fetchData(); // تحديث البيانات في الجدول
      handleToggle(); // إغلاق النموذج
    } catch (err) {
      console.error('API Error:', err);
      DangerMsg('اشعارات', 'حدث خطأ أثناء العملية');
    }
  };

  return (
    <Modal open={open} onClose={handleToggle} aria-labelledby="modal-title" aria-describedby="modal-description">
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
            <IconButton
              aria-label="close"
              color="default"
              sx={{ position: 'fixed', left: '10px', top: '10px' }}
              onClick={handleToggle}
            >
              <Close />
            </IconButton>
            <FormGroup>
              <Typography id="modal-title" variant="h4" mb={2}>
                {modalProps ? 'تعديل مكان العمل' : 'إضافة مكان عمل جديد'}
              </Typography>
              <TextField
                name="name"
                label=" مكان العمل"
                value={dataBody.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="standard"
              />
              <Grid container justifyContent="center" sx={{ mt: 2 }}>
                <Button onClick={handleSubmit} variant="contained" disabled={!dataBody.name}>
                  {modalProps ? 'تعديل المعلومات' : 'إضافة جديد'}
                </Button>
              </Grid>
            </FormGroup>
          </Box>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default Add_Device;
