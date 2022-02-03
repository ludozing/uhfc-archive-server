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
app.get('/cases', async(req,res)=>{
    connection.query(
        "SELECT * FROM cases",
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

app.listen(port, ()=>{
    console.log("아카이브 서버가 실행 중입니다.")
})
