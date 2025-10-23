import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { Stack, Typography } from '@mui/material';
export default function RefugeesGrid() {
  const api = useApi();
  const [rows, setRows] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', 'freqs/refugees/stage/rejected');
      if (!success) {
        DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
        return;
      }

      const formatted = (data?.records || data || []).map((item) => ({
        id: item.id,
        case_number: item.case_number,
        name_plain: item.name_plain,
        gender: item.gender,
        religion: item.religion,
        birth_date: item.birth_date ? new Date(item.birth_date).toLocaleDateString('ar-EG') : '',
        birth_place: item.birth_place,
        marital_status: item.marital_status,
        spouse_nationality: item.spouse_nationality,
        phone_number: item.phone_number,
        nationality: item.nationality,
        origin_country: item.origin_country,
        profession: item.profession,
        created_at: item.created_at ? new Date(item.created_at).toLocaleString('ar-EG') : '',
        current_stage: item.current_stage,
        political_opinion: item.political_opinion,
        social_group_membership: item.social_group_membership,
        reasons_for_persecution: item.reasons_for_persecution,
        last_place_of_residence: item.last_place_of_residence,
        residency_duration: item.residency_duration,
        military_service: item.military_service ? 'نعم' : 'لا',
        political_party_membership: item.political_party_membership ? 'نعم' : 'لا',
        political_party_names: item.political_party_names || '',
        departure_date_from_origin: item.departure_date_from_origin
          ? new Date(item.departure_date_from_origin).toLocaleDateString('ar-EG')
          : '',
        date_of_arrival_to_iraq: item.date_of_arrival_to_iraq
          ? new Date(item.date_of_arrival_to_iraq).toLocaleDateString('ar-EG')
          : '',
        passport_expiry_date: item.passport_expiry_date
          ? new Date(item.passport_expiry_date).toLocaleDateString('ar-EG')
          : '',
        reasons_for_leaving_origin: item.reasons_for_leaving_origin,
        previous_country_before_iraq: item.previous_country_before_iraq,
        reasons_for_asylum: item.reasons_for_asylum,
        updated_at: item.updated_at || '',
        interview_date: item.interview_date ? new Date(item.interview_date).toLocaleDateString('ar-EG') : '',
        interview_officerName: item.interview_officerName || '',
        personal_photo: item.personal_photo || '',
        notes: item.notes,
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
    { field: 'interview_date', headerName: 'تاريخ المقابلة', width: 130 },
    { field: 'interview_officerName', headerName: 'اسم موظف المقابلة', width: 150 },
    { field: 'name_plain', headerName: 'الاسم الكامل', width: 150 },
    { field: 'gender', headerName: 'الجنس', width: 90 },
    { field: 'religion', headerName: 'الديانة', width: 100 },
    { field: 'birth_date', headerName: 'تاريخ الميلاد', width: 130 },
    { field: 'birth_place', headerName: 'مكان الميلاد', width: 120 },
    { field: 'marital_status', headerName: 'الحالة الاجتماعية', width: 120 },
    { field: 'spouse_nationality', headerName: 'جنسية الزوج/ة', width: 130 },
    { field: 'phone_number', headerName: 'رقم الهاتف', width: 140 },
    { field: 'nationality', headerName: 'الجنسية', width: 120 },
    { field: 'origin_country', headerName: 'بلد الأصل', width: 120 },
    { field: 'profession', headerName: 'المهنة', width: 130 },
    { field: 'current_stage', headerName: 'المرحلة الحالية', width: 130 },
    { field: 'political_opinion', headerName: 'الرأي السياسي', width: 130 },
    { field: 'social_group_membership', headerName: 'الانتماء الاجتماعي', width: 140 },
    { field: 'reasons_for_persecution', headerName: 'أسباب الاضطهاد', width: 140 },
    { field: 'last_place_of_residence', headerName: 'مكان الإقامة الأخير', width: 140 },
    { field: 'residency_duration', headerName: 'مدة الإقامة', width: 120 },
    { field: 'military_service', headerName: 'الخدمة العسكرية', width: 120 },
    { field: 'political_party_membership', headerName: 'عضوية حزب سياسي', width: 140 },
    { field: 'political_party_names', headerName: 'أسماء الأحزاب', width: 140 },
    { field: 'departure_date_from_origin', headerName: 'تاريخ المغادرة من بلد الأصل', width: 160 },
    { field: 'date_of_arrival_to_iraq', headerName: 'تاريخ الوصول إلى العراق', width: 160 },
    { field: 'passport_expiry_date', headerName: 'تاريخ انتهاء الجواز', width: 140 },
    { field: 'reasons_for_leaving_origin', headerName: 'أسباب مغادرة بلد الأصل', width: 160 },
    { field: 'previous_country_before_iraq', headerName: 'البلد السابق قبل العراق', width: 160 },
    { field: 'reasons_for_asylum', headerName: 'أسباب اللجوء', width: 120 },
    { field: 'created_at', headerName: 'تاريخ الإنشاء', width: 140 },
    { field: 'updated_at', headerName: 'تاريخ التحديث', width: 140 },
    { field: 'notes', headerName: 'سبب الرفض ' },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      {' '}
      <Stack alignItems="center" mb={1}>
        <Typography variant="h3"> طلبات مرفوضة من قبل اللجنة </Typography>
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
      />
    </Box>
  );
}
