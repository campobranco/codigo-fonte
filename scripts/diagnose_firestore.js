
const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function diagnose() {
  console.log('--- DIAGNÓSTICO FIRESTORE ---');
  
  // 1. Check user doc for Paulo
  const userQuery = await db.collection('users').where('email', '==', 'paulo.jacomelli2001@gmail.com').get();
  if (userQuery.empty) {
    console.log('Usuário Paulo não encontrado.');
  } else {
    const userDoc = userQuery.docs[0];
    console.log('Usuário Paulo:', userDoc.id, userDoc.data());
  }

  // 2. Check counts for congregation ls-catanduva
  const congId = 'ls-catanduva';
  
  const colls = ['witnessing_points', 'visits', 'addresses', 'shared_lists'];
  for (const coll of colls) {
    const snap = await db.collection(coll).where('congregationId', '==', congId).limit(1).get();
    const snapUnderscore = await db.collection(coll).where('congregation_id', '==', congId).limit(1).get();
    
    console.log(`Coleção ${coll}:`);
    console.log(`  - Com congregationId: ${snap.size} docs encontrados (exemplo: ${snap.empty ? 'N/A' : JSON.stringify(snap.docs[0].data()).substring(0, 100)})`);
    console.log(`  - Com congregation_id: ${snapUnderscore.size} docs encontrados (exemplo: ${snapUnderscore.empty ? 'N/A' : JSON.stringify(snapUnderscore.docs[0].data()).substring(0, 100)})`);
  }

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
