//صفحة الاعدادات - عرض الاجهزة
import React, { useCallback, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit, AddCircle } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

import { useApi } from '../../../utils';
import { DangerMsg, NotificationMsg } from '../../../components/NotificationMsg';
import Add_Device from './add_Device';
import { filePaths } from '../../../utils/paths';
function View_Device() {
  //  define api
  const api = useApi();

  const [device, setDevice] = useState([]);
  // const [editData, setEditData] = useState({}); // تخزين البيانات أثناء التعديل
  const [selectedRow, setSelectedRow] = useState(null); // تخزين بيانات الصف المحدد

  // add data modal
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };
  const [modalProps, setModalProps] = useState(null);
  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/devices`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setDevice(data?.records);
    } catch (err) {
      DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // // delete
  const deleteData = async (row) => {
    try {
      const { success, data } = await api('DELETE', `mains/devices/id/${row.id}`);
      if (!success) {
        DangerMsg(' اشعارات الاجهزة', 'لا يمكن حذف الجهاز كونه مرتبط بتردد');
        return;
      }
      fetchData();
      NotificationMsg('اشعارات التصنيفات', 'تم الحذف بنجاح');
    } catch (err) {
      DangerMsg('  اشعارات التصنيفات', ' خطأ في حذف البيانات');
      console.error(err);
    }
  };

  // Handle Open Edit Dialog with Row Data
  const handleEditOpen = (row) => {
    setSelectedRow(row); // تخزين بيانات الصف المحدد
    setOpen(true); // فتح النموذج
  };

  // Handle Open Edit Dialog with Data
  // const handleEditOpen = (row) => {
  //   setEditData(row); // تمرير بيانات الصف إلى النموذج
  //   setOpen(true); // فتح النموذج
  // };

  //----- edit data -----
  // Handle Edit Data
  //  const handleEdit = async () => {
  //   try {
  //     const { success } = await api('PUT', `mains/devices/id/${editData.id}`, editData);
  //     if (!success) {
  //       DangerMsg('اشعارات الاجهزة', 'خطأ في تعديل البيانات');
  //       return;
  //     }
  //     fetchData();
  //     NotificationMsg('اشعارات التصنيفات', 'تم التعديل بنجاح');
  //     handleToggle();
  //   } catch (err) {
  //     DangerMsg('اشعارات التصنيفات', 'خطأ في تعديل البيانات');
  //     console.error(err);
  //   }
  // };

  // Handle Input Change
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setEditData((prev) => ({ ...prev, [name]: value }));
  // };

  // device table columns
  const columns = [
    {
      field: 'type',
      headerName: 'نوع الجهاز',
      width: 150,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p style={{ direction: 'ltr', textAlign: 'left' }}>{params.row.type}</p>,
    },
    {
      field: 'device_number',
      headerName: 'العدد',
      width: 100,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p>{params.row.device_number || 'غير متوفر'}</p>,
    },
    {
      field: 'serial_number',
      headerName: 'الرقم التسلسلي',
      width: 200,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p>{params.row.serial_number || 'غير متوفر'}</p>,
    },
    {
      field: 'notes',
      headerName: 'الملاحظات',
      width: 300,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p>{params.row.notes || 'لا توجد ملاحظات'}</p>,
    },
    {
      field: 'device_id',
      headerName: 'معرّف الجهاز',
      width: 150,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p>{params.row.device_id || 'غير معرف'}</p>,
    },
    {
      field: 'click',
      headerName: '',
      minWidth: 130,
      headerClassName: 'header-color',
      sortable: false,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="تعديل" placement="top">
            <IconButton
              aria-label="delete"
              sx={{ color: amber[500] }}
              onClick={() => {
                handleEditOpen(params.row);
                setModalProps(params.row);
                // setEditData(params.row); // تمرير بيانات الصف إلى النموذج
                handleToggle();
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف" placement="top">
            <IconButton
              aria-label="delete"
              color="error"
              onClick={() => {
                if (window.confirm('هل ترغب فعلاً بحذف البيانات')) deleteData(params.row);
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <div>
        <Stack alignItems="center" mb={1}>
          <Typography variant="h3">واجهة اعدادت الاجهزة</Typography>
        </Stack>

        <Stack alignItems="flex-start" mb={1}>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            sx={{ marginBottom: '0', marginRight: '10px' }}
            onClick={() => setOpen(true)}
          >
            اضافة جديد
          </Button>
        </Stack>
        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={device}
            columns={columns}
            pageSize={10}
            getRowId={(row) => row.id}
            components={{ Toolbar: GridToolbar }}
          />
        </Box>
        <Add_Device
          open={open}
          handleToggle={() => {
            setOpen(false);
            setSelectedRow(null);
          }}
          modalProps={selectedRow}
          fetchData={fetchData}
        />
      </div>
    </>
  );
}

export default View_Device;
