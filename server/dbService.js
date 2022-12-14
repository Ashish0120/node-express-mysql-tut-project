const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if(err){
        console.log('Error: ' + err.message);
    }
    console.log('DB Connected: ' + connection.state);
});

// let instance = null;
class DbService {
    static getDbServiceInstance() {
        instance = instance ? instance : new DbService();
        return instance;
    }

    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM names;";
                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getDataByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM names WHERE name LIKE ?;";
                connection.query(query, ['%' + name + '%'] ,(err, results) => {
                    // console.log('err',err);
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
                // console.log(connection.sql);
            });
            console.log('resp: ',response.sql);
            
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewName(name){
        try {
            if(!name || name.length == 0 ) return false;
            const dateAdded = new Date();
            const response = await new Promise((resolve,reject) => {
                const query = "INSERT INTO names (name,date) VALUES (?,?);";
                connection.query(query, [name,dateAdded], (err, result) => {
                    if(err) reject(new Error(err.message));
                    resolve(result.insertId);
                });
            });
            
            return {
                id: response,
                name:name,
                date: dateAdded
            };
        } catch (error) {
            console.log(error.message);
        }
    }

    async deleteNameById(id){
        try {
            id = parseInt(id,10);
            if(!id) return false;

            const response = await new Promise((resolve,reject) => {
                const query = "DELETE FROM names WHERE id = ?;";
                connection.query(query, [id], (err, result) => {
                    if(err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                });
            });
            return (response === 1);
        } catch (error) {
            console.log(error.message);
        }
        return false;
    }

    async updateNameById(id, name) {
        try{ 
            if(!id || !name || id.length == 0 || name.length == 0) return false;
            const response = await new Promise((resolve,reject) => {
                const query = "UPDATE names SET name = ? where id = ?";
                connection.query(query, [name,id], (err, result) => {
                    // console.log('rrr', result);
                    if(err) reject(new Error(err.message));
                    resolve(result.changedRows);
                });
            });

            return {
                success: true,
                id: response,
                name:name
            };
        } catch (error){
            console,log(error.message);
        }
    }
}

module.exports = DbService;