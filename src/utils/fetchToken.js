import { useContext } from 'react'
import { endPoints } from './endPoint'
import { appContext } from '../context'

export const useApiToken = () => {

    const { setLoading } = useContext(appContext)

    return (method = "GET", path, token, data, upload = false, auth = true) => {
        return new Promise((done, fail) => {
            const url = endPoints.WID_API;
            // setLoading(true)
            const header = upload ?
                {
                    "Access-Control-Allow-Origin": "https://api.eco-nahrainuniv.a2hosted.com",
                    "Authorization": auth ? `Bearer ${token}` : '',

                }
                : {
                    "Access-Control-Allow-Origin": "https://api.eco-nahrainuniv.a2hosted.com",
                    "Authorization": auth ? `Bearer ${token}` : '',
                    "Content-Type": "application/json; charset=utf-8",
                }

            fetch(`${url}/${path}`, {
                method,
                body: upload ? JSON.stringify(data) : JSON.stringify(data),
                headers: header,

            }).then((res) => {
                // setLoading(false)
                res.json().then(jsonRes => done(jsonRes))
            }).catch((err) => {
                // setLoading(false)
                fail(err)
            })
        })
    }
}