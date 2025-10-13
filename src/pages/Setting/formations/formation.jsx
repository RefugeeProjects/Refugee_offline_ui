//صفحة عرض التشكيل
import React, { useCallback, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit, AddCircle } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

import { useApi } from '../../../utils';
import { DangerMsg, NotificationMsg } from '../../../components/NotificationMsg';
import Addgovers from './addgovers';
import { filePaths } from '../../../utils/paths';
function Formation() {
  //  define api
  const api = useApi();

  const [departments, setDepartments] = useState([]);
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
      const { success, data } = await api('GET', `mains/departments`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setDepartments(data?.records);
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
      const { success, data } = await api('DELETE', `mains/departments/id/${row.id}`);
      if (!success) {
        DangerMsg(' اشعارات الاجهزة', 'لا يمكن حذف التشكيل كونه مرتبط بتردد');
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
  //     const { success } = await api('PUT', `mains/departments/id/${editData.id}`, editData);
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

  // departments table columns
  const columns = [
    {
      field: 'name',
      headerName: 'مكان العمل ',
      width: 300,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p style={{ direction: 'ltr', textAlign: 'left' }}>{params.row.name}</p>,
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
          <Typography variant="h3">واجهة اعدادت مكان العمل</Typography>
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
            rows={departments}
            columns={columns}
            pageSize={10}
            getRowId={(row) => row.id}
            components={{ Toolbar: GridToolbar }}
          />
        </Box>
        <Addgovers
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

export default Formation;
