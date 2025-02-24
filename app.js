// 라이브러리 설치 후 사용할 수 있도록 변수에 할당
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mysql = require('mysql2')
require('dotenv').config();
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.set('views', './views')
app.use(express.static(__dirname + '/public')) // static file serving (정적파일 서빙, 보통 public에 저장)
app.use(bodyParser.urlencoded({extended: false})) // parsing application/x-www-form-urlencoded
app.use(bodyParser.json()) // parsing JSON

// MySQL Connection Pool, 보안을 위해 .env에 상세 정보 기재 후 import
// MySQL 커넥션을 사용할 때, 주로 커넥션 풀을 이용해 관리하는 것이 권장된다.
const connectionPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionLimit: 10, // 최대 연결 수 설정(필요 시)
    insecureAuth: true,
})

// MySQL connection check
connectionPool.getConnection((err, connection) => {
    if (err){
        console.errror('MySQL 연결 중 에러 발생: ', err);
    } else {
        console.log('MySQL에 연결되었습니다');
        connection.release();
    }
});


// 라우터 배치하는 곳
// localhost:3000 을 통해 접속
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/users', (req, res) => {
    res.render('users')
})

app.get('/blog', (req, res) => {
    res.render('blog')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

// CRUD of Create
app.post('/api/contact', (req, res) => {
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const subject = req.body.subject;
    const memo = req.body.memo;

    const SQL_Query =
        `INSERT INTO contact(name, phone, email, subject, memo, create_at, modify_at)
        VALUES('${name}', '${phone}', '${email}', '${subject}', '${memo}', NOW(), NOW())`
    
    connectionPool.query(SQL_Query, (err, result) => {
        if(err) {
            console.error('데이터 삽입 중 에러 발생: ', err);
            res.status(500).send('내부 서버 오류')
        } else {
            console.log('데이터 삽입 완료')
            res.send("<script>alert('문의사항이 등록되었습니다.'); location.href='/' </script>")
        }
    })
})

// CRUD of Read
app.get('/contactList', (req, res) => {
    const selectQuery = 
        `SELECT * FROM contact ORDER BY id DESC`

    connectionPool.query(selectQuery, (err, result) => {
        if(err) {
            console.error('데이터 조회 중 에러 발생: ', err);
            res.status(500).send('내부 서버 오류')
        } else {
            console.log('데이터 조회 완료')
            console.log(result)
            res.render('contactList', {lists: result})
        }
    })
});

// CRUD of Update
app.put('/api/contactUpdate/:id', (req, res) => {
    const id = req.params.id
    const status = "done"
    const updateQuery = 
        `UPDATE contact SET status = '${status}' WHERE id='${id}'`
    
    connectionPool.query(updateQuery, (err, result) => {
        if(err) {
            console.error('데이터 수정 중 에러 발생: ', err);
            res.status(500).send('내부 서버 오류')
        } else {
            console.log('데이터 수정 완료')
            console.log(result)
            res.send("<script>alert('문의사항의 상태가 변경되었습니다.'); location.href='/contactList' </script>")
        }
    })
})

// CRUD of Delete (원래 app.delete 사용, but 현재는 편의를 위해 app.post방식 적용)
// path variable 방식 접근
app.delete('/api/contactDelete/:id', (req, res) => {
    const id = req.params.id
    const deleteQuery = 
        `DELETE FROM contact WHERE id = '${id}'`

    connectionPool.query(deleteQuery, (err, result) => {
        if(err) {
            console.error('데이터 삭제 중 에러 발생: ', err);
            res.status(500).send('내부 서버 오류')
        } else {
            console.log('데이터 삭제 완료')
            console.log(result)
            res.send("<script>alert('문의사항이 삭제되었습니다.'); location.href='/contactList' </script>")
        }
    })
})



// listen은 마지막에 두는 것 권장
app.listen(port, () => {
    console.log(`Node Legacy App listening on port ${port}`)
})