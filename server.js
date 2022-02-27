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

// admin 확인
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
            b.HTline,
            b.isUlsan, 
            b.recordedTime, 
            b.scorer, 
            b.assist, 
            b.isPK, 
            b.missedPK,
            b.isOG, 
            b.isCanceled,
            b.yellowcard, b.redcard, 
            b.isSecond, 
            b.subIn, b.subOut,
            b.refer_vid,
            c.logo_url,
            c.color

        FROM matchResult_KL1 AS a 
        LEFT OUTER JOIN matchSituation_KL1 AS b ON a.round = b.round 
        INNER JOIN teamlist_KL1 AS c ON a.against = c.team
        WHERE a.round = ${param.id} ORDER BY b.recordedTime*1 ASC, b.dataId ASC`,
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

// Matches페이지 포메이션 업데이트
app.post('/matchlineup/kl1/:id/update',async(req,res)=>{
    const param = req.params;
    
    const { GK_sta, GK_sub_time, GK_sub,
        LB_sta, LB_sub_time, LB_sub,
        LCD_sta, LCD_sub_time, LCD_sub,
        CD_sta, CD_sub_time, CD_sub,
        RCD_sta, RCD_sub_time, RCD_sub,
        RB_sta, RB_sub_time, RB_sub,
        LWB_sta, LWB_sub_time, LWB_sub,
        LDM_sta, LDM_sub_time, LDM_sub,
        CDM_sta, CDM_sub_time, CDM_sub,
        RDM_sta, RDM_sub_time, RDM_sub,
        RWB_sta, RWB_sub_time, RWB_sub,
        LM_sta, LM_sub_time, LM_sub,
        LCM_sta, LCM_sub_time, LCM_sub,
        CM_sta, CM_sub_time, CM_sub,
        RCM_sta, RCM_sub_time, RCM_sub,
        RM_sta, RM_sub_time, RM_sub,
        LW_sta, LW_sub_time, LW_sub,
        LAM_sta, LAM_sub_time, LAM_sub,
        CAM_sta, CAM_sub_time, CAM_sub,
        RAM_sta, RAM_sub_time, RAM_sub,
        RW_sta, RW_sub_time, RW_sub,
        LF_sta, LF_sub_time, LF_sub,
        CF_sta, CF_sub_time, CF_sub,
        RF_sta, RF_sub_time, RF_sub, isCap } = req.body       
        
    connection.query(
        `INSERT INTO matchLineup_KL1(matchResult_KL1_round, GK_sta, GK_sub, GK_sub_time, LB_sta, LB_sub, LB_sub_time, LCD_sta, LCD_sub, LCD_sub_time, CD_sta, CD_sub, CD_sub_time, RCD_sta, RCD_sub, RCD_sub_time, RB_sta, RB_sub, RB_sub_time, LWB_sta, LWB_sub, LWB_sub_time, LDM_sta, LDM_sub, LDM_sub_time, CDM_sta, CDM_sub, CDM_sub_time, RDM_sta, RDM_sub, RDM_sub_time, RWB_sta, RWB_sub, RWB_sub_time, LM_sta, LM_sub, LM_sub_time, LCM_sta, LCM_sub, LCM_sub_time, CM_sta, CM_sub, CM_sub_time, RCM_sta, RCM_sub, RCM_sub_time, RM_sta, RM_sub, RM_sub_time, LW_sta, LW_sub, LW_sub_time, LAM_sta, LAM_sub, LAM_sub_time, CAM_sta, CAM_sub, CAM_sub_time, RAM_sta, RAM_sub, RAM_sub_time, RW_sta, RW_sub, RW_sub_time, LF_sta, LF_sub, LF_sub_time, CF_sta, CF_sub, CF_sub_time, RF_sta, RF_sub, RF_sub_time, ${isCap}_sta_isCap) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,true);`,
        [param.id, GK_sta, GK_sub, GK_sub_time, LB_sta, LB_sub, LB_sub_time, LCD_sta, LCD_sub, LCD_sub_time, CD_sta, CD_sub, CD_sub_time, RCD_sta, RCD_sub, RCD_sub_time, RB_sta, RB_sub, RB_sub_time, LWB_sta, LWB_sub, LWB_sub_time, LDM_sta, LDM_sub, LDM_sub_time, CDM_sta, CDM_sub, CDM_sub_time, RDM_sta, RDM_sub, RDM_sub_time, RWB_sta, RWB_sub, RWB_sub_time, LM_sta, LM_sub, LM_sub_time, LCM_sta, LCM_sub, LCM_sub_time, CM_sta, CM_sub, CM_sub_time, RCM_sta, RCM_sub, RCM_sub_time, RM_sta, RM_sub, RM_sub_time, LW_sta, LW_sub, LW_sub_time, LAM_sta, LAM_sub, LAM_sub_time, CAM_sta, CAM_sub, CAM_sub_time, RAM_sta, RAM_sub, RAM_sub_time, RW_sta, RW_sub, RW_sub_time, LF_sta, LF_sub, LF_sub_time, CF_sta, CF_sub, CF_sub_time, RF_sta, RF_sub, RF_sub_time],
        (err, result, fields) => {
            console.log(result);
        })
        res.send('업로드 완료')
})

// 세팅한 app을 실행
app.listen(port, ()=>{
    console.log("아카이브 서버가 실행 중입니다.")
})
