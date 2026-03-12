
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// API para listar todas as congregações (uso restrito ao painel admin)
// Utiliza o Firebase Admin SDK para contornar regras de segurança e garantir acesso total
export async function GET(req: Request) {
    console.log('📡 API: Listando congregações...');
    try {
        // Extrai o token de autenticação do header Authorization ou cookie de sessão
        const authHeader = req.headers.get('Authorization');
        let token = '';

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            const cookie = req.headers.get('cookie');
            token = cookie?.split('__session=')[1]?.split(';')[0] || '';
        }

        if (!token) {
            console.warn('⚠️ API: Token não encontrado');
            return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        }


        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (e: any) {
            console.error('❌ API: Erro ao verificar token:', e.message);
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
        }

        // Verifica se o usuário é administrador no Firestore
        console.log('🔍 API: Verificando papel para user:', decodedToken.uid);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        // Permite acesso se for ADMIN ou se for o email mestre
        const isAdmin = userData?.role === 'ADMIN' || decodedToken.email === 'campobrancojw@gmail.com';

        if (!isAdmin) {
            console.warn('🚫 API: Acesso negado para', decodedToken.email);
            return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
        }

        // Busca todas as congregações ordenadas por nome
        console.log('📂 API: Buscando congregações no Firestore...');
        const snapshot = await adminDb.collection('congregations').orderBy('name', 'asc').get();

        const congregations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ API: ${congregations.length} congregações encontradas`);
        return NextResponse.json({ success: true, congregations });

    } catch (error: any) {
        console.error('💥 Congregations List API Error:', error);
        return NextResponse.json({ 
            error: 'Erro interno no servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        }, { status: 500 });
    }
}
