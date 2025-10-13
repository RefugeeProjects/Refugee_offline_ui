import jwtdecode from 'jwt-decode';
import dayjs from 'dayjs';
import { decryptAsymJwe } from '../auth/decrypt';

export const decodeJWT = (eToken) => {
  return new Promise(async (done, fail) => {
    try {
      if (!eToken) return null;
      const jToken = await decryptAsymJwe(eToken);
      const token = jToken.payload.jws;
      const {
        exp,
        sub: {
          id,
          sec_id,
          name,
          username,
          roles,
          status,
          phone,
          email,
          first_enter,
          created_at,
          created_by,
          updated_at,
          verified,
        },
      } = jwtdecode(token);
      if (dayjs().unix() >= exp) {
        return fail('Token expired');
      }
      return done({
        id,
        sec_id,
        name,
        username,
        roles,
        status,
        phone,
        email,
        first_enter,
        created_at,
        created_by,
        updated_at,
        verified,
      });
    } catch (err) {
      return fail(err);
    }
  });
};
