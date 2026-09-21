import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server/app';
import * as placesService from '../../server/services/placesService';
import * as geminiService from '../../server/services/geminiService';

describe('Backend API - /api/prospects', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/prospects/autocomplete', () => {
    it('should return empty suggestions when query is empty or less than 2 characters', async () => {
      const resEmpty = await request(app).get('/api/prospects/autocomplete');
      expect(resEmpty.status).toBe(200);
      expect(resEmpty.body).toEqual({ suggestions: [] });

      const resShort = await request(app).get('/api/prospects/autocomplete?q=P');
      expect(resShort.status).toBe(200);
      expect(resShort.body).toEqual({ suggestions: [] });
    });

    it('should return suggestions for valid query', async () => {
      vi.spyOn(placesService, 'autocompleteCityNew').mockResolvedValueOnce([
        { text: 'Lyon, France', mainText: 'Lyon', secondaryText: 'France', placeId: 'place_1' },
        { text: 'Lyon 01, France', mainText: 'Lyon 01', secondaryText: 'France', placeId: 'place_2' },
      ]);

      const res = await request(app).get('/api/prospects/autocomplete?q=Lyon');
      expect(res.status).toBe(200);
      expect(res.body.suggestions).toHaveLength(2);
      expect(res.body.suggestions[0].mainText).toBe('Lyon');
    });

    it('should handle service errors with 500 status', async () => {
      vi.spyOn(placesService, 'autocompleteCityNew').mockRejectedValueOnce(
        new Error('Google Places API quota exceeded')
      );

      const res = await request(app).get('/api/prospects/autocomplete?q=Lyon');
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Google Places API quota exceeded');
    });
  });

  describe('POST /api/prospects/search', () => {
    it('should return 400 when sector or city is missing', async () => {
      const resNoCity = await request(app)
        .post('/api/prospects/search')
        .send({ sector: 'Boulangerie' });
      expect(resNoCity.status).toBe(400);
      expect(resNoCity.body.error).toBe('Secteur et ville requis');

      const resNoSector = await request(app)
        .post('/api/prospects/search')
        .send({ city: 'Paris' });
      expect(resNoSector.status).toBe(400);
    });

    it('should return prospects list on valid search', async () => {
      const mockResult = {
        prospects: [
          {
            id: 'p_mock_1',
            name: 'Boulangerie Artisanale',
            activity: 'Boulangerie',
            location: 'Paris 11',
            status: 'searched',
            keyAngle: 'Refonte site vitrine',
          },
        ],
        searchQuery: { sector: 'Boulangerie', city: 'Paris' },
      };

      vi.spyOn(geminiService, 'searchLocalProspects').mockResolvedValueOnce(mockResult as any);

      const res = await request(app)
        .post('/api/prospects/search')
        .send({ sector: 'Boulangerie', city: 'Paris', forceRefresh: false });

      expect(res.status).toBe(200);
      expect(res.body.prospects).toHaveLength(1);
      expect(res.body.prospects[0].name).toBe('Boulangerie Artisanale');
      expect(res.body.prospects[0].status).toBe('searched');
    });

    it('should handle search errors with 500 status', async () => {
      vi.spyOn(geminiService, 'searchLocalProspects').mockRejectedValueOnce(
        new Error('Erreur réseau service IA')
      );

      const res = await request(app)
        .post('/api/prospects/search')
        .send({ sector: 'Boulangerie', city: 'Paris' });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Erreur réseau service IA');
    });
  });

  describe('POST /api/prospects/generate-email', () => {
    it('should return 400 if prospect is missing', async () => {
      const res = await request(app)
        .post('/api/prospects/generate-email')
        .send({ tone: 'Direct' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Prospect requis');
    });

    it('should return generated email subject and body on success', async () => {
      const mockEmail = {
        subject: 'Idée pour moderniser votre présence en ligne',
        body: 'Bonjour, je vous propose un audit gratuit...',
      };

      vi.spyOn(geminiService, 'generateProspectEmail').mockResolvedValueOnce(mockEmail as any);

      const res = await request(app)
        .post('/api/prospects/generate-email')
        .send({
          prospect: { name: 'Restaurant du Parc', activity: 'Restaurant' },
          tone: 'Chaleureux & Professionnel',
          objective: 'Audit gratuit 15 min',
        });

      expect(res.status).toBe(200);
      expect(res.body.subject).toBe(mockEmail.subject);
      expect(res.body.body).toBe(mockEmail.body);
    });

    it('should handle generation error with 500 status', async () => {
      vi.spyOn(geminiService, 'generateProspectEmail').mockRejectedValueOnce(
        new Error('Gemini quota limit')
      );

      const res = await request(app)
        .post('/api/prospects/generate-email')
        .send({
          prospect: { name: 'Test' },
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Gemini quota limit');
    });
  });
});
