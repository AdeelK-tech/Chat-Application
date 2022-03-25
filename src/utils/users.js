const users=[];

const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();

    if(!username || !room){
        return {
            error:'username and room name is required!'
        }
    }
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })
    if(existingUser){
        return {
            error:'Username is already in use'
        }
    }
    const user={id,username,room}
    users.push(user)
    return{user}
}

const getUser=(id)=>{
    const user=users.find(user=>user.id===id)
   return user;
}

const getUsersInRoom=(room)=>{
    const _users=users.filter(user=>user.room===room)
    return _users;
}
const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id);
    if(index!==-1){
        return users.splice(index,1)[0]
    }

}
module.exports={
    addUser,getUser,getUsersInRoom,removeUser
}