import React,{useContext} from 'react'
import { endPoints } from './endPoint'
import { appContext } from '../context'
export const filePaths = {
    images: endPoints.WID_API + '/storage/images/',
    // fingerPrint: endPoints.WID_API + '/storage/biometric/'
}

// export const Info = () => {
//     const { user } = useContext(appContext)
//     let userData = {
//         name: user.username,
//         user_type: user.user_type,
//     }
//     return userData
// }