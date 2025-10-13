import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, MenuItem } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApi } from '../utils';
import arabicFont from '../fonts/arabicFont.js';

const DepartmentFollowupReport = () => {
  const [rows, setRows] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [filters, setFilters] = useState({
    department_id: '',
    day: '',
    report_date: '',
  });
  const api = useApi();

  jsPDF.API.events.push([
    'addFonts',
    function () {
      this.addFileToVFS('Arabic-Regular.ttf', arabicFont);
      this.addFont('Arabic-Regular.ttf', 'Arabic', 'normal');
    },
  ]);
  console.log('row', rows);

  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', 'mains/department_followups');
      if (success) setRows(data.records || []);
    } catch (err) {
      console.error('فشل تحميل البيانات', err);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const { success, data } = await api('GET', 'mains/departments');
      if (success) setDepartmentsList(data.records || []);
    } catch (err) {
      console.error('فشل تحميل الاقسام', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, [fetchData, fetchDepartments]);

  const filteredRows = rows.filter((row) => {
    const matchDept = filters.department_id ? row.department_id === +filters.department_id : true;
    const matchDay = filters.day ? row.day === filters.day : true;
    const matchDate = filters.report_date
      ? new Date(row.report_date).toISOString().split('T')[0] === filters.report_date
      : true;
    return matchDept && matchDay && matchDate;
  });
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    });

    doc.setFont('Arabic');
    doc.setFontSize(12);
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginRight = 10; // المسافة من اليمين

    doc.text('وزارة الداخلية', pageWidth - 25, 5, { align: 'right' });
    doc.text(' وكالة الوزارة لشؤون الامن الاتحادي', pageWidth - 10, 10, { align: 'right' });
    doc.text('قيادة قوات الشرطة الاتحادية', pageWidth - 15, 15, { align: 'right' });
    doc.text('مديرية الرواتب والامور  المالية', pageWidth - 14.5, 20, { align: 'right' });

    doc.text('تقرير متابعة الأقسام', pageWidth / 2, 20, { align: 'center' });

    // const body = filteredRows.map((row, index) => [
    //   index + 1,
    //   row.day,
    //   formatDate(row.report_date),
    //   row.outgoing,
    //   row.incoming,
    //   row.completed,
    //   row.not_completed,
    //   row.notes || '',
    //   row.obstacles || '',
    //   row.suggestions || '',
    //   departmentsList.find((d) => d.id === row.department_id)?.name || '',
    // ]);
    const body = filteredRows.map((row, index) => [
      row.suggestions || '',
      row.obstacles || '',
      row.notes || '',
      row.not_completed,
      row.completed,
      row.outgoing,
      row.incoming,
      row.day,
      formatDate(row.report_date),
      departmentsList.find((d) => d.id === row.department_id)?.name || '',
      index + 1,
    ]);

    autoTable(doc, {
      head: [['مقترحات', 'معوقات', 'ملاحضات', ' غير منجز', 'منجز', 'صادر', 'وارد', ' اليوم', 'التاريخ', 'القسم', 'ت']],
      body: body,
      styles: {
        font: 'Arabic',
        fontStyle: 'normal',
        halign: 'right',
        cellWidth: 'wrap',
        lineWidth: 0.1, // سمك الخط بين الصفوف والأعمدة
        lineColor: [150, 150, 150], // لون رمادي فاتح للخط
      },
      headStyles: {
        textColor: 255,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: {
        0: { cellWidth: 30 }, //
        1: { cellWidth: 50 }, // معوقات
        2: { cellWidth: 60 }, // تاريخ التقرير
        3: { cellWidth: 12 }, // صادر
        4: { cellWidth: 12 }, // وارد
        5: { cellWidth: 12 }, // منجز
        6: { cellWidth: 12 }, // غير منجز
        7: { cellWidth: 18 }, // ملاحظات
        8: { cellWidth: 25 }, //
        9: { cellWidth: 50 }, // القسم
        10: { cellWidth: 7 }, // ت
      },
      margin: { top: 30, left: 8, right: 8 }, // قلل الهوامش الجانبية
      tableWidth: 'wrap', // أو 'wrap' حسب التجربة التي تفضلها
    });

    doc.save('تقرير_متابعة_الاقسام.pdf');
  };

  const columns = [
    {
      field: 'index',
      headerName: 'ت',
      width: 50,
      renderCell: (params) => {
        const index = filteredRows.findIndex((r) => r.id === params.row.id) + 1;
        return <div className="ltr-number">{index}</div>;
      },
    },
    {
      field: 'department_id',
      headerName: 'القسم',
      width: 250,
      valueGetter: (params) => departmentsList.find((d) => d.id === params.row.department_id)?.name || '',
    },
    { field: 'day', headerName: 'اليوم', width: 70 },
    {
      field: 'report_date',
      headerName: ' التاريخ',
      width: 130,
      valueFormatter: (params) => new Date(params.value).toISOString().split('T')[0],
    },
    { field: 'outgoing', headerName: 'صادر', width: 90 },
    { field: 'incoming', headerName: 'وارد', width: 90 },
    { field: 'completed', headerName: 'منجز', width: 90 },
    { field: 'not_completed', headerName: 'غير منجز', width: 100 },
    { field: 'notes', headerName: 'ملاحظات', width: 180 },
    { field: 'obstacles', headerName: 'معوقات', width: 180 },
    { field: 'suggestions', headerName: 'مقترحات', width: 180 },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <TextField
          select
          label="القسم"
          value={filters.department_id}
          onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
          size="small"
          style={{ minWidth: 180 }} // ✅ توسيع العرض
        >
          <MenuItem value="">الكل</MenuItem>
          {departmentsList.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="اليوم"
          value={filters.day}
          onChange={(e) => setFilters({ ...filters, day: e.target.value })}
          size="small"
          style={{ minWidth: 180 }} // ✅ توسيع العرض
        >
          <MenuItem value="">الكل</MenuItem>
          {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => (
            <MenuItem key={day} value={day}>
              {day}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="التاريخ"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={filters.report_date}
          onChange={(e) => setFilters({ ...filters, report_date: e.target.value })}
        />

        <Button onClick={exportPDF} variant="contained" color="primary">
          تصدير PDF
        </Button>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid rows={filteredRows} columns={columns} getRowId={(row) => row.id} pageSize={10} />
      </div>
    </div>
  );
};

export default DepartmentFollowupReport;
