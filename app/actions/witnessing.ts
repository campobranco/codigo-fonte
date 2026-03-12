// app/actions/witnessing.ts
// Ações do servidor para gestão de pontos de testemunho público (Carrinhos)
// Migrado de Supabase para Firebase Firestore (Admin SDK)

import { adminDb, FieldValue } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';

const TABLE = 'witnessing_points';

/**
 * Busca pontos de testemunho de uma cidade
 */
export async function getWitnessingPoints(cityId: string) {
    try {
        await requireAuth();

        // Tenta buscar pelo campo novo (camelCase)
        let snapshot = await adminDb.collection(TABLE)
            .where('cityId', '==', cityId)
            .get();

        if (snapshot.empty) {
            // Retrocompatibilidade: busca por city_id se cityId falhar
            snapshot = await adminDb.collection(TABLE)
                .where('city_id', '==', cityId)
                .get();
        }

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordenação manual para evitar necessidade de índices compostos inicialmente
        data.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        return { success: true, data }
    } catch (error: any) {
        console.error('Error fetching witnessing points:', error)
        return { success: false, error: error.message || 'Failed to fetch points' }
    }
}

/**
 * Cria um novo ponto de testemunho
 */
export async function createWitnessingPoint(data: {
    name: string;
    address: string;
    cityId: string;
    latitude: number;
    longitude: number;
    schedule: string;
}) {
    try {
        const user = await requireAuth(['SERVO', 'ANCIAO']);

        // Verificação de segurança: Cidade deve pertencer à congregação do usuário
        if (user.role !== 'ADMIN') {
            const cityDoc = await adminDb.collection('cities').doc(data.cityId).get();
            const city = cityDoc.data();

            if (!cityDoc.exists || !city || (city.congregationId !== user.congregationId && city.congregation_id !== user.congregationId)) {
                throw new Error('Acesso negado à cidade especificada.');
            }
        }

        const pointData = {
            name: data.name,
            address: data.address,
            cityId: data.cityId,
            lat: data.latitude,
            lng: data.longitude,
            schedule: data.schedule,
            status: 'AVAILABLE',
            congregationId: user.congregationId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        const docRef = await adminDb.collection(TABLE).add(pointData);

        revalidatePath(`/witnessing`)
        return { success: true, id: docRef.id }
    } catch (error: any) {
        console.error('Error creating witnessing point:', error)
        return { success: false, error: error.message || 'Failed to create point' }
    }
}

/**
 * Busca um ponto pelo ID
 */
export async function getWitnessingPointById(id: string) {
    try {
        await requireAuth();
        const doc = await adminDb.collection(TABLE).doc(id).get();

        if (!doc.exists) throw new Error('Ponto não encontrado.');

        return { success: true, data: { id: doc.id, ...doc.data() } }
    } catch (error: any) {
        console.error('Error fetching point:', error)
        return { success: false, error: error.message || 'Failed to fetch point' }
    }
}

/**
 * Atualiza detalhes de localização/nome do ponto
 */
export async function updateWitnessingPointDetails(id: string, data: {
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    schedule: string;
}) {
    try {
        const user = await requireAuth(['SERVO', 'ANCIAO']);

        const pointDoc = await adminDb.collection(TABLE).doc(id).get();
        const point = pointDoc.data();

        if (!pointDoc.exists || !point) throw new Error('Ponto não encontrado.');

        // Verificação de segurança: Ponto deve pertencer à congregação do usuário
        const congId = point.congregationId || point.congregation_id;
        if (user.role !== 'ADMIN' && congId !== user.congregationId) {
            throw new Error('Acesso negado.');
        }

        await adminDb.collection(TABLE).doc(id).update({
            name: data.name,
            address: data.address,
            lng: data.longitude,
            lat: data.latitude,
            schedule: data.schedule,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath(`/witnessing`)
        return { success: true }
    } catch (error: any) {
        console.error('Error updating point details:', error)
        return { success: false, error: error.message || 'Failed to update point' }
    }
}

/**
 * Atualiza status (ocupado/vago) e publicadores no carrinho
 */
export async function updateWitnessingPointStatus(id: string, status: string, publishersAsString: string | null) {
    try {
        const user = await requireAuth();

        const pointDoc = await adminDb.collection(TABLE).doc(id).get();
        const point = pointDoc.data();

        if (!pointDoc.exists || !point) throw new Error('Ponto não encontrado.');

        // Garante que o ponto pertence à congregação do usuário
        const congId = point.congregationId || point.congregation_id;
        if (user.role !== 'ADMIN' && congId !== user.congregationId) {
            throw new Error('Acesso negado.');
        }

        await adminDb.collection(TABLE).doc(id).update({
            status,
            currentPublishers: publishersAsString ? [publishersAsString] : [],
            updatedAt: FieldValue.serverTimestamp()
        });

        revalidatePath(`/witnessing`)
        return { success: true }
    } catch (error: any) {
        console.error('Error updating witnessing point status:', error)
        return { success: false, error: error.message || 'Failed to update status' }
    }
}

/**
 * Remove um ponto de testemunho
 */
export async function deleteWitnessingPoint(id: string) {
    try {
        const user = await requireAuth(['SERVO', 'ANCIAO']);

        const pointDoc = await adminDb.collection(TABLE).doc(id).get();
        const point = pointDoc.data();

        if (!pointDoc.exists || !point) throw new Error('Ponto não encontrado.');

        const congId = point.congregationId || point.congregation_id;
        if (user.role !== 'ADMIN' && congId !== user.congregationId) {
            throw new Error('Acesso negado.');
        }

        await adminDb.collection(TABLE).doc(id).delete();

        revalidatePath(`/witnessing`)
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting witnessing point:', error)
        return { success: false, error: error.message || 'Failed to delete point' }
    }
}
