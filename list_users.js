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

async function listUsers() {
    try {
        const snapshot = await db.collection('users').get();
        console.log(`Total users in Firestore: ${snapshot.size}`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ${doc.id}: ${data.name} (${data.email}) - Role: ${data.role} - Cong: ${data.congregationId}`);
        });
        
        const congs = await db.collection('congregations').get();
        console.log(`Total congregations: ${congs.size}`);
        congs.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().name}`);
        });
    } catch (e) {
        console.error(e);
    }
}

listUsers();
