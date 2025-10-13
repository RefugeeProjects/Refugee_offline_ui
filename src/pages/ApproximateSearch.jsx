//صفحة البحث التقريبي
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, Button, Autocomplete, IconButton, Tooltip } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit, AddCircle, ExpandMore } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { Container, Card, CardContent, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useApi } from '../utils';
import { DangerMsg, NotificationMsg } from '../components/NotificationMsg';
import { filePaths } from '../utils/paths';
import { useReactToPrint } from 'react-to-print';
// sections
import _ from 'lodash';

// import titles
import { titles } from '../utils/title';
// ----------------------------------------------------------------------

export default function ApproximateSearch() {
  //  define api
  const [freqs, setFreqs] = useState([]);
  const [results, setResults] = useState(''); // لحفظ القيمة

  const fetchData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/freqs`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setFreqs(data?.records);
    } catch (err) {
      DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //-- governate
  const [tblGov, setTblGov] = useState([]);
  const fetchGovData = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/governorate`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setTblGov(data?.records);
    } catch (err) {
      DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);
  useEffect(() => {
    fetchGovData();
  }, [fetchGovData]);

  //-- allocating_entity
  const [allocating_entity, setAllocating_entity] = useState([]);
  const fetchAllocating_entity = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/allocating_entity`);
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

  //-- allocating_entity
  const [devices, setDevices] = useState([]);
  const fetchDevices = useCallback(async () => {
    try {
      const { success, data } = await api('GET', `mains/devices`);
      if (!success) {
        DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
        return;
      }
      setDevices(data?.records);
    } catch (err) {
      DangerMsg('اشعارات الاجهزة', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  }, []);
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const api = useApi();

  const columns2 = [
    { field: 'freq_tx', headerName: 'ارسال', width: 100 },
    { field: 'freq_rx', headerName: 'استلام', width: 100 },
    { field: 'type', headerName: 'نوع التردد', width: 130 },
    { field: 'freq_char', headerName: 'صنف التردد', width: 130 },
    { field: 'class', headerName: 'صفة التردد', width: 130 },
    {
      field: 'status',
      headerName: 'حالة التردد ',
      minWidth: 200,
      renderCell: (params) => <p>{params.row.status === 1 ? 'مستخدم' : 'غير مستخدم'}</p>,

      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },
    {
      field: 'gov',
      headerName: 'المحافظة',
      valueGetter: (params) => {
        const gov = tblGov.find((g) => g.id == params.row.gov);
        return gov ? gov.gov : '';
      },
    },
    { field: 'org_name', headerName: 'الهيكل الاداري', width: 200 },
    {
      field: 'formation',
      headerName: 'تشكيل اضافي ',
      minWidth: 150,
      renderCell: (params) => {
        const eventLocMap = allocating_entity.reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {});

        return <>{eventLocMap[params.row.formation2] && <p>{eventLocMap[params.row.formation2]}</p>}</>;
      },
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },
    {
      field: 'device_type',
      headerName: 'نوع الاجهزة',
      minWidth: 150,
      renderCell: (params) => {
        const eventLocMap = devices.reduce((acc, item) => {
          acc[item.id] = item.type;
          return acc;
        }, {});

        return <>{eventLocMap[params.row.device_type] && <p>{eventLocMap[params.row.device_type]}</p>}</>;
      },
      headerClassName: 'header-color',
      cellClassName: 'cellContent',
    },
    { field: 'device_number', headerName: 'عدد الاجهزة', width: 130 },
    { field: 'location', headerName: 'موقع المنظومة', width: 150 },
    { field: 'approvals_and_licenses', headerName: 'الموافقات والتراخيص', width: 200 },
    { field: 'notes', headerName: 'الملاحظات', width: 200 },
  ];

  const ref = useRef();
  const handlePrint = useReactToPrint({
    content: () => ref.current,
    documentTitle: 'ادارة الترددات',
    pageStyle: `
      @page {
        size: landscape;
        margin: 0.5cm 0.5cm 0.5cm 0.5cm;
        color: black;
      }
      body {
        direction: rtl;
      }
      .print-header {
        position: fixed;
        top: 0;
        width: 100%;
        text-align: center;
      }
      .print-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
      }
      .page-break {
        page-break-after: always;
      }
    `,
  });
  // -- Export to PDF --------

  function getFreqTx(data) {
    return data
      .filter((record) => record.freq_tx != null) // تصفية السجلات التي تحتوي على null أو undefined
      .map((record) => {
        return { freq_tx: record.freq_tx };
      });
  }

  const freqTx = getFreqTx(freqs);
  //---------------------------------------------------

  function getFreqRx(data) {
    return data
      .filter((record) => record.freq_rx != null) // تصفية السجلات التي تحتوي على null أو undefined
      .map((record) => {
        return { freq_rx: record.freq_rx };
      });
  }

  const freqRx = getFreqRx(freqs);

  //-------------------------------------------------
  function getDecimalLength(value) {
    if (value === null || value === undefined || value === '') {
      return 0; // إذا كانت القيمة غير صالحة، نعيد 0
    }

    let numStr = value.toString();
    if (numStr.includes('.')) {
      let decimalPart = numStr.split('.')[1] || '';
      decimalPart = decimalPart.replace(/0+$/, ''); // إزالة الأصفار الزائدة
      return decimalPart.length;
    }

    return 0; // إذا كان الرقم ليس عشريًا
  }

  function searchFreqTx(freqTx, searchValue) {
    if (searchValue !== null && searchValue !== undefined && searchValue !== '') {
      if (getDecimalLength(searchValue) < 2 || getDecimalLength(searchValue) == undefined) {
        const target = parseFloat(searchValue);
        const steps = 5;
        const lowerBound = target - steps * 0.1;
        const upperBound = target + steps * 0.1;

        return freqTx.filter((record) => {
          const freq = parseFloat(record.freq_tx);
          if (getDecimalLength(freq) <= getDecimalLength(searchValue)) {
            return freq >= lowerBound && freq <= upperBound;
          }
        });
      } else {
        if (getDecimalLength(searchValue) == 2) {
          const target = parseFloat(searchValue);
          const steps = 25;
          const lowerBound = target - steps * 0.01;
          const upperBound = target + steps * 0.01;

          return freqTx.filter((record) => {
            const freq = parseFloat(record.freq_tx);
            if (getDecimalLength(freq) == getDecimalLength(searchValue)) {
              return freq >= lowerBound && freq <= upperBound;
            }
          });
        }
        if (getDecimalLength(searchValue) == 3) {
          console.log('length is 3');

          const target = parseFloat(searchValue);
          const steps = 25;
          const lowerBound = target - steps * 0.001;
          const upperBound = target + steps * 0.001;

          return freqTx.filter((record) => {
            const freq = parseFloat(record.freq_tx);
            if (getDecimalLength(freq) == getDecimalLength(searchValue)) {
              return freq >= lowerBound && freq <= upperBound;
            }
          });
        }
        return []; // إعادة مصفوفة فارغة لضمان أن الدالة لا تعيد قيمة غير متوقعة
      }
    } else {
      return []; // إعادة مصفوفة فارغة لضمان أن الدالة لا تعيد قيمة غير متوقعة
    }
  }

  const [value, setValue] = useState('');

  const [valueRx, setValueRx] = useState('');

  function searchFreqRx(freqRx, searchValue) {
    if (searchValue !== null && searchValue !== undefined && searchValue !== '') {
      if (getDecimalLength(searchValue) == 1) {
        const target = parseFloat(searchValue);
        const steps = 5;
        const lowerBound = target - steps * 0.1;
        const upperBound = target + steps * 0.1;

        return freqRx.filter((record) => {
          const freq = parseFloat(record.freq_rx);
          if (getDecimalLength(freq) <= getDecimalLength(searchValue)) {
            return freq >= lowerBound && freq <= upperBound;
          }
        });
      }
      if (getDecimalLength(searchValue) == 2) {
        console.log('freq', getDecimalLength(searchValue));

        const target = parseFloat(searchValue);
        const steps = 25;
        const lowerBound = target - steps * 0.01;
        const upperBound = target + steps * 0.01;

        return freqRx.filter((record) => {
          const freq = parseFloat(record.freq_rx);
          if (getDecimalLength(freq) == getDecimalLength(searchValue)) {
            console.log('freq', freq);
            console.log('lowerBound', lowerBound);
            console.log('upperBound', upperBound);
            return freq >= lowerBound && freq <= upperBound;
          }
        });
      }
      if (getDecimalLength(searchValue) == 3) {
        const target = parseFloat(searchValue);
        const steps = 25;
        const lowerBound = target - steps * 0.001;
        const upperBound = target + steps * 0.001;

        return freqRx.filter((record) => {
          const freq = parseFloat(record.freq_rx);
          if (getDecimalLength(freq) == getDecimalLength(searchValue)) {
            return freq >= lowerBound && freq <= upperBound;
          }
        });
      }
    } else {
      return []; // إعادة مصفوفة فارغة لضمان أن الدالة لا تعيد قيمة غير متوقعة
    }
  }

  return (
    <>
      {' '}
      <Stack direction="row" alignItems="center" mb={4} sx={{ color: 'rgb(237, 239, 241)' }}>
        <Typography variant="h4" sx={{ margin: 'auto', color: 'black' }}>
          انشاء تقرير
        </Typography>
      </Stack>
      <Card sx={{ padding: '5px' }}>
        <Box key={999}>
          <Grid container columnSpacing={2} rowSpacing={2} sx={{ mb: 0 }}>
            <Grid item xs={12} columnSpacing={2} rowSpacing={2}>
              <Accordion defaultExpanded={true}>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#eee !important' }} />}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                  style={{
                    color: '#fff',
                    backgroundColor: '#456A8E',
                    maxHeight: '15px',
                  }}
                >
                  <h4 style={{ color: '#fff' }}> البحث عن الترددات بصورة تقريبية</h4>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: 'rgba(145, 158, 171, 0.12)',
                  }}
                ></AccordionDetails>
                <AccordionDetails
                  sx={{
                    backgroundColor: 'rgba(145, 158, 171, 0.12)',
                  }}
                >
                  <Grid container columnSpacing={2} rowSpacing={2} justifyContent="center" sx={{ mt: 0 }}>
                    <Grid item xs={6} display="flex" justifyContent="left">
                      <TextField
                        id="freq_tx"
                        label="TX"
                        value={value || null}
                        onChange={(e) => {
                          setValue(e.target.value || null);
                        }}
                        type="number"
                      />
                      <Button
                        variant="contained"
                        onClick={() => {
                          setResults(searchFreqTx(freqs, value));
                        }}
                      >
                        بحث
                      </Button>
                    </Grid>
                    <Grid item xs={6} display="flex" justifyContent="right">
                      <TextField
                        id="freq_rx"
                        label="RX"
                        value={valueRx || null}
                        onChange={(e) => {
                          setValueRx(e.target.value || null);
                        }}
                        type="number"
                      />
                      <Button
                        variant="contained"
                        onClick={() => {
                          setResults(searchFreqRx(freqs, valueRx));
                        }}
                      >
                        بحث
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Box>
      </Card>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Stack alignItems="center" mb={1}>
          <Typography variant="h3">نظام ادارة الطيف الترددي</Typography>
        </Stack>

        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Button variant="contained" color="primary" onClick={handlePrint}>
            طباعة
          </Button>
          <div ref={ref} className="bg-gray-200 w-full">
            <DataGrid
              rows={results}
              columns={columns2}
              pageSize={15} // تعيين عدد الصفوف الافتراضي إلى 15
              rowsPerPageOptions={[15, 20, 50]} // الخيارات المتاحة لعدد الصفوف في الصفحة
              pagination
              getRowId={(row) => row.id}
            />
          </div>
        </Box>
      </Box>
    </>
  );
}
