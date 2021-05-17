"use strict"

const joinForm = document.getElementById('join_frm');

const socket = io();

joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.name.value
    socket.emit('name', name);
    socket.on('res',function(data){
        if(data==-1){
            alert("인원이 다 차 들어갈 수 없습니다!");
        }
        else{
            var input1=document.createElement('input');
            input1.setAttribute('type','hidden');
            input1.setAttribute('name','cnt');
            input1.setAttribute('value',data.cnt);

            joinForm.appendChild(input1);
            sessionStorage.setItem('user_name',data.name);
            sessionStorage.setItem('user_cnt',data.cnt);
            joinForm.submit();
        }
    })
})
