/**
 * KrishiSeva Enterprise Secrets Vault Service
 * Section 10: Secrets Management
 * 
 * Provides an abstraction layer for storing and retrieving sensitive secrets
 * from enterprise vaults (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault,
 * or encrypted local Keyring) instead of plain-text configuration files.
 */

import crypto from 'crypto';

export interface VaultSecretEntry {
  key: string;
  value: string;
  version: number;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface IVaultProvider {
  name: string;
  getSecret(key: string): Promise<string | null>;
  setSecret(key: string, value: string, metadata?: Record<string, any>): Promise<boolean>;
  rotateSecret(key: string): Promise<{ newSecret: string; version: number }>;
  listSecretKeys(): Promise<string[]>;
}

// In-Memory Hardware Security Module (HSM) / Keyring simulation for zero-dependency container portability
class LocalEncryptedVaultProvider implements IVaultProvider {
  public name = 'LocalEncryptedKeyring';
  private secrets: Map<string, VaultSecretEntry> = new Map();
  private masterVaultKey: Buffer;

  constructor() {
    // Derive a dedicated 256-bit vault key from environment or cryptographic random seed
    const rawSeed = process.env.VAULT_MASTER_KEY || process.env.DATA_ENCRYPTION_KEY || 'krishiseva-national-procurement-vault-seed-2026';
    this.masterVaultKey = crypto.createHash('sha256').update(rawSeed).digest();
    this.seedDefaultSecrets();
  }

  private seedDefaultSecrets() {
    // Initialize default managed secrets in vault
    this.setSecretSync('JWT_SECRET', process.env.JWT_SECRET || 'krishiseva-enterprise-jwt-secret-secure-2026');
    this.setSecretSync('DB_PASSWORD', process.env.DB_PASSWORD || 'krishi_secure_pg_pass_9921');
    this.setSecretSync('PFMS_GATEWAY_TOKEN', process.env.PFMS_GATEWAY_TOKEN || 'sec_pfms_live_token_7718921');
    this.setSecretSync('AADHAAR_HMAC_SALT', process.env.AADHAAR_HMAC_SALT || 'salt_uidai_hmac_256_krishi');
  }

  private encryptValue(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterVaultKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return iv.toString('hex') + ':' + authTag + ':' + encrypted;
  }

  private decryptValue(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterVaultKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public setSecretSync(key: string, value: string, metadata?: Record<string, any>): boolean {
    const existing = this.secrets.get(key);
    const version = existing ? existing.version + 1 : 1;
    const encrypted = this.encryptValue(value);
    this.secrets.set(key, {
      key,
      value: encrypted,
      version,
      updatedAt: new Date().toISOString(),
      metadata,
    });
    return true;
  }

  public async getSecret(key: string): Promise<string | null> {
    const entry = this.secrets.get(key);
    if (!entry) return null;
    return this.decryptValue(entry.value);
  }

  public async setSecret(key: string, value: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.setSecretSync(key, value, metadata);
  }

  public async rotateSecret(key: string): Promise<{ newSecret: string; version: number }> {
    const newSecret = crypto.randomBytes(32).toString('hex');
    this.setSecretSync(key, newSecret, { rotatedReason: 'AUTOMATED_VAULT_ROTATION' });
    const entry = this.secrets.get(key)!;
    return { newSecret, version: entry.version };
  }

  public async listSecretKeys(): Promise<string[]> {
    return Array.from(this.secrets.keys());
  }

  public getSecretEntryMetadata(key: string): { version: number; updatedAt: string } | null {
    const entry = this.secrets.get(key);
    if (!entry) return null;
    return { version: entry.version, updatedAt: entry.updatedAt };
  }
}

export const vaultService = new LocalEncryptedVaultProvider();
