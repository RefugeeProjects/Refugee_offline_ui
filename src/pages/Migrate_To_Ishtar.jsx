import React, { useCallback, useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useApi } from '../utils';
import { DangerMsg,NotificationMsg } from '../components/NotificationMsg';

export default function Migrate_To_Ishtar() {
  const api = useApi();

  const [rows, setRows] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================
  // جلب طلبات المرحلة النهائية فقط
  // =============================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { success, data, msg } = await api(
        'GET',
        'migration/need_numbers'
      );

      if (!success) {
        DangerMsg('الطلبات', msg || 'فشل جلب البيانات');
        return;
      }
      setRows(data || []);
    } catch (err) {
      DangerMsg('الطلبات', 'خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =============================
  // توليد الرقم العائلي
  // =============================
  // const generateFamilyNumber = async (id) => {
  //   setLoadingIds((prev) => [...prev, id]);
  //   try {
  //     const { success, msg } = await api(
  //       'POST',
  //       `migration/refugees/${id}/generate-family-number`
  //     );

  //     if (!success) {
  //       DangerMsg('رقم عائلي', msg || 'فشل التوليد');
  //     } else {
  //       NotificationMsg('رقم عائلي', 'تم توليد الرقم بنجاح', 'success');
  //       fetchData();
  //     }
  //   } catch {
  //     DangerMsg('رقم عائلي', 'خطأ أثناء التوليد');
  //   } finally {
  //     setLoadingIds((prev) => prev.filter((x) => x !== id));
  //   }
  // };

  // =============================
  // أعمدة الجدول
  // =============================
  const columns = [
    { field: 'id', headerName: 'رقم الطلب', width: 90 },
    { field: 'number', headerName: 'الرقم الشخصي' },
    { field: 'frist_name', headerName: 'الاسم' },
    { field: 'second_name', headerName: ' الأب' },
    { field: 'theard_name', headerName: ' الجد' },
    { field: 'sur_name', headerName: 'اللقب' },
    { field: 'current_stage', headerName: 'المرحلة' },
    { field: 'registration_group_number', headerName: 'الرقم العائلي', width: 160 },
      //  {
      //     field: 'actions',
      //     headerName: 'الإجراءات',
      //     width: 160,
      //     sortable: false,
      //     renderCell: (params) => (
      //       <Button
      //         variant="contained"
      //         dir="rtl"
      //         color="primary"
      //         sx={{
      //           direction: 'rtl',
      //           transform: 'scaleX(-1);', // يوقف أي عكس
      //           unicodeBidi: 'normal', // يمنع الانعكاس داخل النص
      //           textAlign: 'center',
      //         }}
      //         onClick={() => generateFamilyNumber(params.row.id)}
      //       >توليد رقم عائلي
      //       </Button>
      //     ),
      //   },
  ];
const migrateAll = async () => {
  setLoading(true);
  try {
    const { success, msg } = await api(
      'POST',
      'migration/refugees/to-ishtar'
    );

    if (!success) {
      DangerMsg('الترحيل', msg || 'فشل الترحيل');
    } else {
      NotificationMsg('الترحيل', 'تم ترحيل جميع الطلبات إلى عشتار', 'success');
      fetchData();
    }
  } catch {
    DangerMsg('الترحيل', 'خطأ أثناء الترحيل');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        px={2}
      >
        <Typography variant="h4">
          الطلبات المكتملة (Done)
        </Typography>
          <Button
    variant="contained"
    color="success"
    onClick={migrateAll}
    disabled={loading || rows.length === 0}
  >
    اضغط لترحيل جميع الطلبات إلى عشتار
  </Button>
      </Stack>

      <Box sx={{ flexGrow: 1, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            components={{ Toolbar: GridToolbar }}
          />
        )}
      </Box>
    </Box>
  );
}
