import React, { useContext, useCallback, useState, useEffect } from 'react';

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
import { SuccessMsg } from "../utils/alerts"; // عدل المسار حسب مكان الملف

import { useApi } from '../utils';
import { DangerMsg,NotificationMsg } from '../components/NotificationMsg';
import { LoadingButton } from '@mui/lab';

import { appContext } from '../context';

const RELIGIONS = ['إسلام', 'مسيحية', 'يهودية', 'بوذية', 'ديانات أخرى'];
const GENDERS = ['ذكر', 'أنثى'];
const MARITAL_STATUSES = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

const MILITARY_SERVICES = ['لا', 'نعم'];
const COUNTRIES = ['العراق', 'سوريا', 'لبنان', 'مصر', 'الأردن', 'تركيا', 'دول أخرى'];
const NATIONALITIES = ['عربي', 'كردي', 'تركماني', 'كلداني', 'سرياني', 'أشوري', 'أخرى'];

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

export default function FreqsHome() {
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

  const { user } = useContext(appContext);
  console.log('user roles:', user.roles);

  // const fetchData = useCallback(async () => {
  //   setIsLoadingTable(true);
  //   try {
  //     const { success, data } = await api('GET', `freqs/refugees`);
  //     if (!success) {
  //       DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
  //       return;
  //     }
  //     setRefugees(data?.records || data);
  //   } catch (err) {
  //     DangerMsg('اشعارات اللاجئين', 'خطأ في تحميل البيانات');
  //     console.error(err);
  //   } finally {
  //     setIsLoadingTable(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);
    const userRole = user.roles; // أو من الكونتكست/ستيت

const fetchData = useCallback(async () => {
  setIsLoadingTable(true);
  try {
    // تحديد المسار بناءً على الدور
    let endpoint = "freqs/refugees";

    if (["mokhabarat", "amn_watani", "istikhbarat_defense", "iqama","",null].includes(userRole)) {
      endpoint = "freqs/refugees/pending-approval";
    }

    const { success, data } = await api("GET", endpoint);

    if (!success) {
      DangerMsg("اشعارات اللاجئين", "خطأ في تحميل البيانات");
      return;
    }
    else {      NotificationMsg("اشعارات اللاجئين", "تم  تحميل البيانات");
}
//  setRefugees(Array.isArray(data) || null);
    setRefugees(data?.records || data);
  } catch (err) {
    DangerMsg("اشعارات اللاجئين", "خطأ في تحميل البيانات");
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

  //
  const handleRowClick = (refugeeData) => {
    setSelectedRefugee(refugeeData);
    setEditableRefugeeData({ ...refugeeData });
    setIsEditing(false);

    // ✅ فلترة بيانات العائلة لهذا اللاجئ فقط
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
      [name]: value,
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
    gender: 'الجنس',
    interview_date: 'تاريخ المقابلة',
    interview_officername: 'اسم مسؤول المقابلة',
    frist_name: 'الاسم  ',
    second_name: 'اسم الأب',
    theard_name: 'اسم الجد',
    sur_name: 'اللقب',
    mother_name: 'اسم الأم',
    fath_mother_name: 'اسم  ابي الأم',
    religion: 'الديانة',
    birth_date: 'تاريخ الولادة',
    birth_place: 'مكان الولادة',
    marital_status: 'الحالة الاجتماعية',
    spouse_nationality: 'جنسية الزوج/الزوجة',
    marital_status_date: 'تاريخ الحالة الاجتماعية',
    phone_number: 'رقم الهاتف',
    governorate: 'المحافظة',
    district: 'القضاء',
    subdistrict: 'المنطقة',
    nationality: 'القومية',
    origin_country: 'بلد الأصل',
    profession: 'المهنة',
    personal_photo: 'الصورة الشخصية',
    first_name_member: 'اسم أول فرد من العائلة',
    political_opinion: 'الرأي السياسي',
    social_group_membership: 'الانتماء الاجتماعي أو القبلي',
    reasons_for_persecution: 'أسباب طلب اللجوء',
    last_place_of_residence: 'آخر مكان سكن فيه',
    residency_duration: 'مدة الإقامة في آخر مكان',
    military_service: 'هل لديك خدمة عسكرية؟',
    political_party_membership: 'هل تنتمي لأحزاب سياسية؟',
    political_party_names: 'أسماء الأحزاب',
    departure_date_from_origin: 'تاريخ مغادرة البلد الأصلي',
    date_of_arrival_to_iraq: 'تاريخ الوصول إلى العراق',
    is_iraq_residency: 'هل لديك إقامة في العراق؟',
    residency_issue_date: 'تاريخ إصدار الإقامة',
    residency_expiry_date: 'تاريخ انتهاء الإقامة',
    passport: 'هل لديك جواز سفر',
    passportissuecountry: 'بلد إصدار جواز السفر',
    familypassports: '   هل كل أفراد العائلة لديهم جوازات سفر؟   ',
    reasons_for_leaving_origin: 'أسباب مغادرة البلد الأصلي',
    previous_country_before_iraq: 'البلد السابق قبل القدوم إلى العراق',
    residency_befor_iraq: ' محل الاقامة قبل دخول الاراضي العراقية ',
    residency_befor_iraq_durtion: 'الفترةالزمنية قبل دخول الاراضي العراقية ',
    returntocountryhistory:
      '(اذكر بالتفصيل)هل سبق وأن عدت إلى بلدك بعد مغادرته؟ إذا كان الجواب نعم، فمتى؟ وأين كان مكان العودة ومتى؟ وماهي الفترة التي بقيت فيها؟ ماذا فعلت هناك؟ لماذا عدت إلى العراق؟',
    intendtoreturn: 'هل تنوي العودة إلى بلدك؟',
    preferredresidencereturn: 'اذا كنت تنوي العودة اين تفضل السكن ؟',
    whathappensifreturn: 'ماذا سيحدث لك اذا عدت الى بلدك؟',
    place_of_residence: '  آخر محل للإقامة ضمن مغادرة بلد الأصل (قرية/مدينة/مقاطعة/الدولة)',
    duration_of_place: 'ماضي الفترة الزمنية التي قضيتها في هذا المكان قبل مغادرة بلدالأصل',
    reasons_for_asylum: 'ملخص اسباب طلب اللجوء',
    power_of_attorney_number: 'رقم الفورما',
    form_issue_date: 'تاريخ إصدار الفورما',
    form_expiry_date: 'تاريخ انتهاء الفورما',
    form_place_of_issue: 'جهة الاصدار',
    race: 'العرق',
    notes_case: 'تعليق',
    mok_approval: 'موافقة المخابرات',amn_wat_approval:'موافقة الامن الوطني',istk_approval:'موافقة استخبارات وامن الدفاع',iqama_approval:'موافقة الاقامة',
    interviewnotes: 'ملخص المقابلة',
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
    'first_name_member',
  ];

  const additionalFields = Object.keys(fieldLabels).filter((key) => !personalFields.includes(key));

  const getEditableFieldComponent = (key, value) => {
    const commonProps = {
      fullWidth: true,
      variant: 'outlined',
      name: key,
      value: value || '',
      onChange: handleInputChange,
    };

    if (
      [
        'gender',
        'religion',
        'marital_status',
        'military_service',
        'origin_country',
        'previous_country_before_iraq',
        'spouse_nationality',
        'nationality',
      ].includes(key)
    ) {
      let options = [];
      switch (key) {
        case 'gender':
          options = GENDERS;
          break;
        case 'religion':
          options = RELIGIONS;
          break;
        case 'marital_status':
          options = MARITAL_STATUSES;
          break;
        case 'military_service':
          options = MILITARY_SERVICES;
          break;
        case 'origin_country':
        case 'previous_country_before_iraq':
        case 'spouse_nationality':
          options = COUNTRIES;
          break;
        case 'nationality':
          options = NATIONALITIES;
          break;

        default:
          options = [];
      }
      return (
        <FormControl fullWidth variant="outlined">
          <InputLabel>{fieldLabels[key]}</InputLabel>
          <Select {...commonProps} label={fieldLabels[key]}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (
      key === 'birth_date' ||
      key === 'form_issue_date' ||
      key === 'residency_issue_date' ||
      key === 'residency_expiry_date' ||
      key === 'form_expiry_date' ||
      key === 'interview_date' ||
      key === 'departure_date_from_origin' ||
      key === 'date_of_arrival_to_iraq'
    ) {
      return (
        <TextField
          type="date"
          {...commonProps}
          value={formatDateForInput(value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      );
    }

    if (key === 'personal_photo') {
      return null;
    }

    const isMultiline = [
      'political_opinion',
      'social_group_membership',
      'reasons_for_persecution',
      'last_place_of_residence',
      'reasons_for_leaving_origin',
      'reasons_for_asylum',
      'political_party_names',
      'returntocountryhistory',
    ].includes(key);

    return <TextField {...commonProps} multiline={isMultiline} rows={isMultiline ? 3 : 1} />;
  };

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
      if (
        key === 'birth_date' ||
        key === 'residency_issue_date' ||
        key === 'residency_expiry_date' ||
        key === 'form_issue_date' ||
        key === 'form_expiry_date' ||
        key === 'interview_date' ||
        key === 'departure_date_from_origin' ||
        key === 'date_of_arrival_to_iraq'
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
      // return (
      //   <Grid container spacing={2}>
      //     {fields.map((key) => {
      //       if (key === 'personal_photo') {
      //         return null;
      //       }

      //       const label = fieldLabels[key] || key;
      //       const value = editableRefugeeData?.[key];

      //       return (
      //         <Grid item xs={12} sm={6} key={key}>
      //           <Box sx={{ mb: 3 }}>
      //             <Typography variant="h6" fontSize={20} fontWeight="medium" lineHeight={1.8} gutterBottom>
      //             {label}
      //             </Typography>
      //             {getEditableFieldComponent(key, value)}
      //           </Box>
      //         </Grid>
      //       );
      //     })}
      //   </Grid>
      // );
      return (
  <Grid container spacing={2}>
    {/* الجنس */}
    <Grid item xs={12} sm={6}>
      <TextField
        select
        fullWidth
        label={fieldLabels.gender}
        name="gender"
        value={editableRefugeeData?.gender || ""}
        onChange={handleInputChange}
      >
        {GENDERS.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
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
      />
    </Grid>

    {/* اسم مسؤول المقابلة */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.interview_officername}
        name="interview_officername"
        value={editableRefugeeData?.interview_officername || ""}
        onChange={handleInputChange}
      />
    </Grid>

    {/* الاسم الأول */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.frist_name}
        name="frist_name"
        value={editableRefugeeData?.frist_name || ""}
        onChange={handleInputChange}
      />
    </Grid>

    {/* اسم الأب */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.second_name}
        name="second_name"
        value={editableRefugeeData?.second_name || ""}
        onChange={handleInputChange}
      />
    </Grid>

    {/* اسم الجد */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.theard_name}
        name="theard_name"
        value={editableRefugeeData?.theard_name || ""}
        onChange={handleInputChange}
      />
    </Grid>

    {/* اللقب */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.sur_name}
        name="sur_name"
        value={editableRefugeeData?.sur_name || ""}
        onChange={handleInputChange}
      />
    </Grid>

    {/* اسم الأم */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.mother_name}
        name="mother_name"
        value={editableRefugeeData?.mother_name || ""}
        onChange={handleInputChange}
      />
    </Grid>

    {/* اسم أبي الأم */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={fieldLabels.fath_mother_name}
        name="fath_mother_name"
        value={editableRefugeeData?.fath_mother_name || ""}
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
        value={editableRefugeeData?.religion || ""}
        onChange={handleInputChange}
      >
        {RELIGIONS.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
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
        fullWidth
        label={fieldLabels.birth_place}
        name="birth_place"
        value={editableRefugeeData?.birth_place || ""}
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
        value={editableRefugeeData?.marital_status || ""}
        onChange={handleInputChange}
      >
        {MARITAL_STATUSES.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>
    </Grid>

    {/* باقي الحقول */}
    {/* كرر نفس النمط لبقية الحقول: spouse_nationality, phone_number, governorate, district, ... إلخ */}

  </Grid>
);

    }
  };

  const tableHeaders = [
    { id: 'frist_name', label: 'الاسم  ' },
    { id: 'second_name', label: 'اسم الاب  ' },
    { id: 'theard_name', label: 'اسم الجد  ' },
    { id: 'sur_name', label: 'اللقب  ' },
    { id: 'mother_name', label: 'اسم الام  ' },
    { id: 'fath_mother_name', label: 'اسم والد الام  ' },
    { id: 'interview_officername', label: 'مسؤول المقابلة  ' },
    { id: 'current_stage', label: 'المرحلة الحالية', render: (stage) => getStageText(stage) },
    { id: 'phone_number', label: 'رقم الهاتف' },
    { id: 'origin_country', label: 'بلد الأصل' },
    { id: 'date_of_arrival_to_iraq', label: 'تاريخ الوصول للعراق', render: (date) => formatDateForDisplay(date) },
    { id: 'nationality', label: 'القومية' },
    { id: 'birth_date', label: 'تاريخ الولادة', render: (date) => formatDateForDisplay(date) },
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

  // const handleForward = async () => {
  //   if (!selectedRefugee) return;
  //   setIsForwarding(true);

  //   try {
  //     const { success, msg } = await api('PUT', `freqs/refugees/${selectedRefugee.id}/forward`);
  //     await new Promise((resolve) => setTimeout(resolve, 1500));
  //     if (success) {
  //       DangerMsg('نجاح', 'تمت ترقية الطلب بنجاح');
  //       await fetchData();
  //       handleClose();
  //     } else {
  //       DangerMsg('فشل التحديث', msg || 'تعذر ترقية الطلب');
  //     }
  //   } catch (error) {
  //     DangerMsg('خطأ', 'حدث خطأ أثناء ترقية الطلب');
  //     console.error(error);
  //   } finally {
  //     setIsForwarding(false);
  //   }
  // };

const handleForward = async () => {
  if (!selectedRefugee) return;
  setIsForwarding(true);

  try {
    let url = "";
    let body = {};

    if (["mokhabarat", "amn_watani", "istikhbarat_defense", "iqama"].includes(userRole)) {
      // لو الدور من أدوار الموافقات
      url = `freqs/refugees/update-approval/${selectedRefugee.id}`;
      body = { decision: "موافق" };
    } else {
      // باقي الأدوار يستخدمون الراوتر القديم
      url = `freqs/refugees/${selectedRefugee.id}/forward`;
    }

    const { success, msg } = await api("PUT", url, body);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (success) {
      NotificationMsg("نجاح", userRole && ["mokhabarat", "amn_watani", "istikhbarat_defense", "iqama"].includes(userRole) 
        ? "تمت الموافقة على الطلب" 
        : "تمت ترقية الطلب بنجاح");
      await fetchData();
      handleClose();
    } else {
      DangerMsg("فشل التحديث", msg || "تعذر تنفيذ العملية");
    }
  } catch (error) {
    DangerMsg("خطأ", "حدث خطأ أثناء العملية");
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

  // const handleReject = async (reason) => {
  //   if (!selectedRefugee || !reason) {
  //     if (!reason) DangerMsg('خطأ', 'يرجى إدخال سبب الرفض.');
  //     return;
  //   }
  //   setIsForwarding(true);

  //   try {
  //     const { success, msg } = await api('PUT', `freqs/refugees/${selectedRefugee.id}/reject`, {
  //       notes_case: reason,
  //     });
  //     await new Promise((resolve) => setTimeout(resolve, 1500));
  //     if (success) {
  //       DangerMsg('نجاح', 'تم رفض الطلب بنجاح.');
  //       await fetchData();
  //       handleClose();
  //     } else {
  //       DangerMsg('فشل الرفض', msg || 'تعذر رفض الطلب');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     DangerMsg('خطأ', 'حدث خطأ أثناء رفض الطلب');
  //   } finally {
  //     setIsForwarding(false);
  //     setOpenConfirmDialog(false);
  //   }
  // };

  const handleReject = async (reason) => {
  if (!selectedRefugee || !reason) {
    if (!reason) DangerMsg("خطأ", "يرجى إدخال سبب الرفض.");
    return;
  }
  setIsForwarding(true);

  try {
    let url = "";
    let body = {};

    if (["mokhabarat", "amn_watani", "istikhbarat_defense", "iqama"].includes(userRole)) {
      // لو الدور من أدوار الموافقات
      url = `freqs/refugees/update-approval/${selectedRefugee.id}`;
      body = { decision: "رفض" };
    } else {
      // باقي الأدوار يستخدمون الراوتر القديم
      url = `freqs/refugees/${selectedRefugee.id}/reject`;
      body = { notes_case: reason };
    }

    const { success, msg } = await api("PUT", url, body);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (success) {
      NotificationMsg(
        "نجاح",
        ["mokhabarat", "amn_watani", "istikhbarat_defense", "iqama"].includes(userRole)
          ? "تم تسجيل قرار الرفض بنجاح."
          : "تم رفض الطلب بنجاح."
      );
      await fetchData();
      handleClose();
    } else {
      DangerMsg("فشل الرفض", msg || "تعذر رفض الطلب");
    }
  } catch (error) {
    console.error(error);
    DangerMsg("خطأ", "حدث خطأ أثناء رفض الطلب");
  } finally {
    setIsForwarding(false);
    setOpenConfirmDialog(false);
  }
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
      // ✅ حدد الحقول التي تريد السماح بتعديلها فقط
      const allowedFieldsToEdit = [
        'interview_date',
        'interview_officername',
        'gender',
        'frist_name',
        'second_name',
        'theard_name',
        'sur_name',
        'mother_name',
        'fath_mother_name',
        'religion',
        'birth_date',
        'birth_place',
        'marital_status',
        'spouse_nationality',
        'marital_status_date',
        'phone_number',
        'nationality',
        'origin_country',
        'profession',
        'first_name_member',
        'political_opinion',
        'social_group_membership',
        'reasons_for_persecution',
        'last_place_of_residence',
        'residency_duration',
        'military_service',
        'political_party_membership',
        'political_party_names',
        'departure_date_from_origin',
        'date_of_arrival_to_iraq',
        'is_iraq_residency',
        'residency_issue_date',
        'residency_expiry_date',
        'reasons_for_leaving_origin',
        'previous_country_before_iraq',
        'residency_befor_iraq',
        'residency_befor_iraq_durtion',
        'place_of_residence',
        'duration_of_place',
        'returntocountryhistory',
        'intendtoreturn',
        'whathappensifreturn',
        'reasons_for_asylum',
        'power_of_attorney_number',
        'form_issue_date',
        'form_expiry_date',
        'form_place_of_issue',
        'race',
        'passport',
        'passportissuecountry',
        'familypassports',
        'interviewnotes',
        // أضف حقول أخرى إن أردت السماح بتعديلها
      ];

      // ⚙️ فلترة الحقول غير المسموح بها
      const filteredData = Object.fromEntries(
        Object.entries(editableRefugeeData).filter(([key]) => allowedFieldsToEdit.includes(key))
      );
       console.log('filteredData',filteredData);

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

  const handleOpenEditDialog = (member) => {
    setEditingMember({ ...member }); // نسخة من بيانات الفرد
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setEditingMember(null);
    setOpenEditDialog(false);
  };

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

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
      <Stack alignItems="center" mb={3}>
        <Typography variant="h3" component="h1" gutterBottom>
          نظام شؤون اللاجئين
        </Typography>
        <Typography variant="h5" color="text.secondary">
          مرحلة: {getStageText(user?.roles)}
        </Typography>
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
                {tableHeaders.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      backgroundColor: '#e6e6e6ff',
                      color: 'black',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      padding: '12px 16px',
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`, // Corrected line
                      textAlign: 'right', // Align header text to right for RTL
                      border: '1px solid #ccc', // حدود لكل خلية رأس
                    }}
                  >
                    {header.label}
                  </TableCell>
                ))}
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
              ) : refugees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography>لا توجد طلبات لعرضها.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                refugees.map((refugee) => (
                  <TableRow
                    key={refugee.id}
                    onClick={() => handleRowClick(refugee)} // Pass the whole refugee object
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'white', // خلفية الصف الأساسي
                      '&:hover': {
                        backgroundColor: '#f5f5f5', // رمادي باهت عند التمرير
                      },
                      borderBottom: (theme) => `1px solid rgba(0, 0, 0, 0.1)`, // خط سفلي خفيف

                      // ✅ حذف أي خلفية خاصة بالحالات الأخرى (approved, rejected...) أو استبدالها لو أردت
                      '&.row-approved': {
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      },
                      '&.row-rejected': {
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      },
                      '&.row-reviewer': {
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      },
                      '&.row-suspended': {
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      },
                    }}
                    className={`row-${refugee.current_stage}`} // Apply class for row styling
                  >
                    {tableHeaders.map((header) => (
                      <TableCell
                        key={header.id}
                        sx={{ textAlign: 'right', padding: '12px 16px', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'normal', lineHeight: 'normal' }}>
                          {header.render ? header.render(refugee[header.id]) : refugee[header.id] || '---'}
                        </Typography>
                      </TableCell>
                    ))}
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
          <IconButton
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
          </IconButton>

          {/* Edit Button (positioned at top right) */}
          {!isEditing &&
            selectedRefugee &&
            ((user.roles === 'data_entry' && selectedRefugee.current_stage === 'data_entry') ||
              (user.roles === 'data_entry' && selectedRefugee.current_stage === 'suspended')) && (
              <IconButton
                onClick={() => setIsEditing(true)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'info.main',
                }}
                aria-label="تعديل الطلب"
                title="تعديل الطلب"
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
            {renderSection(personalFields)} {/* زر تفاصيل العائلة */}
            {!isEditing && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined" color="primary" onClick={() => setOpenFamilyDialog(true)}>
                  تفاصيل العائلة
                </Button>
              </Box>
            )}
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            {/* Render table in view mode, or grid for edit mode */}
            {renderSection(additionalFields)}
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

                    {/* Approve Button */}
                    {((selectedRefugee.current_stage === 'data_entry' &&
                      (user.roles === 'data_entry' || user.roles === 'reviewer')) ||
                      (selectedRefugee.current_stage === 'reviewer' &&
                        (user.roles === 'reviewer' || user.roles === 'approver')) ||
                      (selectedRefugee.current_stage === 'approver' && user.roles === 'approver') ||
                      isSpecialRole(user.roles)) && (
                      <LoadingButton variant="contained" color="primary" onClick={handleForward} loading={isForwarding}>
                        موافقة
                      </LoadingButton>
                    )}

                    {/* Reject Button */}
                    {(user.roles === 'reviewer' || user.roles === 'approver' || isSpecialRole(user.roles)) && (
                      <Button variant="outlined" color="error" onClick={() => handleOpenConfirmDialog('reject')}>
                        رفض الطلب
                      </Button>
                    )}

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
    </Container>
  );
}
