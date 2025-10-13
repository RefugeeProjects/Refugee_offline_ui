// صفحة عرض تقييمات الموظفين
import React, { useCallback, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useApi } from '../../../utils';
import { DangerMsg, NotificationMsg } from '../../../components/NotificationMsg';
import EditEvaluation from './edit_freqs';

const departmentsMap = {
  2: 'قسم الادارية والمالية',
  3: 'مديرية الرواتب والامور المالية',
  4: 'التخطيط والمتابعة',
  5: 'تخطيط',
};

function ViewEvaluations() {
  const api = useApi();
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', 'mains/evaluations');
      if (success) {
        setRows(data.records || []);
      } else {
        DangerMsg('اشعار', 'فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error(error);
      DangerMsg('اشعار', 'حدث خطأ أثناء تحميل البيانات');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  //-- departments
  const [departments, setAllocating_entity] = useState([]);
  const fetchAllocating_entity = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/departments`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setAllocating_entity(data?.records);
    } catch (err) {
      DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);
  useEffect(() => {
    fetchAllocating_entity();
  }, [fetchAllocating_entity]);
  const deleteData = async (row) => {
    if (!window.confirm('هل ترغب فعلاً بحذف التقييم؟')) return;

    try {
      const { success } = await api('DELETE', `mains/evaluations/id/${row.id}`);
      if (success) {
        NotificationMsg('اشعار', 'تم الحذف بنجاح');
        fetchData();
      } else {
        DangerMsg('اشعار', 'فشل في حذف التقييم');
      }
    } catch (error) {
      console.error(error);
      DangerMsg('اشعار', 'حدث خطأ أثناء الحذف');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'rank', headerName: 'الرتبة', width: 80 },

    { field: 'employee_name', headerName: 'اسم الموظف', width: 200 },
    {
      field: 'department_id', // هذا هو اسم الحقل في الجدول الرئيسي
      headerName: 'اسم القسم',
      width: 200,
      renderCell: (params) => {
        // نحول جدول الترميز إلى كائن سريع الوصول
        const deptMap = departments.reduce((acc, item) => {
          acc[item.id?.toString()] = item.name;
          return acc;
        }, {});

        // نحصل على id من الصف ونحوله لنص (لضمان التطابق)
        const deptId = params.row.department_id?.toString();
        const name = deptMap[deptId];

        return <p>{name || 'غير معروف'}</p>;
      },
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },

    { field: 'evaluation_type', headerName: 'نوع التقييم', flex: 1 },
    { field: 'notes', headerName: 'ملاحظات', flex: 2 },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 130,
      renderCell: (params) => (
        <>
          <Tooltip title="تعديل">
            <IconButton
              onClick={() => {
                setSelectedRow(params.row);
                handleToggle();
              }}
              color="warning"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton onClick={() => deleteData(params.row)} color="error">
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <Stack alignItems="center" mb={2}>
        <Typography variant="h4">نظام تقييم الاداء</Typography>
      </Stack>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          pageSize={10}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
      <EditEvaluation
        open={open}
        handleToggle={() => {
          setOpen(false);
          setSelectedRow(null);
        }}
        modalProps={selectedRow}
        fetchData={fetchData}
      />
    </>
  );
}

export default ViewEvaluations;
