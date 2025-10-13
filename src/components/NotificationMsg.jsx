// import React from 'react'
import { Store } from 'react-notifications-component';

export const NotificationMsg = ( Title, Message ) => (

    Store.addNotification({
        title: Title,
        message: Message,
        type: "info",
        insert: "top",
        container: "top-center",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 3000,
            onScreen: true,
            pauseOnHover: true
            // showIcon: true
        },
        width: 400
    })


)

export const WarningMsg =(Title, Message)=>(
    Store.addNotification({
        title: Title,
        message: Message,
        type: 'warning',
        insert: "top",
        container: "top-center",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 3000,
            onScreen: true,
            pauseOnHover: true,
            // showIcon: true,
            // waitForAnimation:true,
            
        },
       width:400,
       
    })
)

export const DangerMsg =(Title, Message)=>(
    Store.addNotification({
        title: Title,
        message: Message,
        type: 'danger',
        insert: "top",
        container: "top-center",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 3000,
            onScreen: true,
            pauseOnHover: true
            // showIcon: true
        },
       width:400
    })
)
// export default NotificationMsg

