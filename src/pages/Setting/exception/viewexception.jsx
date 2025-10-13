//صفحة ملغاة

import React, { useCallback, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit, AddCircle } from '@mui/icons-material';
import { useApi } from '../../../utils';
import { DangerMsg, NotificationMsg } from '../../../components/NotificationMsg';
import Addexception from './addexception';
import { filePaths } from '../../../utils/paths';
function Viewexception() {
  //  define api
  const api = useApi();

  const [category, setCategory] = useState([]);
  // add data modal
  const [open, setOpen] = useState(false);
  const handleToggle = () => setOpen(!open);
  const [modalProps, setModalProps] = useState(null);
  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/exceptiontype`);
      if (!success) {
        DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
        return;
      }
      setCategory(data?.records);
    } catch (err) {
      DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // // delete
  // const deleteData = async (row) => {
  //   try {
  //     if (row.cat_img) {
  //       const { success, data } = await api('GET', `remove/item/category/img/${row.cat_img}`);
  //       // if (!success) {
  //       //   DangerMsg('اشعارات تعديل الصورة', 'خطأ في تحميل البيانات');
  //       //   return;
  //       // }
  //     }
  //     const { success, data } = await api('DELETE', `mainsAuth/categories/id/${row.id}`)
  //     if (!success) {
  //       DangerMsg('اشعارات التصنيفات', 'خطأ في حذف البيانات')
  //       return
  //     }
  //     fetchData()
  //     NotificationMsg('اشعارات التصنيفات', 'تم الحذف بنجاح')
  //   } catch (err) {
  //     DangerMsg('اشعارات التصنيفات', 'خطأ في حذف البيانات')
  //     console.error(err)
  //   }
  // }

  // category table columns
  const columns = [
    {
      field: 'no',
      headerName: 'ت',
      width: 70,
      sortable: true,
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
      renderCell: (params) => <p>{params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1}</p>,
    },

    { field: 'value', headerName: 'نوع الاستثناء', width: 300 },
    // {
    //   field: 'cat_img', headerName: 'الصورة', width: 130, headerClassName: 'header-color', cellClassName: 'cellContent',
    //   renderCell: (params) => (
    //     (params.row.cat_img != '[]' && params.row.cat_img) && <a target='_blank' href={filePaths.images + 'category/' + params.row.cat_img}> <img src={filePaths.images + 'category/' + params.row.cat_img} alt='cat_img' /></a>
    //   )
    // },
    // {
    //   field: 'click', headerName: '', minWidth: 130, headerClassName: 'header-color', sortable: false, filterable: false, editable: false,
    //   renderCell: (params) => (
    //     <>
    //       <Tooltip title="تعديل" placement="top">
    //         <IconButton aria-label="delete" sx={{ color: amber[500] }} onClick={() => { setModalProps(params.row); handleToggle() }}>
    //           <Edit />
    //         </IconButton>
    //       </Tooltip>
    //       <Tooltip title="حذف" placement="top">
    //         <IconButton aria-label="delete" color="error" onClick={() => {
    //           if (
    //             window.confirm(
    //               'هل ترغب فعلاً بحذف البيانات',
    //             )
    //           )
    //             deleteData(params.row)
    //         }}>
    //           <Delete />
    //         </IconButton>
    //       </Tooltip>
    //     </>
    //   )
    // },
  ];

  return (
    <>
      <div>
        <Stack alignItems="center" mb={1}>
          <Typography variant="h3">واجهة نوع الاستثناء</Typography>
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

        <Addexception
          open={open}
          handleToggle={() => {
            handleToggle();
            setModalProps(null);
          }}
          modalProps={modalProps}
          fetchData={fetchData}
        />

        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            autoPageSize
            rows={category}
            columns={columns}
            paginationModel={{ page: 0, pageSize: 100 }}
            // checkboxSelection
            // disableColumnFilter
            // disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Box>
      </div>
    </>
  );
}

export default Viewexception;
