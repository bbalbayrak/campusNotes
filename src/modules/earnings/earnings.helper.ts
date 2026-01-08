export const calculateSplit = (
  price: number,
  plan: 'FREE' | 'PRO' | 'LEGEND',
) => {
  if (plan === 'PRO') {
    return {
      uploader: price * 0.85,
      platform: price * 0.15,
    };
  }

  if (plan === 'LEGEND') {
    return {
      uploader: price * 0.95,
      platform: price * 0.05,
    };
  }

  return {
    uploader: price * 0.6,
    platform: price * 0.4,
  };
};
