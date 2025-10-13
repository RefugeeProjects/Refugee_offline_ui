//صفحة الربط مع erp
import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Grid } from '@mui/material';
import { Stepper, Step, StepLabel } from '@mui/material';

import { useCallback, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Card,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  InputLabel,
  Divider,
  Autocomplete,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

import { RemoveCircle, ArrowBack, ExpandMore, AddCircle, Save } from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
// date time picker
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import Iconify from '../components/iconify';
import { useApi } from '../utils';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
import { appContext } from '../context/appContext';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

//-----------
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { filePaths } from '../utils/paths';
// sections

// import titles
import { titles } from '../utils/title';

const styleBox = {
  bgcolor: 'background.paper',
  border: '2px solid #555',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};
const PanalForERP = ({ open, onClose, dataRecord, SetdataRecord }) => {
  const [step, setStep] = useState(1);
  //  define api
  const api = useApi();
  const handleToggle = () => {
    setOpen3(!open3);
  };
  const navigate = useNavigate();
  const [lastSelectedFormationName, setLastSelectedFormationName] = useState('الهيكل الاداري للوزارة');
  const [selectedFormationName, setSelectedFormationName] = useState('');
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  //-----

  //---ORG -------//
  //--- ORG ------ //
  const buildHierarchy = (updatedSelectedIds = {}) => {
    const levels = [2, 4, 6, 8, 11, 13];
    const hierarchy = levels
      .map((level) => {
        const levelOptions = options[`level${level}`];
        const selectedId = updatedSelectedIds[`level${level}`];

        // تأكد من أن levelOptions موجودة وselectedId موجود قبل محاولة البحث عن org_name
        return levelOptions && selectedId ? levelOptions.find((org) => org.org_id === selectedId)?.org_name : null; // إرجاع سلسلة فارغة إذا لم توجد البيانات
      })
      .filter(Boolean) // إزالة القيم الفارغة
      .join(' / '); // جمع الأسماء بفاصل "/"

    return hierarchy;
  };

  const [loadingLevel2, setLoadingLevel2] = useState(false);
  const [loadingLevel4, setLoadingLevel4] = useState(false);
  const [loadingLevel6, setLoadingLevel6] = useState(false);
  const [loadingLevel8, setLoadingLevel8] = useState(false);
  const [loadingLevel11, setLoadingLevel11] = useState(false);
  const [loadingLevel13, setLoadingLevel13] = useState(false);
  const levelMapping = {
    2: 4,
    4: 6,
    6: 8,
    8: 11,
    11: 13,
  };
  const loadingMapping = {
    2: setLoadingLevel2,
    4: setLoadingLevel4,
    6: setLoadingLevel6,
    8: setLoadingLevel8,
    11: setLoadingLevel11,
    13: setLoadingLevel13,
  };

  const resetSelectedIds = () => {
    setSelectedIds({
      level2: null,
      level4: null,
      level6: null,
      level8: null,
      level11: null,
      level13: null,
    });
  };

  // حالة لتخزين المعرفات المختارة لكل مستوى
  const [selectedIds, setSelectedIds] = useState({
    level2: null, // المستوى الثاني (وكالات)
    level4: null, // المستوى الرابع (مديريات عامة)
    level6: null, // المستوى السادس (مديريات)
    level8: null, // المستوى الثامن (أقسام المديرية)
    level11: null, // المستوى الحادي عشر (شعب)
    level13: null, // المستوى الثالث عشر (وحدات)
  });

  // حالة لتخزين الخيارات لكل مستوى
  const [options, setOptions] = useState({
    level2: [], // خيارات المستوى الثاني
    level4: [], // خيارات المستوى الرابع
    level6: [], // خيارات المستوى السادس
    level8: [], // خيارات المستوى الثامن
    level11: [], // خيارات المستوى الحادي عشر
    level13: [], // خيارات المستوى الثالث عشر
  });

  // إعادة تعيين الحقول (إعادة ضبط) بعد الإضافة/التعديل أو عند إغلاق النموذج
  const resetForm = () => {
    setSelectedIds({
      level2: null,
      level4: null,
      level6: null,
      level8: null,
      level11: null,
      level13: null,
    });
    setOptions({
      level2: [],
      level4: [],
      level6: [],
      level8: [],
      level11: [],
      level13: [],
    });
  };

  // تحميل خيارات المستوى بناءً على المعرف الحالي والمستوى
  const fetchOptions = async (parentId, level, setLoading = () => {}) => {
    try {
      setLoading(true);

      const endpoint = `freqs/allchildlvl/${parentId}/${level}`;
      const { result } = await api('GET', endpoint);
      if (result && result.child) {
        setOptions((prev) => ({ ...prev, [`level${level}`]: result.child }));
      }
    } catch (err) {
      console.error(`حدث خطأ أثناء تحميل الخيارات للمستوى ${level}:`, err);
      DangerMsg('خطأ', `فشل في تحميل الخيارات للمستوى ${level}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (level, value) => {
    const updatedSelectedIds = {
      ...selectedIds,
      [`level${level}`]: value,
    };

    setSelectedIds(updatedSelectedIds);

    SetdataRecord((prev) => ({
      ...prev,
      formation: value,
      org_name: buildHierarchy(updatedSelectedIds),
    }));

    const selectedOption = options[`level${level}`].find((org) => org.org_id === value);
    if (selectedOption) {
      setLastSelectedFormationName('تعديل التشكيل'); // تغيير اسم الزر بعد اختيار التشكيل
      setSelectedFormationName(buildHierarchy(updatedSelectedIds)); // تحديث اسم التشكيل المختار
    }

    // تحقق من المستوى التالي في الخريطة
    const nextLevel = levelMapping[level];
    if (nextLevel) {
      const nextLoadingFunction = loadingMapping[nextLevel];
      fetchOptions(value, nextLevel, nextLoadingFunction);
    }
  };
  useEffect(() => {
    fetchOptions(1, 2, setLoadingLevel2); // تمرير المعرف الأساسي 1 والمستوى 2 لتحميل بيانات المستوى الثاني
  }, []);

  // جلب بيانات المستوى الرابع (Level 4) عند اختيار level2
  useEffect(() => {
    if (selectedIds.level2) {
      fetchOptions(selectedIds.level2, 4, setLoadingLevel4);
    }
  }, [selectedIds.level2]);

  // جلب بيانات المستوى السادس (Level 6) عند اختيار level4
  useEffect(() => {
    if (selectedIds.level4) {
      fetchOptions(selectedIds.level4, 6, setLoadingLevel6);
    }
  }, [selectedIds.level4]);

  // جلب بيانات المستوى الثامن (Level 8) عند اختيار level6
  useEffect(() => {
    if (selectedIds.level6) {
      fetchOptions(selectedIds.level6, 8, setLoadingLevel8);
    }
  }, [selectedIds.level6]);

  // إعادة تعيين الحقول عند إغلاق النموذج
  const handleClose = () => {
    resetForm();
    handleToggle();
  };
  //---END ORG -----//

  //-- goves
  const [govsName, setgovsName] = useState([]);
  const Governsfn = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/governorate`);
      if (!success) {
        DangerMsg('اشعارات المحافظات', 'خطأ في تحميل البيانات');
        return;
      }
      setgovsName(data?.records || []); // التأكد من تخزين البيانات في الحالة

      // التحقق من القيم المخزنة
    } catch (err) {
      DangerMsg('اشعارات المحافظات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Governsfn();
  }, [Governsfn]);

  useEffect(() => {}, [govsName]);
  //---end of goves -----

  //--- formation2 -------//
  const [locatingName, setlocatingName] = useState([]);
  const locating = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/allocating_entity`);
      if (!success) {
        DangerMsg('اشعارات جهة التخصيص', 'خطأ في تحميل التشكيل ');
        return;
      }
      setlocatingName(data?.records || []); // التأكد من تخزين البيانات في الحالة
    } catch (err) {
      DangerMsg('اشعارات التشكيل (جهة التخصيص)', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    locating();
  }, [locating]);
  useEffect(() => {}, [locatingName]);
  // --- End of FormaTION2 ---------//

  //---Device --------//
  const [deviceName, setdeviceName] = useState([]);

  const devices = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/devices`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setdeviceName(data?.records || []); // التأكد من تخزين البيانات في الحالة

      // التحقق من القيم المخزنة
    } catch (err) {
      DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    devices();
  }, [devices]);

  useEffect(() => {}, [deviceName]);
  //---------------
  //---- END Device -----//
  const handleTypeSelect = (type) => {
    SetdataRecord((prev) => ({ ...prev, type }));
    setStep(2);
  };

  const handleFreqCharSelect = (freqChar) => {
    SetdataRecord((prev) => ({ ...prev, freq_char: freqChar }));
    setStep(3);
  };

  const handleGoBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      SetdataRecord((prev) => ({ ...prev, type: null }));
    } else {
      onClose();
    }
  };
  //---org_name -----//
  // دالة تقوم بتحديث حالة `status` بناءً على قيم الحقول المطلوبة
  const updateStatus = () => {
    const shouldSetStatusToOne = ['notes', 'formation', 'formation2', 'org_name'].some(
      (key) => dataRecord[key] !== null && dataRecord[key] !== ''
    );

    SetdataRecord((prev) => ({
      ...prev,
      status: shouldSetStatusToOne ? 1 : 2,
    }));
  };

  // استخدام `useEffect` لمراقبة الحقول وتحديث `status`

  useEffect(() => {
    updateStatus();
  }, [dataRecord.notes, dataRecord.formation, dataRecord.formation2, dataRecord.org_name]);

  const saveClick = useCallback(async () => {
    try {
      const { success, message } = await api('POST', `mains/freqs`, dataRecord); // إرسال البيانات باستخدام POST
      if (!success) {
        DangerMsg('إضافة القيد', 'فشل في إضافة القيد: ' + message);
        return;
      }
      NotificationMsg('إضافة القيد', 'تم إضافة القيد بنجاح!');
    } catch (err) {
      DangerMsg('إضافة القيد', 'حدث خطأ أثناء إرسال البيانات');
      console.error(err);
    }
  }, [dataRecord, api, navigate]);

  let freqRxField;
  if (dataRecord.freq_char === 'معيدة بث') {
    freqRxField = (
      <Grid item xs={3}>
        <TextField
          label="RX"
          variant="outlined"
          value={dataRecord.freq_rx || null}
          onChange={(e) => SetdataRecord((prev) => ({ ...prev, freq_rx: e.target.value }))}
          fullWidth
        />
      </Grid>
    );
  }
  //-- condition when choise HF , بيني

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '75%', md: '60%', lg: '50%' }, // تناسق العرض مع جميع الشاشات
          maxHeight: '90vh', // أقصى ارتفاع للمودل لتجنب الخروج من الشاشة
          overflowY: 'auto', // إتاحة التمرير عند الحاجة
          bgcolor: 'background.paper',
          border: '2px solid rgba(0, 0, 0, 0.5)',
          p: 4,
          borderRadius: 2, // إضافة زوايا مستديرة لجمالية العرض
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {' '}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <Close />
        </IconButton>
        <Stepper activeStep={step - 1}>
          <Step>
            <StepLabel>نوع التردد</StepLabel>
          </Step>
          <Step>
            <StepLabel>صنف التردد</StepLabel>
          </Step>
          <Step>
            <StepLabel>إدخال البيانات</StepLabel>
          </Step>
        </Stepper>
        {step === 1 && (
          <>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
              اختر نوع التردد
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['UHF', 'VHF', 'HF'].map((type) => (
                <Button
                  key={type}
                  variant="contained"
                  size="large"
                  onClick={() => {
                    if (dataRecord.type === 'HF') {
                      SetdataRecord((prev) => ({ ...prev, freq_char: 'بيني' }));
                      setStep(3); // الانتقال مباشرة إلى step 3
                    } else {
                      handleTypeSelect(type);
                      setStep(2); // الانتقال إلى step 2 إذا كان النوع ليس HF
                    }
                  }}
                  sx={{ fontSize: '1.5rem', padding: '10px 20px' }}
                >
                  {type}
                </Button>
              ))}
            </Box>
          </>
        )}
        {step === 2 && (
          <>
            {dataRecord.type === 'HF' ? (
              // في حال كان النوع HF، يتم تعيين القيم وتحديث الخطوة
              (() => {
                SetdataRecord({ ...dataRecord, freq_char: 'بيني' });
                setStep(3); // الانتقال مباشرة إلى المرحلة الثالثة
                return null; // عدم عرض محتوى المرحلة الثانية
              })()
            ) : (
              <>
                <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
                  اختر صنف التردد ({dataRecord.type})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleFreqCharSelect('معيدة بث')}
                    sx={{ fontSize: '1.5rem', padding: '10px 20px' }}
                  >
                    معيدة بث
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleFreqCharSelect('بيني')}
                    sx={{ fontSize: '1.5rem', padding: '10px 20px' }}
                  >
                    بيني
                  </Button>
                </Box>
                <Button variant="outlined" sx={{ mt: 5 }} onClick={handleGoBack}>
                  الرجوع إلى الصفحة السابقة
                </Button>
              </>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
              ({dataRecord.type} , {dataRecord.freq_char}) - إدخال بيانات
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 600 }}>
              <Grid container spacing={2}>
                {/* الصف الأول */}
                <Grid item xs={4}>
                  <TextField
                    label="TX"
                    variant="outlined"
                    value={dataRecord.freq_tx || null}
                    onChange={(e) => SetdataRecord((prev) => ({ ...prev, freq_tx: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                {/* الصف الأول */}
                {freqRxField}
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    id="class"
                    label="صفة التردد *"
                    value={dataRecord?.class || null}
                    onChange={(e) => {
                      SetdataRecord({ ...dataRecord, class: e.target.value || null });
                    }}
                  >
                    <MenuItem value="عسكري" style={{ fontWeight: 'bold' }}>
                      عسكري
                    </MenuItem>
                    <MenuItem value="مدني" style={{ fontWeight: 'bold' }}>
                      مدني
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    id="govSelect"
                    fullWidth
                    options={govsName}
                    getOptionLabel={(option) => option.gov || null} // عرض اسم المحافظة من الخيارات
                    isOptionEqualToValue={(option, value) => option.id === value.id} // للتحقق من تطابق id القيم
                    onChange={(event, newValue) => {
                      SetdataRecord({ ...dataRecord, gov: newValue?.id || null }); // تحديث قيمة الحقل عند التغيير
                    }}
                    renderInput={(params) => <TextField {...params} label="اختر المحافظة *" />}
                  />
                </Grid>

                {/* الصف الثاني */}
                <Grid item xs={4}>
                  <Autocomplete
                    id="formation2Select"
                    fullWidth
                    options={locatingName}
                    getOptionLabel={(option) => option.name || null} // عرض اسم التشكيل من الخيارات
                    isOptionEqualToValue={(option, value) => option.id === value.id} // للتحقق من تطابق id القيم
                    onChange={(event, newValue) => {
                      SetdataRecord({ ...dataRecord, formation2: newValue?.id || null }); // تحديث قيمة الحقل عند التغيير
                    }}
                    renderInput={(params) => <TextField {...params} label=" اختر التشكيل الاضافي  *" />}
                  />
                </Grid>
                <Grid item xs={3}>
                  {/* receiveDate */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Modal
                      open={open3}
                      onClose={handleClose} // استخدام handleClose لإعادة التعيين عند الإغلاق
                      aria-labelledby="modal-title"
                      aria-describedby="modal-description"
                    >
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
                              aria-label="إغلاق"
                              color="default"
                              sx={{ position: 'fixed', left: '10px', top: '10px' }}
                              onClick={() => {
                                resetForm(); // استدعاء resetForm لإعادة تعيين الحقول
                                handleClose(); // استدعاء handleClose لإغلاق المودال
                              }}
                            >
                              <Close />
                            </IconButton>
                            <FormGroup>
                              <Typography id="modal-title" variant="h4" mb={2}>
                                إضافة جهة تنظيمية جديدة
                              </Typography>

                              {/* المستوى الثاني: وكالات */}
                              <InputLabel id="org-level2-label">اختر الوكالة (المستوى 2)</InputLabel>
                              {loadingLevel2 ? (
                                <CircularProgress size={24} />
                              ) : (
                                <Select
                                  labelId="org-level2-label"
                                  name="level2"
                                  value={selectedIds.level2}
                                  onChange={(e) => handleSelectChange(2, e.target.value)}
                                  fullWidth
                                  margin="normal"
                                >
                                  {options.level2.map((org) => (
                                    <MenuItem key={org.org_id} value={org.org_id}>
                                      {org.org_name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                              {/* المستوى الرابع: مديريات عامة */}
                              {selectedIds.level2 && (
                                <>
                                  <InputLabel id="org-level4-label">اختر المديرية العامة (المستوى 4)</InputLabel>
                                  {loadingLevel4 ? (
                                    <CircularProgress size={24} />
                                  ) : (
                                    <Select
                                      labelId="org-level4-label"
                                      name="level4"
                                      value={selectedIds.level4}
                                      onChange={(e) => handleSelectChange(4, e.target.value)}
                                      fullWidth
                                      margin="normal"
                                    >
                                      {options.level4.map((org) => (
                                        <MenuItem key={org.org_id} value={org.org_id}>
                                          {org.org_name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  )}
                                </>
                              )}

                              {/* المستوى السادس: مديريات */}
                              {selectedIds.level4 && (
                                <>
                                  <InputLabel id="org-level6-label">اختر المديرية (المستوى 6)</InputLabel>
                                  {loadingLevel6 ? (
                                    <CircularProgress size={24} />
                                  ) : (
                                    <Select
                                      labelId="org-level6-label"
                                      name="level6"
                                      value={selectedIds.level6}
                                      onChange={(e) => handleSelectChange(6, e.target.value)}
                                      fullWidth
                                      margin="normal"
                                    >
                                      {options.level6.map((org) => (
                                        <MenuItem key={org.org_id} value={org.org_id}>
                                          {org.org_name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  )}
                                </>
                              )}

                              {/* المستوى الثامن: أقسام */}
                              {selectedIds.level6 && (
                                <>
                                  <InputLabel id="org-level8-label">اختر القسم (المستوى 8)</InputLabel>
                                  {loadingLevel8 ? (
                                    <CircularProgress size={24} />
                                  ) : (
                                    <Select
                                      labelId="org-level8-label"
                                      name="level8"
                                      value={selectedIds.level8}
                                      onChange={(e) => handleSelectChange(8, e.target.value)}
                                      fullWidth
                                      margin="normal"
                                    >
                                      {options.level8.map((org) => (
                                        <MenuItem key={org.org_id} value={org.org_id}>
                                          {org.org_name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  )}
                                </>
                              )}

                              {/* المستوى الحادي عشر: شعب */}
                              {selectedIds.level8 && (
                                <>
                                  <InputLabel id="org-level11-label">اختر الشعبة (المستوى 11)</InputLabel>
                                  <Select
                                    labelId="org-level11-label"
                                    name="level11"
                                    value={selectedIds.level11}
                                    onChange={(e) => handleSelectChange(11, e.target.value)}
                                    fullWidth
                                    margin="normal"
                                  >
                                    {options.level11.map((org) => (
                                      <MenuItem key={org.org_id} value={org.org_id}>
                                        {org.org_name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </>
                              )}
                              <Grid container justifyContent="center" sx={{ mt: 2 }}>
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    if (!selectedIds.level2) {
                                      DangerMsg('خطأ', 'يرجى اختيار جهة تنظيمية');
                                    } else {
                                      NotificationMsg('إشعار', 'تمت إضافة التشكيل بنجاح');
                                      resetForm(); // استدعاء resetForm لإعادة تعيين الحقول
                                      handleClose(); // استدعاء handleClose لإغلاق المودال
                                      setOpen3(false);
                                    }
                                  }}
                                  disabled={!selectedIds.level2} // تعطيل الزر إذا لم يتم اختيار أي مستوى
                                >
                                  إضافة تشكيل
                                </Button>
                              </Grid>
                            </FormGroup>
                          </Box>
                        </Grid>
                      </Grid>
                    </Modal>

                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Button
                        variant="outlined"
                        sx={{
                          marginBottom: '0',
                          marginRight: '10px',
                          color: 'rgba(0, 0, 0, 0.70)', // لون النص الأبيض
                          padding: '8px 16px', // تعديل المساحة الداخلية
                          borderRadius: '8px', // زوايا مستديرة قليلاً
                          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // ظل خفيف لإبراز الزر
                          transition: 'background-color 0.3s ease', // إضافة حركة سلسة
                          height: '56px', // نفس ارتفاع الحقول النصية الافتراضية في MUI
                          display: 'flex',
                          alignItems: 'center', // التأكد من محاذاة المحتوى عموديًا
                        }}
                        onClick={() => {
                          setOpen3(true);
                          fetchOptions(1, 2, setLoadingLevel2); // تحميل بيانات المستوى الثاني مباشرة عند فتح المودال
                        }}
                      >
                        {lastSelectedFormationName}
                      </Button>

                      {/* عرض التشكيل الذي تم اختياره فقط بناءً على المستوى الأعلى */}
                      {selectedIds.level11 ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="التشكيل"
                          value={options.level11.find((org) => org.org_id === selectedIds.level11)?.org_name || null}
                          InputProps={{
                            readOnly: true, // جعل الحقل غير قابل للكتابة
                          }}
                          inputProps={{
                            style: {
                              width: 'auto', // العرض يتغير تلقائيًا حسب المحتوى
                              minWidth: '100px', // الحد الأدنى للعرض
                            },
                          }}
                          sx={{
                            display: 'inline-flex',
                            width: 'auto', // العرض يتغير تلقائيًا
                          }}
                        />
                      ) : selectedIds.level8 ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="التشكيل"
                          value={options.level8.find((org) => org.org_id === selectedIds.level8)?.org_name || null}
                          InputProps={{
                            readOnly: true, // جعل الحقل غير قابل للكتابة
                          }}
                          inputProps={{
                            style: {
                              width: 'auto', // العرض يتغير تلقائيًا حسب المحتوى
                              minWidth: '100px', // الحد الأدنى للعرض
                            },
                          }}
                          sx={{
                            display: 'inline-flex',
                            width: 'auto', // العرض يتغير تلقائيًا
                          }}
                        />
                      ) : selectedIds.level6 ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="التشكيل"
                          value={options.level6.find((org) => org.org_id === selectedIds.level6)?.org_name || null}
                          InputProps={{
                            readOnly: true, // جعل الحقل غير قابل للكتابة
                          }}
                          inputProps={{
                            style: {
                              width: 'auto', // العرض يتغير تلقائيًا حسب المحتوى
                              minWidth: '100px', // الحد الأدنى للعرض
                            },
                          }}
                          sx={{
                            display: 'inline-flex',
                            width: 'auto', // العرض يتغير تلقائيًا
                          }}
                        />
                      ) : selectedIds.level4 ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="التشكيل"
                          value={options.level4.find((org) => org.org_id === selectedIds.level4)?.org_name || null}
                          InputProps={{
                            readOnly: true, // جعل الحقل غير قابل للكتابة
                          }}
                          inputProps={{
                            style: {
                              width: 'auto', // العرض يتغير تلقائيًا حسب المحتوى
                              minWidth: '100px', // الحد الأدنى للعرض
                            },
                          }}
                          sx={{
                            display: 'inline-flex',
                            width: 'auto', // العرض يتغير تلقائيًا
                          }}
                        />
                      ) : selectedIds.level2 ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="التشكيل - الهيكل الاداري للوزارة"
                          // value={options.level2.find((org) => org.org_id === selectedIds.level2)?.org_name || null}
                          value={'Test text field' || null}
                          InputProps={{
                            readOnly: true, // جعل الحقل غير قابل للكتابة
                          }}
                          sx={{
                            display: 'inline-flex',
                            width: '350px', // العرض يتغير تلقائيًا
                          }}
                        />
                      ) : null}
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="complaintNotes"
                    label="ملاحظات "
                    value={dataRecord?.notes}
                    onChange={(e) => {
                      SetdataRecord({ ...dataRecord, notes: e.target.value || null });
                    }}
                    multiline
                    rows={2} //   عدد الأسطر
                  />
                </Grid>
                {/* الصف الثالث */}
                <Grid item xs={4}>
                  <Autocomplete
                    id="deviceselect"
                    fullWidth
                    options={deviceName}
                    getOptionLabel={(option) => option.type || null} // عرض اسم المحافظة من الخيارات
                    isOptionEqualToValue={(option, value) => option.id === value.id} // للتحقق من تطابق id القيم
                    onChange={(event, newValue) => {
                      SetdataRecord({ ...dataRecord, device_type: newValue?.id || null }); // تحديث قيمة الحقل عند التغيير
                    }}
                    renderInput={(params) => <TextField {...params} label="اختر الجهاز *" />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    id="device_number"
                    label=" عدد الاجهزة"
                    value={dataRecord?.device_number || null}
                    onChange={(e) => {
                      SetdataRecord({ ...dataRecord, device_number: e.target.value });
                    }}
                    type="number"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    sx={{ width: '100%' }}
                    fullWidth
                    id="location"
                    label=" موقع المنظومة "
                    variant="outlined"
                    value={dataRecord?.location}
                    onChange={(e) => {
                      SetdataRecord({ ...dataRecord, location: e.target.value || null });
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 0 }}>
              <Grid container justifyContent={'center'} columnSpacing={2} rowSpacing={4} sx={{ my: 2 }}>
                <Grid display={'flex'} justifyContent={'center'} item xs={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mx: 10, fontSize: '16px' }}
                    onClick={() => {
                      saveClick();
                    }}
                  >
                    {'اضافة تردد جديد '}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              sx={{ mt: 5 }}
              onClick={() => {
                if (dataRecord.type === 'HF') {
                  SetdataRecord({ ...dataRecord, freq_char: 'بيني' });
                  SetdataRecord({ ...dataRecord, type: null });
                  // تحديث قيمة الحقل عند التغيير
                  setStep(1); // العودة إلى step 1 مباشرة إذا كان type هو HF
                } else {
                  handleGoBack(); // تابع التنفيذ الافتراضي إذا لم يكن type هو HF
                }
              }}
            >
              الرجوع إلى الصفحة السابقة
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default PanalForERP;
