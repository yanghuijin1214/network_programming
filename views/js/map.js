//main1.js -> map.ejs

const socket = io("/main");

//car_renew로 메시지가 들어오면 페이지를 reload한다. (지하철 노선 다시 표시)
socket.on('car_renew',function(data){
    //console.log(data);
    location.reload();
})
