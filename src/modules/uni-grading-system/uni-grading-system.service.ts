import { Injectable } from '@nestjs/common';

export interface CourseInput {
  credit: number;
  gradePoint: number;
}

export interface GeneralGradingInput {
  vizeNote: number;
  vizeWeight: number;
  finalWeight: number;
  finalPassLimit?: number;
  // Bell Curve Parameters
  classAverage?: number;
  standardDeviation?: number;
  customTThresholds?: { [grade: string]: number };
  // Absolute System Parameters
  scoreThresholds?: { [grade: string]: number };
}

@Injectable()
export class GradingService {
  private readonly defaultTThresholds = {
    AA: 70,
    BA: 65,
    BB: 60,
    CB: 55,
    CC: 50,
    DC: 45,
    DD: 40,
  };
  private readonly defaultScoreThresholds = {
    AA: 90,
    BA: 80,
    BB: 70,
    CB: 60,
    CC: 50,
    DC: 45,
    DD: 40,
  };

  calculateQuickGPA(courses: CourseInput[]): number {
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    courses.forEach((course) => {
      totalWeightedPoints += course.credit * course.gradePoint;
      totalCredits += course.credit;
    });
    return totalCredits > 0
      ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2))
      : 0;
  }

  calculateFinalTargets(input: GeneralGradingInput) {
    if (
      input.classAverage !== undefined &&
      input.standardDeviation !== undefined
    ) {
      return this.calculateGeneralBellCurveTargets(input);
    }
    return this.calculateAbsoluteTargets(input);
  }

  private calculateAbsoluteTargets(input: GeneralGradingInput) {
    const thresholds = input.scoreThresholds || this.defaultScoreThresholds;
    const vizeContribution = (input.vizeNote * input.vizeWeight) / 100;

    return Object.entries(thresholds).map(([grade, minScore]) => {
      let neededFinal =
        (minScore - vizeContribution) / (input.finalWeight / 100);
      neededFinal = Math.ceil(neededFinal);

      let status = 'reachable';
      let message = '';
      const passLimit = input.finalPassLimit || 0;

      if (neededFinal > 100) {
        status = 'Impossible';
        message = "100 isn't enough.";
      } else if (neededFinal < passLimit) {
        neededFinal = passLimit;
        message = `Final threshold (${passLimit}) applied.`;
      }

      return {
        grade,
        neededFinal: status === 'Impossible' ? 'Impossible' : neededFinal,
        status,
        info: message,
        system: 'Absolute',
      };
    });
  }

  private calculateGeneralBellCurveTargets(input: GeneralGradingInput) {
    const tThresholds = input.customTThresholds || this.defaultTThresholds;
    const vizeContribution = (input.vizeNote * input.vizeWeight) / 100;

    return Object.entries(tThresholds).map(([grade, minT]) => {
      const neededRawTotal =
        ((minT - 50) / 10) * input.standardDeviation + input.classAverage;
      let neededFinal = Math.ceil(
        (neededRawTotal - vizeContribution) / (input.finalWeight / 100),
      );

      let status = 'reachable';
      let message = '';
      const passLimit = input.finalPassLimit || 0;

      if (neededFinal > 100) {
        status = 'Impossible';
        message = "100 isn't enough.";
      } else if (neededFinal < passLimit) {
        neededFinal = passLimit;
        message = `Final threshold (${passLimit}) applied.`;
      }

      const decimalPart = neededRawTotal - Math.floor(neededRawTotal);
      const roundedTotalScore =
        decimalPart <= 0.5
          ? Math.floor(neededRawTotal)
          : Math.ceil(neededRawTotal);

      return {
        grade,
        neededFinal: status === 'Impossible' ? 'Impossible' : neededFinal,
        neededTotalScore: roundedTotalScore,
        status,
        info: message,
        system: 'Bell Curve',
      };
    });
  }
}
