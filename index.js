const express=require('express');
const app=new express();

var server = require('http').createServer(app);

var io = require('socket.io')(server);
const axios=require('axios');

function shuffle(a) { 
    var j, x, i; 
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1]; 
        a[i - 1] = a[j]; 
        a[j] = x; 
    } 
}
var random_line=[1,2,3];
shuffle(random_line);

var line;
const getline=async(num)=> {
    try{
        //1호선
        if(num==1)
            return await axios.get('http://api.data.go.kr/openapi/tn_pubr_public_ctyrlroad_route_api?serviceKey=iYQjcRrPSKRq1%2B9uB33oHleRIEqCm7mZGdRUAW%2FdmJ0yd2RhpoU7jq4gHOZPaD%2Bwc8Z5nv4DCG%2FaVnsih%2Fmp2g%3D%3D&pageNo=1&type=json&routeNo=S2701');
        //2호선
        if(num==2)
            return await axios.get('http://api.data.go.kr/openapi/tn_pubr_public_ctyrlroad_route_api?serviceKey=iYQjcRrPSKRq1%2B9uB33oHleRIEqCm7mZGdRUAW%2FdmJ0yd2RhpoU7jq4gHOZPaD%2Bwc8Z5nv4DCG%2FaVnsih%2Fmp2g%3D%3D&pageNo=1&type=json&routeNo=S2702');
        //3호선
        if(num==3)
            return await axios.get('http://api.data.go.kr/openapi/tn_pubr_public_ctyrlroad_route_api?serviceKey=iYQjcRrPSKRq1%2B9uB33oHleRIEqCm7mZGdRUAW%2FdmJ0yd2RhpoU7jq4gHOZPaD%2Bwc8Z5nv4DCG%2FaVnsih%2Fmp2g%3D%3D&pageNo=1&type=json&routeNo=S2703');
    }
    catch(error){
        console.log(error);
    }
}

const returnline = async (num) => {
    const out = await getline(num);
    if (out) {
        var a=out.data.response.body.items[0].sttnComposition;
        a=a.split(',');
        line=a.map(x=>x.split('-')[1]);
        console.log(line);
    }
  };


// router 설정
var indexRouter = require('./routes/index');

const path=require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 화면 engine을 ejs로 설정
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// 기본 path를 /src으로 설정(css, javascript 등의 파일 사용을 위해)
app.use(express.static(path.join(__dirname,'views')));

app.use('/', indexRouter);

var user=0;

app.post('/game', function(req, res, next) {
    console.log(req.body.name,req.body.cnt);
    res.render('game',{'name':req.body.name,'cnt':req.body.cnt});
});

app.get('/game', function(req, res, next) {
    res.render('game',{'name':req.body.name,'cnt':req.body.cnt});
});

//socket 통신
//소켓 연결
var user_data=[];
var start=0;
io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('name',function(data){
        if(user>=3){
            console.log("인원이 다 찼습니다!");
            socket.emit("res",-1);
        }
        else{
            user++;
            console.log('Client '+user+' name: ' + data);
            user_data.push({"number":user,"id":socket.id,"name":data,"score":0});
            console.log(user_data);
            io.emit("res",{"cnt":user,"name":data,"user_id":socket.id});

            io.emit("img",{"cnt":user,"name":data,"user_id":socket.id});
        }
    })
    socket.on('ready',function(data){
        user_data[user-1].id=socket.id;
        for(var i=0;i<user_data.length;i++){
            socket.emit("img",{"cnt":user_data[i].number,"name":user_data[i].name,"user_id":user_data[i].id});
        }
        if(user==3){
            console.log(user_data);
            io.emit("start",1);
            var num=10;
            var interval=setInterval(()=>{
                if(num==0){
                    returnline(random_line[start]);
                    console.log(line);
                    io.emit('line',random_line[start]);
                    clearInterval(interval);
                }
                io.emit('time_cnt',num);
                num--;
            },1000);
        }
    })

    socket.on('answer',function(data){
        console.log(data);
        if(line.includes(data.answer)){
            //고치기
            line.splice(line.indexOf(data.answer),1);
            for(var i=0;i<3;i++){
                if(user_data[i].id==socket.id){
                    user_data[i].score+=10;
                    io.emit('score',user_data[i]);
                    break;
                }
            }
            if(line.length==0){
                console.log('다음 스테이지');
            }
            console.log(user_data);
        } 
    })
  });

//포트번호 8080로 접속
server.listen(5000, () => {
    console.log("http://localhost:5000/");
  });
  