const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: parseData.host,
    user: parseData.user,
    password: parseData.password,
    port: parseData.port,
    database: parseData.database
})

app.use(express.json());
app.use(cors());

app.post('/adminChk', async(req,res)=>{
    console.log(req.body)
    // const pw = req.body.pw;
    // res.send({
        
    // })
    // 여기서 비밀번호를 받아서 다시 클라이언트로 SESSION을 돌릴 수 있도록 돌려줘야 하는데,
    // 무얼 어떻게 보내서 어느 쪽에서 세션을 돌려야 할지 찾아봐야 하겠다.
})

// 타임라인 페이지 전체 데이터
app.get('/events', async(req,res)=>{
    connection.query(
        "SELECT * FROM events ORDER BY date",
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// 플레이어스 페이지 전체 데이터
app.get('/players', async(req,res)=>{
    connection.query(
        "SELECT * FROM players ORDER BY b_no",
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// 플레이어스 페이지 디테일 접근
app.get('/players/:id', async(req,res)=>{
    const param = req.params;
    connection.query(
        `SELECT * FROM players WHERE b_no = ${param.id}`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})
// 플레이어스 페이지 디테일 이벤트 접근
app.get('/events/:id', async(req, res)=>{
    const param = req.params;
    connection.query(
        `SELECT * FROM events WHERE tags LIKE '% ${param.id},%' OR tags = 'ALL'`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

app.listen(port, ()=>{
    console.log("아카이브 서버가 실행 중입니다.")
})
