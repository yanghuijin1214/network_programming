"use strict"

const joinForm = document.getElementById('join_frm');

const socket = io("/game");

//버튼시 form 제출. 
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //form의 input 값 (name)을 가져옴
    const name = e.target.name.value
    socket.emit('name', name); //name 소켓서버로 전송

    //res 메시지로 오는 소켓 받기
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
