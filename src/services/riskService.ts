import { SafetyScoreData, SafeRouteOption } from '../types';
import { incidentService } from './incidentService';

class RiskService {
  /**
   * Transparent Rule-based Area Safety Score Calculation
   * Range 0 - 100
   * 70 - 100: SAFE (Green)
   * 40 - 69: MODERATE (Yellow/Orange)
   * 0 - 39: HIGH RISK (Red)
   */
  public calculateAreaSafetyScore(): SafetyScoreData {
    const incidents = incidentService.getAllIncidents();
    let baseScore = 95;
    const reasons: string[] = [];

    // 1. Incident Penalty
    let incidentPenalty = 0;
    incidents.forEach((inc) => {
      switch (inc.severity) {
        case 'CRITICAL':
          incidentPenalty += 25;
          reasons.push(`Critical incident: ${inc.title}`);
          break;
        case 'HIGH':
          incidentPenalty += 16;
          reasons.push(`High severity: ${inc.title}`);
          break;
        case 'MEDIUM':
          incidentPenalty += 10;
          break;
        case 'LOW':
          incidentPenalty += 4;
          break;
      }
    });

    if (incidents.length > 0) {
      reasons.push(`${incidents.length} active incident reports in this sector`);
    }

    // 2. Time-of-day penalty
    const currentHour = new Date().getHours();
    let timeContext = 'Daytime daylight';
    let lightingCondition = 'Natural Daylight';

    if (currentHour >= 21 || currentHour < 5) {
      baseScore -= 18;
      timeContext = 'Late Night (Post 9 PM)';
      lightingCondition = 'Reduced visibility & sparse foot traffic';
      reasons.push('Low ambient lighting & isolated pedestrian walkways after 9 PM');
    } else if (currentHour >= 18) {
      baseScore -= 8;
      timeContext = 'Dusk / Evening';
      lightingCondition = 'Artificial street lighting';
    }

    // 3. Flood & Weather factor
    const hasFloodOrDisaster = incidents.some((i) => i.type === 'Flood' || i.type === 'Fire');
    let weatherAdvisory: string | undefined;
    if (hasFloodOrDisaster) {
      baseScore -= 15;
      weatherAdvisory = 'Active weather waterlogging / flash-flood warning in low-lying routes';
      reasons.push(weatherAdvisory);
    }

    const calculatedScore = Math.max(15, Math.min(100, baseScore - incidentPenalty));

    let riskLevel: 'SAFE' | 'MODERATE' | 'HIGH RISK' = 'SAFE';
    let color = '#3A7D5C'; // Green

    if (calculatedScore < 40) {
      riskLevel = 'HIGH RISK';
      color = '#C0392B'; // Red
    } else if (calculatedScore < 70) {
      riskLevel = 'MODERATE';
      color = '#E8743B'; // Orange
    }

    return {
      score: calculatedScore,
      riskLevel,
      color,
      reasons: reasons.slice(0, 4),
      nearbyIncidentsCount: incidents.length,
      lightingCondition,
      timeContext,
      weatherAdvisory
    };
  }

  /**
   * Safe Route Recommendation Logic
   * Compares Fastest Route vs Safer Route
   */
  public getSafeRouteOptions(userLat: number, userLng: number): {
    fastest: SafeRouteOption;
    safer: SafeRouteOption;
    recommendationNotice: string;
  } {
    // Offset paths for visualization
    const fastestPath: [number, number][] = [
      [userLat, userLng],
      [userLat + 0.003, userLng + 0.002],
      [userLat + 0.006, userLng + 0.001], // passes through incident zone
      [userLat + 0.009, userLng + 0.005],
      [userLat + 0.012, userLng + 0.006]
    ];

    const saferPath: [number, number][] = [
      [userLat, userLng],
      [userLat + 0.001, userLng + 0.004],
      [userLat + 0.005, userLng + 0.008], // uses wide illuminated commercial avenue
      [userLat + 0.009, userLng + 0.009],
      [userLat + 0.012, userLng + 0.006]
    ];

    const fastest: SafeRouteOption = {
      id: 'fastest',
      name: 'Fastest Route (Direct Cut)',
      durationMinutes: 18,
      distanceKm: 3.2,
      riskLevel: 'HIGH',
      path: fastestPath,
      incidentZonesAvoided: 0,
      recommendation: 'Passes through 2 unlit alleys and active waterlogging zone.',
      isRecommended: false,
      lightingQuality: 'Poorly Lit',
      patrolledArea: false
    };

    const safer: SafeRouteOption = {
      id: 'safer',
      name: 'LOCURA Safer Route (Recommended)',
      durationMinutes: 23,
      distanceKm: 4.1,
      riskLevel: 'LOW',
      path: saferPath,
      incidentZonesAvoided: 2,
      recommendation: 'Recommended: Well-lit commercial avenue, 24/7 CCTV surveillance, and verified volunteer shelter along route.',
      isRecommended: true,
      lightingQuality: 'Well Lit',
      patrolledArea: true
    };

    return {
      fastest,
      safer,
      recommendationNotice: 'Safer route recommended: only 5 mins longer, but avoids 2 reported hazard zones and stays on well-lit main roads.'
    };
  }
}

export const riskService = new RiskService();
