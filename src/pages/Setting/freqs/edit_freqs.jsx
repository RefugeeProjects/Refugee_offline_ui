// الصفحة الجديدة لتعديل أو إضافة تقييمات الموظفين
import React, { useState, useEffect, useContext } from 'react';
import { Modal, Box, Typography, Grid, TextField, Button, MenuItem, FormGroup } from '@mui/material';
import { Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { useApi } from '../../../utils';
import { appContext } from '../../../context/appContext';
import { NotificationMsg, DangerMsg } from '../../../components/NotificationMsg';

const styleBox = {
  bgcolor: 'background.paper',
  border: '2px solid #555',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  maxHeight: '80vh',
  overflowY: 'auto',
};

const departmentsList = [
  { id: 2, name: 'قسم الادارية والمالية' },
  { id: 3, name: 'مديرية الرواتب والامور المالية' },
  { id: 4, name: 'التخطيط والمتابعة' },
  { id: 5, name: 'تخطيط' },
];

const EditEvaluation = ({ open, handleToggle, modalProps, fetchData }) => {
  const api = useApi();
  const { user } = useContext(appContext);

  const [dataBody, setDataBody] = useState({
    id: '',
    department_id: '',
    employee_name: '',
    evaluation_type: '',
    rank: '',
    notes: '',
  });

  useEffect(() => {
    if (modalProps) setDataBody(modalProps);
  }, [modalProps]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataBody((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const endpoint = modalProps ? 'PUT' : 'POST';
      const url = modalProps ? `mains/evaluations/id/${modalProps.id}` : `mains/evaluations`;
      const { success } = await api(endpoint, url, dataBody);

      if (!success) {
        DangerMsg('اشعار', 'حدث خطأ أثناء حفظ البيانات');
        return;
      }

      NotificationMsg('اشعار', modalProps ? 'تم تعديل التقييم' : 'تمت إضافة التقييم');
      fetchData();
      handleToggle();
      setDataBody({ id: '', department_id: '', employee_name: '', evaluation_type: '', rank: '', notes: '' });
    } catch (err) {
      DangerMsg('اشعار', 'حدث خطأ داخلي');
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={handleToggle}>
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Box sx={styleBox}>
            <IconButton onClick={handleToggle} sx={{ position: 'absolute', top: 10, left: 10 }}>
              <Close />
            </IconButton>

            <Typography variant="h5" mb={2} textAlign="center">
              {modalProps ? 'تعديل تقييم الموظف' : 'إضافة تقييم جديد'}
            </Typography>

            <FormGroup>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    name="department_id"
                    label="القسم"
                    value={dataBody.department_id}
                    onChange={handleChange}
                    fullWidth
                  >
                    {departmentsList.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="employee_name"
                    label="الاسم "
                    value={dataBody.employee_name}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="evaluation_type"
                    label="نوع التقييم"
                    value={dataBody.evaluation_type}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField name="rank" label="الدرجة" value={dataBody.rank} onChange={handleChange} fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="ملاحظات"
                    value={dataBody.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} textAlign="center">
                  <Button onClick={handleSubmit} variant="contained">
                    {modalProps ? 'تعديل' : 'إضافة'}
                  </Button>
                </Grid>
              </Grid>
            </FormGroup>
          </Box>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default EditEvaluation;
