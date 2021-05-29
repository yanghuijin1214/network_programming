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

//지하철 시작 위치. (임의로 줌)
var car=[{name:'car1',count:0,locate:0},{name:'car2',count:0,locate:9},{name:'car3',count:0,locate:19}];

var line1;
var line;

//지하철 api 사용.
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

//역 이름만 잘라서 배열로 리턴
const returnline = async (num) => {
    const out = await getline(num);
    if (out) {
        var a=out.data.response.body.items[0].sttnComposition;
        a=a.split(',');
        line=a.map(x=>x.split('-')[1]);
        console.log(line);
    }
  };

const ret_line1=async()=>{
    const out=await getline(1);
    if(out){
        var a=out.data.response.body.items[0].sttnComposition;
        a=a.split(',');
        line1=a.map(x=>x.split('-')[1]);   
        console.log(line1);
    }
}
ret_line1();


const path=require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 화면 engine을 ejs로 설정
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// 기본 path를 /src으로 설정(css, javascript 등의 파일 사용을 위해)
app.use(express.static(path.join(__dirname,'views')));

//접속 유저수 체크
var user=0;

/* GET home page. */
app.get('/', function(req, res, next) {
    if(req.query.name!==undefined){
        res.render('index',{now:req.query.name});
    }
    else{
        res.render('index',{now:undefined});
    }
});

app.get('/map',function(req,res,next){
    res.render('map',{data:line1,car:car});
});
  
app.get('/game', function(req, res, next) {
    res.render('game1.html');
});


app.post('/game1', function(req, res, next) {
    console.log(req.body.name,req.body.cnt);
    res.render('game',{'name':req.body.name,'cnt':req.body.cnt});
});

app.get('/game1', function(req, res, next) {
    res.render('game',{'name':req.body.name,'cnt':req.body.cnt});
});

//socket 통신
//소켓 연결
var user_data=[];
var start=0;

//게임을 위한 소켓 룸 생성
var game=io.of('/game');

game.on('connection', function(socket) {
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

            
            game.emit("res",{"cnt":user,"name":data,"user_id":socket.id});

            game.emit("img",{"cnt":user,"name":data,"user_id":socket.id});
        }
    })
    socket.on('ready',function(data){
        user_data[user-1].id=socket.id;
        for(var i=0;i<user_data.length;i++){
            socket.emit("img",{"cnt":user_data[i].number,"name":user_data[i].name,"user_id":user_data[i].id});
        }
        if(user==3){
            console.log(user_data);
            game.emit("start",1);
            var num=10;
            //게임 시작 전 10초 신호. 1초마다 보냄
            var interval=setInterval(()=>{
                if(num==0){
                    returnline(random_line[start]);
                    console.log(line);
                    game.emit('line',random_line[start]);
                    clearInterval(interval);
                }
                game.emit('time_cnt',num);
                num--;
            },1000);
        }
    })

    socket.on('answer',function(data){
        console.log(data);
        if(line.includes(data.answer)){
            line.splice(line.indexOf(data.answer),1);
            for(var i=0;i<3;i++){
                if(user_data[i].id==socket.id){
                    user_data[i].score+=10;
                    game.emit('score',user_data[i]);
                    break;
                }
            }
            if(line.length<=10){ //10개 역 남으면 다음 라운드로 넘어가도록
                console.log('다음 스테이지');
                start+=1;

                if(start>=random_line.length){ //모든 노선의 게임 다 했을 시, 게임 종료.
                    var user_res=user_data.sort(function(a,b){
                        return a.score - b.score;
                    });
                    game.emit('fin',{"one":user_res[2].name,"two":user_res[1].name,"three":user_res[0].name});//게임 결과 보냄 (1,2,3등)
                }
                else{
                    //다음 호선 데이터를 들고온다
                returnline(random_line[start]);
                //클라이언트에게 호선 이름 변경하라는 신호를 줌
                game.emit('line',random_line[start]);
                }
            }
            console.log(user_data);
        } 
    })
  });

//지하철 인원체크를 위한 소켓 룸
var main=io.of('/main');

main.on('connection', function(socket) {
    socket.on('subcnt',function(data){
        for(var i=0;i<3;i++){
            if(data.subway==line1[car[i].locate+1]){
                console.log(data.subway);
                var cnt=data.in-data.out;
                //하차인원이 차에 인원보다 많다면 오류
                if(data.out>car[i].count){
                    socket.emit('res',-1);
                }
               else if(cnt+car[i].count>=0&&cnt+car[i].count<=40){
                   car[i].locate+=1;
                   car[i].count+=cnt;
                   console.log(car[i]);
                    socket.emit('res',1);
                    main.emit('car_renew',car[i]);
               }
               else if(cnt+car[i].count>=40){
                   //인원이 가득 찼다는 신호 2
                   socket.emit('res',2);
               }
            }
            if(car[i].locate>=line1.length-1){
                car[i].locate=0;
                car[i].count=0;
            }
        }
        
    })
})

//포트번호 8080로 접속
server.listen(5000, () => {
    console.log("http://localhost:5000/");
  });
  