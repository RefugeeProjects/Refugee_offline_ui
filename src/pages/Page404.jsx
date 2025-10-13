//في حال خطأ يتم عرض هذه الصفحة
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Typography, Container, Box } from '@mui/material';
// import titles
import { titles } from '../utils/title';
// ----------------------------------------------------------------------

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Page404() {
  return (
    <>
      <Helmet>
        <title> 404 الصفحة المطلوبة غير متوفرة | {titles.mainTitle} </title>
      </Helmet>

      <Container>
        <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h3" paragraph>
            عذراً, الصفحة المطلوبة غير متوفرة!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            عذراً, لايمكن العثور على الصفحة المطلوبة الرجاء التاكد من الرابط.
          </Typography>

          <Box
            component="img"
            src={process.env.PUBLIC_URL + '/assets/illustrations/illustration_404.svg'}
            sx={{ height: 260, mx: 'auto', my: { xs: 5, sm: 10 } }}
          />

          <Button to={process.env.PUBLIC_URL + '/dashboard'} size="large" variant="contained" component={RouterLink}>
            الذهاب الى الصفحة الرئيسية
          </Button>
        </StyledContent>
      </Container>
    </>
  );
}
