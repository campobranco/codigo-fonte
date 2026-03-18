# RIPD - Campo Branco
## Relatório de Impacto à Proteção de Dados (DPIA)

**Data de Emissão:** 16 de Março de 2026
**Responsável:** Encarregado de Proteção de Dados (DPO)
**Status:** ATUALIZADO (Conforme recomendações do Relatório de 16/03/2026)

---

## 1. Descrição do Tratamento de Dados
O Campo Branco realiza o tratamento de dados pessoais para fins pastorais e organizacionais de congregações religiosas.

### 1.1. Tipos de Dados Tratados
- **Dados Comuns:** Nome (opcional), Endereço (logradouro, geolocalização), Gênero (opcional).
- **Dados Sensíveis:** Condições de saúde (surdez, neurodivergência), Idade (identificação de menores).
- **Dados de Sistema:** Nome, E-mail, logs de acesso e autenticação.

### 1.2. Finalidade do Tratamento
- Organização eficiente do trabalho de visitação pública e pastoral.
- Prevenção de abordagens inoportunas ou repetitivas.
- Planejamento de acessibilidade para surdos e pessoas com necessidades especiais.
- Proteção e orientação adequada no contato com menores de idade.

---

## 2. Avaliação de Necessidade e Proporcionalidade
O tratamento é considerado legítimo e proporcional às finalidades religiosas declaradas.

- **Minimização:** Apenas os dados estritamente necessários para a abordagem pastoral são coletados.
- **Transparência:** Política de Privacidade e Termos de Uso acessíveis no aplicativo.
- **Base Legal:** Interesse Legítimo (Art. 7, IX) e Exercício Regular de Atividade Religiosa (Art. 7, II).

---

## 3. Medidas de Segurança e Mitigação de Riscos

### 3.1. Isolamento de Dados
Utilizamos o conceito de **Tenancy Isolation** por congregação no Firestore. Usuários de uma congregação não conseguem visualizar ou acessar dados de outras congregações sob nenhuma circunstância (validado via Firestore Rules).

### 3.2. Criptografia
- **Em trânsito:** Uso obrigatório de HTTPS/TLS 1.2+.
- **Em repouso:** Criptografia nativa da infraestrutura Google Cloud/Firebase.

### 3.3. Controle de Acesso (RBAC)
O acesso é restrito por papéis (ADMIN, EDITOR, VIEWER), garantindo que apenas pessoas autorizadas manipulem dados sensíveis.

---

## 4. Análise de Riscos e Plano de Ação

| Risco Identificado | Nível | Medida de Mitigação | Status |
|--------------------|-------|---------------------|---------|
| Vazamento entre congregações | Baixo | Regras de segurança estritas e auditoria de código | ✅ Implementado |
| Acesso não autorizado | Médio | Autenticação Firebase com tokens JWT e expiração curta | ✅ Implementado |
| Falta de rastreabilidade | Baixo | Implementação do LGPDRegistry para logs de conformidade | ✅ Implementado |
| Prazo de resposta LGPD | Médio | Centralização de solicitações via APIs dedicadas | ✅ Implementado |

---

## 5. Conclusão do DPO
O sistema Campo Branco apresenta um estado robusto de conformidade com a LGPD. As medidas técnicas implementadas em Março/2026 (APIs de acesso/exclusão e registro de logs) elevam o nível de proteção e garantem o exercício pleno dos direitos dos titulares.

**Aprovação:**
*Encarregado de Proteção de Dados (DPO) - Campo Branco*
