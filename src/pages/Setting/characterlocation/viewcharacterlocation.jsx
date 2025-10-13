//صفحةى ملغاة
import React, { useCallback, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit, AddCircle } from '@mui/icons-material';
import { useApi } from '../../../utils';
import { DangerMsg, NotificationMsg } from '../../../components/NotificationMsg';
import Addcharacterlocation from './addcharacterlocation';
import { filePaths } from '../../../utils/paths';
function Viewcharacterlocation() {
  //  define api
  const api = useApi();

  const [category, setCategory] = useState([]);
  const [cargov, setCargove] = useState([]);
  const [review, setReview] = useState([]);
  // add data modal
  const [open, setOpen] = useState(false);
  const handleToggle = () => setOpen(!open);
  const [modalProps, setModalProps] = useState(null);
  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/characterlocation`);
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
  const Cargovefn = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/lettertype`);
      if (!success) {
        DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
        return;
      }
      setCargove(data?.records);
    } catch (err) {
      DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Cargovefn();
  }, [Cargovefn]);
  const Reviewfn = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/reviewsit`);
      if (!success) {
        DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
        return;
      }
      setReview(data?.records);
    } catch (err) {
      DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Reviewfn();
  }, [Reviewfn]);

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
    {
      field: 'letterID',
      headerName: 'الحرف',
      minWidth: 300,
      renderCell: (params) => {
        const eventLocMap = cargov.reduce((acc, item) => {
          acc[item.id] = item.value;
          return acc;
        }, {});

        return <>{eventLocMap[params.row.letterID] && <p>{eventLocMap[params.row.letterID]}</p>}</>;
      },
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },
    {
      field: 'reviewsitID',
      headerName: ' موقع المراجعة',
      minWidth: 300,
      renderCell: (params) => {
        const eventLocMap1 = review.reduce((acc, item) => {
          acc[item.id] = item.value;
          return acc;
        }, {});

        return <>{eventLocMap1[params.row.reviewsitID] && <p>{eventLocMap1[params.row.reviewsitID]}</p>}</>;
      },
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },
  ];

  return (
    <>
      <div>
        <Stack alignItems="center" mb={1}>
          <Typography variant="h3">واجهة مواقع المراجعة حسب المحافظات</Typography>
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

        <Addcharacterlocation
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

export default Viewcharacterlocation;
