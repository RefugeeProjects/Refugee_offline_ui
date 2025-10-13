// صفحة عرض المتابعات اليومية للأقسام
import React, { useCallback, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useApi } from '../../../utils';
import { DangerMsg, NotificationMsg } from '../../../components/NotificationMsg';
import EditEvaluation from './edit_depts';

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
      const { success, data } = await api('GET', 'mains/department_followups');
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
        DangerMsg('اشعارات', 'خطأ في تحميل الأقسام');
        return;
      }
      setAllocating_entity(data?.records);
    } catch (err) {
      DangerMsg('اشعارات', 'خطأ في تحميل الأقسام');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAllocating_entity();
  }, [fetchAllocating_entity]);

  const deleteData = async (row) => {
    if (!window.confirm('هل ترغب فعلاً بحذف المتابعة؟')) return;

    try {
      const { success } = await api('DELETE', `mains/department_followups/id/${row.id}`);
      if (success) {
        NotificationMsg('اشعار', 'تم الحذف بنجاح');
        fetchData();
      } else {
        DangerMsg('اشعار', 'فشل في الحذف');
      }
    } catch (error) {
      console.error(error);
      DangerMsg('اشعار', 'حدث خطأ أثناء الحذف');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 20 },
    {
      field: 'department_id',
      headerName: 'اسم القسم',
      width: 200,
      renderCell: (params) => {
        const deptMap = departments.reduce((acc, item) => {
          acc[item.id?.toString()] = item.name;
          return acc;
        }, {});
        const deptId = params.row.department_id?.toString();
        const name = deptMap[deptId];
        return <p>{name || 'غير معروف'}</p>;
      },
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },
    { field: 'day', headerName: 'اليوم', width: 70 },
    {
      field: 'report_date',
      headerName: 'تاريخ التقرير',
      width: 120,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);
        return `${year}-${month}-${day}`;
      },
    },
    { field: 'outgoing', headerName: 'الصادر', width: 10 },
    { field: 'incoming', headerName: 'الوارد', width: 10 },
    { field: 'completed', headerName: 'المكتمل', width: 80 },
    { field: 'not_completed', headerName: 'غير مكتمل', width: 80 },
    { field: 'notes', headerName: 'ملاحظات', width: 160 },
    { field: 'obstacles', headerName: 'المعوقات', width: 160 },
    { field: 'suggestions', headerName: 'المقترحات', width: 160 },

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
        <Typography variant="h4">متابعة الأقسام اليومية</Typography>
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
