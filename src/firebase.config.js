// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// const firebaseConfig = {
//   apiKey: "AIzaSyDJPQryXZRREXI-qphH_vY0JHqgFGIq4o8",
//   authDomain: "eco-nahrain-otp.firebaseapp.com",
//   projectId: "eco-nahrain-otp",
//   storageBucket: "eco-nahrain-otp.appspot.com",
//   messagingSenderId: "670654843450",
//   appId: "1:670654843450:web:596cb9698ffc89af488303",
//   measurementId: "G-H77LHBTWWV"
// };

// const firebaseConfig = {
//     apiKey: "AIzaSyAeEldNHN_q3lk7tovtp273LAPJ9881OYw",
//     authDomain: "otp-eco.firebaseapp.com",
//     projectId: "otp-eco",
//     storageBucket: "otp-eco.appspot.com",
//     messagingSenderId: "321337530007",
//     appId: "1:321337530007:web:e18ef67672556a90cabbd2",
//     measurementId: "G-VJ05TG1V7M"
// };
// *****************************************************************************

// Import the functions you need from the SDKs you need
import {initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUdRV4Pr2BwCERrorDVxYjyQ6J0ptgiA0",
  authDomain: "ayham-project.firebaseapp.com",
  projectId: "ayham-project",
  storageBucket: "ayham-project.appspot.com",
  messagingSenderId: "550564129572",
  appId: "1:550564129572:web:19141c26950c2278cfa1b1",
  measurementId: "G-285STTXHB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// const analytics = getAnalytics(app);

export const auth = getAuth(app)
// export default app;