"use strict"

const send_btn=document.getElementById('send_btn');
var cnt=document.getElementById('cnt');
var userWrap=document.getElementById('userWrap');
const socket = io("/game");

window.onload=function(){
    console.log('ready');
    socket.emit('ready',1);
}

socket.on('res',function(data){
    cnt.innerText=data.cnt;
})

socket.on('img',function(data){
  var li=document.createElement('li');
  li.setAttribute('id','user'+data.cnt);

  var span=document.createElement('span');
  span.setAttribute('class',"icon solid major");
  var img=new Image();
  img.src='../img/'+data.cnt+'.png';
  img.style.margin='10px';
  img.width=160;

  span.appendChild(img);
    
    var name=document.createElement('h3');
    var namea=document.createTextNode(data.name);
    name.appendChild(namea);

    var score=document.createElement('h4');
    var score_t=document.createTextNode("score : ");

    score.appendChild(score_t);

    var score1=document.createElement("span");
    score1.setAttribute('id','score'+data.cnt);
    var s_txt=document.createTextNode('0');
    score1.appendChild(s_txt);

    score.appendChild(score1);

    li.appendChild(span);
    li.appendChild(name);
    li.appendChild(score);

    userWrap.appendChild(li);
})

socket.on('score',function(data){
  if(data){
    var score=document.getElementById('score'+data.number);
    score.innerText=data.score;
  }
})

socket.on('start',function(data){
  if(data==1){
    var start=document.createElement("div");
    start.setAttribute('id','start');
    var start_txt=document.createTextNode("게임이 곧 시작합니다... ");
    var time=document.createElement("span");
    time.setAttribute('id','time');
    start.appendChild(start_txt);
    start.appendChild(time);
    document.body.appendChild(start);

  }
})

socket.on('time_cnt',function(data){
  if(data==0){
    var start=document.getElementById('start');
    var gameWrap=document.getElementById('gameWrap');
    start.remove();
    gameWrap.style.display="block";
  }
  var time=document.getElementById('time');
  if(time)time.innerText=data;
})

socket.on('line',function(data){
  var line_txt=document.getElementById('line_txt');
  line_txt.innerText="대구 "+data+" 호선"
})

socket.on('fin',function(data){
  var gameWrap=document.getElementById('gameWrap');
  console.log(data);
  gameWrap.innerHTML="<div class='col-6 col-12-medium'><h2>게임 종료</h2> <h3>1등 : "+data.one+" </h3><h3>2등 : "+data.two+" </h3><h3>3등 : "+data.three+" </h3></div>";
  socket.disconnect();
})

send_btn.onclick=function(){
  const answer=document.getElementById('answer').value;
  socket.emit('answer',{"cnt":sessionStorage.getItem('user_cnt'),"name":sessionStorage.getItem('user_name'),"answer":answer});
  document.getElementById("answer").value ='';
};