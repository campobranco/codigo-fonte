import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * LGPDRegistry - Classe responsável por registrar atividades relacionadas à LGPD.
 * Garante a rastreabilidade de acessos e exclusões de dados para fins de conformidade.
 */
export class LGPDRegistry {
    /**
     * Registra um acesso ou solicitação de dados de um titular.
     * @param userId ID do usuário que realizou o acesso
     * @param dataType Categoria de dados acessados
     * @param purpose Finalidade do acesso (ex: "Solicitação de Acesso", "Auditoria")
     */
    static async logDataAccess(userId: string, dataType: string, purpose: string) {
        try {
            await addDoc(collection(db, 'lgpd_logs'), {
                action: 'DATA_ACCESS',
                userId,
                dataType,
                purpose,
                timestamp: serverTimestamp(),
                category: 'COMPLIANCE'
            });
            console.log(`[LGPD] Acesso a dados registrado: ${dataType} para ${userId}`);
        } catch (error) {
            console.error('[LGPD] Erro ao registrar acesso a dados:', error);
        }
    }

    /**
     * Registra a exclusão de dados pessoais.
     * @param userId ID do usuário titular dos dados (ou responsável pela ação)
     * @param dataType Categoria de dados excluídos
     * @param reason Motivo da exclusão (ex: "Solicitação do Titular", "Dados Desnecessários")
     */
    static async logDataDeletion(userId: string, dataType: string, reason: string) {
        try {
            await addDoc(collection(db, 'lgpd_logs'), {
                action: 'DATA_DELETION',
                userId,
                dataType,
                reason,
                timestamp: serverTimestamp(),
                category: 'COMPLIANCE'
            });
            console.log(`[LGPD] Exclusão de dados registrada: ${dataType} para ${userId}`);
        } catch (error) {
            console.error('[LGPD] Erro ao registrar exclusão de dados:', error);
        }
    }

    /**
     * Registra uma solicitação formal via canal LGPD.
     * @param requestType Tipo de solicitação (ACESSO, CORREÇÃO, EXCLUSÃO)
     * @param applicantEmail E-mail do solicitante
     * @param details Detalhes adicionais da solicitação
     */
    static async logFormalRequest(requestType: string, applicantEmail: string, details: string) {
        try {
            await addDoc(collection(db, 'lgpd_requests'), {
                type: requestType,
                email: applicantEmail,
                details,
                status: 'RECEIVED',
                receivedAt: serverTimestamp(),
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // Prazo de 15 dias conforme Art. 18
            });
            console.log(`[LGPD] Solicitação formal registrada: ${requestType} de ${applicantEmail}`);
        } catch (error) {
            console.error('[LGPD] Erro ao registrar solicitação formal:', error);
        }
    }
}
