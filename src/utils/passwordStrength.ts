export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
  crackTime: {
    value: number;
    formatted: string;
    scenarios: {
      online: string;
      offline_slow: string;
      offline_fast: string;
      quantum: string;
    };
  };
}

const formatCrackTime = (timeInSeconds: number): string => {
  if (timeInSeconds === Infinity || timeInSeconds > 1e20) return '无法在合理时间内破解';

  const years = Math.floor(timeInSeconds / (60 * 60 * 24 * 365));
  const months = Math.floor((timeInSeconds % (60 * 60 * 24 * 365)) / (60 * 60 * 24 * 30));
  const days = Math.floor((timeInSeconds % (60 * 60 * 24 * 30)) / (60 * 60 * 24));
  const hours = Math.floor((timeInSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((timeInSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (years >= 1000) {
    const millennia = Math.floor(years / 1000);
    if (millennia >= 1000000) return '数百万年以上';
    if (millennia >= 1000) return `${Math.floor(millennia / 1000)}千年以上`;
    return `${millennia}千年以上`;
  }

  if (years >= 100) return `${Math.floor(years / 100)}百年以上`;
  if (years >= 10) return `${years}年以上`;
  if (years > 0) return `约${years}年${months > 0 ? `${months}个月` : ''}`;
  if (months > 0) return `约${months}个月${days > 0 ? `${days}天` : ''}`;
  if (days > 0) return `约${days}天${hours > 0 ? `${hours}小时` : ''}`;
  if (hours > 0) return `约${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}`;
  if (minutes > 0) return `约${minutes}分钟`;
  if (seconds >= 30) return '不到1分钟';
  if (seconds > 0) return '几秒钟';
  return '瞬间';
};

// 常见密码和模式
const commonPatterns = [
  /^123456+$/,
  /^password$/i,
  /^qwerty/i,
  /^abc123/i,
  /^111111+$/,
  /^[0-9]+$/,      // 纯数字
  /^[a-zA-Z]+$/,   // 纯字母
];

const calculateCrackTime = (password: string): PasswordStrength['crackTime'] => {
  const defaultUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const defaultNumbers = '0123456789';
  const defaultSymbols = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

  if (commonPatterns.some(pattern => pattern.test(password))) {
    return {
      value: 0,
      formatted: '瞬间',
      scenarios: {
        online: '瞬间',
        offline_slow: '瞬间',
        offline_fast: '瞬间',
        quantum: '瞬间',
      },
    };
  }

  let availableCharset = 'abcdefghijklmnopqrstuvwxyz';
  const length = password.length;

  if (/[A-Z]/.test(password)) availableCharset += defaultUppercase;
  if (/\d/.test(password)) availableCharset += defaultNumbers;
  if (/[^a-zA-Z0-9]/.test(password)) availableCharset += defaultSymbols;

  const charsetSize = availableCharset.length;

  const scenarios = {
    online: 100,        // 在线攻击（每秒100次）
    offline_slow: 1e4,  // 慢速离线攻击（每秒1万次）
    offline_fast: 1e10, // 快速离线攻击（每秒100亿次）
    quantum: 1e14,      // 量子计算机（每秒10万亿次）
  };

  const totalCombinations = Math.pow(charsetSize, length);

  const timeInSeconds = {
    online: totalCombinations / scenarios.online,
    offline_slow: totalCombinations / scenarios.offline_slow,
    offline_fast: totalCombinations / scenarios.offline_fast,
    quantum: totalCombinations / scenarios.quantum,
  };

  if (timeInSeconds.quantum === Infinity || timeInSeconds.quantum > 1e20) {
    return {
      value: Infinity,
      formatted: '数百万年以上',
      scenarios: {
        online: '数百万年以上',
        offline_slow: '数百万年以上',
        offline_fast: '数百万年以上',
        quantum: '数百万年以上',
      },
    };
  }

  return {
    value: timeInSeconds.offline_fast,
    formatted: formatCrackTime(timeInSeconds.offline_fast),
    scenarios: {
      online: formatCrackTime(timeInSeconds.online),
      offline_slow: formatCrackTime(timeInSeconds.offline_slow),
      offline_fast: formatCrackTime(timeInSeconds.offline_fast),
      quantum: formatCrackTime(timeInSeconds.quantum),
    },
  };
};

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      level: 'weak',
      feedback: ['请输入密码'],
      crackTime: calculateCrackTime(''),
    };
  }

  // 基础长度检查
  if (password.length < 8) {
    feedback.push('密码长度太短（建议12位以上）');
    score -= 20;
  } else if (password.length >= 12) {
    score += 20;
  }

  // 字符多样性检查
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/.test(password);

  if (hasLowercase) score += 10;
  if (hasUppercase) score += 15;
  if (hasNumbers) score += 15;
  if (hasSymbols) score += 20;

  // 长度奖励（要求足够复杂度）
  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  if (varietyCount >= 3) {
    score += Math.min(20, Math.max(0, password.length - 8) * 2);
  }

  // 反馈建议
  if (!hasLowercase) feedback.push('建议包含小写字母');
  if (!hasUppercase) feedback.push('建议包含大写字母');
  if (!hasNumbers) feedback.push('建议包含数字');
  if (!hasSymbols) feedback.push('建议包含特殊字符');

  // 重复字符
  if (/(.)\1{2,}/.test(password)) {
    score -= 20;
    feedback.push('避免使用重复字符（如：aaa）');
  }

  // 连续字符
  if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    score -= 20;
    feedback.push('避免使用连续字符（如：abc、123）');
  }

  // 键盘模式
  if (/(qwer|asdf|zxcv|wasd)/i.test(password)) {
    score -= 15;
    feedback.push('避免使用键盘上连续的字符');
  }

  // 常见密码模式
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 30;
    feedback.push('密码过于简单或使用了常见密码模式');
  }

  // 确定等级
  let level: PasswordStrength['level'] = 'weak';
  if (score >= 80) level = 'very-strong';
  else if (score >= 60) level = 'strong';
  else if (score >= 40) level = 'medium';

  score = Math.max(0, Math.min(100, score));

  const crackTime = calculateCrackTime(password);

  return {score, level, feedback, crackTime};
};
