import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server/app';
import { encodeEmailMessage } from '../../server/services/gmailService';

describe('Backend API & Service - Gmail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('encodeEmailMessage helper', () => {
    it('should correctly encode recipient, subject, and body into Base64URL', () => {
      const encoded = encodeEmailMessage('test@example.com', 'Sujet test', 'Corps du message');
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
      // Verify no standard base64 characters like + or / or trailing =
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });
  });

  describe('POST /api/gmail/send', () => {
    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(app)
        .post('/api/gmail/send')
        .send({ to: 'client@test.fr', subject: 'Hello', body: 'Message' });

      expect(res.status).toBe(401);
      expect(res.body.isAuthError).toBe(true);
      expect(res.body.error).toContain("Jeton d'autorisation Gmail manquant");
    });

    it('should return 401 if Authorization header is not Bearer', async () => {
      const res = await request(app)
        .post('/api/gmail/send')
        .set('Authorization', 'Basic invalid')
        .send({ to: 'client@test.fr', subject: 'Hello', body: 'Message' });

      expect(res.status).toBe(401);
      expect(res.body.isAuthError).toBe(true);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/gmail/send')
        .set('Authorization', 'Bearer valid_token')
        .send({ to: 'client@test.fr' }); // missing subject & body

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Destinataire, objet et corps requis');
    });

    it('should return 200 with messageId when email sends successfully', async () => {
      // Mock fetch call to Google Gmail API
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'gmail_msg_12345' }),
      } as any);

      const res = await request(app)
        .post('/api/gmail/send')
        .set('Authorization', 'Bearer valid_token')
        .send({
          to: 'prospect@boutique.fr',
          subject: 'Proposition digitale',
          body: 'Bonjour...',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, messageId: 'gmail_msg_12345' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle expired Gmail token (401 from Google)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid Credentials' } }),
      } as any);

      const res = await request(app)
        .post('/api/gmail/send')
        .set('Authorization', 'Bearer expired_token')
        .send({
          to: 'prospect@boutique.fr',
          subject: 'Proposition digitale',
          body: 'Bonjour...',
        });

      expect(res.status).toBe(401);
      expect(res.body.isAuthError).toBe(true);
      expect(res.body.error).toBe('Invalid Credentials');
    });
  });

  describe('POST /api/gmail/draft', () => {
    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(app)
        .post('/api/gmail/draft')
        .send({ to: 'client@test.fr', subject: 'Hello', body: 'Draft' });

      expect(res.status).toBe(401);
      expect(res.body.isAuthError).toBe(true);
    });

    it('should return 200 with draftId on successful draft creation', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'draft_98765' }),
      } as any);

      const res = await request(app)
        .post('/api/gmail/draft')
        .set('Authorization', 'Bearer valid_token')
        .send({
          to: 'prospect@boutique.fr',
          subject: 'Brouillon',
          body: 'En cours...',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, draftId: 'draft_98765' });
    });
  });
});
