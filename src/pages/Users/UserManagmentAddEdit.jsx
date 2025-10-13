//عرض وتعديل المستخدمين
import React, { useEffect, useState, useContext } from 'react';
import {
  Modal,
  IconButton,
  Card,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
  Button,
  InputLabel,
} from '@mui/material';
import { Close, Person, AccountCircle, Rule, Flag, HomeWork, Label } from '@mui/icons-material';
import { useApi } from '../../utils';
import { NotificationMsg, DangerMsg } from '../../components/NotificationMsg';
import { appContext } from '../../context/appContext';

const Editonline = ({ modalProps, openModal, getUsers, toogleModal }) => {
  const { user } = useContext(appContext);
  // console.log('user',user);
  //  style of modal
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '650px',
    bgcolor: 'background.paper',
    border: '0',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
  };

  //  define api
  const api = useApi();

  // getUsers
  const [dataUsers, setDataUsers] = useState({
    username: '',
    name: '',
    roles: '',
    created_by: user?.id || null,
    updated_at: '',
  });
  // open modal event
  const onOpenModal = () => {
    setDataUsers({
      name: modalProps?.name || '',
      username: modalProps?.username || '',
      // commandID: modalProps?.commandID || null,
      // departmentID: modalProps?.departmentID || null,
      // stationID: modalProps?.stationID || null,
      // userLevel: modalProps?.userLevel || '',
      password: modalProps?.password || '',
      roles: modalProps?.roles || '',
    });
  };

  // close modal event
  const onCloseModal = () => {
    setDataUsers({
      username: '',
      name: '',
      roles: '',
      created_by: user?.id || null,
      updated_at: '',
    });
    toogleModal();
  };

  const insertData = async () => {
    try {
      let payload = dataUsers;
      const { success, data, err } = await api('POST', `users`, payload);
      if (!success) {
        if (err.errdelet === true) {
          DangerMsg('اشعارات المستخدمين', err.errMsg);
          console.log('err', err.errMsg);
          return;
        }
        DangerMsg('اشعارات المستخدمين', 'خطأ في اضافة البيانات');
        return;
      }

      NotificationMsg('اشعارات المستخدمين', 'تم الاضافة بنجاح');
      getUsers();
      toogleModal();
    } catch (err) {
      DangerMsg('اشعارات المستخدمين', 'خطأ في اضافة البيانات');
      console.error(err);
    }
  };

  // edit data
  const editData = async () => {
    try {
      const { success, data, err } = await api('PUT', `users/${modalProps.id}`, dataUsers);
      if (!success) {
        if (err.errUpdate === true) {
          DangerMsg('اشعارات المستخدمين', err.errMsg);
          return;
        }
        DangerMsg('اشعارات المستخدمين', 'خطأ في تعديل البيانات');
        return;
      }
      NotificationMsg('اشعارات المستخدمين', 'تم التعديل بنجاح');
      getUsers();
      toogleModal();
    } catch (err) {
      DangerMsg('اشعارات المستخدمين', 'خطأ في تعديل البيانات');
      console.error(err);
    }
  };

  // save handle function
  const saveClick = () => {
    if (modalProps === null) {
      insertData();
      onCloseModal();
    } else {
      editData();
    }
  };
  return (
    <div>
      <Card sx={{ padding: '5px' }}>
        <Modal
          open={openModal}
          onClose={onCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <IconButton
              aria-label="close"
              color="default"
              sx={{ position: 'fixed', left: '10px', top: '10px' }}
              onClick={() => {
                onCloseModal();
              }}
            >
              <Close />
            </IconButton>
            <Typography id="modal-modal-title" variant="h4" component="h2" mb={2}>
              {modalProps === null ? 'اضافة مستخدم جديد' : 'تعديل المستخدم'}
            </Typography>
            {/* data */}
            <Grid container columnSpacing={2} rowSpacing={2} sx={{ mb: 2 }}>
              {/* name */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Person sx={{ fontSize: 30, color: 'action.active', ml: 1, mb: dataUsers.name === null ? 3 : 0 }} />
                  <TextField
                    className="rtl largeText"
                    fullWidth
                    id="user"
                    label="الاسم *"
                    value={dataUsers?.name}
                    onChange={(e) => {
                      setDataUsers({ ...dataUsers, name: e.target.value || null });
                    }}
                    error={dataUsers.name === ''}
                    helperText={dataUsers.name === '' ? ' مطلوب' : ''}
                    variant="standard"
                  />
                </Box>
              </Grid>
              {/* username */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <AccountCircle
                    sx={{ fontSize: 30, color: 'action.active', ml: 1, mb: dataUsers.username === null ? 3 : 0 }}
                  />
                  <TextField
                    className="rtl largeText"
                    fullWidth
                    sx={{ fontSize: 20 }}
                    id="username"
                    label="اسم المستخدم *"
                    value={dataUsers?.username}
                    onChange={(e) => {
                      setDataUsers({ ...dataUsers, username: e.target.value || null });
                    }}
                    error={dataUsers.username === ''}
                    helperText={dataUsers.username === '' ? '  مطلوب' : ''}
                    variant="standard"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <AccountCircle
                    sx={{ fontSize: 30, color: 'action.active', ml: 1, mb: dataUsers.username === null ? 3 : 0 }}
                  />
                  <FormControl fullWidth className="rtl leftSvgIcon">
                    <InputLabel id="roles-select-standard-label"> مستوى المستخدم *</InputLabel>
                    <Select
                      labelId="roles-select-standard-label"
                      id="roles-select-standard"
                      value={dataUsers?.roles}
                      onChange={(e) => {
                        setDataUsers({ ...dataUsers, roles: e.target.value || null });
                      }}
                      label="roles"
                      variant="standard"
                      error={dataUsers.roles === ''}
                      helperText={dataUsers.roles === '' ? '  مطلوب' : ''}
                    >
                      <MenuItem key={1} value={'data_entry'}>
                        {'مدخل بيانات'}
                      </MenuItem>
                      <MenuItem key={2} value={'reviewer'}>
                        {'مدقق'}
                      </MenuItem>
                      <MenuItem key={3} value={'mokhabarat'}>
                        {'المخابرات'}
                      </MenuItem>
                      <MenuItem key={4} value={'amn_watani'}>
                        {'الأمن الوطني'}
                      </MenuItem>
                      <MenuItem key={5} value={'istikhbarat_defense'}>
                        {'استخبارات الدفاع'}
                      </MenuItem>
                      <MenuItem key={6} value={'iqama'}>
                        {'الإقامة'}
                      </MenuItem>
                      <MenuItem key={7} value={'approver'}>
                        {'  مصرح نهائي (اللجنة)'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              {/* <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <AccountCircle
                    sx={{ fontSize: 30, color: 'action.active', ml: 1, mb: dataUsers.username === null ? 3 : 0 }}
                  />
                  <FormControl fullWidth className="rtl leftSvgIcon">
                    <InputLabel id="roles-select-standard-label"> نوع المستخدم *</InputLabel>
                    <Select
                      labelId="roles-select-standard-label"
                      id="roles-select-standard"
                      value={dataUsers?.user_type}
                      onChange={(e) => {
                        setDataUsers({ ...dataUsers, user_type: e.target.value || null });
                      }}
                      label="roles"
                      error={dataUsers.user_type === ''}
                      helperText={dataUsers.user_type === '' ? '  مطلوب' : ''}
                      variant="standard"
                    >
                      <MenuItem key={1} value={1}>
                        {'تكنلوجيا المعلومات'}
                      </MenuItem>
                      <MenuItem key={2} value={2}>
                        {' الصيانة'}
                      </MenuItem>
                      <MenuItem key={3} value={3}>
                        {' الشبكات'}
                      </MenuItem>
                      <MenuItem key={4} value={4}>
                        {'برمجة'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid> */}
              {/* <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <AccountCircle
                    sx={{ fontSize: 30, color: 'action.active', ml: 1, mb: dataUsers.username === null ? 3 : 0 }}
                  />
                  <FormControl fullWidth className="rtl leftSvgIcon">
                    <InputLabel id="roles-select-standard-label">اسم المؤسسة*</InputLabel>
                    <Select
                      labelId="roles-select-standard-label"
                      id="roles-select-standard"
                      value={dataUsers?.org_id}
                      onChange={(e) => {
                        setDataUsers({ ...dataUsers, org_id: e.target.value || null });
                      }}
                      label="roles"
                      variant="standard"
                    >
                      <MenuItem key={1} value={1}>
                        {'مديرية الاتصالات والنظم المعلوماتية'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid> */}
              {/* <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <AccountCircle
                    sx={{ fontSize: 30, color: 'action.active', ml: 1, mb: dataUsers.username === null ? 3 : 0 }}
                  />
                  <FormControl fullWidth className="rtl leftSvgIcon">
                    <InputLabel id="roles-select-standard-label">اسم المؤسسة*</InputLabel>
                    <Select
                      labelId="roles-select-standard-label"
                      id="roles-select-standard"
                      value={dataUsers?.org_name}
                      onChange={(e) => {
                        setDataUsers({ ...dataUsers, org_name: e.target.value || null });
                      }}
                      label="roles"
                      variant="standard"
                    >
                      <MenuItem key={1} value={1}>
                        {'مديرية الاتصالات والنظم المعلوماتية'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid> */}

              <Grid item xs={12}>
                {/* اكتب هنا */}
              </Grid>
            </Grid>
            <Grid container justifyContent={'center'} columnSpacing={2} rowSpacing={4} sx={{ my: 2 }}>
              <Grid display={'flex'} justifyContent={'center'} item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mx: 10, fontSize: '16px' }}
                  disabled={!(dataUsers?.name && dataUsers?.username && dataUsers?.roles)}
                  onClick={() => {
                    saveClick();
                  }}
                >
                  {modalProps === null ? 'اضافة جديد' : 'تعديل المعلومات'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
      </Card>
    </div>
  );
};

export default Editonline;
