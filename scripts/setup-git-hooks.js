import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const gitDir = join(process.cwd(), '.git');
const hooksDir = join(gitDir, 'hooks');

try {
  mkdirSync(hooksDir, { recursive: true });

  // post-commit 훅: 가장 최근 커밋 메시지/변경 파일을 DEVELOPMENT.md에 반영
  const postCommit = `#!/usr/bin/env bash
set -e

# 최근 커밋 메시지와 변경 파일 목록 추출
MSG=$(git log -1 --pretty=%B)
DIFF=$(git diff --name-status HEAD~1 HEAD || true)
NODE=$(command -v node || command -v node.exe)

"$NODE" scripts/post-commit-devlog.js "$MSG" "$DIFF"
`;

  writeFileSync(join(hooksDir, 'post-commit'), postCommit, { encoding: 'utf8' });
  // 실행 권한 (윈도우에선 무시 가능)
  try { require('fs').chmodSync(join(hooksDir, 'post-commit'), 0o755); } catch {}

  console.log('✅ Git post-commit hook installed.');
} catch (e) {
  console.error('❌ Failed to install git hooks:', e);
  process.exit(1);
}




