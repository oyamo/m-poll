const config = {
    server_port: 3000,
    // Session
    session_name: 'app.sid',
    secret:'280ab5ce1f311e9c8dd112b8fadcbea5',
    session_resave: true,
    saveUninitialised: true,
    //Database
    db_name: "polldb",
    connection_string:"mongodb+srv://Oyamo:brianoti1@poll-app.ietfb.mongodb.net/poll?retryWrites=true&w=majority"
}

module.exports = config