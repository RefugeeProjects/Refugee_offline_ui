import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Drawer, IconButton, Divider, TextField, Button, Grid, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { Stack, Typography } from '@mui/material';
export default function RefugeesGrid() {
  const api = useApi();
  const [rows, setRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', 'freqs/refugees/stage/done');
      if (!success) {
        DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
        return;
      }

      const formatted = (data?.records || data || []).map((item) => ({
        id: item.id,
        case_number: item.case_number,
        name_plain: item.name_plain,
        interview_date: item.interview_date,
        gender: item.gender,
        religion: item.religion,

        birth_date:
          item.birth_date && !isNaN(Date.parse(item.birth_date))
            ? new Date(item.birth_date).toISOString().slice(0, 10)
            : '',

        birth_place: item.birth_place,
        marital_status: item.marital_status,
        spouse_nationality: item.spouse_nationality,
        phone_number: item.phone_number,
        nationality: item.nationality,
        origin_country: item.origin_country,
        profession: item.profession,

        created_at:
          item.created_at && !isNaN(Date.parse(item.created_at))
            ? new Date(item.created_at).toISOString().slice(0, 10)
            : '',

        current_stage: item.current_stage,
        political_opinion: item.political_opinion,
        social_group_membership: item.social_group_membership,
        reasons_for_persecution: item.reasons_for_persecution,
        last_place_of_residence: item.last_place_of_residence,
        residency_duration: item.residency_duration,
        military_service: item.military_service ? 'Yes' : 'No',
        political_party_membership: item.political_party_membership ? 'Yes' : 'No',
        political_party_names: item.political_party_names || '',

        departure_date_from_origin:
          item.departure_date_from_origin && !isNaN(Date.parse(item.departure_date_from_origin))
            ? new Date(item.departure_date_from_origin).toISOString().slice(0, 10)
            : '',

        date_of_arrival_to_iraq:
          item.date_of_arrival_to_iraq && !isNaN(Date.parse(item.date_of_arrival_to_iraq))
            ? new Date(item.date_of_arrival_to_iraq).toISOString().slice(0, 10)
            : '',

        passport_expiry_date:
          item.passport_expiry_date && !isNaN(Date.parse(item.passport_expiry_date))
            ? new Date(item.passport_expiry_date).toISOString().slice(0, 10)
            : '',

        reasons_for_leaving_origin: item.reasons_for_leaving_origin,
        previous_country_before_iraq: item.previous_country_before_iraq,
        reasons_for_asylum: item.reasons_for_asylum,

        updated_at:
          item.updated_at && !isNaN(Date.parse(item.updated_at))
            ? new Date(item.updated_at).toISOString().slice(0, 10)
            : '',

        interview_date:
          item.interview_date && !isNaN(Date.parse(item.interview_date))
            ? new Date(item.interview_date).toISOString().slice(0, 10)
            : '',

        interview_officerName: item.interview_officerName || '',
        personal_photo: item.personal_photo || '',
      }));

      setRows(formatted);
    } catch (err) {
      DangerMsg('اشعارات اللاجئين', 'فشل في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { field: 'case_number', headerName: 'رقم الطلب', width: 100 },

    { field: 'interview_officerName', headerName: 'اسم موظف المقابلة', width: 150 },
    { field: 'interview_date', headerName: 'تاريخ المقابلة  ', width: 150 },
    { field: 'name_plain', headerName: 'الاسم الكامل', width: 150 },
    { field: 'birth_date', headerName: 'تاريخ الميلاد', width: 130 },
    { field: 'created_at', headerName: 'تاريخ الإنشاء', width: 140 },
    { field: 'created_by', headerName: 'انشيء من قبل المستخدم ', width: 140 },
    { field: 'current_stage', headerName: 'الحالة', width: 140 },
  ];
  console.log('Raw birth_date: test', selectedRow?.birth_date);

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      {' '}
      <Stack alignItems="center" mb={1}>
        <Typography variant="h3"> طلبات مصادق عليها من الوزير</Typography>
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        onRowClick={handleRowClick} // <<< أضف هذا السطر
      />
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { width: '90%' },
        }}
      >
        <Box p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
              تفاصيل اللاجئ
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {selectedRow && (
            <Grid container spacing={3}>
              {/* صورة شخصية في أعلى اليمين */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                {selectedRow.personal_photo ? (
                  <Avatar
                    alt={selectedRow.name_plain}
                    src={selectedRow.personal_photo}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '2px solid',
                      borderColor: 'primary.main',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <Avatar sx={{ width: 120, height: 120, bgcolor: 'grey.300', fontSize: '3rem', borderRadius: '4px' }}>
                    {selectedRow.name_plain ? selectedRow.name_plain.charAt(0) : '؟'}
                  </Avatar>
                )}
              </Grid>

              {/* معلومات شخصية */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', fontSize: '2.8rem' }}>
                  المعلومات الشخصية
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الاسم الكامل:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.name_plain}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الجنس:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      تاريخ الميلاد:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow?.birth_date
                        ? new Date(selectedRow.birth_date).toISOString().split('T')[0]
                        : 'Not available'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      مكان الميلاد:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.birth_place}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الديانة:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.religion}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الجنسية:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.nationality}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      دولة المنشأ:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.origin_country}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      المهنة:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.profession}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      رقم الهاتف:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.phone_number}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* معلومات الزواج والعائلة */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', fontSize: '2.8rem' }}>
                  معلومات الزواج
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الحالة الاجتماعية:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.marital_status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      جنسية الزوج/الزوجة:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.spouse_nationality}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* معلومات اللجوء والوضع السياسي */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', fontSize: '2.8rem' }}>
                  تفاصيل اللجوء والوضع الأمني
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الرأي السياسي:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.political_opinion}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الانتماء الاجتماعي:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.social_group_membership}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      أسباب الاضطهاد:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.reasons_for_persecution}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      آخر مكان إقامة:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.last_place_of_residence}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      مدة الإقامة هناك:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.residency_duration}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      خدمة عسكرية:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.military_service ? 'نعم' : 'لا'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      عضوية حزب سياسي:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.political_party_membership ? 'نعم' : 'لا'}
                    </Typography>
                  </Grid>
                  {selectedRow.political_party_membership && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                        أسماء الأحزاب السياسية:
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                        {selectedRow.political_party_names}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* معلومات السفر والوصول */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', fontSize: '2.8rem' }}>
                  تفاصيل السفر والوصول
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      تاريخ المغادرة من بلد المنشأ:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {/* {new Date(selectedRow.departure_date_from_origin).toLocaleDateString('ar-IQ')} */}
                      {selectedRow.departure_date_from_origin}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      تاريخ الوصول إلى العراق:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {/* {new Date(selectedRow.date_of_arrival_to_iraq).toLocaleDateString('ar-IQ')} */}
                      {selectedRow.date_of_arrival_to_iraq}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      أسباب مغادرة بلد المنشأ:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.reasons_for_leaving_origin}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      الدولة السابقة قبل العراق:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.previous_country_before_iraq}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      أسباب طلب اللجوء:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.reasons_for_asylum}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      تاريخ انتهاء صلاحية جواز السفر:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.passport_expiry_date ? selectedRow.passport_expiry_date : 'لا يوجد'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* معلومات إدارية */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', fontSize: '2.8rem' }}>
                  معلومات إدارية
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      رقم الحالة:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.case_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      المرحلة الحالية:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.current_stage}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      تاريخ الإنشاء:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {/* {new Date(selectedRow.created_at).toLocaleDateString('ar-IQ')} */}
                      {selectedRow.created_at}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      آخر تحديث:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.updated_at}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
                      ملاحظات:
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      {selectedRow.notes || 'لا توجد ملاحظات'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
