const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const data = require(__dirname + '/user_id.json');
const student_data = mysql.createConnection(data);

student_data.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/',(req,res) => {
    res.sendFile(__dirname+"/html_files/index.html");
});

app.get('/all/contents', (req,res) => {
    student_data.query('SELECT * FROM students', (err,result) => {
        if(err) throw err;
        res.json(result);
    });
});

app.get('/roll/:roll', async (req,res) => {
    const qry='SELECT * FROM students WHERE RollNo = ?';
    student_data.query(qry, [req.params.roll], (err,result) => {
        if(err) {
            res.json({status : "Failure!!"});
        }
        else if(!result[0]){
            return res.json({status : "Student not found!!"});
        }
        else res.json(result[0]);
    });   
});

app.post('/add/student', (req, res) => {
    const qry = 'INSERT INTO students VALUES(?,?,?,?)';
    student_data.query(qry,Object.values(req.body),(err) =>{
        if (err){
            res.json({status : "Failed to add student", reason : err.code});
        }
        else{
            res.json({status : "Success", data: req.body});
        }
    });
});

app.put('/update/:roll', (req, res) => {

    let a='',b='',c='',d='',e='';
    if(req.body.Name) a+=`Name = '${req.body.Name}'`;
    if(req.body.Address) b+=`Address = '${req.body.Address}'`;
    if(req.body.ContactNo) c+=`ContactNo = '${req.body.ContactNo}'`;

    if(a&&b) d+=',';
    if(b&&c) e+=',';
    const qry = 'UPDATE students SET '+a+d+b+e+c+` WHERE RollNo= '${req.params.roll}'`;
    student_data.query(qry,(err,result) =>{
        if (err){
            res.json({status : "Failed to add student", reason : err.code});
        }
        else if(result.affectedRows == 0){
            res.json({status : "Student not found!!"});
        }
        else{
            res.json({status : "Successfully modified"});
        }
    });
});

app.delete('/delete/:roll', (req,res) => {
    const qry = `DELETE FROM students WHERE RollNo = '${req.params.roll}'`;
    student_data.query(qry,(err,result) =>{
        if (err){
            res.json({status : "Failed to delete student", reason : err.code});
        }
        else if(result.affectedRows==0){
            res.json({status : "Student not found!!"});
        }
        else{
            res.json({status : "Successfully deleted"});
        }
    });
});

app.get('/:id', (req, res) => {
    switch(req.params.id)
    {
        case "all":
            res.sendFile(__dirname + '/html_files/allstudent.html');
            break;
        case "roll":
            res.sendFile(__dirname + '/html_files/rollstudent.html');
            break;
        case "add":
            res.sendFile(__dirname + '/html_files/addstudent.html');
            break;
        case "update":
            res.sendFile(__dirname + '/html_files/updatestudent.html');
            break;
        case "remove":
            res.sendFile(__dirname + '/html_files/removestudent.html');
            break;
    }
});

const port = process.env.PORT || 8080;
app.listen(port,()=>{
    console.log(`listening on port ${port}...`);
})
