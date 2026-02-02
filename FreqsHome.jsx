import React, { useContext, useCallback, useState, useEffect } from 'react';
import {
  Stack, Typography, Box, Modal, Button, Grid, IconButton,
  Tabs, Tab, Paper, Container, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Backdrop,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PauseIcon from '@mui/icons-material/Pause';
import { useApi } from '../utils';
import { DangerMsg, NotificationMsg } from '../components/NotificationMsg';
import { LoadingButton } from '@mui/lab';
import { appContext } from '../context';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other} dir="rtl">
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
}

export default function ApprovalsPage() {
  const [refugees, setRefugees] = useState([]);
  const [familyData, setFamilyData] = useState([]);
  const [selectedRefugee, setSelectedRefugee] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const api = useApi();
  const [isForwarding, setIsForwarding] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [openFamilyDialog, setOpenFamilyDialog] = useState(false);
  const { user } = useContext(appContext);
  const userRole = user.roles;

  const fetchData = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      let endpoint = "freqs/refugees";
      if (["mokhabarat","amn_watani","istikhbarat_defense","iqama"].includes(userRole)) {
        endpoint = "freqs/refugees/pending-approval";
      }
      const { success, data } = await api("GET", endpoint);
      if (!success) {
        DangerMsg("اشعارات اللاجئين", "خطأ في تحميل البيانات");
        return;
      } else {
        NotificationMsg("اشعارات اللاجئين", "تم تحميل البيانات");
      }
      setRefugees(data?.records || data);
    } catch (err) {
      DangerMsg("اشعارات اللاجئين", "خطأ في تحميل البيانات");
    } finally {
      setIsLoadingTable(false);
    }
  }, [api, userRole]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRowClick = (refugeeData) => {
    setSelectedRefugee(refugeeData);
    const filteredFamily = familyData.filter((f) => f.refugee_id === refugeeData.id);
    setFamilyData(filteredFamily);
  };

  const handleClose = () => {
    setSelectedRefugee(null);
    setTabIndex(0);
    setSuspendReason('');
  };

  const handleTabChange = (event, newValue) => { setTabIndex(newValue); };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';
    return date.toLocaleDateString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit'});
  };

  const fieldLabels = {
    gender:'الجنس', interview_date:'تاريخ المقابلة', interview_officername:'اسم مسؤول المقابلة',
    frist_name:'الاسم', second_name:'اسم الأب', theard_name:'اسم الجد', sur_name:'اللقب',
    mother_name:'اسم الأم', fath_mother_name:'اسم ابي الأم', religion:'الديانة', birth_date:'تاريخ الولادة',
    birth_place:'بلد الولادة',placeofbirthcity:'مكان الولادة', marital_status:'الحالة الاجتماعية', spouse_nationality:'جنسية الزوج/الزوجة',
    marital_status_date:'تاريخ الحالة الاجتماعية', phone_number:'رقم الهاتف', governorate:'المحافظة',
    district:'القضاء', subdistrict:'المنطقة', nationality:'القومية', origin_country:'بلد الأصل',
    profession:'المهنة', personal_photo:'الصورة الشخصية', first_name_member:'اسم أول فرد من العائلة',
    political_opinion:'الرأي السياسي', social_group_membership:'الانتماء الاجتماعي أو القبلي',
    reasons_for_persecution:'أسباب طلب اللجوء', last_place_of_residence:'آخر مكان سكن فيه',
    residency_duration:'مدة الإقامة في آخر مكان', military_service:'هل لديك خدمة عسكرية؟',
    political_party_membership:'هل تنتمي لأحزاب سياسية؟', political_party_names:'أسماء الأحزاب',
    departure_date_from_origin:'تاريخ مغادرة البلد الأصلي', date_of_arrival_to_iraq:'تاريخ الوصول إلى العراق',
    is_iraq_residency:'هل لديك إقامة في العراق؟', residency_issue_date:'تاريخ إصدار الإقامة',
    residency_expiry_date:'تاريخ انتهاء الإقامة', passport:'هل لديك جواز سفر',
    passportissuecountry:'بلد إصدار جواز السفر', familypassports:'هل كل أفراد العائلة لديهم جوازات سفر؟',
    reasons_for_leaving_origin:'أسباب مغادرة البلد الأصلي', previous_country_before_iraq:'البلد السابق قبل القدوم إلى العراق',
    residency_befor_iraq:'محل الاقامة قبل دخول الاراضي العراقية', residency_befor_iraq_durtion:'الفترة الزمنية قبل دخول الاراضي العراقية',
    returntocountryhistory:'هل سبق وعدت إلى بلدك؟', intendtoreturn:'هل تنوي العودة؟',
    preferredresidencereturn:'المكان المفضل عند العودة', whathappensifreturn:'ماذا سيحدث اذا عدت؟',
    place_of_residence:'آخر محل للإقامة ضمن مغادرة بلد الأصل', duration_of_place:'مدة الإقامة قبل مغادرة بلد الأصل',
    reasons_for_asylum:'ملخص اسباب طلب اللجوء', power_of_attorney_number:'رقم الفورما',
    form_issue_date:'تاريخ إصدار الفورما', form_expiry_date:'تاريخ انتهاء الفورما',
    form_place_of_issue:'جهة الاصدار', race:'العرق', notes_case:'تعليق',
    mok_approval:'موافقة المخابرات', amn_wat_approval:'موافقة الامن الوطني',
    istk_approval:'موافقة استخبارات وامن الدفاع', iqama_approval:'موافقة الاقامة',
    interviewnotes:'ملخص المقابلة',
    education_level_id:'المستوى التعليمي',
     father_date_ofbirth: 'تاريخ ميلاد الأب',
    father_isdead: 'هل الأب متوفى؟',
    father_nationalityid: 'جنسية الأب',
    mother_date_ofbirth: 'تاريخ ميلاد الأم',
    mother_isdead: 'هل الأم متوفاة؟',
    mother_nationalityid: 'جنسية الأم',
  };

  const personalFields = ['gender','frist_name','second_name','theard_name','sur_name','mother_name','fath_mother_name',
    'interview_officername','interview_date','birth_date','birth_place','placeofbirthcity','religion','marital_status','spouse_nationality',
    'marital_status_date','phone_number','governorate','district','subdistrict','nationality','origin_country',
    'profession','personal_photo','first_name_member','education_level_id',
    'father_date_ofbirth','father_isdead','father_nationalityid',
    'mother_date_ofbirth','mother_isdead','mother_nationalityid'
  ];

  const additionalFields = Object.keys(fieldLabels).filter((key) => !personalFields.includes(key));

  const renderSection = (fields) => {
    const dataToDisplay = selectedRefugee;
    const renderFieldValue = (key, value) => {
      if (key === 'personal_photo') {
        return value ? (<img src={value} alt="الصورة" style={{maxWidth:'100%',maxHeight:'120px',borderRadius:8}} />)
        : (<Typography variant="body1" color="text.secondary">لا توجد صورة</Typography>);
      }
      if (['birth_date','residency_issue_date','residency_expiry_date','form_issue_date','form_expiry_date','interview_date','departure_date_from_origin','date_of_arrival_to_iraq','father_date_ofbirth','mother_date_ofbirth'].includes(key)) {
        return <Typography variant="body1">{formatDateForDisplay(value) || '---'}</Typography>;
      }
      return (<Typography variant="body1" sx={{whiteSpace:'pre-wrap'}}>{value || '---'}</Typography>);
    };
    return (
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'20px'}}>
        <tbody>
          {fields.map((key) => {
            if (key === 'personal_photo' && !dataToDisplay?.personal_photo) return null;
            const label = fieldLabels[key] || key;
            const value = dataToDisplay?.[key];
            return (
              <tr key={key} style={{borderBottom:'1px solid #ddd'}}>
                <td style={{padding:'12px',fontWeight:'bold',width:'35%',backgroundColor:'#f5f5f5',borderRight:'1px solid #ddd'}}>
                  <Typography variant="subtitle1" fontWeight="bold">{label}</Typography>
                </td>
                <td style={{padding:'12px',width:'65%'}}>{renderFieldValue(key,value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const tableHeaders = [
    {id:'frist_name',label:'الاسم'},
    {id:'second_name',label:'اسم الاب'},
    {id:'theard_name',label:'اسم الجد'},
    {id:'sur_name',label:'اللقب'},
    {id:'mother_name',label:'اسم الام'},
    {id:'fath_mother_name',label:'اسم والد الام'},
    {id:'interview_officername',label:'مسؤول المقابلة'},
    {id:'current_stage',label:'المرحلة الحالية'},
    {id:'phone_number',label:'رقم الهاتف'},
    {id:'origin_country',label:'بلد الأصل'},
    {id:'date_of_arrival_to_iraq',label:'تاريخ الوصول للعراق',render:(d)=>formatDateForDisplay(d)},
    {id:'nationality',label:'القومية'}, {id:'birth_date',label:'تاريخ الولادة',render:(d)=>formatDateForDisplay(d)},
    {id:'interview_date',label:'تاريخ المقابلة',render:(d)=>formatDateForDisplay(d)},
    {id:'notes_case',label:'تعليق'},
    {id:'father_date_ofbirth',label:'تاريخ ميلاد الأب',render:(d)=>formatDateForDisplay(d)},
    {id:'mother_date_ofbirth',label:'تاريخ ميلاد الأم',render:(d)=>formatDateForDisplay(d)},
  ];

  const getStageText = (stage) => {
    switch(stage){
      case 'data_entry': return 'إدخال البيانات';
      case 'reviewer': return 'مدقق البيانات';
      case 'approver': return 'موافقة اللجنة';
      case 'rejected': return 'مرفوض';
      case 'approved': return 'موافق عليه';
      case 'suspended': return 'معلق';
      case 'mokhabarat': return 'مخابرات';
      case 'istikhbarat_defense': return 'استخبارات وامن الدفاع';
      case 'amn_watani': return 'أمن وطني';
      case 'iqama': return 'الإقامة';
      default: return 'غير محدد';
    }
  };

  return (
    <Container maxWidth="xl" sx={{height:'100vh',display:'flex',flexDirection:'column',py:3}}>
      <Stack alignItems="center" mb={3}>
        <Typography variant="h3">نظام شؤون اللاجئين</Typography>
        <Typography variant="h5" color="text.secondary">مرحلة: {getStageText(user?.roles)}</Typography>
      </Stack>
      <Paper elevation={6} sx={{flexGrow:1,width:'100%',borderRadius:3,overflow:'hidden'}}>
        <TableContainer sx={{maxHeight:'calc(100vh - 200px)',border:'1px solid #ccc',borderRadius:'4px'}}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell key={header.id} sx={{backgroundColor:'#e6e6e6ff',color:'black',fontSize:'1rem',fontWeight:'bold',textAlign:'right',border:'1px solid #ccc'}}>
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingTable ? (
                <TableRow><TableCell colSpan={tableHeaders.length} sx={{textAlign:'center',py:5}}><CircularProgress/><Typography>جاري تحميل البيانات...</Typography></TableCell></TableRow>
              ) : refugees.length===0 ? (
                <TableRow><TableCell colSpan={tableHeaders.length} sx={{textAlign:'center',py:5}}><Typography>لا توجد طلبات</Typography></TableCell></TableRow>
              ) : (
                refugees.map((refugee)=>(
                  <TableRow key={refugee.id} onClick={()=>handleRowClick(refugee)} sx={{cursor:'pointer','&:hover':{backgroundColor:'#f5f5f5'}}}>
                    {tableHeaders.map((header)=>(
                      <TableCell key={header.id} sx={{textAlign:'right'}}>
                        <Typography variant="body1">{header.render ? header.render(refugee[header.id]) : refugee[header.id] || '---'}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isForwarding && <Backdrop sx={{color:'#fff',zIndex:(t)=>t.zIndex.drawer+1,flexDirection:'column'}} open={isForwarding}><CircularProgress/><Typography>جاري معالجة الطلب...</Typography></Backdrop>}

      <Modal open={!!selectedRefugee} onClose={handleClose}>
        <Box sx={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:{xs:'95%',sm:'90%',md:'75%',lg:'65%'},maxHeight:'90vh',bgcolor:'background.paper',boxShadow:24,p:4,overflowY:'auto',borderRadius:2,direction:'rtl'}}>
          <IconButton onClick={handleClose} sx={{position:'absolute',top:8,left:8}}><CloseIcon/></IconButton>
          <Typography variant="h4" gutterBottom sx={{textAlign:'center',mb:3}}>تفاصيل الطلب</Typography>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" textColor="primary" indicatorColor="primary" sx={{mb:3}}>
            <Tab label="المعلومات الشخصية"/><Tab label="المعلومات الإضافية"/>
          </Tabs>
          <TabPanel value={tabIndex} index={0}>{renderSection(personalFields)}</TabPanel>
          <TabPanel value={tabIndex} index={1}>{renderSection(additionalFields)}</TabPanel>
        </Box>
      </Modal>
    </Container>
  );
}