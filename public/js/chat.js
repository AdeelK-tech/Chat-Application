const socket=io();
const $messageInputForm=document.querySelector('#form')
const $messageInput=document.querySelector('input');
const $messageBtn=document.querySelector('#formBtn');
const $messageBtn_2=document.querySelector('#location');
const $messageContainer=document.querySelector('#messagesContainer');
//Templates
const $messagetemplate=document.getElementById('message-template').innerHTML;
const $locationtemplate=document.getElementById('location-template').innerHTML;
const $sidebartemplate=document.getElementById('sidebar-template').innerHTML;
//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true});

const autoScroll=()=>{
    const $newMessage=$messageContainer.lastElementChild;

    const $newMsgStyles=getComputedStyle($newMessage);
    const $newMsgMargin=parseInt($newMsgStyles.marginBottom);
    const $newMsgHeight=$newMessage.offsetHeight+$newMsgMargin

    const visibleHeight=$messageContainer.offsetHeight;

    const containerHeight=$messageContainer.scrollHeight;

    const scrollOffset=$messageContainer.scrollTop+visibleHeight;

    if(containerHeight-$newMsgHeight <=scrollOffset){
        $messageContainer.scrollTop=$messageContainer.scrollHeight
    }
}
socket.on('message',(msg)=>{
    console.log(msg);
    const html=Mustache.render($messagetemplate,{username:msg.username,msg:msg.text,createdAt:moment(msg.createdAt).format('h:mm a')})
    $messageContainer.insertAdjacentHTML('beforeend',html);
    autoScroll()
})
$messageInputForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageBtn.setAttribute('disabled','disabled');
    let msgVal=e.target.elements.message.value;
    socket.emit('recieveMsg',msgVal,(err='message sent successfully')=>{
        $messageBtn.removeAttribute('disabled');
        e.target.elements.message.value=''
        $messageInput.focus()
        console.log(err)
    });
    
})



document.querySelector('#location').addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('Your browser does not support sharing location')
    }
    $messageBtn_2.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit("locationShared",{latitude:position.coords.latitude,longitude:position.coords.longitude},()=>{
        $messageBtn_2.removeAttribute('disabled')
        console.log('your location is shared')
    })
})
   })

   socket.on('roomData',({room,users})=>{
    const html=Mustache.render($sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})
   
   socket.on('location',(message)=>{
       console.log(message)
       const html=Mustache.render($locationtemplate,{username:message.username,url:message.location,createdAt:moment(message.createdAt).format('h:mm a')})
       $messageContainer.insertAdjacentHTML('beforeend',html)
       autoScroll()
   })

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
  
  

})