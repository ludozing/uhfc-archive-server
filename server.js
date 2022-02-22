const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);
const mysql = require('mysql');
const pwAnswer = '1983';

const connection = mysql.createConnection({
    host: parseData.host,
    user: parseData.user,
    password: parseData.password,
    port: parseData.port,
    database: parseData.database
})

app.use(express.json());
app.use(cors());

app.post('/adminChk', (req,res)=>{
    console.log(req.query)
    res.send(pwAnswer);
})

// Timeline 페이지 전체 데이터
app.get('/events', async(req,res)=>{
    connection.query(
        "SELECT * FROM events ORDER BY date",
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Timeline 업데이트 데이터 테이블에 삽입
app.post('/addEvent', async(req,res)=>{
    const { e_dept, e_date, e_title, e_refer_url, e_tags } = req.body
    connection.query('insert into events(dept, title, date, refer_url, tags) values(?,?,?,?,?);', [e_dept, e_title, e_date, e_refer_url, e_tags],
    function(err, result, fields){console.log(result);})
    res.send('등록되었습니다.')
})

// Players 페이지 전체 데이터
app.get('/players', async(req,res)=>{
    connection.query(
        "SELECT * FROM players ORDER BY b_no",
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Players 페이지 디테일 접근
app.get('/players/:id', async(req,res)=>{
    const param = req.params;
    connection.query(
        `SELECT * FROM players WHERE b_no = ${param.id}`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})
// Players 페이지 디테일 이벤트 접근
app.get('/events/:id', async(req, res)=>{
    const param = req.params;
    connection.query(
        `SELECT * FROM events WHERE tags LIKE '% ${param.id},%' OR tags = 'ALL'`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Matches 페이지 경기 결과 접근
app.get('/matches/kl1', async(req, res)=>{
    connection.query(
        `SELECT * FROM matchResult_KL1 ORDER BY round`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Matches 페이지 경기 세부 결과 접근
app.get('/matches/kl1/:id', async(req, res)=>{
    const param = req.params;
    connection.query(
        `SELECT
            a.round, 
            a.against, 
            a.gf, 
            a.ga, 
            a.isAwaygame, 
            a.vid_url, 
            b.dataId, 
            b.recordedTime, 
            b.ulsanScorer, 
            b.ulsanAssist, 
            b.againstScorer, 
            b.againstAssist, 
            b.isPK, 
            b.isOG, 
            b.ulsanYellowcard, b.ulsanRedcard, 
            b.againstYellowcard, b.againstRedcard, 
            b.isSecondYellow, 
            b.refer_vid, 
            b.ulsanSubIn, b.ulsanSubOut, 
            b.againstSubIn, b.againstSubOut
        FROM matchResult_KL1 AS a LEFT OUTER JOIN matchSituation_KL1 AS b 
        ON a.round = b.matchResult_KL1_round 
        WHERE a.round = ${param.id} ORDER BY b.dataId`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Matches 페이지 라인업 접근
app.get('/matchlineup/kl1/:id', async(req, res)=>{
    const param = req.params;
    connection.query(
        `SELECT * FROM matchLineup_KL1 WHERE matchResult_KL1_round = ${param.id}`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Matches 페이지 리그 테이블 접근
app.get('/leaguetable/kl1/:id', async(req, res)=>{
    const param = req.params;
    connection.query(
        `SELECT
            a.dataId,
            a.matchResult_KL1_round,
            a.team,
            a.win,
            a.draw,
            a.lose,
            a.points,
            a.g,
            a.a,
            a.gd,
            b.logo_url,
            b.color
        FROM leagueTable_KL1 AS a LEFT OUTER JOIN teamlist_KL1 AS b 
        ON a.team = b.team
        WHERE matchResult_KL1_round = ${param.id} ORDER BY points DESC, g DESC, gd DESC`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

app.listen(port, ()=>{
    console.log("아카이브 서버가 실행 중입니다.")
})
