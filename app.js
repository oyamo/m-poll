/**
 * @Author: oyamo-brian
 * 
 */
const config = require('./config')
const express = require('express')
const cookieparser = require('cookie-parser')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()


const session = require('express-session')
// Middlewares
app.use(express.static('public'))
app.use(cookieparser())
app.use(bodyParser.urlencoded({extended: true}))
// Session Middleware
const MongoStore = require('connect-mongo')(session)


mongoose.connect(config.connection_string,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err=>{
    console.log(err)
})

mongoose.Promise = global.Promise
const db = mongoose.connection

let nStore = session.MemoryStore
app.use(session({
    secret: config.secret,
    resave: config.session_resave,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection : db}),
    name: config.session_name
}))


//View Engine
app.set('view engine', 'ejs')


let authCollection = db.collection('users')
let votesCollection = db.collection('votes')
/**
 * 
 * Homepage
 * 
 */


app.get('/',(req, res)=>{

    if(req.session.loggedin){
       authCollection.find().toArray((err, result)=>{
            const comp = (a,b) =>{
                console.log(a)
                console.log('||')
                console.log(b)
                console.log(a==b)
                return a==b
            }
            const me = result.filter((i)=>comp(i.idno, req.session.idno))[0]
            console.log(result)
            const hasVoted = me.has_voted == true;
            res.render('dashboard',{
                count: result.length, 
                name:req.session.fullname,
                has_voted:hasVoted 
            })
        })
    }else{
        res.sendFile(__dirname+'/public/html/main.html')
    }
})


/**
 * Authentication
 * 
 */
app.get('/login',(req, res)=>{
    if(req.session.loggedin){
        res.redirect('/')
    }else{
        res.sendFile(__dirname+'/public/html/login.html')
    }
})

app.post('/login', (req, res)=>{
    if(req.session.loggedin){
        res.redirect('/')
    }else{
        if(req.body == undefined 
            || req.body.idno == undefined ||
             req.body.idno == null){
            // if body
            res.redirect('/login')
        }else{
            let query = {idno: req.body.idno, password: req.body.password}
            authCollection.find(query).toArray((err,result)=>{
                if(result.length == 1){
                    req.session.loggedin = true
                    req.session.idno = req.body.idno
                    req.session.fullname = result[0].fullnames
                    res.redirect('/')
                }else{
                    console.log('incorrect password')
                    res.redirect('/login')
                }
            })
        }
    }
})

app.get('/register',(req,res)=>{
    if(req.session.loggedin){
        res.redirect('/');
    }else{
        res.sendFile(__dirname+'/public/html/signup.html')
    }
})

app.post('/register',(req,res)=>{
    console.log(req.body)
   if(req.body == undefined || req.body == null){
       console.log('Fields Missing')
       res.redirect('/register')
   }else{
       if(req.body.password == undefined
         || req.body.password.length < 4 ||
         req.body.password != req.body.confirm){
             console.log('Password not match')
            res.redirect('/register')
       }else{
            let query = { idno: req.body.idno}
            
            authCollection.find(query).toArray((err, result)=>{
                if(err){
                    console.log(err)
                    res.redirect('/register')
                }else{
                    if(result.length == 1){
                        console.log('user exists')
                        res.redirect('/register')
                    }else{
                        req.session.loggedin = true
                        req.session.idno = req.body.idno
                        req.session.fullname = req.body.fullnames
                        console.log(req.body)
                        authCollection.insertOne(req.body).then((result)=>{
                            res.redirect('/')
                        })
                    }
                }
            })
       }
   }
})

app.get('/candidates',(req, res)=>{
    
    if(req.session.loggedin){
        res.sendFile(__dirname+'/public/html/candidates.html')
    }else{
        res.redirect('/')
    }
})
app.get('/castvotes',(req,res)=>{
    if(req.session.loggedin){
        res.sendFile(__dirname+'/public/html/castvotes.html')
    }else{
        res.redirect('/')
    }
})

app.post('/castvotes',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session)
        let query = { idno: req.session.idno}
        authCollection.find(query).toArray((err, result)=>{
            if(err){
                console.log(err)
                res.send("appError 398")
            }else{
                if(result.length == 1){
                    const me = result[0]
                    console.log(me)
                    if(me.has_voted == undefined && me.has_voted != true){
                        let votes = req.body;
                        votes.voter = req.session.idno
                        votesCollection.insertOne(
                            votes
                        ).then(result=>{
                            authCollection.findOneAndUpdate(query,{
                                '$set':{has_voted: true}
                            },(err,doc)=>{
                                console.log(err)
                            })
                    
                            res.redirect('/')
                        }).catch(err=>{

                        })
                    }else{
                        res.send("Youre trying to vote more than once")
                    }                                                                      
                }else{
                    res.send("App Error 399")
                }
            }
        })
    }else{
        res.redirect('/')
    }
})
app.get('/results',(req,res)=>{
    let ondoro = 'Ondoro Lawrence'
    let zainab = 'Zainab Odhiambo'
    let george = 'George Opondo'
    let beatrice = 'Beatrice Odhiambo'
    let robin = 'Robinson Davies Kaphwawi'
    let evance_okoth = 'Evance Okoth Oyamo'
    let dwincan = 'Dwincan Owino'
    let philip = 'Philip Achieng'
    let mildred = 'Milded J. Apiyo'
    let othim = 'Othim Wellington'
    votesCollection.find().toArray((err,result)=>{
        const aeqb =(a,b) => {
            console.log(a)
            console.log('||')
            console.log(b)
            return a == b 
        }
        let results = {
            ondoro: result.filter(a=>aeqb(a.chair_person, ondoro)).length,
            zainab: result.filter(a=>aeqb(a.deputy_chair, zainab)).length,
            george: result.filter(a=>aeqb(a.deputy_chair, george)).length,
            beatrice: result.filter(a=>aeqb(a.treasury, beatrice)).length,
            robin : result.filter(a=>aeqb(a.sec_gen, robin)).length,
            evance_okoth: result.filter(a=>aeqb(a.ass_sec_gen, evance_okoth)).length,
            dwincan: result.filter(a=>aeqb(a.ass_sec_gen, dwincan)).length,
            philip: result.filter(a=>aeqb(a.ass_sec_gen, philip)).length,
            mildred: result.filter(a=>aeqb(a.ass_sec_gen, mildred)).length,
            othim: result.filter(a=>aeqb(a.org_sec, othim)).length
        }
        res.render('results',results)
    })
})
app.get('/logout',(req, res)=>{
    req.session.destroy((err)=>{
        console.log('Session Destroyed')
    })
    res.redirect('/')
})
app.get('/favicon.ico',(req,res)=>{
    res.send("0")
})
const port = process.env.PORT || config.server_port;
app.listen(port, ()=>{
    console.log('server is up and running on'+port)
})