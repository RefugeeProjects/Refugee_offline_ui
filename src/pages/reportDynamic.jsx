// صفحة التقارير - تم التعديل لتطابق حقول طالبي اللجوء
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Button, TextField, Typography, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import { useApi } from '../utils';
import { DataGrid } from '@mui/x-data-grid';
import { DangerMsg, NotificationMsg } from '../components/NotificationMsg';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import arabicFont from '../fonts/arabicFont.js'; // يُفترض وجود هذا الملف

export default function RefugeeReport() {
  const dataGridRef = useRef();
  const [visibleData, setVisibleData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({
    id: true,
    interview_date: true,
    interview_officername: true,
    gender: true,
    frist_name: true,
    second_name: true,
    theard_name: true,
    sur_name: false,
    mother_name: false,
    fath_mother_name: false,
    religion: false,
    birth_date: false,
    birth_place: false,
    placeofbirthcity: false,
    marital_status: false,
    spouse_nationality: false,
    phone_number: false,
    nationality: false,
    profession: false,
    personal_photo: false,
    created_at: false,
    reasons_for_persecution: false,
    departure_date_from_origin: false,
    date_of_arrival_to_iraq: false,
    reasons_for_leaving_origin: false,
    reasons_for_asylum: false,
    updated_at: false,
    notes_case: false,
    created_by: false,
    power_of_attorney_number: false,
    race: false,
    passport: false,
    whathappensifreturn: false,
    interview_notes: false,
    applicant_signature: false,
    case_number: false,
    governorate: false,
    district: false,
    subdistrict: false,
    place_of_residence: false,
    duration_of_place: false,
    is_iraq_residency: false,
    residency_issue_date: false,
    residency_expiry_date: false,
    form_issue_date: false,
    form_expiry_date: false,
    form_place_of_issue: false,
    marital_status_date: false,
    residency_befor_iraq: false,
    residency_befor_iraq_durtion: false,
    current_stage: false,
    passportissuecountry: false,
    passport_number: false,
    returntocountryhistory: false,
    intendtoreturn: false,
    preferredresidencereturn: false,
    interviewnotes: false,
    applicantsignature: false,
    notes: false,
    mok_approval: false,
    amn_wat_approval: false,
    istk_approval: false,
    iqama_approval: false,
    familypassports: false,
    origin_country: false,
    political_party_membership: false,
    political_party_names: false,
    education_level_id: false,
    father_date_ofbirth: false,
    father_isdead: false,
    father_nationalityid: false,
    mother_date_ofbirth: false,
    mother_isdead: false,
    mother_nationalityid: false,

  });
  const [filters, setFilters] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const api = useApi();

  // 1. متغيرات القيم الفريدة الجديدة (للفلاتر)
  const uniqueNationalities = [...new Set(reportData.map((row) => row.nationality).filter((value) => value))];
  const uniqueMaritalStatus = [...new Set(reportData.map((row) => row.marital_status).filter((value) => value))];
  const uniqueCurrentStage = [...new Set(reportData.map((row) => row.current_stage).filter((value) => value))];
  const fliterFN = [...new Set(reportData.map((row) => row.frist_name).filter((value) => value))];
  const filterSN = [...new Set(reportData.map((row) => row.second_name).filter((value) => value))];
  const fliterTN = [...new Set(reportData.map((row) => row.theard_name).filter((value) => value))];
  const fliterSN = [...new Set(reportData.map((row) => row.sur_name).filter((value) => value))];
  const fliterMN = [...new Set(reportData.map((row) => row.mother_name).filter((value) => value))];
  const fliterFMN = [...new Set(reportData.map((row) => row.fath_mother_name).filter((value) => value))];
  const fliterRE = [...new Set(reportData.map((row) => row.religion).filter((value) => value))];
  const fliterBD = [...new Set(reportData.map((row) => row.birth_date).filter((value) => value))];
  const fliterPN = [...new Set(reportData.map((row) => row.phone_number).filter((value) => value))];
  const fliterOC = [...new Set(reportData.map((row) => row.origin_country).filter((value) => value))];
  // الامنية
  const fliterMAPP = [...new Set(reportData.map((row) => row.mok_approval).filter((value) => value))];
  const fliterAMNAPP = [...new Set(reportData.map((row) => row.amn_wat_approval).filter((value) => value))];
  const fliterISAPP = [...new Set(reportData.map((row) => row.istk_approval).filter((value) => value))];
  const fliterIQAPP = [...new Set(reportData.map((row) => row.iqama_approval).filter((value) => value))];
  //-------
  const fliterGOV = [...new Set(reportData.map((row) => row.governorate).filter((value) => value))];
  const fliterGB = [...new Set(reportData.map((row) => row.created_by).filter((value) => value))];
  const fliterIN = [...new Set(reportData.map((row) => row.interview_officername).filter((value) => value))];
  const fliterGE = [...new Set(reportData.map((row) => row.gender).filter((value) => value))];
  const fliterFDB = [...new Set(reportData.map((row) => row.father_date_ofbirth).filter((value) => value))];
  const fliterMID = [...new Set(reportData.map((row) => row.mother_date_ofbirth).filter((value) => value))];
  const fliterFID = [...new Set(reportData.map((row) => row.father_isdead).filter((value) => value))];
  const  fliterFNI = [...new Set(reportData.map((row) => row.father_nationalityid).filter((value) => value))];
  const fliterMDB = [...new Set(reportData.map((row) => row.mother_isdead).filter((value) => value))];
  const fliterMNI = [...new Set(reportData.map((row) => row.mother_nationalityid).filter((value) => value))];
  
  

  

  // تحميل الخط إلى jsPDF
  jsPDF.API.events.push([
    'addFonts',
    function () {
      this.addFileToVFS('Arabic-Regular.ttf', arabicFont);
      this.addFont('Arabic-Regular.ttf', 'Arabic', 'normal');
    },
  ]);

  // 2. إزالة المتغيرات القديمة، أو تعديل المتغيرات المشتركة
  // const [tblGov, setTblGov] = useState([]); // يُفترض استخدامها للمحافظة (governorate)

  // تم دمج الدوال القديمة في دالة واحدة لجلب البيانات اللازمة للفلاتر الجديدة
  // const fetchFilterData = useCallback(async () => {
  //   try {
  //     // مثال لجلب المحافظات إذا كانت مستخدمة كفلتر خارجي
  //     const { success, data } = await api('GET', `mains/governorate`); // افتراض أن المسار لا يزال صحيحاً
  //     if (success) {
  //       setTblGov(data?.records || []);
  //     } else {
  //       DangerMsg('تحميل البيانات', 'خطأ في تحميل بيانات المحافظات');
  //     }
  //   } catch (err) {
  //     DangerMsg('تحميل البيانات', 'خطأ في تحميل البيانات الأساسية');
  //     console.error(err);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchFilterData();
  // }, [fetchFilterData]);

  const ref = useRef();
  const handlePrint = useReactToPrint({
    content: () => ref.current,
    documentTitle: 'تقرير طالبي اللجوء', // تم تحديث عنوان المستند
    pageStyle: `
      @page {
        size: landscape;
        margin: 0.5cm 0.5cm 0.5cm 0.5cm;
        color: black;
      }
      body {
        direction: rtl;
      }
      .print-header {
        position: fixed;
        top: 0;
        width: 100%;
        text-align: center;
      }
      .print-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
      }
      .page-break {
        page-break-after: always;
      }
    `,
  });

  // دالة لجلب بيانات التقرير
  const fetchReportData = async () => {
    setLoading(true);
    setShowReport(false);
    try {
      const params = new URLSearchParams({
        table: 'refugees', // تم تغيير اسم الجدول المفترض
      });

      if (filters.length > 0) {
        const filterObject = {};
        filters.forEach(({ column, value }) => {
          filterObject[column] = value;
        });
        params.set('where', JSON.stringify(filterObject));
      }

      // تم افتراض أن مسار الـ API العام لجلب البيانات هو نفسه مع تغيير 'table'
      const response = await api('GET', `freqs/dynamic-query/?${params.toString()}`); // يجب التأكد من مسار الـ API الصحيح لجلب بيانات اللجوء

      if (response.success) {
        setReportData(response.data || []);
        setShowReport(true);
        storeDisplayedData();
      } else {
        console.error('Error in API response:', response.err);
        DangerMsg('إنشاء التقرير', 'خطأ في جلب بيانات التقرير.');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      DangerMsg('إنشاء التقرير', 'حدث خطأ غير متوقع أثناء جلب البيانات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportData.length > 0) {
      storeDisplayedData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData, selectedColumns]);

  // 3. تحديث دالة storeDisplayedData
  const storeDisplayedData = () => {
    const data = reportData.map((row) =>
      availableColumns.reduce((acc, column) => {
        if (selectedColumns[column.field] && column.field !== 'id') {
          // التعامل مع حقل المحافظة (gov)
          if (['interview_date', 'birth_date', 'created_at', 'updated_at'].includes(column.field)) {
            // تنسيق التواريخ
            const dateValue = row[column.field];
            
            acc[column.headerName] = dateValue ? new Date(dateValue).toLocaleDateString('en-CA') : '';
          } else {
            acc[column.headerName] = row[column.field] || '';
          }
        }
        return acc;
      }, {})
    );

    setVisibleData(data);
    return data;
  };

  // يتم استدعاء جلب البيانات لأول مرة
  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // بدون أي تبعيات لتشغيلها مرة واحدة عند التحميل

  // 4. تحديث دالة exportToPDF
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      format: 'a4',
    });
    // إضافة الخط العربي واستخدامه
    doc.addFont('Arabic-Regular.ttf', 'Arabic', 'normal');
    doc.setFont('Arabic');
    doc.setFontSize(10);

    const headersMap = availableColumns
      .filter((col) => selectedColumns[col.field] && col.field !== 'id') // إزالة الـ ID من الرأس
      .map((col) => col.headerName);

    const tableColumnHeaders = ['ت', ...headersMap].reverse(); // الترتيب من اليمين لليسار مع إضافة "ت"

    // تحضير البيانات لـ PDF
    const visibleDataWithIndex = visibleData.map((row, index) => ({
      ت: index + 1, // إضافة عمود الترقيم باسم "ت"
      ...row,
    }));

    const tableRows = visibleDataWithIndex.map((row) => tableColumnHeaders.map((header) => row[header] || ''));

    doc.autoTable({
      head: [tableColumnHeaders],
      body: tableRows,
      startY: 35,
      styles: {
        font: 'Arabic',
        fontSize: 8, // تقليل حجم الخط لاستيعاب المزيد من الأعمدة
        overflow: 'linebreak',
        halign: 'right',
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'right' },
      rtl: true,
      margin: { top: 35, right: 3, left: 3, bottom: 3 },
      didDrawPage: (data) => {
        const logoImage =
          'data:image/png;base64,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';
        // يجب استبدال هذا برمز شعار حقيقي
        // ... (منطق الشعار والترويسة)
        doc.addImage(logoImage, 'PNG', doc.internal.pageSize.width / 2 - 15, 2, 20, 20);
        doc.setFontSize(12);
        doc.text('وزارة الداخلية', doc.internal.pageSize.width - 20, 5, { align: 'right' });
        doc.text('وكالة الوزارة للشؤون الادارية والمالية ', doc.internal.pageSize.width - 30, 10, {
          align: 'center',
        });
        doc.text(' اللجنة الدائمة لشؤون اللاجئين ', doc.internal.pageSize.width - 30, 15, {
          align: 'center',
        });
        doc.text('تقرير طالبي اللجوء', doc.internal.pageSize.width / 2, 28, {
          align: 'center',
        });

        // إضافة رقم الصفحة والتاريخ
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`التاريخ: ${formattedDate} | صفحة ${pageCount}`, 10, 10, {
          align: 'left',
        });
      },
    });

    doc.save('Refugee_Report.pdf');
  };

  const handleAddOrUpdateFilter = (column, value) => {
    setFilters((prevFilters) => {
      if (value === undefined || value === null || value === '') {
        return prevFilters.filter((f) => f.column !== column);
      }

      const existingFilterIndex = prevFilters.findIndex((f) => f.column === column);
      if (existingFilterIndex > -1) {
        const updatedFilters = [...prevFilters];
        updatedFilters[existingFilterIndex].value = value;
        return updatedFilters;
      } else {
        return [...prevFilters, { column, value }];
      }
    });
  };

  const handleColumnSelectionChange = (event) => {
    const { name, checked } = event.target;
    setSelectedColumns((prevColumns) => ({
      ...prevColumns,
      [name]: checked,
    }));
  };

  // 5. مصفوفة الأعمدة (availableColumns) - تم نسخها كما هي من ردك الأخير
  const availableColumns = [
    {
      field: 'id',
      headerName: 'ت',
      width: 50,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p>{params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1}</p>,
    },
    { field: 'interview_date', headerName: 'تاريخ المقابلة', width: 150 },
    { field: 'interview_officername', headerName: 'ضابط المقابلة', width: 150 },
    { field: 'case_number', headerName: 'رقم الملف', width: 100 },
    { field: 'frist_name', headerName: 'الاسم الأول', width: 120 },
    { field: 'second_name', headerName: 'الاسم الثاني', width: 120 },
    { field: 'theard_name', headerName: 'الاسم الثالث', width: 120 },
    { field: 'sur_name', headerName: 'اللقب', width: 120 },
    { field: 'mother_name', headerName: 'اسم الأم', width: 120 },
    { field: 'fath_mother_name', headerName: 'اسم أب الأم', width: 150 },
    { field: 'birth_date', headerName: 'تاريخ الميلاد', width: 150 },
    { field: 'birth_place', headerName: 'بلد الميلاد', width: 150 },
    { field: 'placeofbirthcity', headerName: 'مدينة الولادة', width: 150 },
    { field: 'gender', headerName: 'الجنس', width: 80 },
    { field: 'religion', headerName: 'الديانة', width: 100 },
    { field: 'nationality', headerName: 'الجنسية', width: 100 },
    { field: 'race', headerName: 'العرق', width: 100 },
    { field: 'profession', headerName: 'المهنة', width: 150 },
    { field: 'education_level_id', headerName: 'المستوى التعليمي', width: 150 },
    { field: 'phone_number', headerName: 'رقم الهاتف', width: 150 },
    { field: 'marital_status', headerName: 'الحالة الاجتماعية', width: 150 },
    { field: 'marital_status_date', headerName: 'تاريخ الحالة الزوجية', width: 170 },
    { field: 'spouse_nationality', headerName: 'جنسية الزوج/الزوجة', width: 170 },
    { field: 'father_date_ofbirth', headerName: 'تاريخ ميلاد الأب', width: 170 },
    { field: 'mother_date_ofbirth', headerName: 'تاريخ ميلاد الأم', width: 170 },
    { field: 'father_isdead', headerName: 'هل الأب متوفى؟', width: 150 },
    { field: 'mother_isdead', headerName: 'هل الأم متوفاة؟', width: 150 },
    { field: 'father_nationalityid', headerName: 'جنسية الأب', width: 150 },
    { field: 'mother_nationalityid', headerName: 'جنسية الأم', width: 150 },
    { field: 'governorate', headerName: 'المحافظة الحالية', width: 150 },
    { field: 'district', headerName: 'القضاء الحالي', width: 150 },
    { field: 'subdistrict', headerName: 'المنطقة الحالية', width: 150 },
    { field: 'is_iraq_residency', headerName: 'هل الإقامة في العراق', width: 150 },
    { field: 'residency_issue_date', headerName: 'تاريخ إصدار الإقامة', width: 170 },
    { field: 'residency_expiry_date', headerName: 'تاريخ انتهاء الإقامة', width: 170 },
    { field: 'form_issue_date', headerName: 'تاريخ إصدار الفورمة', width: 170 },
    { field: 'form_expiry_date', headerName: 'تاريخ انتهاء الفورمة', width: 170 },
    { field: 'form_place_of_issue', headerName: 'جهة إصدار الفورمة', width: 170 },
    { field: 'place_of_residence', headerName: 'آخر محل إقامة ببلد الأصل', width: 200 },
    { field: 'duration_of_place', headerName: 'الفترة الزمنية للإقامة الأخيرة', width: 200 },
    { field: 'residency_befor_iraq', headerName: 'محل الإقامة قبل العراق', width: 200 },
    { field: 'residency_befor_iraq_durtion', headerName: 'الفترة الزمنية قبل العراق', width: 200 },
    { field: 'departure_date_from_origin', headerName: 'تاريخ المغادرة من بلد الأصل', width: 200 },
    { field: 'date_of_arrival_to_iraq', headerName: 'تاريخ الوصول إلى العراق', width: 200 },
    { field: 'origin_country', headerName: 'بلد الأصل', width: 150 },
    { field: 'reasons_for_leaving_origin', headerName: 'أسباب مغادرة بلد الأصل', width: 200 },
    { field: 'reasons_for_persecution', headerName: 'أسباب طلب اللجوء التفصيلية', width: 250 },
    { field: 'reasons_for_asylum', headerName: 'ملخص أسباب طلب اللجوء', width: 250 },
    { field: 'whathappensifreturn', headerName: 'ماذا سيحدث لك إذا عدت', width: 250 },
    { field: 'intendtoreturn', headerName: 'هل تنوي العودة لبلدك', width: 170 },
    { field: 'preferredresidencereturn', headerName: 'محل الإقامة المفضل عند العودة', width: 250 },
    { field: 'returntocountryhistory', headerName: 'تاريخ العودة لبلد الأصل (تفصيل)', width: 250 },
    { field: 'passport', headerName: 'هل لديك جواز سفر', width: 150 },
    { field: 'passport_number', headerName: 'رقم جواز السفر', width: 150 },
    { field: 'passportissuecountry', headerName: 'بلد إصدار جواز السفر', width: 170 },
    { field: 'familypassports', headerName: 'هل كل أفراد العائلة لديهم جواز سفر', width: 250 },
    { field: 'political_party_membership', headerName: 'عضوية حزب سياسي', width: 150 },
    { field: 'political_party_names', headerName: 'أسماء الأحزاب السياسية', width: 200 },
    { field: 'power_of_attorney_number', headerName: 'رقم الفورما/وكالة', width: 170 },
    { field: 'interviewnotes', headerName: 'ملخص المقابلة', width: 200 },
    { field: 'notes_case', headerName: 'ملاحظات الملف', width: 200 },
    { field: 'notes', headerName: 'ملاحظات عامة', width: 200 },
    { field: 'current_stage', headerName: 'المرحلة الحالية', width: 150 },
    { field: 'mok_approval', headerName: 'موافقة المخابرات  ', width: 200 },
    { field: 'amn_wat_approval', headerName: 'موافقة الأمن الوطني', width: 200 },
    { field: 'istk_approval', headerName: 'موافقة الاستخبارات', width: 200 },
    { field: 'iqama_approval', headerName: 'موافقة الإقامة', width: 150 },
    { field: 'created_at', headerName: 'تاريخ الإنشاء', width: 180 },
    { field: 'updated_at', headerName: 'آخر تحديث', width: 180 },
    { field: 'created_by', headerName: 'تم الإنشاء بواسطة (ID)', width: 150 },
  ];

  const isAnyColumnSelected = Object.values(selectedColumns).some((selected) => selected);
  const style = {
    bgcolor: 'background.paper',
    border: '0',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
  };
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#eee !important', style }}
        style={{
          color: '#fff',
          backgroundColor: '#456A8E',
        }}
      >
        إنشاء تقارير طالبي اللجوء
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">الفلاتر</Typography>
          <Grid container spacing={2}>
            {/* 6. تحديث الفلاتر */}
            {availableColumns
              .filter((column) =>
                [
                  'nationality',
                  'marital_status',
                  'governorate',
                  'current_stage',
                  'frist_name',
                  'second_name',
                  'theard_name',
                  'sur_name',
                  'mother_name',
                  'fath_mother_name',
                  'religion',
                  'birth_date',
                  'phone_number',
                  'origin_country',
                  'mok_approval',
                  'amn_wat_approval',
                  'istk_approval',
                  'iqama_approval',
                  'created_by',
                  'interview_officername',
                  'gender',
                  'father_date_ofbirth',
                  'father_isdead',
                  'father_nationalityid',
                  'mother_date_ofbirth',
                  'mother_isdead',
                  'mother_nationalityid',
                ].includes(column.field)
              ) // اختيار الحقول التي ستكون كفلاتر
              .map((column) => (
                <Grid item xs={12} sm={3} key={column.field}>
                  {column.field === 'nationality' ? (
                    <Autocomplete
                      fullWidth
                      options={uniqueNationalities}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'marital_status' ? (
                    <Autocomplete
                      fullWidth
                      options={uniqueMaritalStatus}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'current_stage' ? (
                    <Autocomplete
                      fullWidth
                      options={uniqueCurrentStage}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'frist_name' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterFN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'second_name' ? (
                    <Autocomplete
                      fullWidth
                      options={filterSN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'theard_name' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterTN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'sur_name' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterSN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'mother_name' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterMN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'fath_mother_name' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterFMN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'birth_date' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterBD}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'religion' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterRE}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'phone_number' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterPN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'origin_country' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterOC}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'iqama_approval' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterIQAPP}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'istk_approval' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterISAPP}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'amn_wat_approval' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterAMNAPP}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'mok_approval' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterMAPP}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'governorate' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterGOV}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'created_by' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterGB}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'interview_officername' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterIN}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'gender' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterGE}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'father_date_ofbirth' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterFDB}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'father_isdead' ? (
                    <Autocomplete 
                      fullWidth
                      options={fliterFID}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'father_nationalityid' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterFNI}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'mother_date_ofbirth' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterMDB}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'mother_isdead' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterMID}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) : column.field === 'mother_nationalityid' ? (
                    <Autocomplete
                      fullWidth
                      options={fliterMNI}
                      getOptionLabel={(option) => option.toString()}
                      onChange={(event, newValue) => handleAddOrUpdateFilter(column.field, newValue)}
                      renderInput={(params) => <TextField {...params} label={`فلتر: ${column.headerName}`} />}
                    />
                  ) :  
                
                  (
                    <TextField
                      label={`فلتر: ${column.headerName}`}
                      onChange={(e) => handleAddOrUpdateFilter(column.field, e.target.value)}
                      fullWidth
                    />
                  )}
                </Grid>
              ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {/* يمكنك هنا إضافة قسم لاختيار الأعمدة للعرض */}
          <Typography variant="h6" gutterBottom>
            اختيار الأعمدة للعرض:
          </Typography>
          <Grid
            container
            spacing={1}
            sx={{ maxHeight: 200, overflowY: 'auto', p: 1, border: '1px solid #ccc', borderRadius: '4px' }}
          >
            {availableColumns.map((column) => (
              <Grid item xs={3} key={column.field}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name={column.field}
                      checked={selectedColumns[column.field] || false}
                      onChange={handleColumnSelectionChange}
                    />
                  }
                  label={column.headerName}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchReportData}
            disabled={!isAnyColumnSelected || loading}
            sx={{ mr: 1 }}
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
          </Button>
          <Button variant="contained" color="success" onClick={handlePrint} disabled={!showReport} sx={{ mr: 1 }}>
            طباعة
          </Button>
          <Button variant="contained" color="secondary" onClick={exportToPDF} disabled={!showReport}>
            تصدير إلى PDF
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 600, width: '100%', marginTop: 24 }}>
        {loading ? (
          <Typography>تحميل البيانات...</Typography>
        ) : showReport ? (
          <div ref={ref} className="bg-gray-200 w-full">
            <DataGrid
              rows={reportData}
              // عرض الأعمدة التي تم اختيارها فقط، مع إبقاء عمود الـ ID دائماً لعمليات الـ DataGrid
              columns={availableColumns.filter((col) => selectedColumns[col.field] || col.field === 'id')}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              getRowId={(row) => row.id}
            />
          </div>
        ) : (
          <Typography>يرجى اختيار الأعمدة والضغط على "إنشاء التقرير" لعرض البيانات.</Typography>
        )}
      </div>
    </Box>
  );
}
