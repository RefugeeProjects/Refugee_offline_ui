// صفحة ادخال التقارير
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, Grid, TextField, Stack, MenuItem, Typography, Box, Button, Autocomplete } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useApi } from '../utils';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
import { titles } from '../utils/title';
import dayjs from 'dayjs';

const daysOptions = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const EntryPage = () => {
  const api = useApi();

  const [record, setRecord] = useState({
    day: '',
    report_date: dayjs(),
    outgoing: '',
    incoming: '',
    completed: '',
    not_completed: '',
    notes: '',
    obstacles: '',
    suggestions: '',
    department_id: null,
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});

  const loadDepartments = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/departments`);
      if (success) {
        setDepartments(data?.records || []);
      } else {
        DangerMsg('فشل في تحميل الأقسام');
      }
    } catch (err) {
      DangerMsg('خطأ', 'حدث خطأ أثناء تحميل الأقسام');
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const validateFields = () => {
    const newErrors = {};
    if (!record.day) newErrors.day = 'يجب اختيار اليوم';
    if (!record.report_date) newErrors.report_date = 'يجب اختيار التاريخ';
    if (!record.department_id) newErrors.department_id = 'يجب اختيار القسم';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveClick = useCallback(async () => {
    if (!validateFields()) {
      DangerMsg('خطأ', 'يرجى تصحيح الحقول المطلوبة');
      return;
    }
    try {
      const sendData = {
        ...record,
        outgoing: Number(record.outgoing),
        incoming: Number(record.incoming),
        completed: Number(record.completed),
        not_completed: Number(record.not_completed),
        report_date: dayjs(record.report_date).toISOString(),
      };
      const { success, message } = await api('POST', 'mains/department_followups', sendData);
      if (success) {
        NotificationMsg('تم الحفظ', 'تمت إضافة التقرير بنجاح');
        resetForm();
      } else {
        DangerMsg('خطأ', 'فشل في حفظ التقرير: ' + message);
      }
    } catch (err) {
      DangerMsg('خطأ', 'فشل في إرسال البيانات');
    }
  }, [record]);

  const resetForm = () => {
    setRecord({
      day: '',
      report_date: dayjs(),
      outgoing: '',
      incoming: '',
      completed: '',
      not_completed: '',
      notes: '',
      obstacles: '',
      suggestions: '',
      department_id: null,
    });
    setErrors({});
  };

  return (
    <div>
      <Helmet>
        <title>ادخال التقارير {titles.mainTitle}</title>
      </Helmet>
      <Stack direction="row" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ margin: 'auto' }}>
          ادخال بيانات التقرير اليومي
        </Typography>
      </Stack>
      <Card sx={{ padding: '20px' }}>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="اليوم *"
                value={record.day}
                onChange={(e) => setRecord({ ...record, day: e.target.value })}
                error={!!errors.day}
                helperText={errors.day}
              >
                {daysOptions.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="تاريخ التقرير *"
                  value={record.report_date}
                  onChange={(newValue) => setRecord({ ...record, report_date: newValue })}
                  slotProps={{
                    textField: { fullWidth: true, error: !!errors.report_date, helperText: errors.report_date },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="عدد الصادر"
                type="number"
                value={record.outgoing}
                onChange={(e) => setRecord({ ...record, outgoing: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="عدد الوارد"
                type="number"
                value={record.incoming}
                onChange={(e) => setRecord({ ...record, incoming: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="عدد المنجز"
                type="number"
                value={record.completed}
                onChange={(e) => setRecord({ ...record, completed: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="عدد غير المنجز"
                type="number"
                value={record.not_completed}
                onChange={(e) => setRecord({ ...record, not_completed: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الملاحظات"
                multiline
                rows={2}
                value={record.notes}
                onChange={(e) => setRecord({ ...record, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="المعوقات"
                multiline
                rows={2}
                value={record.obstacles}
                onChange={(e) => setRecord({ ...record, obstacles: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="المقترحات"
                multiline
                rows={2}
                value={record.suggestions}
                onChange={(e) => setRecord({ ...record, suggestions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={departments}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={departments.find((dep) => dep.id === record.department_id) || null}
                onChange={(event, newValue) => {
                  setRecord({ ...record, department_id: newValue?.id || null });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="اختر القسم *"
                    error={!!errors.department_id}
                    helperText={errors.department_id}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" onClick={saveClick}>
                  حفظ التقرير
                </Button>
                <Button variant="outlined" onClick={resetForm}>
                  إعادة ضبط
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </div>
  );
};

export default EntryPage;
