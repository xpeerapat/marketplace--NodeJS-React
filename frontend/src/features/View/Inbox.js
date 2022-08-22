import * as React from 'react';

import MyAppBar from '../../components/AppBar';
import SideBar from '../../components/SideBar';
import NotifyBox from '../../components/NotifyBox';
import { useLocation } from 'react-router-dom';

import { getAxios } from '../../utils/axios'
import { useState, useEffect } from 'react'
import { tokenExist } from '../../utils/tokenHandler'
import { useNavigate } from 'react-router-dom';

import '../../components/theme/notifyBox.css'

import {
    Grid, Stack, Box, Typography
} from '@mui/material';

function Inbox() {

    // const navigate = useNavigate()
    const { pathname } = useLocation()
    const [notif, setNotif] = useState([])
    const [myUser, setMyUser] = useState({ name: '' })
    const userEndpoint = "http://192.168.1.125:8080/setting"
    const Endpoint = "http://192.168.1.125:8080/notify"

    const getMyUser = async () => {
        if (!tokenExist()) return;
        const { data } = await getAxios(userEndpoint)
        setMyUser(data.user)

        const { data: { inbox } } = await getAxios(Endpoint)
        setNotif(inbox)
    }

    useEffect(() => {
        getMyUser()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps 

    return (
        <Stack spacing={7}> {/*appbar*/}
            <MyAppBar avatar={myUser.avatar} name={myUser.name} />
            <Box className='container'>

                <Grid container>
                    <Grid item md={4} lg={3} xl={3}>
                        <Box className='sidebar'>
                            <SideBar pathname={pathname} />
                        </Box>
                    </Grid>

                    <Grid item md={8} lg={9} xl={9} >
                        <Box className='itemContainer'>

                            <div className='main'>
                                <Typography variant='h5' sx={{ my: 2, mb: 1 }} >
                                    Selling , Buying
                                </Typography>
                            </div>

                            <div> &nbsp; </div>

                            <div className='main'>
                                <NotifyBox list={notif} />
                            </div>

                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Stack >
    )
}

export default Inbox