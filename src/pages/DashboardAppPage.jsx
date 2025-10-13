//صفحة الرئيسية
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import { useApi } from '../utils/fetch';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
import React, { useState, useEffect } from 'react';
import { AppWidgetSummary, AppConversionRates } from '../sections/@dashboard/app';
// import titles
import { titles } from '../utils/title';
import { round } from 'lodash';
// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const api = useApi();

  // دالة حساب الإحصائيات
  const calculateFreqStats = (records) => {
    const accepted = records.filter((record) => record.current_stage == 'done').length;
    const rejected = records.filter((record) => record.current_stage == 'rejected').length;

    // حساب الترددات المكررة
    const frequencyCounts = {};
    records.forEach((record) => {
      const key = `${record.freq_value}`;
      frequencyCounts[key] = (frequencyCounts[key] || 0) + 1;
    });
    const duplicateFrequencies = Object.values(frequencyCounts).filter((count) => count > 1).length;

    return { accepted, rejected, duplicateFrequencies };
  };

  const [counting, setCounting] = useState({ accepted: 0, rejected: 0, duplicateFrequencies: 0 });

  // جلب البيانات وحساب الإحصائيات
  const getCount = async () => {
    try {
      const { success, data } = await api('GET', `mains/refugees`);
      if (!success) {
        DangerMsg('اشعارات مقدم الطلب', 'خطأ في تحميل البيانات');
        return;
      }

      // حساب الإحصائيات باستخدام الدالة الجديدة
      const stats = calculateFreqStats(data.records);

      setCounting(stats);
    } catch (err) {
      DangerMsg('اشعارات مقدم الطلب', 'خطأ في تحميل البيانات');
      console.error(err);
    }
  };
  useEffect(() => {
    getCount();
  }, []);

  return (
    <>
      <Helmet>
        <title> الرئيسية | {titles.mainTitle} </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          نظام شؤون اللاجئين
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AppWidgetSummary
              title="عدد الطلبات المقبولة   "
              total={counting.accepted} // تأكد من أن القيمة هنا هي counting.accepted
              color="primary"
              icon={'EditNote'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AppWidgetSummary
              title="عدد الطلبات المرفوضة "
              total={counting.rejected} // تأكد من أن القيمة هنا هي counting.rejected
              color="success"
              icon={'SupervisedUserCircle'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AppWidgetSummary
              title="  "
              total={counting.duplicateFrequencies} // تأكد من أن القيمة هنا هي counting.duplicateFrequencies
              color="error"
              icon={'Tour'}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppConversionRates
              title="إحصائيات النظام   "
              subheader={`نسبة  : ${round((counting.accepted / (counting.accepted + counting.rejected)) * 100)}%`}
              chartData={[
                { label: 'عدد الطلبات المقبولة', value: counting.accepted },
                { label: ' عدد الطلبات المرفوضة', value: counting.rejected },
                { label: 'التكرار ', value: counting.duplicateFrequencies },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
