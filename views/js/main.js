"use strict"

const socket = io("/main");

//server/index.js 의 main 방에서 서버와 통신
const cntForm = document.getElementById('cnt_frm');

if(cntForm){
    cntForm.addEventListener('submit', (e) => {
        e.preventDefault();
        //e.target.now.value : 현재 역, e.target.in.value: 탑승인원, e.target.out.value : 하차인원
        //역 이름과 (탑승 인원 - 하차인원) 을 소켓전송
        if(isNaN(e.target.in.value)||isNaN(e.target.out.value)){
            alert("숫자를 입력하세요!");
        }
        else{
            var inp =e.target.in.value;
            var out=e.target.out.value;
            if(inp=="")inp=0;
            if(out=="")out=0;
            console.log(inp,out);
            socket.emit('subcnt',{"subway":e.target.now.value,"in":inp,"out":out});  
            socket.on('res',function(data){
                if(data==-1){
                    alert("하차 인원 오류");
                }
                else if(data==1){
                    alert("탑승 완료");
                }
                else if(data==2){
                    alert("인원이 다 찼습니다! 다음 차량을 이용해 주세요.");
                }
            });
        }
        e.target.in.value="";
        e.target.out.value="";
    })
}


