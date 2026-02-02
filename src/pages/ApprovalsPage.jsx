import React, { useContext, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Avatar from '@mui/material/Avatar';

import {
  Stack,
  Typography,
  Box,
  Modal,
  Button,
  Grid,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Container, // Make sure Container is imported
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PauseIcon from '@mui/icons-material/Pause';
import { SuccessMsg } from '../utils/alerts'; // عدل المسار حسب مكان الملف

import { useApi } from '../utils';
import { DangerMsg, NotificationMsg } from '../components/NotificationMsg';
import { LoadingButton } from '@mui/lab';

import { appContext } from '../context';
import ActionWithNote from './ActionWithNote'

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      dir="rtl"
    >
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
}

export default function ApprovalsPage() {
  const [openFamilyDialog, setOpenFamilyDialog] = useState(false);

  const [isForwarding, setIsForwarding] = useState(false);
  const [refugees, setRefugees] = useState([]);
  const [familyData, setFamilyData] = useState([]);
  const [selectedRefugee, setSelectedRefugee] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const api = useApi();

  const [isEditing, setIsEditing] = useState(false);
  const [editableRefugeeData, setEditableRefugeeData] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    refugee_id: null,
    first_name_member: '',
    second_name_member: '',
    theard_name_member: '',
    birthday_member: '',
    relation_member: '',
  });
const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
const [pendingRefugee, setPendingRefugee] = useState(null);
const [officerName, setOfficerName] = useState('');
const [interviewDate, setInterviewDate] = useState('');
useEffect(() => {
  if (openInterviewDialog) {
    setOfficerName('');
    setInterviewDate('');
  }
}, [openInterviewDialog]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const FILES_BASE_URL = process.env.REACT_APP_FILES_BASE_URL;
  const DEFAULT_PHOTO = process.env.REACT_APP_DEFAULT_PHOTO;
  const { user } = useContext(appContext);
  const [lookups, setLookups] = useState({});
  const LOOKUP_MAP = {
    gender: 'Sex',
    religion: 'Religions',
    marital_status: 'MaritalStatus',
    nationality: 'Nationalities',
    spouse_nationality: 'COUNTRY',
    birth_place: 'COUNTRY',
    profession: 'Occupations',
    race: 'Ethnicities',
    origin_country: 'COUNTRY',
    education_level_id: 'EducationLevels',
    father_nationalityid: 'Nationalities',
    mother_nationalityid: 'Nationalities',

  };
  const mapLabelsToIdsByLookupMap = (record, lookups, LOOKUP_MAP) => {
    const result = { ...record };

    Object.keys(LOOKUP_MAP).forEach((field) => {
      const value = record[field];
      const lookupArr = lookups[field];

      if (!value || !Array.isArray(lookupArr)) return;

      const found = lookupArr.find((o) => o.description_ar === value || o.name === value);

      if (found) {
        result[field] = found.id;
      }
    });

    return result;
  };

  const [isLoadingLookups, setIsLoadingLookups] = useState(false);

  const loadAllLookups = async (force = false) => {
    if (!force && Object.keys(lookups).length === Object.keys(LOOKUP_MAP).length) {
      return lookups;
    }

    setIsLoadingLookups(true);
    try {
      const entries = Object.entries(LOOKUP_MAP);

      const results = await Promise.all(
        entries.map(([key, category]) =>
          api('GET', `lookups/items?category=${category}`).then((res) => ({
            key,
            success: res.success,
            data: res.data,
          }))
        )
      );

      const aggregated = {};
      results.forEach((r) => {
        if (r.success) aggregated[r.key] = r.data;
      });

      setLookups(aggregated);
      return aggregated; // ✅ مهم جدًا
    } finally {
      setIsLoadingLookups(false);
    }
  };

  const loadLookup = async (key) => {
    if (lookups[key]) return; // لا تعيد الجلب إذا موجود

    const category = LOOKUP_MAP[key];
    if (!category) return;

    const { data, success } = await api('GET', `lookups/items?category=${category}`);
    if (success) {

      setLookups((prev) => ({
        ...prev,
        [key]: data,
      }));
    }
  };
console.log('FILES_BASE_URL =', FILES_BASE_URL);
console.log('DEFAULT_PHOTO =', DEFAULT_PHOTO);

  const navigate = useNavigate();

  const userRole = user.roles; // أو من الكونتكست/ستيت2023

  const fetchData = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      // تحديد المسار بناءً على الدور
      let endpoint = 'freqs/refugees';

      if (['mokhabarat', 'amn_watani', 'istikhbarat_defense', 'iqama', '', null].includes(userRole)) {
        endpoint = 'freqs/refugees/pending-approval';
      }

      const { success, data } = await api('GET', endpoint);
console.log('REFUGEES RAW FROM API =', data?.records || data);

      if (!success) {
        DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
        return;
      } else {
        NotificationMsg('اشعارات اللاجئين', 'تم  تحميل البيانات');
      }
      //  setRefugees(Array.isArray(data) || null);
      setRefugees(data?.records || data);
    } catch (err) {
      DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
      console.error(err);
    } finally {
      setIsLoadingTable(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //جلب بيانات العائلة
  const fetchFamily = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const { success, data } = await api('GET', `mains/family_members`);
      if (!success) {
        DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل تفاصيل العائلة');
        return;
      }
      setFamilyData(data?.records || data);
    } catch (err) {
      DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل العائلة');
      console.error(err);
    } finally {
      setIsLoadingTable(false);
    }
  }, []);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const mapLabelToId = (lookupsArray = [], label) => {
    const found = lookupsArray.find((o) => o.description_ar === label || o.name === label);
    return found ? found.id : '';
  };

  const token = localStorage.getItem("token");

  const handleRowClick = async (refugeeData) => {

    try {

      // const { success, data } = await api('GET',`freqs/refugees/${refugeeData.id}/with-files`);

      // const result = await data.json();

      // if (result.success && Array.isArray(result.data?.files)) {
      //   const photoFile = result.data.files.find((f) => f.file_name === 'personal_photo.png');

      //   refugeeData.personal_photo = photoFile
      //     ? `${FILES_BASE_URL}${photoFile.file_path.replace('/uploads', '')}`
      //     : DEFAULT_PHOTO;
      // } else {
      //   refugeeData.personal_photo = DEFAULT_PHOTO;
      // }

      const { success, data } = await api(
  'GET',
  `freqs/refugees/${refugeeData.id}/with-files`
);

if (success && Array.isArray(data?.files)) {
  const photoFile = data.files.find(
    (f) => f.file_name === 'personal_photo.png'
  );

  if (photoFile?.file_path) {
    refugeeData.personal_photo =
      `${FILES_BASE_URL}${photoFile.file_path.replace('/uploads', '')}`;
  } else {
    refugeeData.personal_photo = DEFAULT_PHOTO;
  }
} else {
  refugeeData.personal_photo = DEFAULT_PHOTO;
}




    } catch (error) {
      console.error('Error fetching photo:', error);
      refugeeData.personal_photo = DEFAULT_PHOTO;
    }
    setRefugees((prev) =>
      prev.map((r) => (r.id === refugeeData.id ? { ...r, personal_photo: refugeeData.personal_photo } : r))
    );

if (user.roles === 'data_entry') {
  const hasDate = !!refugeeData.interview_date;
  const hasOfficer = !!refugeeData.interview_officername;

  if (!hasDate && !hasOfficer) {
    // الاثنين مفقودين → ابدأ بالتاريخ
    setPendingRefugee({ ...refugeeData, require: 'date' });
    setOpenInterviewDialog(true);
    return;
  }

  if (hasDate && !hasOfficer) {
    setPendingRefugee({ ...refugeeData, require: 'officer' });
    setOpenInterviewDialog(true);
    return;
  }

  if (!hasDate && hasOfficer) {
    setPendingRefugee({ ...refugeeData, require: 'date' });
    setOpenInterviewDialog(true);
    return;
  }
}



    // ✅ نفس عملك السابق
    setSelectedRefugee(refugeeData);
    setIsEditing(false);

    const filteredFamily = familyData.filter((f) => f.refugee_id === refugeeData.id);
    setFamilyData(filteredFamily);
  };

  const handleClose = () => {
    setSelectedRefugee(null);
    setEditableRefugeeData(null);
    setTabIndex(0);
    setIsEditing(false);
    setSuspendReason('');
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableRefugeeData((prevData) => ({
      ...prevData,
      [name]: name === "mother_isdead" || name === "father_isdead"
      ? parseInt(value, 10) : value,
    }));
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

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
    placeofbirthcity: 'مدينة الولادة', //confirmed
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
    education_level_id: 'المستوى التعليمي', // confirmed
    father_date_ofbirth: 'تاريخ ميلاد الأب', // confirmed
    father_isdead: 'هل الأب متوفى؟', // confirmed
    father_nationalityid: 'جنسية الأب', // confirmed
    mother_date_ofbirth: 'تاريخ ميلاد الأم', // confirmed
    mother_isdead: 'هل الأم متوفاة؟', // confirmed
    mother_nationalityid: 'جنسية الأم', // confirmed
  };

  const personalFields = [
    'gender',
    'frist_name',
    'second_name',
    'theard_name',
    'sur_name',
    'mother_name',
    'fath_mother_name',
    'interview_officername',
    'interview_date',
    'birth_date',
    'birth_place',
    'placeofbirthcity',
    'religion',
    'marital_status',
    'spouse_nationality',
    'marital_status_date',
    'phone_number',
    'governorate',
    'district',
    'subdistrict',
    'nationality',
    'origin_country',
    'profession',
    'personal_photo',
    'education_level_id',
    'father_date_ofbirth',
    'father_isdead',
    'father_nationalityid',
    'mother_date_ofbirth',
    'mother_isdead',
    'mother_nationalityid'
  ];

  const additionalFields = Object.keys(fieldLabels).filter((key) => !personalFields.includes(key));

  const renderSection = (fields) => {
    const dataToDisplay = isEditing ? editableRefugeeData : selectedRefugee;

    const renderFieldValue = (key, value) => {
      if (key === 'personal_photo') {
        return value ? (
          <img src={value} alt="الصورة الشخصية" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: 8 }} />
        ) : (
          <Typography variant="body1" color="text.secondary">
            لا توجد صورة
          </Typography>
        );
      }
      
if (key === "father_isdead" || key === "mother_isdead") {
  return Number(value) === 1 ? "نعم" : "لا";
}


      if (
        key === 'birth_date' ||
        key === 'residency_issue_date' ||
        key === 'residency_expiry_date' ||
        key === 'form_issue_date' ||
        key === 'form_expiry_date' ||
        key === 'interview_date' ||
        key === 'departure_date_from_origin' ||
        key === 'date_of_arrival_to_iraq' ||
        key === 'father_date_ofbirth' ||
        key === 'mother_date_ofbirth'
      ) {
        return <Typography variant="body1">{formatDateForDisplay(value) || '---'}</Typography>;
      }
      return (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {value || '---'}
        </Typography>
      );
    };

    if (!isEditing) {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <tbody>
            {fields.map((key) => {
              if (key === 'personal_photo' && !dataToDisplay?.personal_photo) {
                return null;
              }

              const label = fieldLabels[key] || key;
              const value = dataToDisplay?.[key];

              return (
                <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                  <td
                    style={{
                      padding: '12px',
                      fontWeight: 'bold',
                      width: '35%',
                      backgroundColor: '#f5f5f5',
                      borderRight: '1px solid #ddd',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {label}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', width: '65%' }}>{renderFieldValue(key, value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    } else {
      return (
        <Grid container spacing={2}>
          {/* الجنس */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.gender}
              name="gender"
              value={editableRefugeeData?.gender || ''}
              onChange={handleInputChange}
            >
              {(lookups.gender || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* تاريخ المقابلة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={fieldLabels.interview_date}
              name="interview_date"
              value={formatDateForInput(editableRefugeeData?.interview_date)}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* اسم مسؤول المقابلة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.interview_officername}
              name="interview_officername"
              value={editableRefugeeData?.interview_officername || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* الاسم الأول */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.frist_name}
              name="frist_name"
              value={editableRefugeeData?.frist_name || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* اسم الأب */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.second_name}
              name="second_name"
              value={editableRefugeeData?.second_name || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* اسم الجد */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.theard_name}
              name="theard_name"
              value={editableRefugeeData?.theard_name || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* اللقب */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.sur_name}
              name="sur_name"
              value={editableRefugeeData?.sur_name || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* اسم الأم */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.mother_name}
              name="mother_name"
              value={editableRefugeeData?.mother_name || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* اسم أبي الأم */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.fath_mother_name}
              name="fath_mother_name"
              value={editableRefugeeData?.fath_mother_name || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* الديانة */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.religion}
              name="religion"
              value={editableRefugeeData?.religion || ''}
              onChange={handleInputChange}
            >
              {(lookups.religion || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* تاريخ الولادة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={fieldLabels.birth_date}
              name="birth_date"
              value={formatDateForInput(editableRefugeeData?.birth_date)}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* مكان الولادة */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.birth_place}
              name="birth_place"
              value={editableRefugeeData?.birth_place || ''}
              onChange={handleInputChange}
            >
              {(lookups.birth_place || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* مدينة الولادة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.placeofbirthcity}
              name="placeofbirthcity"
              value={editableRefugeeData?.placeofbirthcity || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* الحالة الاجتماعية */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.marital_status}
              name="marital_status"
              value={editableRefugeeData?.marital_status || ''}
              onChange={handleInputChange}
            >
              {(lookups.marital_status || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* تاريخ الحالة الاجتماعية */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={fieldLabels.marital_status_date}
              name="marital_status_date"
              value={formatDateForInput(editableRefugeeData?.marital_status_date || '')}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {/* جنسية الزوج  */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.spouse_nationality}
              name="spouse_nationality"
              value={editableRefugeeData?.spouse_nationality || ''}
              onChange={handleInputChange}
            >
              {(lookups.spouse_nationality || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* رقم الهاتف */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.phone_number}
              name="phone_number"
              value={editableRefugeeData?.phone_number || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* المحافظة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.governorate}
              name="governorate"
              value={editableRefugeeData?.governorate || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* القضاء */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.district}
              name="district"
              value={editableRefugeeData?.district || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* المنطقة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={fieldLabels.subdistrict}
              name="subdistrict"
              value={editableRefugeeData?.subdistrict || ''}
              onChange={handleInputChange}
            />
          </Grid>

          {/* القومية */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.nationality}
              name="nationality"
              value={editableRefugeeData?.nationality || ''}
              onChange={handleInputChange}
            >
              {(lookups.nationality || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* بلد الأصل */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.origin_country}
              name="origin_country"
              value={editableRefugeeData?.origin_country || ''}
              onChange={handleInputChange}
            >
              {(lookups.origin_country || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* المهنة */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.profession}
              name="profession"
              value={editableRefugeeData?.profession || ''}
              onChange={handleInputChange}
            >
              {(lookups.profession || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
         {/* المستوى التعليمي*/}

            <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.education_level_id}
              name="education_level_id"
              value={editableRefugeeData?.education_level_id || ''}
              onChange={handleInputChange}
            >
              {(lookups.EducationLevels || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* تاريخ ميلاد الأب */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={fieldLabels.father_date_ofbirth}
              name="father_date_ofbirth"
              value={formatDateForInput(editableRefugeeData?.father_date_ofbirth)}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* هل الأب متوفى؟ */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.father_isdead}
              name="father_isdead"
              value={editableRefugeeData?.father_isdead !== undefined && editableRefugeeData?.father_isdead !== null ? String(editableRefugeeData.father_isdead) : ""}
              onChange={handleInputChange}
            >
              <MenuItem value="1">نعم</MenuItem>
              <MenuItem value="0">لا</MenuItem>
            </TextField>
          </Grid>

          {/* جنسية الأب */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.father_nationalityid}
              name="father_nationalityid"
              value={editableRefugeeData?.father_nationalityid || ''}
              onChange={handleInputChange}
            >
              {(lookups.father_nationalityid || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>



          {/* تاريخ ميلاد الأم */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={fieldLabels.mother_date_ofbirth}
              name="mother_date_ofbirth"
              value={formatDateForInput(editableRefugeeData?.mother_date_ofbirth)}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>


          {/* هل الأم متوفاة؟ */}          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.mother_isdead}
              name="mother_isdead"
              value={editableRefugeeData?.mother_isdead !== undefined && editableRefugeeData?.mother_isdead !== null ? String(editableRefugeeData.mother_isdead) : ""}
              onChange={handleInputChange}
            >
              <MenuItem value="1">نعم</MenuItem>
              <MenuItem value="0">لا</MenuItem>
            </TextField>
          </Grid>

          {/* جنسية الأم */}          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={fieldLabels.mother_nationalityid}
              name="mother_nationalityid"
              value={editableRefugeeData?.mother_nationalityid || ''}
              onChange={handleInputChange}
            >
              {(lookups.father_nationalityid || []).map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.description_ar}
                </MenuItem>
              ))}
            </TextField>
          </Grid>








          {/* End final Grid   */}        
        </Grid>
      );
    }
  };

  // وضع التعديل (تحرير البيانات)
  const renderEditSection = (fields) => {
    return (
      <Grid container spacing={2}>
        {fields.map((key) => {
          if (key === 'personal_photo') {
            return null; // عادة لا نعدل الصورة من هنا
          }

          const label = fieldLabels[key] || key;
          const value = editableRefugeeData?.[key] || '';

          // لو الحقل تاريخ
          if (
            key === 'birth_date' ||
            key === 'residency_issue_date' ||
            key === 'residency_expiry_date' ||
            key === 'form_issue_date' ||
            key === 'form_expiry_date' ||
            key === 'interview_date' ||
            key === 'departure_date_from_origin' ||
            key === 'date_of_arrival_to_iraq' ||
            key === 'marital_status_date'  ||
            key === 'father_date_ofbirth' ||
            key === 'mother_date_ofbirth'
          ) {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  type="date"
                  label={label}
                  name={key}
                  value={formatDateForInput(value)}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            );
          }

          // لو الحقل اختيار (مثلاً: الجنس، الحالة الاجتماعية، الديانة)
          if (key === 'gender') {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField select fullWidth label={label} name="gender" value={value} onChange={handleInputChange}>
                  {(lookups.gender || []).map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.description_ar}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          if (key === 'religion') {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField select fullWidth label={label} name="religion" value={value} onChange={handleInputChange}>
                  {(lookups.religion || []).map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.description_ar}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          if (key === 'marital_status') {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  select
                  fullWidth
                  label={label}
                  name="marital_status"
                  value={value}
                  onChange={handleInputChange}
                >
                  {(lookups.marital_status || []).map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.description_ar}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }
          if (key === 'race') {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField select fullWidth label={label} name="race" value={value} onChange={handleInputChange}>
                  {(lookups.race || []).map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.description_ar}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          if (key === 'father_nationalityid') {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  select
                  fullWidth
                  label={label}
                  name="father_nationalityid"
                  value={value}
                  onChange={handleInputChange}
                >
                  {(lookups.father_nationalityid || []).map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.description_ar}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          if (key === 'mother_nationalityid') {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  select
                  fullWidth
                  label={label}
                  name="mother_nationalityid"
                  value={value}
                  onChange={handleInputChange}
                >
                  {(lookups.mother_nationalityid || []).map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.description_ar}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          if (
            key === 'mok_approval' ||
            key === 'amn_wat_approval' ||
            key === 'istk_approval' ||
            key === 'iqama_approval'
          ) {
            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField fullWidth label={label} name={key} value={value} disabled />
              </Grid>
            );
          }

          // باقي الحقول النصية
          return (
            <Grid item xs={12} sm={6} key={key}>
              <TextField fullWidth label={label} name={key} value={value} onChange={handleInputChange} />
            </Grid>
          );
        })}
      </Grid>
    );
  };
  const tableHeaders = [
    { id: 'personal_photo', label: 'الصورة  ' },
    { id: 'frist_name', label: 'الاسم  ' },
    { id: 'second_name', label: 'اسم الاب  ' },
    { id: 'theard_name', label: 'اسم الجد  ' },
    { id: 'sur_name', label: 'اللقب  ' },
    { id: 'interview_officername', label: 'مسؤول المقابلة  ' },
    { id: 'interview_date', label: 'تاريخ المقابلة', render: (date) => formatDateForDisplay(date) },
    { id: 'notes_case', label: 'تعليق' },
  ];

  const getStageText = (stage) => {
    switch (stage) {
      case 'data_entry':
        return 'إدخال البيانات';
      case 'reviewer':
        return 'مدقق البيانات';
      case 'approver':
        return 'موافقة اللجنة';
      case 'rejected':
        return 'مرفوض';
      case 'approved':
        return 'موافق عليه';
      case 'suspended':
        return 'معلق';
      // الإضافات الجديدة
      case 'mokhabarat':
        return 'مخابرات';
      case 'istikhbarat_defense':
        return 'استخبارات وامن الدفاع';
      case 'amn_watani':
        return 'أمن وطني';
      case 'iqama':
        return 'الإقامة';
      default:
        return 'غير محدد';
    }
  };

  const handleForward = async (note = null) => {
    if (!selectedRefugee) return;
    setIsForwarding(true);

    try {
      let url = '';
      let body = {};

      if (['mokhabarat', 'amn_watani', 'istikhbarat_defense', 'iqama'].includes(userRole)) {
        // لو الدور من أدوار الموافقات
        url = `freqs/refugees/update-approval/${selectedRefugee.id}`;
        body = { decision: 'موافق',  ...(note ? { notes: note } : {}) };
      } else {
        // باقي الأدوار يستخدمون الراوتر القديم
        url = `freqs/refugees/${selectedRefugee.id}/forward`;
      }

      const { success, msg } = await api('PUT', url, body);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (success) {
        NotificationMsg(
          'نجاح',
          userRole && ['mokhabarat', 'amn_watani', 'istikhbarat_defense', 'iqama'].includes(userRole)
            ? 'تمت الموافقة على الطلب'
            : 'تمت ترقية الطلب بنجاح'
        );
        await fetchData();
        handleClose();
      } else {
        DangerMsg('فشل التحديث', msg || 'تعذر تنفيذ العملية');
      }
    } catch (error) {
      DangerMsg('خطأ', 'حدث خطأ أثناء العملية');
      console.error(error);
    } finally {
      setIsForwarding(false);
    }
  };

  const handleRollback = async (reason) => {
    if (!selectedRefugee) return;
    setIsForwarding(true);

    try {
      const { success, msg } = await api(
        'PUT',
        `freqs/refugees/${selectedRefugee.id}/rollback`,
        { notes_case: reason || '' } // ✅ نرسل القيمة أو قيمة فارغة);
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (success) {
        NotificationMsg('نجاح', 'تم إرجاع المرحلة بنجاح.');
        await fetchData();
        handleClose();
      } else {
        DangerMsg('فشل الرجوع', msg || 'تعذر إرجاع المرحلة');
      }
    } catch (error) {
      DangerMsg('خطأ', 'حدث خطأ أثناء إرجاع المرحلة');
      console.error(error);
    } finally {
      setIsForwarding(false);
      setOpenConfirmDialog(false);
    }
  };

  const handleReject = async (reason) => {
    if (!selectedRefugee || !reason) {
      if (!reason) DangerMsg('خطأ', 'يرجى إدخال سبب الرفض.');
      return;
    }
    setIsForwarding(true);
    try {
      let url = '';
      let body = {};

      if (['mokhabarat', 'amn_watani', 'istikhbarat_defense', 'iqama'].includes(userRole)) {
        // لو الدور من أدوار الموافقات
        url = `freqs/refugees/update-approval/${selectedRefugee.id}`;
        body = { decision: 'رفض',  ...(reason ? { notes: reason } : {}) };
      } else {
        // باقي الأدوار يستخدمون الراوتر القديم
        url = `freqs/refugees/${selectedRefugee.id}/reject`;
        body = { notes_case: reason };
      }

      const { success, msg } = await api('PUT', url, body);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (success) {
        NotificationMsg(
          'نجاح',
          ['mokhabarat', 'amn_watani', 'istikhbarat_defense', 'iqama'].includes(userRole)
            ? 'تم تسجيل قرار الرفض بنجاح.'
            : 'تم رفض الطلب بنجاح.'
        );
        await fetchData();
        handleClose();
      } else {
        DangerMsg('فشل الرفض', msg || 'تعذر رفض الطلب');
      }
    } catch (error) {
      console.error(error);
      DangerMsg('خطأ', 'حدث خطأ أثناء رفض الطلب');
    } finally {
      setIsForwarding(false);
      setOpenConfirmDialog(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    // 🔹 نافذة التأكيد قبل الحذف
    Swal.fire({
      title: 'تأكيد الحذف',
      text: 'هل أنت متأكد من حذف هذا القيد؟ لا يمكن التراجع بعد الحذف.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، حذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // 🔹 تفعيل الـ Loader
          Swal.fire({
            title: 'جاري الحذف...',
            text: 'يرجى الانتظار قليلاً',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // 🔹 تنفيذ طلب الحذف من الـ API
          const { success, msg } = await api('DELETE', `mains/refugees/id/${id}`);

          if (success) {
            // 🔹 تحديث الواجهة
            setRefugees((prev) => prev.filter((r) => r.id !== id));

            Swal.fire({
              icon: 'success',
              title: 'تم الحذف بنجاح',
              text: 'تم حذف القيد من النظام.',
              confirmButtonText: 'موافق',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'فشل الحذف',
              text: msg || 'حدث خطأ أثناء تنفيذ عملية الحذف.',
              confirmButtonText: 'موافق',
            });
          }
        } catch (error) {
          console.error('خطأ في الحذف:', error);
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'حدث خطأ أثناء عملية الحذف. الرجاء المحاولة لاحقاً.',
            confirmButtonText: 'موافق',
          });
        }
      }
    });
  };

  const handleSuspend = async (reason) => {
    if (!selectedRefugee || !reason) {
      if (!reason) DangerMsg('خطأ', 'يرجى إدخال سبب التعليق.');
      return;
    }
    setIsForwarding(true);

    try {
      const { success, msg } = await api('PUT', `freqs/refugees/${selectedRefugee.id}/notes_case`, {
        notes_case: reason,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (success) {
        NotificationMsg('نجاح', 'تم تعليق الطلب بنجاح.');
        await fetchData();
        handleClose();
      } else {
        DangerMsg('فشل التعليق', msg || 'تعذر تعليق الطلب');
      }
    } catch (error) {
      console.error(error);
      DangerMsg('خطأ', 'حدث خطأ أثناء تعليق الطلب');
    } finally {
      setIsForwarding(false);
      setOpenConfirmDialog(false);
      setSuspendReason('');
    }
  };

  const handleSaveEdit = async () => {
    if (!editableRefugeeData) return;
    setIsForwarding(true);

    try {
      // ✅ هنا نكوّن الكائن يدوياً بالحقول المسموح تعديلها فقط
      const filteredData = {
        interview_date: editableRefugeeData.interview_date,
        interview_officername: editableRefugeeData.interview_officername,
        gender: editableRefugeeData.gender,
        frist_name: editableRefugeeData.frist_name,
        second_name: editableRefugeeData.second_name,
        theard_name: editableRefugeeData.theard_name,
        sur_name: editableRefugeeData.sur_name,
        mother_name: editableRefugeeData.mother_name,
        fath_mother_name: editableRefugeeData.fath_mother_name,
        religion: editableRefugeeData.religion,
        birth_date: editableRefugeeData.birth_date,
        birth_place: editableRefugeeData.birth_place,
        placeofbirthcity: editableRefugeeData.placeofbirthcity,
        marital_status: editableRefugeeData.marital_status,
        spouse_nationality: editableRefugeeData.spouse_nationality,
        marital_status_date: editableRefugeeData.marital_status_date,
        phone_number: editableRefugeeData.phone_number,
        nationality: editableRefugeeData.nationality,
        origin_country: editableRefugeeData.origin_country,
        profession: editableRefugeeData.profession,
        first_name_member: editableRefugeeData.first_name_member,
        political_opinion: editableRefugeeData.political_opinion,
        social_group_membership: editableRefugeeData.social_group_membership,
        reasons_for_persecution: editableRefugeeData.reasons_for_persecution,
        last_place_of_residence: editableRefugeeData.last_place_of_residence,
        residency_duration: editableRefugeeData.residency_duration,
        military_service: editableRefugeeData.military_service,
        political_party_membership: editableRefugeeData.political_party_membership,
        political_party_names: editableRefugeeData.political_party_names,
        departure_date_from_origin: editableRefugeeData.departure_date_from_origin,
        date_of_arrival_to_iraq: editableRefugeeData.date_of_arrival_to_iraq,
        is_iraq_residency: editableRefugeeData.is_iraq_residency,
        residency_issue_date: editableRefugeeData.residency_issue_date,
        residency_expiry_date: editableRefugeeData.residency_expiry_date,
        reasons_for_leaving_origin: editableRefugeeData.reasons_for_leaving_origin,
        previous_country_before_iraq: editableRefugeeData.previous_country_before_iraq,
        residency_befor_iraq: editableRefugeeData.residency_befor_iraq,
        residency_befor_iraq_durtion: editableRefugeeData.residency_befor_iraq_durtion,
        place_of_residence: editableRefugeeData.place_of_residence,
        duration_of_place: editableRefugeeData.duration_of_place,
        returntocountryhistory: editableRefugeeData.returntocountryhistory,
        intendtoreturn: editableRefugeeData.intendtoreturn,
        whathappensifreturn: editableRefugeeData.whathappensifreturn,
        reasons_for_asylum: editableRefugeeData.reasons_for_asylum,
        power_of_attorney_number: editableRefugeeData.power_of_attorney_number,
        form_issue_date: editableRefugeeData.form_issue_date,
        form_expiry_date: editableRefugeeData.form_expiry_date,
        form_place_of_issue: editableRefugeeData.form_place_of_issue,
        race: editableRefugeeData.race,
        passport: editableRefugeeData.passport,
        passport_number: editableRefugeeData.passport_number,
        passportissuecountry: editableRefugeeData.passportissuecountry,
        familypassports: editableRefugeeData.familypassports,
        interviewnotes: editableRefugeeData.interviewnotes,
        district: editableRefugeeData.district,
        subdistrict: editableRefugeeData.subdistrict,
        governorate: editableRefugeeData.governorate,
        education_level_id: editableRefugeeData.education_level_id,
        father_date_ofbirth: editableRefugeeData.father_date_ofbirth,
        father_isdead: editableRefugeeData.father_isdead,//if 1  write "yes " else "no",
        father_nationalityid: editableRefugeeData.father_nationalityid,
        mother_date_ofbirth: editableRefugeeData.mother_date_ofbirth,
        mother_isdead: editableRefugeeData.mother_isdead,
        mother_nationalityid: editableRefugeeData.mother_nationalityid,
      };

      if (!editableRefugeeData?.interview_date) {
  return DangerMsg('خطأ', 'تاريخ المقابلة حقل إجباري ولا يمكن تركه فارغاً');
}

      const { success, msg } = await api('PUT', `mains/refugees/id/${editableRefugeeData.id}`, filteredData);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (success) {
        NotificationMsg('نجاح', 'تم حفظ التعديلات بنجاح.');
        await fetchData();
        setIsEditing(false);
        setSelectedRefugee((prev) => ({ ...prev, ...filteredData }));
        setEditableRefugeeData((prev) => ({ ...prev, ...filteredData }));
      } else {
        DangerMsg('فشل الحفظ', msg || 'تعذر حفظ التعديلات');
      }
    } catch (error) {
      DangerMsg('خطأ', 'حدث خطأ أثناء حفظ التعديلات');
      console.error(error);
    } finally {
      setIsForwarding(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableRefugeeData({ ...selectedRefugee });
  };

  const handleOpenConfirmDialog = (actionType) => {
    setConfirmAction(actionType);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDialogClose = () => {
    setOpenConfirmDialog(false);
    setConfirmAction(null);
    setSuspendReason('');
  };

  const handleConfirmDialogAction = async () => {
    const reasonInput = document.getElementById('reason');
    const reason = reasonInput ? reasonInput.value : '';

    if (confirmAction === 'rollback') {
      await handleRollback(reason);
    } else if (confirmAction === 'reject') {
      await handleReject(reason);
    } else if (confirmAction === 'suspend') {
      await handleSuspend(reason);
    }
  };
  // تعريف الدالة خارج JSX
  function isSpecialRole(role) {
    const specialRoles = ['mokhabarat', 'istikhbarat_defense', 'amn_watani', 'iqama'];
    return specialRoles.includes(role);
  }
  // ✅ دالة الحذف (خارج JSX)
  const handleDeleteMember = async (id) => {
    if (!id) return;

    try {
      const { success, msg } = await api('DELETE', `freqs/family_members/${id}`);

      if (success) {
        // تحديث الحالة بعد الحذف
        setFamilyData((prev) => prev.filter((m) => m.id !== id));
        NotificationMsg('نجاح', 'تم حذف الفرد من العائلة بنجاح');
      } else {
        DangerMsg('فشل الحذف', msg || 'تعذر حذف الفرد');
      }
    } catch (error) {
      console.error('خطأ في حذف الفرد:', error);
      DangerMsg('خطأ', 'حدث خطأ أثناء الحذف');
    }
  };

  // حالة للتحكم بفتح/إغلاق Dialog التعديل
  // تحكم بفتح نافذة تعديل فرد
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // تخزين بيانات الفرد الجاري تعديله
  const [editingMember, setEditingMember] = useState(null);

  //Edit Familly
  const handleOpenEditDialog = (member) => {
    setEditingMember({ ...member }); // نسخة من بيانات الفرد
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setEditingMember(null);
    setOpenEditDialog(false);
  };

  //العائلة
  const handleEditMember = async () => {
    if (!editingMember?.id) return;

    try {
      const { success, msg } = await api('PUT', `freqs/family_members/${editingMember.id}`, editingMember);

      if (success) {
        // تحديث البيانات في الحالة
        setFamilyData((prev) => prev.map((m) => (m.id === editingMember.id ? { ...editingMember } : m)));
        NotificationMsg('نجاح', 'تم تعديل بيانات الفرد بنجاح');
        handleCloseEditDialog();
      } else {
        DangerMsg('فشل التعديل', msg || 'تعذر تعديل بيانات الفرد');
      }
    } catch (error) {
      console.error('خطأ في تعديل الفرد:', error);
      DangerMsg('خطأ', 'حدث خطأ أثناء تعديل البيانات');
    }
  };

  // اضافة فرد الى العائلة
  const [isSaving, setIsSaving] = useState(false);
  // تحديث أي حقل ديناميكيًا
  const handleNewMemberChange = (field, value) => {
    setNewMember((prev) => ({ ...prev, [field]: value }));
  };
  // إضافة فرد جديد للجدول
  const handleAddMember = async () => {
    try {
      setIsSaving(true);

      const response = await api('POST', 'freqs/family_members', {
        ...newMember,
        refugee_id: selectedRefugee.id,
      });

      if (response.success) {
        // ✅ تحديث الجدول مباشرة
        setFamilyData((prev) => [...prev, response.data]);

        // ✅ إغلاق وإعادة تعيين
        setOpenAddDialog(false);
        setNewMember({
          first_name_member: '',
          second_name_member: '',
          theard_name_member: '',
          birthday_member: '',
          relation_member: '',
        });
      } else {
        alert('فشل الإضافة: ' + response.msg);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('حدث خطأ أثناء الإضافة');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchFamilyData = async () => {
    try {
      if (!selectedRefugee) return;

      const response = await api('GET', `freqs/family_members/${selectedRefugee.id}`);
      if (response.success) {
        setFamilyData(response.data);
      } else {
        console.error('فشل في جلب بيانات العائلة:', response.msg);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    }
  };
  useEffect(() => {
    if (openFamilyDialog) {
      fetchFamilyData(); // ✅ إعادة الجلب عند كل فتح
    }
  }, [openFamilyDialog, selectedRefugee]);

  const handleSyncFromOnline = async () => {
    try {
      NotificationMsg('جاري السحب', 'يتم الآن جلب الطلبات من النظام العام...');

      const { success, data, msg } = await api('GET', 'mains/sync/all'); // هذا هو endpoint مالك

      if (success) {
        NotificationMsg('نجاح', 'تم سحب الطلبات من الأونلاين بنجاح ✅');
        await fetchData(); // لإعادة تحميل البيانات بعد السحب
      } else {
        DangerMsg('فشل السحب', msg || 'تعذر السحب من النظام العام');
      }
    } catch (err) {
      console.error(err);
      DangerMsg('خطأ', 'حدث خطأ أثناء عملية السحب من الأونلاين');
    }
  };

  const handleSaveInterviewRequired = async () => {
  if (!pendingRefugee) return;

  let payload = {};

  if (pendingRefugee.require === 'officer') {
    if (!officerName) return DangerMsg('خطأ', 'اسم ضابط المقابلة مطلوب');
    payload.interview_officername = officerName;
  }

  if (pendingRefugee.require === 'date') {
    if (!interviewDate) return DangerMsg('خطأ', 'تاريخ المقابلة مطلوب');
    payload.interview_date = interviewDate;
  }

  try {
    const { success, msg } = await api(
      'PUT',
      `mains/refugees/id/${pendingRefugee.id}`,
      payload
    );

    if (success) {
      NotificationMsg('نجاح', 'تم حفظ البيانات');
      setOpenInterviewDialog(false);
      setPendingRefugee(null);
      await fetchData(); // تحديث الجدول
    } else {
      DangerMsg('فشل', msg || 'لم يتم الحفظ');
    }
  } catch (e) {
    console.error(e);
    DangerMsg('خطأ', 'فشل الاتصال بالخادم');
  }
};

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
      <Stack alignItems="center" mb={3}>
        <Typography variant="h3" component="h1" gutterBottom>
          نظام شؤون اللاجئين
        </Typography>
        <Typography variant="h5" color="text.secondary">
          مرحلة: {getStageText(user?.roles)}
        </Typography>
        {/* ✅ زر سحب البيانات – يظهر فقط للأدوار المطلوبة */}
        {['data_entry', 'reviewer', 'approver'].includes(user.roles) && (
          <Button variant="contained" color="primary" onClick={handleSyncFromOnline} sx={{ mt: 2, fontWeight: 'bold' }}>
            سحب الطلبات من الانترنت
          </Button>
        )}
      </Stack>

      {/* Wrap the custom table in Paper for a card-like effect */}
      <Paper elevation={6} sx={{ flexGrow: 1, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer
          sx={{
            maxHeight: 'calc(100vh - 200px)',
            border: '1px solid #ccc', // حدود خفيفة رمادية تميل للسواد
            borderRadius: '4px',
          }}
        >
          {' '}
          {/* Adjust maxHeight as needed */}
          <Table
            stickyHeader
            aria-label="بيانات اللاجئين"
            sx={{
              borderCollapse: 'collapse', // يجعل الحدود تظهر بوضوح بين الأعمدة والصفوف
            }}
          >
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => {
                  if (header.label === 'حذف القيد' && user.roles !== 'data_entry') {
                    // لا تعرض العمود نهائياً
                    return null;
                  }

                  return (
                    <TableCell
                      key={header.id}
                      sx={{
                        backgroundColor: '#e6e6e6ff',
                        color: 'black',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        textAlign: 'right',
                        border: '1px solid #ccc',
                      }}
                    >
                      {header.label}
                    </TableCell>
                  );
                })}

                {/* ✅ إذا كنت تريد إضافة عمود حذف القيد فقط لمستخدم data_entry */}
                {user.roles === 'data_entry' && (
                  <TableCell
                    sx={{
                      backgroundColor: '#e6e6e6ff',
                      color: 'black',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      border: '1px solid #ccc',
                    }}
                  >
                    حذف القيد
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingTable ? (
                <TableRow>
                  <TableCell
                    colSpan={tableHeaders.length}
                    sx={{
                      textAlign: 'center',
                      py: 5,
                      padding: '12px 16px',
                      border: '1px solid #ccc', // حدود لكل خلية رأس
                    }}
                  >
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>جاري تحميل البيانات...</Typography>
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(refugees) || refugees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography>لا توجد طلبات لعرضها.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                refugees.map((refugee) => (
                  <TableRow
                    key={refugee.id}
                    onClick={() => handleRowClick(refugee)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      borderBottom: (theme) => `1px solid rgba(0, 0, 0, 0.1)`,
                    }}
                    className={`row-${refugee.current_stage}`}
                  >
                    {tableHeaders.map((header) => ( 
                      <TableCell
                        key={header.id}
                        sx={{
                          textAlign: 'right',
                          padding: '12px 16px',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {header.id === 'personal_photo' && (
  console.log(
    'IMG SRC BUILT =',
    refugee.personal_photo
  )
)}

                        {header.id === 'personal_photo' ? (
                          refugee.personal_photo ? (
                            <Avatar
                              src={refugee.personal_photo}
                              alt="الصورة"
                              sx={{
                                width: 55,
                                height: 55,
                                border: '1px solid #ccc',
                              }}
                            />
                          ) : (
                            <Avatar sx={{ width: 55, height: 55 }}>?</Avatar>
                          )
                        ) : (
                          <Typography variant="body1" sx={{ whiteSpace: 'normal', lineHeight: 'normal' }}>
                            {header.render ? header.render(refugee[header.id]) : refugee[header.id] || '---'}
                          </Typography>
                        )}
                      </TableCell>
                    ))}

                    {/* ✅ عرض زر الحذف فقط إذا كان الدور هو data_entry */}
                    {user.roles === 'data_entry' && (
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // منع تفعيل onClick للصف
                            handleDelete(refugee.id);
                          }}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            px: 2,
                            py: 0.5,
                          }}
                        >
                          حذف
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* This Backdrop is for specific action loading (forward, reject, save), not initial table load */}
      {isForwarding && (
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure it's above the modal
            flexDirection: 'column',
          }}
          open={isForwarding}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            جاري معالجة الطلب...
          </Typography>
        </Backdrop>
      )}

      {/* The Modal component remains unchanged */}
      <Modal
        open={!!selectedRefugee}
        onClose={handleClose}
        aria-labelledby="refugee-modal-title"
        aria-describedby="refugee-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '75%', lg: '65%' },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            overflowY: 'auto',
            borderRadius: 2,
            fontSize: '18px',
            lineHeight: 2,
            direction: 'rtl',
          }}
        >
          {/* Close Button */}
          {/* 2026-01-02 */}
          {/* <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: 'grey.600',
            }}
            aria-label="إغلاق"
          >
            <CloseIcon />
          </IconButton> */}

          {/* Edit Button (positioned at top right) */}
          {!isEditing &&
            selectedRefugee &&
            ((user.roles === 'data_entry' && selectedRefugee.current_stage === 'data_entry') ||
              (user.roles === 'data_entry' && selectedRefugee.current_stage === 'suspended')) && (
              <IconButton
                onClick={async () => {
                  // 1️⃣ حمّل التراميز وخذ النسخة الفعلية
                  const loadedLookups = await loadAllLookups(true);

                  // 2️⃣ خذ نسخة من الصف
                  const source = { ...selectedRefugee };

                  // 3️⃣ التحويل باستخدام lookups الصحيحة
                  const converted = mapLabelsToIdsByLookupMap(source, loadedLookups, LOOKUP_MAP);

                  // 4️⃣ خزّنها
                  setEditableRefugeeData(converted);

                  // 5️⃣ ادخل وضع التعديل
                  setIsEditing(true);
                }}
              >
                <EditIcon />
              </IconButton>
            )}

          <Typography id="refugee-modal-title" variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            تفاصيل الطلب <br />
            <Typography variant="h6" component="span" color="text.secondary">
              ({isEditing ? 'وضع التعديل' : 'وضع العرض'})
            </Typography>
          </Typography>

          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="تبويبات المعلومات الشخصية والإضافية"
            variant="fullWidth"
            sx={{ mb: 3 }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="المعلومات الشخصية" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="المعلومات الإضافية" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>

          <TabPanel value={tabIndex} index={0}>
            {/* Render table in view mode, or grid for edit mode */}

            {isEditing && isLoadingLookups ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>جاري تحميل التراميز...</Typography>
              </Box>
            ) : (
              renderSection(personalFields)
            )}

            {!isEditing && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined" color="primary" onClick={() => setOpenFamilyDialog(true)}>
                  تفاصيل العائلة
                </Button>{' '}
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/dashboard/attachments/${selectedRefugee.id}`, '_blank');
                  }}
                  sx={{ textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  عرض المرفقات
                </Button>
              </Box>
            )}
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            {/* Render table in view mode, or grid for edit mode */}
            {/* {renderSection(additionalFields)} */}
            {/* إذا في وضع تعديل، اعرض دالة التعديل، غير ذلك اعرض دالة العرض */}
            {isEditing ? renderEditSection(additionalFields) : renderSection(additionalFields)}
          </TabPanel>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
            {selectedRefugee && (
              <>
                {/* View Mode Buttons */}
                {!isEditing && (
                  <>
                    {/* Rollback Button */}
                    {['approver', 'reviewer'].includes(user.roles) &&
                    ['approver', 'reviewer'].includes(selectedRefugee.current_stage) &&
                    selectedRefugee.current_stage === user.roles ? (
                      <Button variant="outlined" color="warning" onClick={() => handleOpenConfirmDialog('rollback')}>
                        إرجاع المرحلة
                      </Button>
                    ) : null}
{/* 
                    <LoadingButton variant="contained" color="primary" onClick={handleForward} loading={isForwarding}>
                      موافقة
                    </LoadingButton>
                  

                
                    <Button variant="outlined" color="error" onClick={() => handleOpenConfirmDialog('reject')}>
                      رفض الطلب
                    </Button>
                    */}

<ActionWithNote
  userRole={user.roles}
  loading={isForwarding}
  onApprove={(note) => handleForward(note)}
  onReject={(note) => handleReject(note)}
/>



                    {/* Suspend Button */}
                    {((user.roles === 'data_entry' && selectedRefugee.current_stage === 'data_entry') ||
                      (user.roles === 'reviewer' && selectedRefugee.current_stage === 'reviewer')) && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenConfirmDialog('suspend')}
                        startIcon={<PauseIcon />}
                      >
                        تعليق الطلب
                      </Button>
                    )}
                  </>
                )}

                {/* Edit Mode Buttons */}
                {isEditing && (
                  <>
                    <LoadingButton
                      variant="contained"
                      color="success"
                      onClick={handleSaveEdit}
                      loading={isForwarding}
                      startIcon={<SaveIcon />}
                    >
                      حفظ التعديلات
                    </LoadingButton>
                    <Button variant="outlined" color="error" onClick={handleCancelEdit} startIcon={<CancelIcon />}>
                      إلغاء التعديل
                    </Button>
                  </>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Modal>

      {/* Confirmation Dialog (for rollback/reject/suspend) */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleConfirmDialogClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        dir="rtl"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmAction === 'rollback'
            ? 'تأكيد إرجاع المرحلة'
            : confirmAction === 'reject'
            ? 'تأكيد رفض الطلب'
            : 'تأكيد تعليق الطلب'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmAction === 'rollback'
              ? 'هل أنت متأكد من أنك تريد إرجاع هذا الطلب إلى المرحلة السابقة؟'
              : confirmAction === 'reject'
              ? 'هل أنت متأكد من أنك تريد رفض هذا الطلب؟ يرجى كتابة سبب الرفض أدناه:'
              : 'هل أنت متأكد من أنك تريد تعليق هذا الطلب؟ يرجى كتابة سبب التعليق أدناه:'}
          </DialogContentText>
          {(confirmAction === 'reject' || confirmAction === 'suspend' || confirmAction === 'rollback') && (
            <TextField
              autoFocus
              margin="dense"
              id="reason"
              label={
                confirmAction === 'reject' ? 'سبب الرفض' : confirmAction === 'rollback' ? 'سبب الإرجاع' : 'سبب التعليق'
              }
              type="text"
              fullWidth
              variant="standard"
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleConfirmDialogClose} color="primary" variant="outlined">
            إلغاء
          </Button>
          <LoadingButton
            onClick={handleConfirmDialogAction}
            color={confirmAction === 'rollback' ? 'warning' : confirmAction === 'reject' ? 'error' : 'secondary'}
            variant="contained"
            loading={isForwarding}
          >
            {confirmAction === 'rollback'
              ? 'تأكيد الإرجاع'
              : confirmAction === 'reject'
              ? 'تأكيد الرفض'
              : 'تأكيد التعليق'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openFamilyDialog}
        onClose={() => setOpenFamilyDialog(false)}
        aria-labelledby="family-dialog-title"
        fullWidth
        maxWidth="md"
        dir="rtl"
      >
        <DialogTitle id="family-dialog-title">تفاصيل العائلة</DialogTitle>
        <DialogTitle
          id="family-dialog-title"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">تفاصيل العائلة</Typography>

          <Button
            variant="contained"
            color="success"
            onClick={() => setOpenAddDialog(true)}
            sx={{ fontWeight: 'bold' }}
          >
            إضافة فرد
          </Button>
        </DialogTitle>

        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم الأول</TableCell>
                  <TableCell>اسم الأب</TableCell>
                  <TableCell>اسم الجد</TableCell>
                  <TableCell>تاريخ الميلاد</TableCell>
                  <TableCell>صلة القرابة</TableCell>
                  <TableCell>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {familyData.map((member, idx) => (
                  <TableRow key={member.id || idx}>
                    <TableCell>{member.first_name_member || '---'}</TableCell>
                    <TableCell>{member.second_name_member || '---'}</TableCell>
                    <TableCell>{member.theard_name_member || '---'}</TableCell>
                    <TableCell>{member.birthday_member ? member.birthday_member.split('T')[0] : '---'}</TableCell>
                    <TableCell>{member.relation_member || '---'}</TableCell>
                    <TableCell>
                      {' '}
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenEditDialog(member)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteMember(member.id)} // ✅ استدعاء الدالة المنظمة
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFamilyDialog(false)} color="primary">
            إغلاق
          </Button>
          <Button
            onClick={() => {
              // هنا تستدعي API لإرسال البيانات وحفظها
              setOpenFamilyDialog(false);
            }}
            color="success"
            variant="contained"
          >
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle>إضافة فرد جديد</DialogTitle>

        <DialogContent dividers>
          <TextField
            margin="dense"
            label="الاسم الأول"
            fullWidth
            value={newMember.first_name_member}
            onChange={(e) => setNewMember((prev) => ({ ...prev, first_name_member: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="اسم الأب"
            fullWidth
            value={newMember.second_name_member}
            onChange={(e) => setNewMember((prev) => ({ ...prev, second_name_member: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="اسم الجد"
            fullWidth
            value={newMember.theard_name_member}
            onChange={(e) => setNewMember((prev) => ({ ...prev, theard_name_member: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="تاريخ الميلاد"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newMember.birthday_member}
            onChange={(e) => setNewMember((prev) => ({ ...prev, birthday_member: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="صلة القرابة"
            fullWidth
            value={newMember.relation_member}
            onChange={(e) => setNewMember((prev) => ({ ...prev, relation_member: e.target.value }))}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            إلغاء
          </Button>
          <Button
            onClick={async () => {
              // 🔹 استدعاء API الإضافة هنا
              // مثال: await api("POST", "family_members", { ...newMember, refugee_id: selectedRefugee.id });
              setOpenAddDialog(false);
              setNewMember({
                first_name_member: '',
                second_name_member: '',
                theard_name_member: '',
                birthday_member: '',
                relation_member: '',
              });
            }}
            color="success"
            variant="contained"
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        aria-labelledby="edit-dialog-title"
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle id="edit-dialog-title">تعديل بيانات الفرد</DialogTitle>

        <DialogContent dividers>
          <TextField
            margin="dense"
            label="الاسم الأول"
            fullWidth
            value={editingMember?.first_name_member || ''}
            onChange={(e) =>
              setEditingMember((prev) => ({
                ...prev,
                first_name_member: e.target.value,
              }))
            }
          />
          <TextField
            margin="dense"
            label="اسم الأب"
            fullWidth
            value={editingMember?.second_name_member || ''}
            onChange={(e) =>
              setEditingMember((prev) => ({
                ...prev,
                second_name_member: e.target.value,
              }))
            }
          />
          <TextField
            margin="dense"
            label="اسم الجد"
            fullWidth
            value={editingMember?.theard_name_member || ''}
            onChange={(e) =>
              setEditingMember((prev) => ({
                ...prev,
                theard_name_member: e.target.value,
              }))
            }
          />
          <TextField
            margin="dense"
            label="تاريخ الميلاد"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editingMember?.birthday_member ? editingMember.birthday_member.split('T')[0] : ''}
            onChange={(e) =>
              setEditingMember((prev) => ({
                ...prev,
                birthday_member: e.target.value,
              }))
            }
          />
          <TextField
            margin="dense"
            label="صلة القرابة"
            fullWidth
            value={editingMember?.relation_member || ''}
            onChange={(e) =>
              setEditingMember((prev) => ({
                ...prev,
                relation_member: e.target.value,
              }))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary" variant="outlined">
            إلغاء
          </Button>
          <Button onClick={handleEditMember} color="success" variant="contained">
            حفظ التعديلات
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle>إضافة فرد جديد</DialogTitle>

        <DialogContent dividers>
          <TextField
            margin="dense"
            label="الاسم الأول"
            fullWidth
            value={newMember.first_name_member}
            onChange={(e) => handleNewMemberChange('first_name_member', e.target.value)}
          />
          <TextField
            margin="dense"
            label="اسم الأب"
            fullWidth
            value={newMember.second_name_member}
            onChange={(e) => handleNewMemberChange('second_name_member', e.target.value)}
          />
          <TextField
            margin="dense"
            label="اسم الجد"
            fullWidth
            value={newMember.theard_name_member}
            onChange={(e) => handleNewMemberChange('theard_name_member', e.target.value)}
          />
          <TextField
            margin="dense"
            label="تاريخ الميلاد"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newMember.birthday_member}
            onChange={(e) => handleNewMemberChange('birthday_member', e.target.value)}
          />
          <TextField
            margin="dense"
            label="صلة القرابة"
            fullWidth
            value={newMember.relation_member}
            onChange={(e) => handleNewMemberChange('relation_member', e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            إلغاء
          </Button>
          <LoadingButton onClick={handleAddMember} color="success" variant="contained" loading={isSaving}>
            حفظ
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
  open={openInterviewDialog}
  disableEscapeKeyDown
  onClose={() => {}}
>
<DialogTitle
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}
>
  بيانات المقابلة مطلوبة

  <IconButton
    onClick={() => {
      setOpenInterviewDialog(false);
      setPendingRefugee(null);
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>

  <DialogContent>

    {pendingRefugee?.require === 'officer' && (
  <TextField
    fullWidth
    required
    label="اسم ضابط المقابلة"
    value={officerName}
    onChange={(e) => setOfficerName(e.target.value)}
  />
)}

{pendingRefugee?.require === 'date' && (
  <TextField
    fullWidth
    required
    type="date"
    label="تاريخ المقابلة"
    InputLabelProps={{ shrink: true }}
    value={interviewDate}
    onChange={(e) => setInterviewDate(e.target.value)}
  />
)}


  </DialogContent>

<DialogActions>
  <Button
    variant="contained"
    color="primary"
    onClick={handleSaveInterviewRequired}
  >
    حفظ
  </Button>
</DialogActions>

</Dialog>

    </Container>
  );
}
