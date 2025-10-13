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
    day: '',
    report_date: '',
    outgoing: '',
    incoming: '',
    completed: '',
    not_completed: '',
    notes: '',
    obstacles: '',
    suggestions: '',
    department_id: '',
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
      const url = modalProps ? `mains/department_followups/id/${modalProps.id}` : `mains/department_followups`;
      const { success } = await api(endpoint, url, dataBody);

      if (!success) {
        DangerMsg('اشعار', 'حدث خطأ أثناء حفظ البيانات');
        return;
      }

      NotificationMsg('اشعار', modalProps ? 'تم تعديل التقييم' : 'تمت إضافة التقييم');
      fetchData();
      handleToggle();
      setDataBody({
        id: '',
        day: '',
        report_date: '',
        outgoing: '',
        incoming: '',
        completed: '',
        not_completed: '',
        notes: '',
        obstacles: '',
        suggestions: '',
        department_id: '',
      });
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
              {modalProps ? 'تعديل متابعة القسم' : 'إضافة متابعة جديدة'}
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
                  <TextField name="day" label="اليوم" value={dataBody.day} onChange={handleChange} fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="report_date"
                    label="تاريخ التقرير"
                    type="date"
                    value={dataBody.report_date?.slice(0, 10) || ''}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name="outgoing"
                    label="الصادر"
                    type="number"
                    value={dataBody.outgoing}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name="incoming"
                    label="الوارد"
                    type="number"
                    value={dataBody.incoming}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name="completed"
                    label="المكتمل"
                    type="number"
                    value={dataBody.completed}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name="not_completed"
                    label="غير مكتمل"
                    type="number"
                    value={dataBody.not_completed}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="ملاحظات"
                    value={dataBody.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="obstacles"
                    label="المعوقات"
                    value={dataBody.obstacles}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="suggestions"
                    label="المقترحات"
                    value={dataBody.suggestions}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
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
