const {generateMsg,generateLocation}=require('./utils/message')
const{addUser,getUser,getUsersInRoom,removeUser}=require('./utils/users')
const express=require('express');
const socketio=require('socket.io');
const http=require('http');
const path=require('path');
const app=express();
const Filter=require('bad-words')
const server=http.createServer(app)
const io=socketio(server); 
const port=process.env.PORT || 4000;
const publicDirectory=path.join(__dirname,'../public')
app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    console.log("new connection");


// When a user connects this events fires and a welcome message is sent    
socket.emit('message',generateMsg('admin','welcome'))


// When the user clicks on send message button this event fires and msg is sent to all clients and callback is called for acknowledgmtnt to the client    
    socket.on('recieveMsg',(msg,callback)=>{
        if(msg.length===0){
            return callback('empty msg reported');
        }
        const filter=new Filter();
        if(filter.isProfane(msg)){
            return callback('cant send bad messages')
        }
        const user=getUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMsg(user.username,msg))
            callback();
        }
        
    })



//When a user disconnects a msg is sent to all clients
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMsg('admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)

            })
        }
        
    })




//when a user clicks on share location this event fires and location is sent to all clients
    socket.on('locationShared',(coords,callback)=>{
        const user=getUser(socket.id)
        if(user){
            io.to(user.room).emit('location',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
            callback();
        }
      
    })




 //When a user joins a room this event will be fired and callback will run   
socket.on("join",({username,room},callback)=>{

    const {error ,user}=addUser({id:socket.id,username:username,room:room});
    if(error){
        return callback(error)
    }
    socket.join(user.room)
    
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
//When a user joins a msg is sent to all user except the joiner 
socket.broadcast.to(user.room).emit('message',generateMsg('admin',`${user.username} has joined`))
    callback()

})


})

server.listen(port,()=>{
    console.log('listening on port 4000')
    
});
