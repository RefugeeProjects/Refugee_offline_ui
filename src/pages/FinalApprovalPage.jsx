import * as React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Drawer, IconButton, Divider, Grid, Avatar, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; // إضافة GridToolbar
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns'; // مكتبة احترافية للتعامل مع التواريخ
import { ar } from 'date-fns/locale'; // استيراد اللغة العربية
import { auth } from 'src/firebase.config';
import Cookies from 'js-cookie';
// 1. مكون مساعد لعرض الحقول والتسميات داخل الـ Drawer (لتحسين القراءة)
const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
      {label}:
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.0rem' }}>
      {value || 'غير متوفر'}
    </Typography>
  </Grid>
);

// 2. دالة مساعدة لتنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return 'تاريخ غير صالح';
    // تنسيق التاريخ باللغة العربية مع اليوم والشهر والسنة
    return format(date, 'yyyy/MM/dd');
  } catch {
    return 'تاريخ غير صالح';
  }
};

// 3. تعريف الأعمدة خارج المكون
const columnsDefinition = [
  { field: 'id', headerName: 'رقم الطلب', flex: 1 },
  { field: 'frist_name', headerName: 'الاسم ', flex: 1 },
  { field: 'second_name', headerName: 'اسم الاب', flex: 1 },
  { field: 'theard_name', headerName: 'اسم الجد', flex: 1 },
  { field: 'sur_name', headerName: 'اللقب ', flex: 1 },
  { field: 'nationality', headerName: 'الجنسية', flex: 1 },
  {
    field: 'interview_date',
    headerName: 'تاريخ المقابلة',
    flex: 1,
    minWidth: 150,
    valueFormatter: (params) => (params.value ? new Date(params.value).toISOString().slice(0, 10) : ''),
  },
  { field: 'interview_officername', headerName: 'اسم موظف المقابلة', flex: 1, minWidth: 150 },
  { field: 'current_stage', headerName: 'الحالة', flex: 1 },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const FILES_BASE_URL = process.env.REACT_APP_FILES_BASE_URL;
const DEFAULT_PHOTO = process.env.REACT_APP_DEFAULT_PHOTO;

export default function RefugeesGrid() {
  const api = useApi();
  const [rows, setRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);

  // const handleRowClick = (params) => {
  //   setSelectedRow(params.row);
  //   setDrawerOpen(true);
  // };

  const handleRowClick = async (params) => {
    const refugee = params.row;
    try {
      const token = Cookies.get('token');

      const response = await fetch(`${API_BASE_URL}/freqs/refugees/${refugee.id}/with-files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (result.success && Array.isArray(result.data.files)) {
        const photoFile = result.data.files.find((f) => f.file_name === 'personal_photo.png');

        // ✅ بناء المسار باستخدام ملفات .env فقط
        refugee.personal_photo = photoFile ? `${FILES_BASE_URL}${photoFile.file_path.replace('/uploads', '')}` : null;
      }
    } catch (err) {
      console.error('Error fetching refugee photo:', err);
    }

    setSelectedRow(refugee);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  // 4. دمج التواريخ المنسقة في عملية جلب البيانات وتحسين معالجة التاريخ
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { success, data } = await api('GET', 'freqs/refugees/stage/done');
      if (!success) {
        DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
        setLoading(false);
        return;
      }

      // وظيفة مساعدة لتنسيق التاريخ إلى 'YYYY-MM-DD'
      const safeFormatDate = (date) =>
        date && !isNaN(Date.parse(date)) ? new Date(date).toISOString().slice(0, 10) : '';

      const formatted = (data?.records || data || []).map((item) => ({
        id: item.id,
        interview_officername: item.interview_officername,
        interviewnotes: item.interviewnotes,
        frist_name: item.frist_name,
        second_name: item.second_name,
        theard_name: item.theard_name,
        sur_name: item.sur_name,
        mother_name: item.mother_name,
        fath_mother_name: item.fath_mother_name,
        gender: item.gender,
        religion: item.religion,
        birth_date: safeFormatDate(item.birth_date), // تنسيق في صفيف البيانات
        birth_place: item.birth_place,
        marital_status: item.marital_status,
        marital_status_date: safeFormatDate(item.marital_status_date),
        spouse_nationality: item.spouse_nationality,
        phone_number: item.phone_number,
        nationality: item.nationality,
        origin_country: item.origin_country,
        governorate: item.governorate,
        district: item.district,
        subdistrict: item.subdistrict,
        profession: item.profession,
        created_at: safeFormatDate(item.created_at),
        current_stage: item.current_stage,
        political_opinion: item.political_opinion,
        social_group_membership: item.social_group_membership,
        reasons_for_persecution: item.reasons_for_persecution,
        last_place_of_residence: item.last_place_of_residence,
        residency_duration: item.residency_duration,
        military_service: item.military_service ? 'نعم' : 'لا',
        political_party_membership: item.political_party_membership ? 'نعم' : 'لا',
        political_party_names: item.political_party_names || '',
        departure_date_from_origin: safeFormatDate(item.departure_date_from_origin),
        residency_issue_date: safeFormatDate(item.residency_issue_date),
        date_of_arrival_to_iraq: safeFormatDate(item.date_of_arrival_to_iraq),
        residency_expiry_date: safeFormatDate(item.residency_expiry_date),
        is_iraq_residency: item.is_iraq_residency,
        residency_befor_iraq: item.residency_befor_iraq,
        residency_befor_iraq_durtion: item.residency_befor_iraq_durtion,
        passport: item.passport,
        returntocountryhistory: item.returntocountryhistory,
        passport_number: item.passport_number,
        passportissuecountry: item.passportissuecountry,
        familypassports: item.familypassports,
        intendtoreturn: item.intendtoreturn,
        preferredresidencereturn: item.preferredresidencereturn,
        whathappensifreturn: item.whathappensifreturn,
        reasons_for_leaving_origin: item.reasons_for_leaving_origin,
        previous_country_before_iraq: item.previous_country_before_iraq,
        reasons_for_asylum: item.reasons_for_asylum,
        updated_at: safeFormatDate(item.updated_at),
        interview_date: safeFormatDate(item.interview_date),
        interview_officerName: item.interview_officerName || '',
        personal_photo: item.personal_photo || '',
        notes: item.notes || '', // ✅ إضافة حقل الملاحظات المفقود
      }));

      setRows(formatted);
    } catch (err) {
      DangerMsg('اشعارات اللاجئين', 'فشل في تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // إضافة api إلى قائمة الاعتمادات

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => columnsDefinition, []); // استخدام useMemo

  return (
    <Box sx={{ height: 650, width: '100%', p: 2 }}>
      <Stack alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
          موافقة نهائية{' '}
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ height: '100%', width: '100%', p: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading} // عرض حالة التحميل
          slots={{ toolbar: GridToolbar }} // إضافة شريط أدوات للبحث والتصفية والتصدير
          checkboxSelection
          disableRowSelectionOnClick
          localeText={{
            // تحسين دعم اللغة العربية
            columnMenuUnsort: 'إلغاء الفرز',
            columnMenuSortAsc: 'فرز تصاعدي',
            columnMenuSortDesc: 'فرز تنازلي',
            columnMenuFilter: 'تصفية',
            columnMenuHideColumn: 'إخفاء العمود',
            columnMenuShowColumns: 'عرض الأعمدة',
            noRowsLabel: 'لا توجد طلبات لعرضها',
            toolbarExport: 'تصدير',
            toolbarExportCSV: 'تصدير كملف CSV',
            toolbarExportPrint: 'طباعة',
            toolbarDensity: 'كثافة العرض',
            toolbarDensityCompact: 'صغير',
            toolbarDensityStandard: 'قياسي',
            toolbarDensityComfortable: 'كبير',
            toolbarFilters: 'الفلاتر',
            toolbarColumns: 'الأعمدة',
            toolbarQuickFilterPlaceholder: 'ابحث...',
            // يمكن إضافة المزيد حسب الحاجة
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            filter: { filterModel: { items: [], quickFilterExcludeHiddenColumns: true } },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          onRowClick={handleRowClick}
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer', backgroundColor: 'action.hover' } }}
        />
      </Paper>

      {/* -------------------- Drawer Details -------------------- */}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: '80%', md: '65%' } } }} // تحسين استجابة العرض على الشاشات المختلفة
      >
        <Box p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
              تفاصيل اللاجئ - رقم الطلب: {selectedRow?.id}
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon sx={{ fontSize: 30, color: 'error.main' }} />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {selectedRow && (
            <Grid
              container
              spacing={4}
              sx={{
                '& *': {
                  // 🔹 يؤثر على كل العناصر بداخل الـ Grid
                  fontSize: {
                    xs: '0.9rem',
                    sm: '1rem',
                    md: '1.2rem',
                    lg: '1.5rem',
                  },
                  lineHeight: 1.6,
                  mb: 1.5,
                },
              }}
            >
              {/* القسم الأول: الصورة والمعلومات الأساسية */}
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                {/* {selectedRow.personal_photo ? (
                  <Avatar
                    alt={selectedRow.frist_name}
                    src={selectedRow.personal_photo}
                    sx={{ width: 140, height: 140, border: '4px solid', borderColor: 'primary.main', m: '0 auto' }}
                  />
                ) : (
                  <Avatar sx={{ width: 140, height: 140, bgcolor: 'grey.400', fontSize: '3rem', m: '0 auto' }}>
                    {selectedRow.frist_name ? selectedRow.frist_name.charAt(0) : '؟'}
                  </Avatar>
                )} */}

                {selectedRow.personal_photo ? (
                  <Avatar
                    alt={selectedRow.frist_name}
                    src={selectedRow.personal_photo || DEFAULT_PHOTO}
                    imgProps={{
                      crossOrigin: 'anonymous',
                      onError: (e) => {
                        e.target.src = DEFAULT_PHOTO;
                      },
                    }}
                    sx={{
                      width: 140,
                      height: 140,
                      border: '4px solid',
                      borderColor: 'primary.main',
                      m: '0 auto',
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 140,
                      height: 140,
                      bgcolor: 'grey.400',
                      fontSize: '3rem',
                      m: '0 auto',
                    }}
                  >
                    {selectedRow.frist_name ? selectedRow.frist_name.charAt(0) : '؟'}
                  </Avatar>
                )}

                <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {selectedRow.frist_name} {selectedRow.second_name} {selectedRow.last_name} {selectedRow.theard_name}{' '}
                  {selectedRow.sur_name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {selectedRow.nationality}
                </Typography>
              </Grid>

              {/* ----------------- المعلومات الشخصية ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  المعلومات الشخصية
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem label="الجنس" value={selectedRow.gender} />
                  <DetailItem label="الاسم " value={selectedRow.frist_name} />
                  <DetailItem label="الاب " value={selectedRow.second_name} />
                  <DetailItem label="الجد " value={selectedRow.theard_name} />
                  <DetailItem label="اللقب " value={selectedRow.sur_name} />
                  {/* استخدام الدالة المساعدة للتنسيق الاحترافي */}

                  <DetailItem label="اسم الام " value={selectedRow.mother_name} />
                  <DetailItem label="اسم اب الام " value={selectedRow.fath_mother_name} />
                  <DetailItem label="تاريخ الميلاد" value={formatDate(selectedRow.birth_date)} />
                  <DetailItem label="مكان الميلاد" value={selectedRow.birth_place} />
                  <DetailItem label="الديانة" value={selectedRow.religion} />
                  <DetailItem label="جنسية مقدم الطلب" value={selectedRow.nationality} />
                  <DetailItem label="بلد الأصل " value={selectedRow.origin_country} />
                  <DetailItem label="المهنة" value={selectedRow.profession} />
                  <DetailItem label="رقم الهاتف" value={selectedRow.phone_number} />
                </Grid>
              </Grid>

              {/* ----------------- معلومات الزواج ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  معلومات الزواج
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem label="الحالة الاجتماعية" value={selectedRow.marital_status} />
                  <DetailItem label="تاريخ الحالة الاجتماعية " value={selectedRow.marital_status_date} />
                  <DetailItem label="جنسية الزوج/الزوجة" value={selectedRow.spouse_nationality} />
                </Grid>
              </Grid>

              {/* ----------------- معلومات السكن ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  معلومات السكن
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem label="المحافظة" value={selectedRow.governorate} />
                  <DetailItem label="القضاء" value={selectedRow.district} />
                  <DetailItem label="المنطقة" value={selectedRow.subdistrict} />
                </Grid>
              </Grid>

              {/* ----------------- تفاصيل اللجوء والوضع الأمني ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  تفاصيل اللجوء والوضع الأمني
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem label="الرأي السياسي" value={selectedRow.political_opinion} />
                  <DetailItem label="الانتماء الاجتماعي" value={selectedRow.social_group_membership} />
                  <DetailItem label="أسباب الاضطهاد" value={selectedRow.reasons_for_persecution} />
                  <DetailItem label="آخر مكان إقامة" value={selectedRow.last_place_of_residence} />
                  <DetailItem label="مدة الإقامة هناك" value={selectedRow.residency_duration} />
                  <DetailItem label="خدمة عسكرية" value={selectedRow.military_service} />
                  <DetailItem label=" هل تنتمي لاحزاب سياسية " value={selectedRow.political_party_membership} />
                  {selectedRow.political_party_membership === 'نعم' && (
                    <DetailItem label="أسماء الأحزاب السياسية" value={selectedRow.political_party_names} />
                  )}
                </Grid>
              </Grid>

              {/* ----------------- تفاصيل السفر والوصول ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  تفاصيل السفر والوصول
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem
                    label="تاريخ المغادرة من بلد الأصلي"
                    value={formatDate(selectedRow.departure_date_from_origin)}
                  />
                  <DetailItem label="تاريخ الوصول إلى العراق" value={formatDate(selectedRow.date_of_arrival_to_iraq)} />
                  <DetailItem label="هل لديك اقامة في العراق؟" value={selectedRow.is_iraq_residency} />
                  <DetailItem
                    label="محل الاقامة قبل الدخول الاراضي العراقية"
                    value={selectedRow.residency_befor_iraq}
                  />
                  <DetailItem label="الفترة التي قضيتها هناك" value={selectedRow.residency_befor_iraq_durtion} />
                  <DetailItem label="تاريخ اصدار الاقامة" value={formatDate(selectedRow.residency_issue_date)} />
                  <DetailItem label="تاريخ انتهاء الاقامة" value={formatDate(selectedRow.residency_expiry_date)} />
                  <DetailItem
                    label="اذكر بإيجاز أسباب مغادرتك لبلد الأصل:
"
                    value={selectedRow.reasons_for_leaving_origin}
                  />
                  <DetailItem label="البلد السابقة قبل العراق" value={selectedRow.previous_country_before_iraq} />
                  <DetailItem label="ملخص اسباب طلب اللجوء" value={selectedRow.reasons_for_asylum} />
                  <DetailItem label=" هل لديك جواز سفر " value={selectedRow.passport} />
                  <DetailItem label="رقم جواز السفر" value={selectedRow.passport_number} />
                  <DetailItem label="بلد اصدار جواز السفر" value={selectedRow.passportissuecountry} />
                  <DetailItem label="هل كل افراد العائلة لديهم جوازات سفر" value={selectedRow.familypassports} />
                  <DetailItem
                    label="هل سبق وأن عدت إلى بلدك بعد مغادرته؟ إذا كان الجواب نعم، فمتى؟ وأين كان مكان العودة ومتى؟ وماهي الفترة التي بقيت فيها؟ ماذا فعلت هناك؟ لماذا عدت إلى العراق؟"
                    value={selectedRow.returntocountryhistory}
                  />
                  <DetailItem label="هل تنوي العودة الى بلدك ؟" value={selectedRow.intendtoreturn} />
                  <DetailItem
                    label=" إذا كنت تنوي العودة أين تفضل السكن"
                    value={selectedRow.preferredresidencereturn}
                  />{' '}
                  <DetailItem label="ماذا سيحدث لك او لعائلتك اذا عدت " value={selectedRow.whathappensifreturn} />
                </Grid>
              </Grid>

              {/* ----------------- معلومات إدارية ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  معلومات إدارية
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem label="رقم الحالة" value={selectedRow.id} />
                  <DetailItem label="المرحلة الحالية" value={selectedRow.current_stage} />
                  <DetailItem label="اسم موظف المقابلة" value={selectedRow.interview_officername} />
                  <DetailItem label=" ملخص المقابلة " value={selectedRow.interviewnotes} />
                  <DetailItem label="تاريخ المقابلة" value={formatDate(selectedRow.interview_date)} />
                  <DetailItem label="تاريخ الإنشاء" value={formatDate(selectedRow.created_at)} />
                  <DetailItem label="آخر تحديث" value={formatDate(selectedRow.updated_at)} />
                  {/* عرض الملاحظات بشكل كامل */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      الملاحظات:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, backgroundColor: 'grey.50' }}>
                      <Typography variant="body1" sx={{ fontWeight: 400, fontSize: '1.0rem' }}>
                        {selectedRow.notes || 'لا توجد ملاحظات'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
          {/* مساحة إضافية في الأسفل لتجنب اقتصاص المحتوى */}
          <Box sx={{ height: 50 }} />
        </Box>
      </Drawer>
    </Box>
  );
}
