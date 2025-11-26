//صفحةعرض المستخدمين من واجهة اعدادات المستخدم

import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton, Card, Stack, Typography, Tooltip, Box, Button } from '@mui/material';
import { amber, blueGrey } from '@mui/material/colors';
import { Delete, Edit, AddCircle, Visibility } from '@mui/icons-material';
import { useApi } from '../../utils';
import Editonline from './UserManagmentAddEdit';
import { NotificationMsg, DangerMsg } from '../../components/NotificationMsg';
import { titles } from '../../utils/title';

const USerRuleManagment = () => {
  //  define api
  const api = useApi();
  // define navigate
  const navigate = useNavigate();
  // open page
  const openAdd = (modalProps) => {
    if (modalProps) {
      navigate(process.env.PUBLIC_URL + '/approver/AddEditUser', { state: { modalProps } });
    } else {
      navigate(process.env.PUBLIC_URL + '/approver/AddEditUser');
    }
  };
  // modal open state
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // modal open state
  const [openChPw, setOpenChPw] = useState(false);
  const [openModalChPw, setOpenModalChPw] = useState(false);

  // handle modal
  const toogleModal = () => {
    setOpenModal(!openModal);
  };
  //  modal props
  const [modalProps, setModalProps] = useState(null);

  //  modal props
  const [modalPropsChPw, setModalPropsChPw] = useState(null);

  // check JSON string
  // const isJsonStringRoles = (str) => {
  //   try {
  //     return JSON.parse(str);
  //   } catch (e) {
  //     return {
  //       roles: '',
  //       pages: {
  //         DashboardAppPage: 1,
  //         freqsHome: 0,
  //         FinalApprovalPage: 0,
  //         reportPage: 0,
  //         reports: 0,
  //       },
  //     };
  //   }
  //   // return true;
  // };
  // getUsers
  const [dataUsers, setDataUsers] = useState([]);

  const getData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `users`);
      if (!success) {
        DangerMsg('اشعارات المستخدمين', 'خطأ في تحميل البيانات');
        return;
      }
      let users = [];
      for (const userD of data) {
        userD.roles = userD.roles;
        userD.id = userD.id || userD.user_id;
        users.push(userD);
      }
      setDataUsers(users);
    } catch (err) {
      DangerMsg('اشعارات المستخدمين', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  // delete user
  const deleteItem = async (body) => {
    try {
      const { success, err } = await api('DELETE', `users/id/${body}`);
      if (err.errdelet) {
        DangerMsg('اشعارات المستخدمين', err.errMsg);
        return;
      }
      if (!success) {
        DangerMsg('اشعارات المستخدمين', 'خطأ في حذف البيانات');
        return;
      }

      getData();
      NotificationMsg('اشعارات المستخدمين', 'تم الحذف بنجاح');
    } catch (err) {
      DangerMsg('اشعارات المستخدمين', 'خطأ في حذف البيانات');
      console.error(err);
    }
  };
  // user table columns
  const columns = [
    {
      field: 'no',
      headerName: 'ت',
      width: 20,
      sortable: true,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => {
        return <p>{params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1}</p>;
      },
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 80,
      headerClassName: 'header-color',
      sortable: false,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <Tooltip title="حذف" placement="top">
          <IconButton
            aria-label="delete"
            color="error"
            onClick={() => {
              if (window.confirm('هل ترغب فعلاً بحذف المستخدم؟')) {
                deleteItem(params.row.id);
              }
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      ),
    },

    // {
    //     field: 'click', headerName: '', minWidth: 50, headerClassName: 'header-color', sortable: false, filterable: false, editable: false,

    //     renderCell: (params) => (
    //         <>
    //             <Tooltip title="تعديل" placement="top">
    //                 <IconButton aria-label="delete" sx={{ color: amber[500] }} onClick={() => { openAdd(params.row) }}>
    //                     <Edit />
    //                 </IconButton>
    //             </Tooltip>
    //             <Tooltip title="حذف" placement="top">
    //                 <IconButton aria-label="delete" color="error" onClick={() => {
    //                     if (
    //                         window.confirm(
    //                             'هل ترغب فعلاً بحذف المستخدم',
    //                         )
    //                     )
    //                         deleteItem(params.row.id)
    //                 }}>
    //                     <Delete />
    //                 </IconButton>
    //             </Tooltip>

    //         </>
    //     )
    // },
    { field: 'name', headerName: 'الاسم', width: 210, headerClassName: 'header-color' },
    { field: 'username', headerName: 'اسم المستخدم', width: 180, headerClassName: 'header-color' },
    // { field: 'org_name', headerName: ' المديرية', width: 250, headerClassName: 'header-color' },
    // {
    //   field: 'roles',
    //   headerName: 'مستوى المستخدم',
    //   width: 140,
    //   headerClassName: 'header-color',
    //   renderCell: (params) => {
    //     return (
    //       <p>
    //         {params.row.roles === 1
    //           ? 'مستخدم حساب'
    //           : params.row.roles === 2
    //           ? 'مستخدم الدعم'
    //           : params.row.roles === 3
    //           ? 'مستخدم المطور'
    //           : ' مدير النظام'}
    //       </p>
    //     );
    //   },
    //   cellClassName: 'cellContent',
    // },
    {
      field: 'roles',
      headerName: 'نوع الحساب',
      width: 140,
      headerClassName: 'header-color',
      renderCell: (params) => {
        return (
          <p>
            {params.row.roles === 'data_entry'
              ? 'مدخل بيانات'
              : params.row.roles === 'approver'
              ? 'مصرح نهائي'
              : params.row.roles === 'reviewer'
              ? 'مدقق بيانات'
              : 'غير محدد'}
          </p>
        );
      },
      cellClassName: 'cellContent',
    },
  ];

  return (
    <div>
      <Helmet>
        <title> ادارة المستخدمين | {titles.mainTitle} </title>
      </Helmet>
      <Stack alignItems="center" mb={1}>
        <Typography variant="h3">ادارة المستخدمين</Typography>
      </Stack>
      <Stack alignItems="flex-start" mb={7}>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          sx={{ marginBottom: '0', marginRight: '10px', position: 'absolute' }}
          onClick={() => {
            setModalProps(null);
            toogleModal();
          }}
        >
          اضافة جديد
        </Button>
      </Stack>

      <Box
        sx={{
          height: 480,
          width: '100%',
          '& .header-color': {
            backgroundColor: blueGrey[50],
          },
        }}
      >
        <DataGrid
          // autoPageSize
          rows={dataUsers}
          columns={columns}
          // paginationModel={{ page: 0, pageSize: 5 }}
          // checkboxSelection
          // disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
        <Editonline modalProps={modalProps} getUsers={getData} openModal={openModal} toogleModal={toogleModal} />
      </Box>
    </div>
  );
};

export default USerRuleManagment;
