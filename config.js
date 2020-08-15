const config = {
    server_port: 3000,
    // Session
    session_name: 'app.sid',
    secret:'280ab5ce1f311e9c8dd112b8fadcbea5',
    session_resave: true,
    saveUninitialised: true,
    //Database
    db_name: "polldb",
    connection_string:"mongodb+srv://Oyasis:brianoti1@pollcluster.mm0jl.mongodb.net/test?retryWrites=true&w=majority",
    reCaptcha: '6LegKb8ZAAAAAHGnG0wOKvO00nqua2um4muinpB7'
}

module.exports = config