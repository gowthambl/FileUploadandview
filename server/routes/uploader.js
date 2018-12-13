import multer from 'multer';
import path from 'path';
import FileModel from './../helpers/db/fileModel'
import mammoth from "mammoth";
import fs from 'fs';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.dirname(require.main.filename) + "\\views\\files")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split('.')[file.originalname.split('.').length - 2] +
            '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (['pdf', 'docx', 'txt'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            req.fileValidationError = 'Invalid File Extension';
            return callback(null, false, new Error('Invalid File Extension'));
        }
        callback(null, true);
    }
}).single('file');


export default class UploadFile {
    static Upload(req, res) {
        upload(req, res, () => {
            if (req.fileValidationError) {
                res.render('index', {title: 'uploaded invalid file'})
            }
            else {
                const fileDetails = {
                    fileName: req.file.filename,
                    originalName: req.file.originalname,
                    date: new Date().toDateString(),
                    size: req.file.size,
                    type: req.file.path.split(".")[req.file.path.split(".").length - 1],
                    path: req.file.path
                }
                UploadFile.saveFile(fileDetails).then(data => {
                    res.render('list', {data: data})
                })
            }
        })
    }

    static list(req, res) {
        return FileModel.find({}).then(data => {
            res.render('list', {data: data});
        })
    }

    static viewer(req, res) {
        if (req.query.type === "pdf") {
            res.render('viewer', {data: req.query.name,name:req.query.name.split('-')[0]});
            // console.log(req.query.name.split('-')[0]);
        }
        else if (req.query.type === "docx") {
            mammoth.convertToHtml({path: path.dirname(require.main.filename) + "\\views\\files\\" + req.query.name})
                .then(function (result) {
                    let html = result.value;
                    let messages = result.messages;
                    res.render('docviewer', {data: html,filename: req.query.name.split('-')[0]});
                })
                .done();
        }
        else if (req.query.type === "txt") {
            fs.readFile(path.dirname(require.main.filename) + "\\views\\files\\" + req.query.name, 'utf8', function (err, data) {
                res.render('txtviewer', {
                    filename: req.query.name.split('-')[0],
                    data: data.replace(/(?:\r\n|\r|\n)/g, '<br>')
                });
            })
        }
    }

    static saveFile(fileDetails) {
        return FileModel(fileDetails).save().then(result => {
            return FileModel.find({});
        })
    }

}