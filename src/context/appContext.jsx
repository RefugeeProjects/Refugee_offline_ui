import { createContext } from 'react';

export const initState = {
  // sidebarShow: false,
  token: '',
  isLogin: false,
  // user: {
  //     id: '', approval_det_id: '', name: '', username: '', activation: '', user_type: '',
  //     roles: '', created_at: '', first_enter: '', destination: '', role_type: '', sudrultype: '', approval_part: '', sudname: '', sudid: '', send_sms: '', id_send_sms: '', validity: ''
  // }
  user: {
    id: '',
    sec_id: '',
    name: '',
    username: '',
    roles: '',
    status: '',
    phone: '',
    email: '',
    first_enter: '',
    created_at: '',
    created_by: '',
    updated_at: '',
    verified: '',
  },
};

export const appContext = createContext();
