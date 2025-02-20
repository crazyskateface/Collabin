const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// const languageExt = {'node': '.js', 'python': '.py', 'java': '.java', 'c': '.c', 'cpp': '.cpp'};
const dockerImage = {
    'node': 'node:14', 
    'python': 'python:3.9', 
    'java': 'openjdk:11', 
    'c': 'gcc:10', 
    'cpp': 'gcc:10',
    'csharp': 'mcr.microsoft.com/dotnet/sdk:5.0'
};
const dockerCommands = {
    'node': 'node tempCode.js', 
    'python': 'python tempCode.py', 
    'java': 'javac Main.java && java Main', 
    'c': 'gcc tempCode.c -o tempCode && ./tempCode', 
    'cpp': 'g++ tempCode.cpp -o tempCode && ./tempCode',
    'csharp': 'csc -out:tempCode.exe tempCode.cs && dotnet tempCode.exe'
};
const filename = {
    'node': 'tempCode.js', 
    'python': 'tempCode.py', 
    'java': 'Main.java', 
    'c': 'tempCode.c', 
    'cpp': 'tempCode.cpp',
    'csharp': 'tempCode.cs'
};

router.post('/execute', (req, res) => {
    const code = req.body.code;
    const language = req.body.language || 'node'; // default to 'node' if no language is specified
    const tempFilePath = path.join(__dirname, filename[language]);

    // Write the code to a temporary file
    fs.writeFile(tempFilePath, code, (err) => {
        if (err) {
            console.error('Error writing to temp file: ' , err);
            return res.status(500).send('Error running code');
        }

        // docker run --rm -v ${tempFilePath}:/usr/src/app/tempCode.py -w /usr/src/app python:3.9 python tempCode.py`;
        // Execute the code using docker
        let dockerCommand = `docker run --rm -v ${tempFilePath}:/usr/src/app/${filename[language]} -w /usr/src/app ${dockerImage[language]} /bin/sh -c "${dockerCommands[language]}"`;
        
        exec(dockerCommand, (error, stdout, stderr) => {
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting temp file: ', unlinkErr);
                }
            });
           
            if (error) {
                console.log('[execute]... error:', error);
                return res.status(500).send(`${stderr}`);
            }
            res.send(stdout);
        });
    })

    
});

module.exports = router;