// app/api/cities/delete/route.ts
// API para exclusão de cidades no Firestore
// Migrado de Supabase para Firebase Admin SDK

import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        console.log('[CITIES_DELETE] Iniciando requisição...');
        
        // Verifica autenticação e permissões (Ancião ou de maior nível)
        const user = await requireAuth(req, ['ANCIAO', 'SERVO', 'ADMIN']);
        console.log('[CITIES_DELETE] Usuário autenticado:', { uid: user.uid, role: user.role, congregationId: user.congregationId });

        const body = await req.json();
        const { id } = body;
        console.log('[CITIES_DELETE] ID recebido:', id);

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
        }

        // Busca a cidade alvo para verificar congregação
        const cityRef = adminDb.collection('cities').doc(id);
        const cityDoc = await cityRef.get();
        console.log('[CITIES_DELETE] Documento da cidade encontrado:', cityDoc.exists);

        if (!cityDoc.exists) {
            return NextResponse.json({ error: 'Registro não encontrado.' }, { status: 404 });
        }

        const cityData = cityDoc.data();
        console.log('[CITIES_DELETE] Dados da cidade:', { congregationId: cityData?.congregationId });

        // Se for Ancião/Servo, só pode deletar da própria congregação
        if (user.role !== 'ADMIN' && cityData?.congregationId !== user.congregationId) {
            console.log('[CITIES_DELETE] Permissão negada: usuário não pode deletar cidade de outra congregação');
            return NextResponse.json({ error: 'Você só pode excluir itens da sua congregação.' }, { status: 403 });
        }

        // 1. Buscar e excluir todos os territórios vinculados à cidade
        const territoriesRef = adminDb.collection('territories');
        const terrSnap1 = await territoriesRef.where('cityId', '==', id).get();
        const terrSnap2 = await territoriesRef.where('city_id', '==', id).get();
        
        const allTerrDocs = [...terrSnap1.docs, ...terrSnap2.docs];
        console.log(`[CITIES_DELETE] Encontrados ${allTerrDocs.length} territórios vinculados`);

        // Para cada território, excluir seus endereços e visitas
        for (const territoryDoc of allTerrDocs) {
            const territoryId = territoryDoc.id;
            
            // 2. Excluir endereços do território
            const addressesRef = adminDb.collection('addresses');
            const addrSnap1 = await addressesRef.where('territoryId', '==', territoryId).get();
            const addrSnap2 = await addressesRef.where('territory_id', '==', territoryId).get();
            
            const allAddrDocs = [...addrSnap1.docs, ...addrSnap2.docs];
            console.log(`[CITIES_DELETE] Território ${territoryId}: ${allAddrDocs.length} endereços encontrados`);

            // 3. Excluir visitas de cada endereço
            for (const addressDoc of allAddrDocs) {
                const addressId = addressDoc.id;
                
                // Buscar visitas vinculadas ao endereço (subcoleção)
                const visitsSnap = await adminDb.collection('addresses').doc(addressId).collection('visits').get();
                
                if (!visitsSnap.empty) {
                    // Excluir visitas em batch
                    const visitBatch = adminDb.batch();
                    visitsSnap.docs.forEach(visitDoc => {
                        visitBatch.delete(visitDoc.ref);
                    });
                    await visitBatch.commit();
                    console.log(`[CITIES_DELETE] Endereço ${addressId}: ${visitsSnap.size} visitas excluídas`);
                }
                
                // Excluir o endereço
                await addressDoc.ref.delete();
            }
            
            // Excluir o território
            await territoryDoc.ref.delete();
            console.log(`[CITIES_DELETE] Território ${territoryId} excluído com sucesso`);
        }

        // 4. Finalmente exclui a cidade
        await cityRef.delete();
        console.log('[CITIES_DELETE] Cidade excluída com sucesso');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[CITIES_DELETE] Erro detalhado:', error);
        
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        if (error.message === 'Forbidden') return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });

        console.error('[CITIES_DELETE] API Critical Error:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
