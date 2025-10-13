import React from 'react'
import { blue } from '@mui/material/colors'
import { Backdrop, CircularProgress, Box, circularProgressClasses } from '@mui/material'

const Loader = ({ loading = true }) => {

    return (
        <>
            <Backdrop
                sx={{
                    color: blue['600'],
                    zIndex: 9999,
                    // zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(10, 10, 10, 0.3)'
                }}
                open={loading}
            // onClick={handleClose}
            >
                <Box sx={{ position: 'relative' }}>
                    <CircularProgress
                        variant="determinate"
                        sx={{
                            color: (theme) =>
                                theme.palette.grey[theme.palette.mode === 'light' ? 400 : 800],
                        }}
                        size={80}
                        thickness={4}
                        // {...props}
                        value={100}
                    />
                    <CircularProgress
                        variant="indeterminate"
                        disableShrink
                        sx={{
                            color: (theme) => (theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'),
                            animationDuration: '550ms',
                            position: 'absolute',
                            left: 0,
                            [`& .${circularProgressClasses.circle}`]: {
                                strokeLinecap: 'round',
                            },
                        }}
                        size={80}
                        thickness={4}
                    // {...props}
                    />
                </Box>
            </Backdrop>
            {/* {loading &&
                <div className="loading">
                    <img style={{width:'150px',height:'150px'}} src="/img/Loading.svg" alt="loading" />
                </div>
            } */}
        </>
    )
}

export default Loader;
