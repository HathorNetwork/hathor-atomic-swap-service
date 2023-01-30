export interface ICreateProposalRequest {
    partialTx: string;
    authPassword: string;
    expiresAt?: Date;
}

export interface ICreateProposalResponse {
    success: boolean;
    id: string;
}
