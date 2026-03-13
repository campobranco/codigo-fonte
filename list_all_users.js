const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const saPath = path.join(__dirname, 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function listAll() {
    try {
        console.log("--- FIRESTORE USERS ---");
        const snapshot = await db.collection('users').get();
        console.log(`Total documents in 'users' collection: ${snapshot.size}`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- DocID: ${doc.id} | Name: ${data.name} | Email: ${data.email} | Role: ${data.role}`);
        });
        
        console.log("\n--- FIREBASE AUTH USERS ---");
        const authUsers = await auth.listUsers();
        console.log(`Total users in Firebase Auth: ${authUsers.users.length}`);
        authUsers.users.forEach(user => {
            console.log(`- UID: ${user.uid} | Email: ${user.email} | Name: ${user.displayName}`);
        });

    } catch (e) {
        console.error(e);
    }
}

listAll();
