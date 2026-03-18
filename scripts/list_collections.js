
const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listCollections() {
  console.log('--- LISTANDO COLEÇÕES ---');
  try {
    const collections = await db.listCollections();
    console.log('Coleções encontradas:', collections.map(c => c.id));
    
    // Test a simple get on a known path if possible
    const testDoc = await db.collection('users').limit(1).get();
    console.log('Teste query users:', testDoc.size, 'docs');
  } catch (err) {
    console.error('Erro ao listar coleções:', err);
  }
  process.exit(0);
}

listCollections();
