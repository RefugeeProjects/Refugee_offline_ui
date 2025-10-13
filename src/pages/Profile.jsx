//الملف الشخصي للمستخدم
import React, { useContext, useEffect, useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Avatar,
  Divider,
  Grid,
  Box,
  Paper,
  Stack,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import {
  AdminPanelSettings,
  Email,
  Close,
  AddCircle,
  Person,
  AccountCircle,
  Rule,
  Flag,
  HomeWork,
  Label,
  Phone,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { titles } from '../utils/title';
import { useApi } from '../utils';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
// context
import { appContext } from '../context';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'wihte' ? 'wihte' : 'wihte',
  ...theme.typography.body2,
  padding: theme.spacing(0),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function Profile() {
  //  define api
  const api = useApi();
  // define user from context
  const { user } = useContext(appContext);

  // const [dataSections, setDataSections] = useState([]);

  // const getDataSections = useCallback(async () => {
  //   try {
  //     const { success, data } = await api('GET', `mainsAuth/sections`);
  //     if (!success) {
  //       DangerMsg('اشعارات الاقسام', 'خطأ في تحميل البيانات');
  //       return;
  //     }
  //     // console.log("section", data.records);
  //     setDataSections(data.records);
  //   } catch (err) {
  //     DangerMsg('اشعارات الاقسام', 'خطأ في تحميل البيانات');
  //     console.error(err);
  //   }
  // }, []);

  // const [dataCategories, setDataCategories] = useState([]);

  // const getDataCategories = useCallback(async () => {
  //   try {
  //     const { success, data } = await api('GET', `mainsAuth/categories`);
  //     if (!success) {
  //       DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
  //       return;
  //     }
  //     // console.log("cate", data.records);
  //     setDataCategories(data.records);
  //   } catch (err) {
  //     DangerMsg('اشعارات التصنيفات', 'خطأ في تحميل البيانات');
  //     console.error(err);
  //   }
  // }, []);
  // // use effect on open modal to call data
  // useEffect(() => {
  //   getDataSections();
  //   getDataCategories();
  // }, [getDataSections, getDataCategories]);

  // const [userSection, setUserSection] = useState([
  //   // { user_id: user?.id, section_id: "7b286b30-c678-4323-b584-27c3e3f49233" },
  //   // { user_id: user?.id, section_id: "880a44cd-6f8a-4080-99b2-66205b340f15" },
  // ]);

  // // Get sectionRole role of user
  // const getSectionsRole = useCallback(async () => {
  //   try {
  //     const { success, data } = await api('GET', `mainsAuth/user_section_roles/user_id/${user?.id}`);
  //     if (!success) {
  //       DangerMsg('اشعارات صلاحيات الاقسام', 'خطأ في تحميل البيانات');
  //       return;
  //     }
  //     // console.log("sectionRole", data.records);
  //     setUserSection(data.records);
  //   } catch (err) {
  //     DangerMsg('اشعارات صلاحيات الاقسام', 'خطأ في تحميل البيانات');
  //     console.error(err);
  //   }
  // }, []);

  // const [userCategory, setUserCategory] = useState([]);
  // // get category role of user
  // const getCategoriesRole = useCallback(async () => {
  //   try {
  //     const { success, data } = await api('GET', `mainsAuth/user_category_roles/user_id/${user?.id}`);
  //     if (!success) {
  //       DangerMsg('اشعارات صلاحيات التصنيفات', 'خطأ في تحميل البيانات');
  //       return;
  //     }
  //     // console.log("cateRolw", data.records);
  //     setUserCategory(data.records);
  //   } catch (err) {
  //     DangerMsg('اشعارات صلاحيات التصنيفات', 'خطأ في تحميل البيانات');
  //     console.error(err);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (user) {
  //     getSectionsRole();
  //     getCategoriesRole();
  //   }
  // }, [user, getSectionsRole, getCategoriesRole]);
  // // find sectionRole
  // const findSection = (sec_id) => {
  //   const findSection = userSection.find((section) => section?.section_id == sec_id);
  //   if (!findSection) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };

  // // find category role
  // const findCategory = (cat_id) => {
  //   const findCategory = userCategory.find((category) => category?.category_id == cat_id);
  //   if (!findCategory) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };

  return (
    <>
      <Helmet>
        <title> معلومات الحساب | {titles.mainTitle} </title>
      </Helmet>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5, textAlign: 'center' }}>
          تفاصيـل الحسـاب
        </Typography>
        <Grid container spacing={2}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} sx={{ width: '100% !important' }}>
              <Grid item xs={12} md={4}>
                <Stack
                  sx={{
                    borderRadius: '10px',
                    width: '100%',
                    height: '100%',
                    py: '20px',
                    backgroundColor: '#2065d5',
                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2),0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                  }}
                  justifyContent="center"
                  direction={'column'}
                  spacing={2}
                >
                  <Stack justifyContent={'center'} alignItems={'center'}>
                    <Avatar
                      sx={{ width: 160, height: 160 }}
                      src={process.env.PUBLIC_URL + '/assets/images/avatars/user_avatar_profile.png'}
                      alt="profile"
                    />
                  </Stack>
                  <Stack justifyContent={'center'} alignItems={'center'}>
                    <Typography variant="h5" component="div" sx={{ color: '#fff' }}>
                      {user?.name}
                    </Typography>
                    {/* <Typography variant="body1" sx={{ color: '#eee' }} >
                      {user?.sec_name_ar}
                    </Typography> */}
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Stack
                  direction={'column'}
                  spacing={2}
                  sx={{
                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2),0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                    backgroundColor: '#FFF',
                    p: '20px',
                    borderRadius: '15px',
                  }}
                >
                  <Typography color="text.secondary" gutterBottom variant="h6" sx={{ textAlign: 'right' }}>
                    المعلومات
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Box>
                    <Stack spacing={2} alignItems={'flex-start'}>
                      {/* <Typography variant='body2' color="text.secondary">  اسم المستخدم :   <span  style={{ color: 'black',fontWeight:'bold' }}> اسم المستخدم    </span>  </Typography>
                            <Typography variant="body2" color="text.secondary">الدائرة :  <span style={{ color: 'black',fontWeight:'bold' }} > الدائرة   </span>  </Typography> */}
                      <Typography variant="body2" color="text.secondary">
                        حالة الحساب:<span style={{ color: 'black', fontWeight: 'bold' }}> {'فعال'} </span>
                        <span style={{ color: 'black', fontWeight: 'bold' }}></span>
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary">
                        البريد الالكتروني :<span style={{ color: 'black', fontWeight: 'bold' }}> {user?.email} </span>{' '}
                      </Typography> */}
                      <Typography variant="body2" color="text.secondary">
                        تاريخ الانشاء :<span style={{ color: 'black', fontWeight: 'bold' }}> {user?.created_at} </span>{' '}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        تاريخ التحديث : <span style={{ color: 'black', fontWeight: 'bold' }}> {user?.updated_at}</span>{' '}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack
                  direction={'column'}
                  spacing={2}
                  sx={{
                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2),0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                    backgroundColor: '#FFF',
                    p: '20px',
                    borderRadius: '15px',
                  }}
                >
                  <Typography color="text.secondary" gutterBottom variant="h6" sx={{ textAlign: 'right' }}>
                    الصلاحيات الممنوحة لهذا الحساب
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack sx={{ ml: '10px', mr: '0px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Typography
                        id="modal-modal-description"
                        sx={{
                          mt: 2,
                          color: '#fff',
                          backgroundColor: '#637381',
                          p: '3px',
                          borderRadius: '3px',
                          fontWeight: 'bold',
                          minWidth: '135px',
                        }}
                      >
                        نوع الحساب:
                      </Typography>
                    </Box>
                    {user?.roles == 'data_entry' && (
                      <FormControlLabel className="largeText" label="مدخل بيانات" control={<Checkbox checked={true} />} />
                    )}

                    {user?.roles == 'approver' && (
                      <FormControlLabel
                        className="largeText"
                        label="مصرح نهائي"
                        control={<Checkbox checked={true} />}
                      />
                    )}
                    {user?.roles == 'reviewer' && (
                      <FormControlLabel className="largeText" label="مدقق بيانات" control={<Checkbox checked={true} />} />
                    )}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Container>
    </>
  );
}

export default Profile;
