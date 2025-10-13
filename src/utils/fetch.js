import { useContext } from 'react'
import { useNavigate } from "react-router-dom";
import { endPoints } from './endPoint'
import { appContext } from '../context'
import Cookies from 'js-cookie';

export const useApi = () => {
    const navigate = useNavigate();
    const { token, setLoading } = useContext(appContext)

    return (method = "GET", path, data, upload = false, auth = true) => {
        return new Promise((done, fail) => {
            const url = endPoints.WID_API;
           
            // console.log("url", url);
            // if (auth && !localStorage.getItem("token")) {
            //     if (!localStorage.getItem("token")) {
            //         fail(new Error('User not logged in'));
            //         navigate("/login")
            //         return
            //     }
            // }
            setLoading(true)
            const header = upload ?
                {
                    "Access-Control-Allow-Origin": "*",
                    "Authorization": auth ? `Bearer ${Cookies.get('token')}` : '',
                }
                : {
                    "Access-Control-Allow-Origin": "*",
                    "Authorization": auth ? `Bearer ${Cookies.get('token')}` : '',
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
            // define form data for upload
            let formData = new FormData()
            // check if multiple files uploaded or single
            if (data?.map) {
                // add multi files
                data?.map(file => {
                    formData.append('file', file)
                })
            }else{
                // add single file
                formData.append('file', data)
            }
                       
            fetch(`${url}/${path}`, {
                method,
                body: upload ? formData : JSON.stringify(data),
                headers: header
            }).then((res) => {
                setLoading(false)
                res.json().then(jsonRes => done(jsonRes))
            }).catch((err) => {
                console.log("err", err)
                setLoading(false)
                fail(err)
            })
        })
    }
}