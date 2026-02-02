import React, { useContext,useCallback, useEffect, useRef, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Stack,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Alert, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { appContext } from '../context';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';

export default function SecurityPage() {
  const tableRef = useRef();
  const api = useApi();
    const { user } = useContext(appContext);
    const userRole = user.roles; // أو من الكونتكست/ستيت2023
    const DEFAULT_PHOTO = '/default-avatar.png';

const [drawerOpen, setDrawerOpen] = useState(false);
const [detailsLoading, setDetailsLoading] = useState(false);
const [refugeeDetails, setRefugeeDetails] = useState(null);

const [openTrack, setOpenTrack] = useState(false);
const [selectedRow, setSelectedRow] = useState(null);
const [stages, setStages] = useState([]);
const [stagesLoading, setStagesLoading] = useState(false);
const [openMigratedAlert, setOpenMigratedAlert] = useState(false);
const [openApproval, setOpenApproval] = useState(false);
const [decision, setDecision] = useState('');
const [notes, setNotes] = useState('');

const handleOpenDetails = async (row) => {
  setDrawerOpen(true);
  setDetailsLoading(true);
  setRefugeeDetails(null);

  try {
    const res = await api(
      'GET',
      `freqs/refugees/${row.id}/with-files`
    );

    if (!res.success) {
      DangerMsg('تفاصيل القيد', res.msg || 'فشل جلب البيانات');
      setDrawerOpen(false);
      return;
    }

    setRefugeeDetails(res.data);
  } catch {
    DangerMsg('تفاصيل القيد', 'خطأ في الاتصال');
    setDrawerOpen(false);
  } finally {
    setDetailsLoading(false);
  }
};

const handleDrawerClose = () => {
  setDrawerOpen(false);
  setRefugeeDetails(null);
};




const stageMap = {
  admin: 'مدير النظام',
  data_entry: 'مدخل بيانات',
  reviewer: 'مدقق',
  approver: 'موافقة اللجنة',
  mokhabarat: 'المخابرات',
  amn_watani: 'امن وطني',
  istikhbarat_defense: 'استخبارات الدفاع',
  iqama: 'الاقامة',
};

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageInfo, setPageInfo] = useState({ hasNext: false, nextCursor: null });

  const [filters, setFilters] = useState({
    id: '',
    frist_name: '',
    second_name: '',
    theard_name: '',
    sur_name: '',
    mother_name: '',
    fath_mother_name: '',
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchData = useCallback(
    async ({ cursor = null, reset = false } = {}) => {
      setLoading(true);
      setError('');

      try {
        const params = {};

        Object.entries(filters).forEach(([k, v]) => {
          if (v) params[k] = v;
        });

        if (!reset && cursor) params.cursor = cursor;

        const query = new URLSearchParams(params).toString();
        const url = query ? `freqs/by-action?${query}` : 'freqs/by-action';

        const response = await api('GET', url);
        const { data, hasNext, nextCursor, msg } = response || {};

        if (!Array.isArray(data)) {
          setError(msg || 'فشل في جلب البيانات');
          setRows([]);
          setPageInfo({ hasNext: false, nextCursor: null });
          return;
        }

        setRows(data);
        setPageInfo({ hasNext, nextCursor });
      } catch (err) {
        console.error(err);
        setError('خطأ غير متوقع أثناء الاتصال بالخادم');
        setRows([]);
        setPageInfo({ hasNext: false, nextCursor: null });
      } finally {
        setLoading(false);
      }
    },
    [filters, api]
  );

  useEffect(() => {
    fetchData({ reset: true });
  }, []);

  const handleSearch = () => {
    fetchData({ reset: true });
  };
const filterLabels = {
  id: 'رقم الطلب',
  frist_name: 'الاسم الأول',
  second_name: 'اسم الأب',
  theard_name: 'اسم الجد',
  sur_name: 'اللقب',
  mother_name: 'اسم الأم',
  fath_mother_name: 'اسم والد الأم',
};

  const handleTrackOpen = async (row) => {
  setSelectedRow(row);
  setOpenTrack(true);
  setStages([]);
  setStagesLoading(true);

  try {
    const endpoint = `freqs/refugees/${row.id}/stages`;
    const { success, data, msg } = await api('GET', endpoint);

    if (!success) {
      DangerMsg('تتبّع الطلب', msg || 'فشل في جلب المراحل');
      setStages([]);
    } else {
      setStages(Array.isArray(data) ? data : data?.records || []);
    }
  } catch (e) {
    console.error(e);
    DangerMsg('تتبّع الطلب', 'خطأ أثناء الاتصال');
    setStages([]);
  } finally {
    setStagesLoading(false);
  }
};

const submitApproval = async () => {
  try {
    await api(
      'PUT',
      `freqs/refugees/${selectedRow.id}/security-approval`,
      { decision, notes }
    );
    setOpenApproval(false);
    fetchData({ reset: true });
  } catch (e) {
    DangerMsg('خطأ', 'فشل تحديث الموافقة');
  }
};



const handleEditApproval = (row) => {
  if (row.is_migrated) {
    setOpenMigratedAlert(true);
    return;
  }
  setSelectedRow(row);
  setDecision('');
  setNotes('');
  setOpenApproval(true);
};


const handleTrackClose = () => {
  setOpenTrack(false);
  setSelectedRow(null);
  setStages([]);
};

const approvalByRole = {
  mokhabarat: {
    field: 'mok_approval',
    header: 'موافقة المخابرات',
  },
  amn_watani: {
    field: 'amn_wat_approval',
    header: 'موافقة الأمن الوطني',
  },
  istikhbarat_defense: {
    field: 'istk_approval',
    header: 'موافقة استخبارات الدفاع',
  },
  iqama: {
    field: 'iqama_approval',
    header: 'موافقة الإقامة',
  },
};

const approvalColumn =
  approvalByRole[userRole] || {
    field: 'istk_approval',
    header: 'حالة الموافقة',
  };



  const columns = [
    { field: 'id', headerName: 'رقم الحالة', width: 75 },
    {
      field: 'full_name',
      headerName: 'الاسم الكامل',
width: 250,
      valueGetter: (params) =>
        `${params.row.frist_name || ''} ${params.row.second_name || ''} ${params.row.theard_name || ''} ${params.row.sur_name || ''}`,
    },{
  field: approvalColumn.field,   // ✅ دينمك
  headerName: approvalColumn.header,
  width: 160,
 valueGetter: (params) =>
    params.row?.[approvalColumn.field] ?? '-',
},


    {
  field: 'actions',
  headerName: 'الإجراءات',
  width: 100,
  sortable: false,
      renderCell: (params) => (
<Button
  variant="contained"
  color="primary"
  sx={{ transform: 'scaleX(-1)' }}
  onClick={(e) => {
    e.stopPropagation();   // ⭐
    handleTrackOpen(params.row);
  }}
>
  تتبّع الطلب
</Button>

      ),
},
{
  field: 'edit',
  headerName: 'تغيير الموافقة',
  width: 100,
  sortable: false,
  renderCell: (params) => {
    const migrated = params.row.is_migrated;

    const handleClick = () => {
      if (migrated) {
        setOpenMigratedAlert(true);
        return;
      }
      handleTrackOpen(params.row);
    };

    return (
<Button
  variant="contained"
  color={migrated ? 'secondary' : 'primary'}
  sx={{ transform: 'scaleX(-1)' }}
  onClick={(e) => {
    e.stopPropagation();   // ⭐
    handleEditApproval(params.row);
  }}
>
  عدّل
</Button>

    );
  },
},


{
  field: 'is_migrated',
  headerName: 'حالة القيد',
  width: 100,
  renderCell: (params) =>
    params.value ? (
      <Box sx={{ color: 'green', fontWeight: 'bold', transform: 'scaleX(-1)' }}>
        مرحل
      </Box>
    ) : (
      <Box sx={{ color: 'blue', transform: 'scaleX(-1)' }}>
        غير مرحل
      </Box>
    ),
}
  ];
  const hiddenFields = [
  'files',
  'created_at',
  'updated_at',
];

const fieldLabels = {

    gender: 'الجنس', //confirmed
    interview_date: 'تاريخ المقابلة', //confirmed
    interview_officername: 'اسم مسؤول المقابلة', //confirmed
    frist_name: 'الاسم  ', //confirmed
    second_name: 'اسم الأب', //confirmed
    theard_name: 'اسم الجد', //confirmed
    sur_name: 'اللقب', //confirmed
    mother_name: 'اسم الأم', //  confirmed
    fath_mother_name: 'اسم  اب الأم', //confirmed
    religion: 'الديانة', //confirmed
    birth_date: 'تاريخ الولادة', //confirmed
    birth_place: 'مكان الولادة', //confirmed
    placeofbirthcity: 'مدينة الولادة', // confirmed
    marital_status: 'الحالة الاجتماعية', //confirmed
    spouse_nationality: 'جنسية الزوج/الزوجة', //confirmed
    marital_status_date: 'تاريخ الحالة الاجتماعية', // confirmed
    phone_number: 'رقم الهاتف', //confirmed
    governorate: 'المحافظة', //confirmed
    district: 'القضاء', //confirmed
    subdistrict: 'المنطقة', //confirmed
    nationality: 'جنسية مقدم الطلب', //confirmed
    origin_country: 'بلد الأصل', //confirmed
    profession: 'المهنة', //confirmed
    education_level_id: 'المستوى التعليمي', //confirmed
    father_date_ofbirth: 'تاريخ ميلاد الأب', //confirmed
    father_isdead: 'هل الأب متوفى؟', //confirmed
    father_nationalityid: 'جنسية الأب', //confirmed
    mother_date_ofbirth: 'تاريخ ميلاد الأم', //confirmed
    mother_isdead: 'هل الأم متوفاة؟', //confirmed
    mother_nationalityid: 'جنسية الأم', //confirmed

    personal_photo: 'الصورة الشخصية', //confirmed
    // political_opinion: 'الرأي السياسي', //confirmed
    // social_group_membership: 'الانتماء الاجتماعي أو القبلي',
    reasons_for_persecution: 'أسباب طلب اللجوء', // confirmed
    // last_place_of_residence: 'آخر مكان سكن فيه',
    // residency_duration: 'مدة الإقامة في آخر مكان',
    // military_service: 'هل لديك خدمة عسكرية؟',
    political_party_membership: 'هل تنتمي لأحزاب سياسية؟', //confirmed
    political_party_names: 'أسماء الأحزاب', //confirmed
    departure_date_from_origin: 'تاريخ مغادرة البلد الأصلي', //confirmed
    date_of_arrival_to_iraq: 'تاريخ الوصول إلى العراق', //confirmed
    is_iraq_residency: 'هل لديك إقامة في العراق؟', //confirmed
    residency_issue_date: 'تاريخ إصدار الإقامة', //confirmed
    residency_expiry_date: 'تاريخ انتهاء الإقامة', //confirmed
    passport: 'هل لديك جواز سفر', //confirme
    passport_number: 'رقم الجواز', //confirmed
    passportissuecountry: 'بلد إصدار جواز السفر', //confirmed
    familypassports: '   هل كل أفراد العائلة لديهم جوازات سفر؟   ', //confirmed
    reasons_for_leaving_origin: 'أسباب مغادرة البلد الأصلي', //confirmed
    // previous_country_before_iraq: 'البلد السابق قبل القدوم إلى العراق',
    residency_befor_iraq: ' محل الاقامة قبل دخول الاراضي العراقية ', //confirmed
    residency_befor_iraq_durtion: 'الفترةالزمنية قبل دخول الاراضي العراقية ', //confirmed
    returntocountryhistory:
      '(اذكر بالتفصيل)هل سبق وأن عدت إلى بلدك بعد مغادرته؟ إذا كان الجواب نعم، فمتى؟ وأين كان مكان العودة ومتى؟ وماهي الفترة التي بقيت فيها؟ ماذا فعلت هناك؟ لماذا عدت إلى العراق؟', //confirmed
    intendtoreturn: 'هل تنوي العودة إلى بلدك؟', //confirmed
    preferredresidencereturn: 'اذا كنت تنوي العودة اين تفضل السكن ؟', //confirmed
    whathappensifreturn: 'ماذا سيحدث لك اذا عدت الى بلدك؟', //confirmed
    place_of_residence: '  آخر محل للإقامة ضمن مغادرة بلد الأصل (قرية/مدينة/مقاطعة/الدولة)', //confirmed
    duration_of_place: 'ماضي الفترة الزمنية التي قضيتها في هذا المكان قبل مغادرة بلدالأصل', //confirmed
    reasons_for_asylum: 'ملخص اسباب طلب اللجوء', //confirmed
    power_of_attorney_number: 'رقم الفورما', //confirmed
    form_issue_date: 'تاريخ إصدار الفورما', //confirmed
    form_expiry_date: 'تاريخ انتهاء الفورما', //confirmed
    form_place_of_issue: 'محل الاصدار', //confirmed
    race: 'العرق', //confirmed
    notes_case: 'تعليق',
    mok_approval: 'موافقة المخابرات',
    amn_wat_approval: 'موافقة الامن الوطني',
    istk_approval: 'موافقة استخبارات وامن الدفاع',
    iqama_approval: 'موافقة الاقامة',
    interviewnotes: 'ملخص المقابلة', //confirmed
};

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '—';

  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';

  if (
    (key.includes('date') || key.includes('at')) &&
    !isNaN(Date.parse(value))
  ) {
    return new Date(value).toLocaleDateString('ar-IQ');
  }

  return String(value);
};

const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">
      {value ?? '—'}
    </Typography>
  </Grid>
);

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString('ar-IQ');
};

  return (
    <Box sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" mb={2}>التقارير حسب الإجراء</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={2}>
        <Grid container spacing={2}>
          {Object.keys(filters).map((key) => (
            <Grid item xs={12} md={3} key={key}>
              <TextField
                label={filterLabels[key]}
                fullWidth
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
              />
            </Grid>
          ))}
          <Grid item xs={12} md={3}>
            <Button variant="contained" fullWidth onClick={handleSearch} disabled={loading}>
              بحث
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box ref={tableRef} sx={{ height:'100%' }}>
<DataGrid
  rows={rows}
  columns={columns}
  loading={loading}
  getRowId={(row) => row.id}
  hideFooterPagination
  hideFooterSelectedRowCount
  slots={{ toolbar: GridToolbar }}
  onRowClick={(params) => handleOpenDetails(params.row)}
  disableRowSelectionOnClick
/>

      </Box>

      <Stack direction="row" justifyContent="flex-end" mt={2}>
        <Button
  variant="outlined"
  disabled={loading}
  onClick={() =>
    fetchData({
      direction: 'next',
      cursor: null,
      reset: true,
    })
  }
>
  الرجوع إلى البداية
</Button>


        <Button
          variant="outlined"
          disabled={!pageInfo.hasNext || loading}
          onClick={() =>
            fetchData({ cursor: pageInfo.nextCursor })
          }
        >
          التالي
        </Button>
      </Stack>
      <Dialog open={openTrack} onClose={handleTrackClose} maxWidth="md" fullWidth>
  <DialogTitle>خط سير المعاملة / تتبّع الطلب</DialogTitle>
  <DialogContent dividers>

    {stagesLoading && (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )}

    {!stagesLoading && stages.length === 0 && (
      <Typography align="center">لا توجد مراحل بعد</Typography>
    )}

    {!stagesLoading && stages.length > 0 && (
      <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>تاريخ الإجراء</th>
            <th>المرحلة</th>
            <th>ملاحظات</th>
            <th>تم بواسطة</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((s, i) => (
            <tr key={i}>
              <td>{s.action_at && new Date(s.action_at).toLocaleString('ar-IQ')}</td>
              <td>{stageMap[s.stage] || s.stage}</td>
              <td>{s.notes || ''}</td>
              <td>{s.action_by_name || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

  </DialogContent>
  <DialogActions>
    <Button onClick={handleTrackClose}>إغلاق</Button>
  </DialogActions>
</Dialog>

<Dialog
  open={openMigratedAlert}
  onClose={() => setOpenMigratedAlert(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>لا يمكن التعديل</DialogTitle>

  <DialogContent dividers>
   <Typography>
  هذا القيد تم ترحيله إلى <b>نظام عشتار</b>، ولا يمكن إجراء أي تعديل أو تغيير عليه.
  <br /><br />
  في حال وجود تغيير في الموافقة الأمنية، أو في حال الرغبة <b>بإلغاء القيد</b>،
  يرجى التواصل مع <b>مسؤول نظام عشتار</b> في أسرع وقت ممكن
  وإبلاغه بالتحديث المطلوب لاتخاذ الإجراء اللازم.
</Typography>

  </DialogContent>

  <DialogActions>
    <Button
      variant="contained"
      onClick={() => setOpenMigratedAlert(false)}
    >
      فهمت
    </Button>
  </DialogActions>
</Dialog>
<Dialog open={openApproval} onClose={() => setOpenApproval(false)}>
  <DialogTitle>تعديل الموافقة الأمنية</DialogTitle>

  <DialogContent>
    <Button
      fullWidth
      variant={decision === 'موافق' ? 'contained' : 'outlined'}
      onClick={() => setDecision('موافق')}
    >
      موافق
    </Button>

    <Button
      fullWidth
      sx={{ mt: 1 }}
      color="error"
      variant={decision === 'رفض' ? 'contained' : 'outlined'}
      onClick={() => setDecision('رفض')}
    >
      رفض
    </Button>

    <TextField
      label="ملاحظات"
      fullWidth
      multiline
      rows={3}
      sx={{ mt: 2 }}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenApproval(false)}>إلغاء</Button>
    <Button
      variant="contained"
      disabled={!decision}
      onClick={submitApproval}
    >
      حفظ
    </Button>
  </DialogActions>
</Dialog>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: '80%', md: '65%' } } }} // تحسين استجابة العرض على الشاشات المختلفة
      >
        <Box p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
              تفاصيل اللاجئ - رقم الطلب: {refugeeDetails?.id}
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon sx={{ fontSize: 30, color: 'error.main' }} />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {refugeeDetails && (
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
                {/* {refugeeDetails.personal_photo ? (
                  <Avatar
                    alt={refugeeDetails.frist_name}
                    src={refugeeDetails.personal_photo}
                    sx={{ width: 140, height: 140, border: '4px solid', borderColor: 'primary.main', m: '0 auto' }}
                  />
                ) : (
                  <Avatar sx={{ width: 140, height: 140, bgcolor: 'grey.400', fontSize: '3rem', m: '0 auto' }}>
                    {refugeeDetails.frist_name ? refugeeDetails.frist_name.charAt(0) : '؟'}
                  </Avatar>
                )} */}

                {refugeeDetails.personal_photo ? (
                  <Avatar
                    alt={refugeeDetails.frist_name}
                    src={refugeeDetails.personal_photo || DEFAULT_PHOTO}
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
                    {refugeeDetails.frist_name ? refugeeDetails.frist_name.charAt(0) : '؟'}
                  </Avatar>
                )}

                <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {refugeeDetails.frist_name} {refugeeDetails.second_name} {refugeeDetails.last_name} {refugeeDetails.theard_name}{' '}
                  {refugeeDetails.sur_name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {refugeeDetails.nationality}
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
                  <DetailItem label="الجنس" value={refugeeDetails.gender} />
                  <DetailItem label="الاسم " value={refugeeDetails.frist_name} />
                  <DetailItem label="الاب " value={refugeeDetails.second_name} />
                  <DetailItem label="الجد " value={refugeeDetails.theard_name} />
                  <DetailItem label="اللقب " value={refugeeDetails.sur_name} />
                  {/* استخدام الدالة المساعدة للتنسيق الاحترافي */}

                  <DetailItem label="اسم الام " value={refugeeDetails.mother_name} />
                  <DetailItem label="اسم اب الام " value={refugeeDetails.fath_mother_name} />
                  <DetailItem label="تاريخ الميلاد" value={formatDate(refugeeDetails.birth_date)} />
                  <DetailItem label="بلد الميلاد" value={refugeeDetails.birth_place} />
                  <DetailItem label="مدينة الميلاد" value={refugeeDetails.placeofbirthcity} />
                  <DetailItem label="الديانة" value={refugeeDetails.religion} />
                  <DetailItem label="جنسية مقدم الطلب" value={refugeeDetails.nationality} />
                  <DetailItem label="بلد الأصل " value={refugeeDetails.origin_country} />
                  <DetailItem label="المهنة" value={refugeeDetails.profession} />
                  <DetailItem label="المستوى التعليمي" value={refugeeDetails.education_level_id} />
                  <DetailItem label="رقم الهاتف" value={refugeeDetails.phone_number} />
                </Grid>
              </Grid>


              {/* ----------------- معلومات الوالدين ----------------- */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'divider', pb: 0.5 }}
                >
                  معلومات الوالدين
                </Typography>
                <Grid container spacing={3}>
                  <DetailItem label="تاريخ ميلاد الأب" value={refugeeDetails.father_date_ofbirth} />
                  <DetailItem label="هل الأب متوفى؟" value={refugeeDetails.father_isdead} />
                  <DetailItem label="جنسية الأب" value={refugeeDetails.father_nationalityid} />
                  <DetailItem label="تاريخ ميلاد الأم" value={refugeeDetails.mother_date_ofbirth} />
                  <DetailItem label="هل الأم متوفاة؟" value={refugeeDetails.mother_isdead} />
                  <DetailItem label="جنسية الأم" value={refugeeDetails.mother_nationalityid} />
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
                  <DetailItem label="الحالة الاجتماعية" value={refugeeDetails.marital_status} />
                  <DetailItem label="تاريخ الحالة الاجتماعية " value={formatDate(refugeeDetails.marital_status_date)} />
                  <DetailItem label="جنسية الزوج/الزوجة" value={refugeeDetails.spouse_nationality} />
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
                  <DetailItem label="المحافظة" value={refugeeDetails.governorate} />
                  <DetailItem label="القضاء" value={refugeeDetails.district} />
                  <DetailItem label="المنطقة" value={refugeeDetails.subdistrict} />
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
                  <DetailItem label="الرأي السياسي" value={refugeeDetails.political_opinion} />
                  <DetailItem label="الانتماء الاجتماعي" value={refugeeDetails.social_group_membership} />
                  <DetailItem label="أسباب الاضطهاد" value={refugeeDetails.reasons_for_persecution} />
                  <DetailItem label="آخر مكان إقامة" value={refugeeDetails.last_place_of_residence} />
                  <DetailItem label="مدة الإقامة هناك" value={refugeeDetails.residency_duration} />
                  <DetailItem label="خدمة عسكرية" value={refugeeDetails.military_service} />
                  <DetailItem label=" هل تنتمي لاحزاب سياسية " value={refugeeDetails.political_party_membership} />
                  {refugeeDetails.political_party_membership === 'نعم' && (
                    <DetailItem label="أسماء الأحزاب السياسية" value={refugeeDetails.political_party_names} />
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
                    value={formatDate(refugeeDetails.departure_date_from_origin)}
                  />
                  <DetailItem label="تاريخ الوصول إلى العراق" value={formatDate(refugeeDetails.date_of_arrival_to_iraq)} />
                  <DetailItem label="هل لديك اقامة في العراق؟" value={refugeeDetails.is_iraq_residency} />
                  <DetailItem
                    label="محل الاقامة قبل الدخول الاراضي العراقية"
                    value={refugeeDetails.residency_befor_iraq}
                  />
                  <DetailItem label="الفترة التي قضيتها هناك" value={refugeeDetails.residency_befor_iraq_durtion} />
                  <DetailItem label="تاريخ اصدار الاقامة" value={formatDate(refugeeDetails.residency_issue_date)} />
                  <DetailItem label="تاريخ انتهاء الاقامة" value={formatDate(refugeeDetails.residency_expiry_date)} />
                  <DetailItem
                    label="اذكر بإيجاز أسباب مغادرتك لبلد الأصل:
"
                    value={refugeeDetails.reasons_for_leaving_origin}
                  />
                  <DetailItem label="البلد السابقة قبل العراق" value={refugeeDetails.previous_country_before_iraq} />
                  <DetailItem label="ملخص اسباب طلب اللجوء" value={refugeeDetails.reasons_for_asylum} />
                  <DetailItem label=" هل لديك جواز سفر " value={refugeeDetails.passport} />
                  <DetailItem label="رقم جواز السفر" value={refugeeDetails.passport_number} />
                  <DetailItem label="بلد اصدار جواز السفر" value={refugeeDetails.passportissuecountry} />
                  <DetailItem label="هل كل افراد العائلة لديهم جوازات سفر" value={refugeeDetails.familypassports} />
                  <DetailItem
                    label="هل سبق وأن عدت إلى بلدك بعد مغادرته؟ إذا كان الجواب نعم، فمتى؟ وأين كان مكان العودة ومتى؟ وماهي الفترة التي بقيت فيها؟ ماذا فعلت هناك؟ لماذا عدت إلى العراق؟"
                    value={refugeeDetails.returntocountryhistory}
                  />
                  <DetailItem label="هل تنوي العودة الى بلدك ؟" value={refugeeDetails.intendtoreturn} />
                  <DetailItem
                    label=" إذا كنت تنوي العودة أين تفضل السكن"
                    value={refugeeDetails.preferredresidencereturn}
                  />{' '}
                  <DetailItem label="ماذا سيحدث لك او لعائلتك اذا عدت " value={refugeeDetails.whathappensifreturn} />
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
                  <DetailItem label="رقم الحالة" value={refugeeDetails.id} />
                  <DetailItem label="المرحلة الحالية" value={refugeeDetails.current_stage} />
                  <DetailItem label="اسم موظف المقابلة" value={refugeeDetails.interview_officername} />
                  <DetailItem label=" ملخص المقابلة " value={refugeeDetails.interviewnotes} />
                  <DetailItem label="تاريخ المقابلة" value={formatDate(refugeeDetails.interview_date)} />
                  <DetailItem label="تاريخ الإنشاء" value={formatDate(refugeeDetails.created_at)} />
                  <DetailItem label="آخر تحديث" value={formatDate(refugeeDetails.updated_at)} />
                  {/* عرض الملاحظات بشكل كامل */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      الملاحظات:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, backgroundColor: 'grey.50' }}>
                      <Typography variant="body1" sx={{ fontWeight: 400, fontSize: '1.0rem' }}>
                        {refugeeDetails.notes || 'لا توجد ملاحظات'}
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


// import React, { useContext,useCallback, useEffect, useRef, useState } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import {
//   Stack,
//   Typography,
//   Box,
//   Button,
//   TextField,
//   Grid,
//   Alert, Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
// } from '@mui/material';
// import { useApi } from '../utils';
// import { DangerMsg } from '../components/NotificationMsg';
// import { appContext } from '../context';

// export default function SecurityPage() {
//   const tableRef = useRef();
//   const api = useApi();
//     const { user } = useContext(appContext);
//     const userRole = user.roles; // أو من الكونتكست/ستيت2023

// const [openTrack, setOpenTrack] = useState(false);
// const [refugeeDetails, setSelectedRow] = useState(null);
// const [stages, setStages] = useState([]);
// const [stagesLoading, setStagesLoading] = useState(false);
// const [openMigratedAlert, setOpenMigratedAlert] = useState(false);
// const [openApproval, setOpenApproval] = useState(false);
// const [decision, setDecision] = useState('');
// const [notes, setNotes] = useState('');

// const stageMap = {
//   admin: 'مدير النظام',
//   data_entry: 'مدخل بيانات',
//   reviewer: 'مدقق',
//   approver: 'موافقة اللجنة',
//   mokhabarat: 'المخابرات',
//   amn_watani: 'امن وطني',
//   istikhbarat_defense: 'استخبارات الدفاع',
//   iqama: 'الاقامة',
// };

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [pageInfo, setPageInfo] = useState({ hasNext: false, nextCursor: null });

//   const [filters, setFilters] = useState({
//     id: '',
//     frist_name: '',
//     second_name: '',
//     theard_name: '',
//     sur_name: '',
//     mother_name: '',
//     fath_mother_name: '',
//   });

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const fetchData = useCallback(
//     async ({ cursor = null, reset = false } = {}) => {
//       setLoading(true);
//       setError('');

//       try {
//         const params = {};

//         Object.entries(filters).forEach(([k, v]) => {
//           if (v) params[k] = v;
//         });

//         if (!reset && cursor) params.cursor = cursor;

//         const query = new URLSearchParams(params).toString();
//         const url = query ? `freqs/by-action?${query}` : 'freqs/by-action';

//         const response = await api('GET', url);
//         const { data, hasNext, nextCursor, msg } = response || {};

//         if (!Array.isArray(data)) {
//           setError(msg || 'فشل في جلب البيانات');
//           setRows([]);
//           setPageInfo({ hasNext: false, nextCursor: null });
//           return;
//         }

//         setRows(data);
//         setPageInfo({ hasNext, nextCursor });
//       } catch (err) {
//         console.error(err);
//         setError('خطأ غير متوقع أثناء الاتصال بالخادم');
//         setRows([]);
//         setPageInfo({ hasNext: false, nextCursor: null });
//       } finally {
//         setLoading(false);
//       }
//     },
//     [filters, api]
//   );

//   useEffect(() => {
//     fetchData({ reset: true });
//   }, []);

//   const handleSearch = () => {
//     fetchData({ reset: true });
//   };
// const filterLabels = {
//   id: 'رقم الطلب',
//   frist_name: 'الاسم الأول',
//   second_name: 'اسم الأب',
//   theard_name: 'اسم الجد',
//   sur_name: 'اللقب',
//   mother_name: 'اسم الأم',
//   fath_mother_name: 'اسم والد الأم',
// };

//   const handleTrackOpen = async (row) => {
//   setSelectedRow(row);
//   setOpenTrack(true);
//   setStages([]);
//   setStagesLoading(true);

//   try {
//     const endpoint = `freqs/refugees/${row.id}/stages`;
//     const { success, data, msg } = await api('GET', endpoint);

//     if (!success) {
//       DangerMsg('تتبّع الطلب', msg || 'فشل في جلب المراحل');
//       setStages([]);
//     } else {
//       setStages(Array.isArray(data) ? data : data?.records || []);
//     }
//   } catch (e) {
//     console.error(e);
//     DangerMsg('تتبّع الطلب', 'خطأ أثناء الاتصال');
//     setStages([]);
//   } finally {
//     setStagesLoading(false);
//   }
// };

// const submitApproval = async () => {
//   try {
//     await api(
//       'PUT',
//       `freqs/refugees/${selectedRow.id}/security-approval`,
//       { decision, notes }
//     );
//     setOpenApproval(false);
//     fetchData({ reset: true });
//   } catch (e) {
//     DangerMsg('خطأ', 'فشل تحديث الموافقة');
//   }
// };



// const handleEditApproval = (row) => {
//   if (row.is_migrated) {
//     setOpenMigratedAlert(true);
//     return;
//   }
//   setSelectedRow(row);
//   setDecision('');
//   setNotes('');
//   setOpenApproval(true);
// };


// const handleTrackClose = () => {
//   setOpenTrack(false);
//   setSelectedRow(null);
//   setStages([]);
// };

// const approvalByRole = {
//   mokhabarat: {
//     field: 'mok_approval',
//     header: 'موافقة المخابرات',
//   },
//   amn_watani: {
//     field: 'amn_wat_approval',
//     header: 'موافقة الأمن الوطني',
//   },
//   istikhbarat_defense: {
//     field: 'istk_approval',
//     header: 'موافقة استخبارات الدفاع',
//   },
//   iqama: {
//     field: 'iqama_approval',
//     header: 'موافقة الإقامة',
//   },
// };

// const approvalColumn =
//   approvalByRole[userRole] || {
//     field: 'istk_approval',
//     header: 'حالة الموافقة',
//   };



//   const columns = [
//     { field: 'id', headerName: 'رقم الحالة', width: 75 },
//     {
//       field: 'full_name',
//       headerName: 'الاسم الكامل',
// width: 250,
//       valueGetter: (params) =>
//         `${params.row.frist_name || ''} ${params.row.second_name || ''} ${params.row.theard_name || ''} ${params.row.sur_name || ''}`,
//     },{
//   field: approvalColumn.field,   // ✅ دينمك
//   headerName: approvalColumn.header,
//   width: 160,
//  valueGetter: (params) =>
//     params.row?.[approvalColumn.field] ?? '-',
// },


//     {
//   field: 'actions',
//   headerName: 'الإجراءات',
//   width: 100,
//   sortable: false,
//       renderCell: (params) => (
//         <Button
//           variant="contained"
//           color="primary"
//           sx={{
//             transform: 'scaleX(-1);', // يوقف أي عكس
//           }}
//          onClick={() => handleTrackOpen(params.row)}
//         >
//           تتبّع الطلب
//         </Button>
//       ),
// },
// {
//   field: 'edit',
//   headerName: 'تغيير الموافقة',
//   width: 100,
//   sortable: false,
//   renderCell: (params) => {
//     const migrated = params.row.is_migrated;

//     const handleClick = () => {
//       if (migrated) {
//         setOpenMigratedAlert(true);
//         return;
//       }
//       handleTrackOpen(params.row);
//     };

//     return (
//       <Button
//         variant="contained"
//         color={migrated ? 'secondary' : 'primary'}
//         sx={{ transform: 'scaleX(-1)' }}
// onClick={() => handleEditApproval(params.row)}
//       >
//         عدّل
//       </Button>
//     );
//   },
// },


// {
//   field: 'is_migrated',
//   headerName: 'حالة القيد',
//   width: 100,
//   renderCell: (params) =>
//     params.value ? (
//       <Box sx={{ color: 'green', fontWeight: 'bold', transform: 'scaleX(-1)' }}>
//         مرحل
//       </Box>
//     ) : (
//       <Box sx={{ color: 'blue', transform: 'scaleX(-1)' }}>
//         غير مرحل
//       </Box>
//     ),
// }
//   ];
//   return (
//     <Box sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
//       <Typography variant="h4" mb={2}>التقارير حسب الإجراء</Typography>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       <Box mb={2}>
//         <Grid container spacing={2}>
//           {Object.keys(filters).map((key) => (
//             <Grid item xs={12} md={3} key={key}>
//               <TextField
//                 label={filterLabels[key]}
//                 fullWidth
//                 value={filters[key]}
//                 onChange={(e) => handleFilterChange(key, e.target.value)}
//               />
//             </Grid>
//           ))}
//           <Grid item xs={12} md={3}>
//             <Button variant="contained" fullWidth onClick={handleSearch} disabled={loading}>
//               بحث
//             </Button>
//           </Grid>
//         </Grid>
//       </Box>

//       <Box ref={tableRef} sx={{ height:'100%' }}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           loading={loading}
//           getRowId={(row) => row.id}
//           hideFooterPagination
//           hideFooterSelectedRowCount
//           slots={{ toolbar: GridToolbar }}
//         />
//       </Box>

//       <Stack direction="row" justifyContent="flex-end" mt={2}>
//         <Button
//   variant="outlined"
//   disabled={loading}
//   onClick={() =>
//     fetchData({
//       direction: 'next',
//       cursor: null,
//       reset: true,
//     })
//   }
// >
//   الرجوع إلى البداية
// </Button>


//         <Button
//           variant="outlined"
//           disabled={!pageInfo.hasNext || loading}
//           onClick={() =>
//             fetchData({ cursor: pageInfo.nextCursor })
//           }
//         >
//           التالي
//         </Button>
//       </Stack>
//       <Dialog open={openTrack} onClose={handleTrackClose} maxWidth="md" fullWidth>
//   <DialogTitle>خط سير المعاملة / تتبّع الطلب</DialogTitle>
//   <DialogContent dividers>

//     {stagesLoading && (
//       <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//         <CircularProgress />
//       </Box>
//     )}

//     {!stagesLoading && stages.length === 0 && (
//       <Typography align="center">لا توجد مراحل بعد</Typography>
//     )}

//     {!stagesLoading && stages.length > 0 && (
//       <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
//         <thead>
//           <tr>
//             <th>تاريخ الإجراء</th>
//             <th>المرحلة</th>
//             <th>ملاحظات</th>
//             <th>تم بواسطة</th>
//           </tr>
//         </thead>
//         <tbody>
//           {stages.map((s, i) => (
//             <tr key={i}>
//               <td>{s.action_at && new Date(s.action_at).toLocaleString('ar-IQ')}</td>
//               <td>{stageMap[s.stage] || s.stage}</td>
//               <td>{s.notes || ''}</td>
//               <td>{s.action_by_name || ''}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     )}

//   </DialogContent>
//   <DialogActions>
//     <Button onClick={handleTrackClose}>إغلاق</Button>
//   </DialogActions>
// </Dialog>

// <Dialog
//   open={openMigratedAlert}
//   onClose={() => setOpenMigratedAlert(false)}
//   maxWidth="sm"
//   fullWidth
// >
//   <DialogTitle>لا يمكن التعديل</DialogTitle>

//   <DialogContent dividers>
//    <Typography>
//   هذا القيد تم ترحيله إلى <b>نظام عشتار</b>، ولا يمكن إجراء أي تعديل أو تغيير عليه.
//   <br /><br />
//   في حال وجود تغيير في الموافقة الأمنية، أو في حال الرغبة <b>بإلغاء القيد</b>،
//   يرجى التواصل مع <b>مسؤول نظام عشتار</b> في أسرع وقت ممكن
//   وإبلاغه بالتحديث المطلوب لاتخاذ الإجراء اللازم.
// </Typography>

//   </DialogContent>

//   <DialogActions>
//     <Button
//       variant="contained"
//       onClick={() => setOpenMigratedAlert(false)}
//     >
//       فهمت
//     </Button>
//   </DialogActions>
// </Dialog>
// <Dialog open={openApproval} onClose={() => setOpenApproval(false)}>
//   <DialogTitle>تعديل الموافقة الأمنية</DialogTitle>

//   <DialogContent>
//     <Button
//       fullWidth
//       variant={decision === 'موافق' ? 'contained' : 'outlined'}
//       onClick={() => setDecision('موافق')}
//     >
//       موافق
//     </Button>

//     <Button
//       fullWidth
//       sx={{ mt: 1 }}
//       color="error"
//       variant={decision === 'رفض' ? 'contained' : 'outlined'}
//       onClick={() => setDecision('رفض')}
//     >
//       رفض
//     </Button>

//     <TextField
//       label="ملاحظات"
//       fullWidth
//       multiline
//       rows={3}
//       sx={{ mt: 2 }}
//       value={notes}
//       onChange={(e) => setNotes(e.target.value)}
//     />
//   </DialogContent>

//   <DialogActions>
//     <Button onClick={() => setOpenApproval(false)}>إلغاء</Button>
//     <Button
//       variant="contained"
//       disabled={!decision}
//       onClick={submitApproval}
//     >
//       حفظ
//     </Button>
//   </DialogActions>
// </Dialog>



//     </Box>
//   );
// }

