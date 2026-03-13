import { adminDb } from './lib/firebase-admin';

async function listUsers() {
    try {
        const snapshot = await adminDb.collection('users').get();
        console.log(`Total users: ${snapshot.size}`);
        snapshot.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().name} (${doc.data().email}) - Role: ${doc.data().role} - Cong: ${doc.data().congregationId}`);
        });
    } catch (e) {
        console.error(e);
    }
}

listUsers();
