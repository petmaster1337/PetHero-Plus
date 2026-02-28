import { CHECKR_KEY, CHECKR_URL } from '@/config';
import axios from 'axios';
import { getHeroByUser, updateHero } from './hero.service';

const CHECKR_API_KEY = CHECKR_KEY
const CHECKR_API_BASE_URL = CHECKR_URL;

const checkrClient = axios.create({
  baseURL: CHECKR_API_BASE_URL,
  auth: {
    username: CHECKR_API_KEY,
    password: '',
  },
});

class BackgroundService {
  async createApplicant(applicantData: any, hero: any): Promise<any> {
    try {
      const response = await checkrClient.post('/candidates', applicantData);
      const answer = response.data;
      if (answer?.id) {
        const newHero = {...hero};
        newHero.bgCandidateId = answer.id;
        await updateHero(newHero._id, newHero);
      }
      return answer;
    } catch (error: any) {
      console.log('Error creating Checkr applicant:', error.response?.data ?? error.message);
      throw error;
    }
  }

  async getAvailablePackages() {
    const response = await checkrClient.get('/packages');
    return response.data;
  }

  async requestBackgroundCheck(data: { candidate_id: string; package: string, hero: any }): Promise<any> {
    try {
      const response = await checkrClient.post('/reports', data);
      const answer = response.data;
      if (answer?.id) {
        const newHero = {...data.hero};
        newHero.bgReportId = answer.id;
        await updateHero(newHero._id, newHero);
      }
      return response.data;
    } catch (error: any) {
      console.log('Error requesting Checkr background check:', error.response?.data ?? error.message);
      throw error;
    }
  }

  async getCheckStatus(reportId: string): Promise<any> {
    try {
      const response = await checkrClient.get(`/reports/${reportId}`);
      return response.data;
    } catch (error: any) {
      console.log('Error getting Checkr report status:', error.response?.data ?? error.message);
      throw error;
    }
  }

  async getCheckStatusReturn(reportId: string): Promise<boolean> {
    try {
      const report = await this.getCheckStatus(reportId);
      if (report.status === 'clear') return true;
      for (const check of report.checks ?? []) {
        if (check.result?.toLowerCase() === 'clear') {
          return true;
        }
      }
      return false;
    } catch (error: any) {
      console.log('Error in getCheckStatusReturn:', error.message);
      return false;
    }
  }
}

export default new BackgroundService();
