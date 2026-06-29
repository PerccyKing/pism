export interface QRCodeConfig {
  /** 小程序码图片路径（相对于 /img/mini_app_code/） */
  image: string;
  /** 提示文字 */
  label?: string;
}

/** 全局默认小程序码 */
export const defaultQRCode: QRCodeConfig = {
  image: 'index.jpg',
  label: '手机微信扫码，体验 PISM 小程序',
};

/**
 * 按工具 ID 配置的独立小程序码
 * key 对应工具的 docId（即 sidebars.ts 或 index.config.ts 中的 id）
 * 后续新增工具二维码只需在此添加一行配置
 */
export const toolQRCodes: Record<string, QRCodeConfig> = {
  uuid: {image: 'uuid.png', label: '扫码体验 UUID 生成器小程序'},
  // nanoid: {image: 'nanoid.png', label: '扫码体验 NanoID 生成器小程序'},
  // snowflakeId: {image: 'snowflake.png', label: '扫码体验雪花ID小程序'},
  // password: {image: 'password.png', label: '扫码体验密码生成器小程序'},
  // md5: {image: 'md5.png', label: '扫码体验 MD5 小程序'},
  // sha: {image: 'sha.png', label: '扫码体验 SHA 小程序'},
  // digest: {image: 'digest.png', label: '扫码体验摘要算法小程序'},
};

/**
 * 根据工具 ID 获取二维码配置
 */
export function getQRCodeForTool(toolId?: string): QRCodeConfig {
  if (toolId && toolQRCodes[toolId]) {
    return toolQRCodes[toolId];
  }
  return defaultQRCode;
}
