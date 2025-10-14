// // صفحة عرض التقارير اليومية
// import React, { useCallback, useState, useEffect, useRef } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { Stack, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// import { useReactToPrint } from 'react-to-print';

// import { useApi } from '../utils';
// import { DangerMsg } from '../components/NotificationMsg';

// export default function DepsFollow() {
//   const [reports, setReports] = useState([]);
//   const api = useApi();
//   const tableRef = useRef();

//   const [open, setOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);

//   const handleOpen = (row) => {
//     setSelectedRow(row);
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelectedRow(null);
//   };

//   const fetchData = useCallback(async () => {
//     try {
//       const { success, data } = await api('GET', `mains/refugees`);
//       if (!success) {
//         DangerMsg('تقارير يومية', 'خطأ في تحميل البيانات');
//         return;
//       }
//       setReports(data?.records);
//     } catch (err) {
//       DangerMsg('تقارير يومية', 'خطأ في تحميل البيانات');
//       console.error(err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // زر الطباعة
//   const handlePrint = useReactToPrint({
//     content: () => tableRef.current,
//     documentTitle: 'التقارير ', // يظهر في نافذة الطباعة
//   });

//   const columns = [
//     // {
//     //   field: 'index',
//     //   headerName: 'ت',
//     //   width: 50,
//     //   renderCell: (params) => <p>{params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1}</p>,
//     // },
//     { field: 'id', headerName: 'رقم الحالة' },
//     { field: 'frist_name', headerName: 'الاسم' },
//     { field: 'second_name', headerName: 'اسم الاب' },
//     { field: 'theard_name', headerName: 'اسم الجد' },
//     { field: 'current_stage', headerName: 'حالة الطلب' },

//     // {
//     //   field: 'birth_date',
//     //   headerName: 'تاريخ الميلاد',
//     //   flex: 1,
//     //   renderCell: (params) => (
//     //     <p>{params.row.birth_date ? new Date(params.row.birth_date).toLocaleDateString() : ''}</p>
//     //   ),
//     // },
//     { field: 'birth_place', headerName: 'مكان الميلاد' },
//     { field: 'nationality', headerName: 'الجنسية', width: 120 },
//     {
//       field: 'actions',
//       headerName: 'الإجراءات',
//       width: 150,
//       sortable: false,
//       renderCell: (params) => (
//         <div style={{ direction: 'rtl' }}>
//           <Button variant="contained" color="primary" onClick={() => handleOpen(params.row)}>
//             Track Request
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//       <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} px={2}>
//         <Typography variant="h3">التقارير اليومية</Typography>
//         <Button variant="contained" color="primary" onClick={handlePrint}>
//           طباعة التقرير
//         </Button>
//       </Stack>
//       <Box ref={tableRef} sx={{ flexGrow: 1, width: '100%' }}>
//         <DataGrid
//           rows={reports}
//           columns={columns}
//           pageSize={10}
//           getRowId={(row) => row.id}
//           components={{ Toolbar: GridToolbar }}
//         />
//       </Box>{' '}
//       <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//         <DialogTitle>تفاصيل الحالة</DialogTitle>
//         <DialogContent dividers>
//           {selectedRow && (
//             <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
//               <thead>
//                 <tr>
//                   <th>تاريخ الإجراء</th>
//                   <th>الإجراء</th>
//                   <th>تم بواسطة</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>{selectedRow.id}</td>
//                   <td>{selectedRow.id}</td>
//                   <td>{selectedRow.id}</td>
//                 </tr>
//               </tbody>
//             </table>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose} color="secondary">
//             إغلاق
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

// صفحة عرض التقارير اليومية
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Stack,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useReactToPrint } from 'react-to-print';

import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';

export default function DepsFollow() {
  const [reports, setReports] = useState([]);
  const [stages, setStages] = useState([]); // NEW
  const [stagesLoading, setStagesLoading] = useState(false); // NEW

  const api = useApi();
  const tableRef = useRef();

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  // خريطة تحويل الأدوار إلى نصوص عربية
  const stageMap = {
    admin: 'مدير النظام',
    data_entry: 'مدخل بيانات',
    reviewer: 'مدقق',
    approver: 'مصرح نهائي (موافقة اللجنة)',
    mokhabarat: 'المخابرات',
    amn_watani: 'امن وطني',
    istikhbarat_defense: 'استخبارات وامن الدفاع',
    iqama: 'الاقامة',
  };
  const handleOpen = async (row) => {
    setSelectedRow(row);
    setOpen(true);
    setStages([]);
    setStagesLoading(true);
    try {
      // عدّل المسار حسب الـbase عندك: تتتت
      // لو useApi تضيف /api/ تلقائيًا:
      const endpoint = `freqs/refugees/${row.id}/stages`; // أو refugees/${row.id}/stages حسب مشروعك
      const { success, data, msg } = await api('GET', endpoint);
      if (!success) {
        DangerMsg('تتبّع الطلب', msg || 'فشل في جلب مراحل الطلب');
        setStages([]);
      } else {
        // بعض الـroutes ترجع مصفوفة مباشرة، وبعضها تحت records
        const rows = Array.isArray(data) ? data : data?.records || [];
        setStages(rows);
      }
    } catch (err) {
      console.error(err);
      DangerMsg('تتبّع الطلب', 'خطأ أثناء جلب مراحل الطلب');
      setStages([]);
    } finally {
      setStagesLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setStages([]);
  };

  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/refugees`);
      if (!success) {
        DangerMsg('تقارير يومية', 'خطأ في تحميل البيانات');
        return;
      }
      setReports(data?.records || []);
    } catch (err) {
      DangerMsg('تقارير يومية', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // زر الطباعة
  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: 'التقارير ', // يظهر في نافذة الطباعة
  });

  const columns = [
    { field: 'id', headerName: 'رقم الحالة' },
    { field: 'frist_name', headerName: 'الاسم' },
    { field: 'second_name', headerName: 'اسم الاب' },
    { field: 'theard_name', headerName: 'اسم الجد' },
    { field: 'current_stage', headerName: 'حالة الطلب' },
    { field: 'birth_place', headerName: 'مكان الميلاد' },
    { field: 'nationality', headerName: 'الجنسية', width: 120 },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Button variant="contained" color="primary" onClick={() => handleOpen(params.row)}>
          {/* لتفادي انعكاس LTR في RTL استعمل نص عربي */}
          تتبّع الطلب
          {/* أو لو لازم إنجليزي:
             <bdo dir="ltr">Track Request</bdo>
          */}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} px={2}>
        <Typography variant="h3">التقارير اليومية</Typography>
        <Button variant="contained" color="primary" onClick={handlePrint}>
          طباعة التقرير
        </Button>
      </Stack>

      <Box ref={tableRef} sx={{ flexGrow: 1, width: '100%' }}>
        <DataGrid
          rows={reports}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.id}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* نافذة تتبّع الطلب */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>خط سير المعاملة / تتبّع الطلب</DialogTitle>
        <DialogContent dividers>
          {!selectedRow && <Typography>لا يوجد صف محدد</Typography>}

          {selectedRow && stagesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {selectedRow && !stagesLoading && stages.length === 0 && (
            <Typography align="center" sx={{ py: 2 }}>
              لم يتم تنفيذ أي مراحل على هذا الطلب بعد.
            </Typography>
          )}

          {selectedRow && !stagesLoading && stages.length > 0 && (
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
                {stages.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.action_at ? new Date(s.action_at).toLocaleString('ar-IQ') : ''}</td>
                    <td>{s.stage ? stageMap[s.stage] || s.stage : ''}</td>
                    <td>{s.notes ?? ''}</td>
                    <td>
                      {s.action_by_name ?? ''}
                      {s.action_by_roles ? ` (${s.action_by_roles})` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
