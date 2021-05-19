const express = require('express');
const router = express.Router();
const db = require('../queries')

// admin page
router.get('/', async (req, res, next) => {

    await req.sessionStore.all(async (error, sessions) => {
        if (error) {
            console.log("sessionStore error: " + error)
            return;
        }
        let activeUsers = [];

        //nepitaj sta je ovo
        sessions = JSON.parse(JSON.stringify(sessions));

        for (const key in sessions) {
            activeUsers.push(sessions[key].user)
        }


        try {
            let allUsers = await db.getUsers();
            let totalUserCount = allUsers.length;

            let radovi = await db.getRadovi();
            let totalRadCount = radovi.length;

            let konferencije = await db.getConferences();
            let totalConfCount = konferencije.length;

            activeUsers.forEach((activeUser, ind, arr) => {
                allUsers.forEach(allUser => {
                    if (activeUser.identifikacija === allUser.identifikacija){
                        arr[ind] = allUser
                    }
                })
            })

            res.render('administrator', {
                title: 'Administrator',
                user: req.session.user,
                err: null,
                activeUsers: activeUsers,
                access: true,
                totalUserCount: totalUserCount,
                totalRadCount: totalRadCount,
                totalConfCount: totalConfCount,
                allUsers: allUsers
            })
        } catch (err) {
            res.send("Database error, try again")
        }
    })


})

// update user info
router.post('/updateUser', async (req, res, next) => {
    let body = req.body;
    // to do
})

// napraviti konferenciju
router.post('konferencija', async (req, res, next) => {
    //to do
})


module.exports = router;