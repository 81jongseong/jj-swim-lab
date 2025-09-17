/**
 * Git 버전 관리 및 백업 스크립트
 * 코드 변경사항을 자동으로 커밋하고 백업합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitBackupManager {
  constructor() {
    this.repoPath = process.cwd();
    this.backupBranch = 'backup';
    this.autoCommitEnabled = true;
  }

  /**
   * Git 상태 확인
   */
  checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.repoPath,
        encoding: 'utf8'
      });
      return status.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.error('Git 상태 확인 실패:', error.message);
      return [];
    }
  }

  /**
   * 변경된 파일이 있는지 확인
   */
  hasChanges() {
    const changes = this.checkGitStatus();
    return changes.length > 0;
  }

  /**
   * 자동 커밋 생성
   */
  createAutoCommit(message = null) {
    try {
      if (!this.hasChanges()) {
        console.log('📝 변경사항이 없습니다.');
        return false;
      }

      const commitMessage = message || this.generateCommitMessage();
      
      // 모든 변경사항 스테이징
      execSync('git add .', { cwd: this.repoPath });
      
      // 커밋 생성
      execSync(`git commit -m "${commitMessage}"`, { cwd: this.repoPath });
      
      console.log(`✅ 자동 커밋 완료: ${commitMessage}`);
      return true;
    } catch (error) {
      console.error('자동 커밋 실패:', error.message);
      return false;
    }
  }

  /**
   * 커밋 메시지 자동 생성
   */
  generateCommitMessage() {
    const timestamp = new Date().toISOString();
    const changes = this.checkGitStatus();
    
    const addedFiles = changes.filter(change => change.startsWith('A')).length;
    const modifiedFiles = changes.filter(change => change.startsWith('M')).length;
    const deletedFiles = changes.filter(change => change.startsWith('D')).length;
    
    let message = `Auto backup: ${timestamp}`;
    
    if (addedFiles > 0) message += ` (+${addedFiles} files)`;
    if (modifiedFiles > 0) message += ` (~${modifiedFiles} files)`;
    if (deletedFiles > 0) message += ` (-${deletedFiles} files)`;
    
    return message;
  }

  /**
   * 백업 브랜치 생성 및 푸시
   */
  createBackupBranch() {
    try {
      // 현재 브랜치 확인
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.repoPath,
        encoding: 'utf8'
      }).trim();

      // 백업 브랜치로 체크아웃 (없으면 생성)
      try {
        execSync(`git checkout ${this.backupBranch}`, { cwd: this.repoPath });
      } catch (error) {
        execSync(`git checkout -b ${this.backupBranch}`, { cwd: this.repoPath });
      }

      // 메인 브랜치의 변경사항을 백업 브랜치로 머지
      execSync(`git merge ${currentBranch}`, { cwd: this.repoPath });
      
      // 원격 저장소에 푸시
      execSync(`git push origin ${this.backupBranch}`, { cwd: this.repoPath });
      
      // 원래 브랜치로 돌아가기
      execSync(`git checkout ${currentBranch}`, { cwd: this.repoPath });
      
      console.log(`✅ 백업 브랜치 생성 완료: ${this.backupBranch}`);
      return true;
    } catch (error) {
      console.error('백업 브랜치 생성 실패:', error.message);
      return false;
    }
  }

  /**
   * 태그 생성
   */
  createTag(tagName = null) {
    try {
      const tag = tagName || `backup-${Date.now()}`;
      const message = `Backup tag created at ${new Date().toISOString()}`;
      
      execSync(`git tag -a ${tag} -m "${message}"`, { cwd: this.repoPath });
      execSync(`git push origin ${tag}`, { cwd: this.repoPath });
      
      console.log(`✅ 태그 생성 완료: ${tag}`);
      return tag;
    } catch (error) {
      console.error('태그 생성 실패:', error.message);
      return null;
    }
  }

  /**
   * 백업 히스토리 조회
   */
  getBackupHistory() {
    try {
      const commits = execSync('git log --oneline --grep="Auto backup" -10', { 
        cwd: this.repoPath,
        encoding: 'utf8'
      });
      
      const tags = execSync('git tag --sort=-creatordate -10', { 
        cwd: this.repoPath,
        encoding: 'utf8'
      });
      
      return {
        commits: commits.trim().split('\n').filter(line => line.length > 0),
        tags: tags.trim().split('\n').filter(line => line.length > 0)
      };
    } catch (error) {
      console.error('백업 히스토리 조회 실패:', error.message);
      return { commits: [], tags: [] };
    }
  }

  /**
   * 특정 시점으로 복구
   */
  restoreToCommit(commitHash) {
    try {
      // 현재 상태 백업
      this.createAutoCommit('Pre-restore backup');
      
      // 지정된 커밋으로 리셋
      execSync(`git reset --hard ${commitHash}`, { cwd: this.repoPath });
      
      console.log(`✅ 복구 완료: ${commitHash}`);
      return true;
    } catch (error) {
      console.error('복구 실패:', error.message);
      return false;
    }
  }

  /**
   * 백업 설정
   */
  configureBackup(options = {}) {
    this.autoCommitEnabled = options.autoCommit !== false;
    this.backupBranch = options.backupBranch || 'backup';
    
    console.log('📋 백업 설정 완료:', {
      autoCommit: this.autoCommitEnabled,
      backupBranch: this.backupBranch
    });
  }

  /**
   * 전체 백업 프로세스 실행
   */
  async runFullBackup() {
    console.log('🚀 전체 백업 프로세스 시작...');
    
    try {
      // 1. 자동 커밋
      if (this.autoCommitEnabled) {
        this.createAutoCommit();
      }
      
      // 2. 백업 브랜치 생성
      this.createBackupBranch();
      
      // 3. 태그 생성
      this.createTag();
      
      console.log('✅ 전체 백업 프로세스 완료');
      return true;
    } catch (error) {
      console.error('❌ 전체 백업 프로세스 실패:', error.message);
      return false;
    }
  }
}

// CLI 사용을 위한 메인 함수
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new GitBackupManager();
  
  switch (command) {
    case 'status':
      const changes = manager.checkGitStatus();
      console.log('📊 Git 상태:', changes.length > 0 ? changes : '변경사항 없음');
      break;
      
    case 'commit':
      const message = args[1];
      manager.createAutoCommit(message);
      break;
      
    case 'backup':
      manager.createBackupBranch();
      break;
      
    case 'tag':
      const tagName = args[1];
      manager.createTag(tagName);
      break;
      
    case 'history':
      const history = manager.getBackupHistory();
      console.log('📚 백업 히스토리:');
      console.log('커밋:', history.commits);
      console.log('태그:', history.tags);
      break;
      
    case 'restore':
      const commitHash = args[1];
      if (!commitHash) {
        console.error('복구할 커밋 해시를 입력하세요.');
        process.exit(1);
      }
      manager.restoreToCommit(commitHash);
      break;
      
    case 'full':
      manager.runFullBackup();
      break;
      
    default:
      console.log(`
📋 Git 백업 관리자 사용법:

  node scripts/git-backup.js status     - Git 상태 확인
  node scripts/git-backup.js commit     - 자동 커밋 생성
  node scripts/git-backup.js backup     - 백업 브랜치 생성
  node scripts/git-backup.js tag        - 태그 생성
  node scripts/git-backup.js history   - 백업 히스토리 조회
  node scripts/git-backup.js restore   - 특정 커밋으로 복구
  node scripts/git-backup.js full       - 전체 백업 프로세스 실행
      `);
  }
}

// 모듈로 사용할 때
module.exports = GitBackupManager;

// 직접 실행할 때
if (require.main === module) {
  main();
}
