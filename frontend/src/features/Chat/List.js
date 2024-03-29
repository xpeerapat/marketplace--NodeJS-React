import {
    Box, Avatar, Typography
} from '@mui/material';

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { getAxios } from '../../utils/axios'


import styles from './css/chat.module.css'

const timeString = (t) => {
    let now = (Date.now() - new Date(t).getTime()) / 1000 //to second 
    let hour = 60 * 60
    let day = 60 * 60 * 24
    if (now < 60) return 'just now'
    if (now >= 0 && now < hour) return Math.trunc(now / 60) + 'm'
    if (now >= hour && now < day) return Math.trunc(now / hour) + 'h'
    if (now >= day && now < day * 7) return Math.trunc(now / day) + 'd'
    if (now >= day * 7) return Math.trunc(now / (day * 7)) + 'w'
    else return `?`
}

const toTimeObj = (xx) => {
    // String -> Obj && sort date
    let newFormat = xx
    for (let i in newFormat) {
        let n = new Date(newFormat[i]['updatedAt'])
        newFormat[i]['updatedAt'] = n
    }
    // sort High to Low
    newFormat.sort(function (a, b) {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    })
    return newFormat
}


function List({ inbox, myUser, id, trig, search }) {

    const navigate = useNavigate()
    const [lists, setLists] = useState([])
    const [timerId, setTimerId] = useState(0)
    const [startTimer, setStartTimer] = useState(true)
    const endpoint = "http://192.168.1.125:8080/inbox/" + id

    const init = async () => {
        const { data: { inbox } } = await getAxios(endpoint)
        let sortInbox = toTimeObj(inbox)
        setLists(sortInbox)
        console.log('init');
    }

    //trigger fetch reload (you)
    useEffect(() => {
        let intervalId = null
        if (startTimer) {
            intervalId = setInterval(() => {
                init() // fetch from db every 5 sec   
                console.log('timer');
            }, 1000)
            setTimerId(intervalId)
        } else {
            clearInterval(timerId)
        }
    }, [startTimer]) // eslint-disable-line react-hooks/exhaustive-deps  

    //trigger new msg & searching (me)
    useEffect(() => {
        setLists(inbox)
        if (search === '') init()
    }, [trig]) // eslint-disable-line react-hooks/exhaustive-deps   

    useEffect(() => {
        let val = search.match(/^[a-zA-Z0-9_ ]*$/i) //allow spaces between words 
        let reg = new RegExp(val, 'gi')
        let filter = inbox.filter(val => val.name.match(reg))
        setLists(filter)
        if (search) {
            setStartTimer(false)
        } else {
            init()
            setStartTimer(true)
        }
    }, [search]) // eslint-disable-line react-hooks/exhaustive-deps  

    const run = (id) => {
        navigate('/messenger/inbox/' + id)
        navigate(0)
    }

    return (
        <Box>
            {lists && lists.map((user, idx) => (
                <div className={user.sentBy === myUser.name ? styles.userColor1 : styles.userColor2}
                    onClick={() => run(user.user)} key={idx}>

                    <Box className={(user.user === id && styles.userPick) || styles.user}
                        backgroundColor={user.user === id && '#252F3C'}  >

                        <Avatar alt={user.name} src={user.avatar}
                            sx={{
                                bgcolor: '#3A3B3C',
                                width: 60, height: 60,
                            }} />
                        <Box className={styles.name} >
                            <Typography variant='h6'>
                                {user.name}
                            </Typography>

                            {user.sentBy === myUser.name ? 'you : ' : null}
                            {user.sent.length < 20
                                ?
                                user.sent
                                : user.sent.substr(0, 8) + '...'}
                            •&nbsp;
                            {timeString(user.updatedAt)}
                        </Box>
                    </Box>
                </div>
            ))}
        </Box>
    )
}

export default List