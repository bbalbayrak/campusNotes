export function getSignedUrlDuration(planCode: string): number {
  switch (planCode) {
    case 'LEGEND':
      return 1800; // 30 min
    case 'PRO':
      return 900; // 15 min
    default:
      return 300; // 5 min / free
  }
}
