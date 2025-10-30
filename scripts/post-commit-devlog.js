import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// args: [node, script, msg, diff]
const [, , rawMsg = '', rawDiff = ''] = process.argv;

const now = new Date();
const ts = now.toISOString().replace('T', ' ').slice(0, 19);

function block(title, content) {
  return `### ${title}\n${content}\n`;
}

function formatDiffLines(diff) {
  if (!diff) return '- (no file changes captured)\n';
  // Keep it brief: STATUS TAB PATH
  return diff
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => `- ${l}`)
    .join('\n') + '\n';
}

try {
  const devPath = join(process.cwd(), 'DEVELOPMENT.md');
  if (!existsSync(devPath)) {
    writeFileSync(devPath, '# 개발 기록\n\n');
  }

  const entry = [
    `\n---\n\n## 📦 커밋 반영 로그 (${ts})`,
    block('커밋 메시지', rawMsg.trim() || '(empty)'),
    block('변경 파일', formatDiffLines(rawDiff)),
  ].join('\n');

  appendFileSync(devPath, entry, { encoding: 'utf8' });
  // stage는 하지 않음: 사용자가 원하는 시점에 포함되도록 유지
  console.log('📝 DEVELOPMENT.md updated with latest commit info');
} catch (e) {
  console.error('Failed to update DEVELOPMENT.md:', e);
  process.exit(0); // 훅 실패로 커밋 실패하지 않도록
}




