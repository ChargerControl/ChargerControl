// Serviço para acessar os endpoints de saúde do sistema
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

class HealthService {
    // Busca dados do dashboard da API personalizada
    async getDashboardData() {
        try {
            const response = await axios.get(`${API_URL}/api/health/dashboard`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            throw error;
        }
    }

    // Busca dados do Actuator Health
    async getActuatorHealth() {
        try {
            const response = await axios.get(`${API_URL}/actuator/health`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar dados do Actuator Health:', error);
            throw error;
        }
    }

    // Busca métricas específicas do Prometheus
    async getMetric(metricName) {
        try {
            const response = await axios.get(`${API_URL}/actuator/metrics/${metricName}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar métrica ${metricName}:`, error);
            throw error;
        }
    }
}

export default new HealthService();
