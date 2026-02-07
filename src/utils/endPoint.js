
// export const endPoints =
// process.env.NODE_ENV !== 'production' ?
//    { FCS_API: `${window.location.hostname}:3030`, RP_URL: `${window.location.hostname}:8080` }
//    :
//    { FCS_API: `http://172.16.16.3:3030`, RP_URL: `http://172.16.16.4:8080` }

export const endPoints =
   process.env.NODE_ENV !== 'production' ?
      { WID_API: process.env.REACT_APP_TRAFFIC_API }
      :
      { WID_API: process.env.REACT_APP_TRAFFIC_API }

      
// export const endPoints =
//    { WID_API: `/api`, DOC_URL: `/doc` }

   // export const endPoints =

   
   // process.env.NODE_ENV !== 'production' ?
   //    { FCS_API: process.env.REACT_APP_FCS_API, RP_URL: process.env.REACT_APP_RP_URL }
   //    :
   //    { FCS_API: process.env.REACT_APP_FCS_API, RP_URL: process.env.REACT_APP_RP_URL }
    // process.env.NODE_ENV !== 'production' ?
    //     {
    //         // TM_API: process.env.REACT_APP_TM_API_TAIL,

    //     }
    //     :
    //     {
    //         TM_API: `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_TM_API}`,
    //     }

