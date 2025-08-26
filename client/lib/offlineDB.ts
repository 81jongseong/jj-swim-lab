// IndexedDB 기반 오프라인 데이터베이스
export class OfflineDB {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'JJSwimLabOffline';
  private readonly DB_VERSION = 1;

  // 데이터베이스 초기화
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 강습법 저장소
        if (!db.objectStoreNames.contains('teachingMethods')) {
          const teachingMethodsStore = db.createObjectStore('teachingMethods', { keyPath: 'id' });
          teachingMethodsStore.createIndex('level', 'level', { unique: false });
          teachingMethodsStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // 학생 정보 저장소
        if (!db.objectStoreNames.contains('students')) {
          const studentsStore = db.createObjectStore('students', { keyPath: 'id' });
          studentsStore.createIndex('centerId', 'centerId', { unique: false });
          studentsStore.createIndex('level', 'level', { unique: false });
        }

        // 사용자 프로필 저장소
        if (!db.objectStoreNames.contains('userProfiles')) {
          const userProfilesStore = db.createObjectStore('userProfiles', { keyPath: 'id' });
          userProfilesStore.createIndex('userType', 'userType', { unique: false });
        }

        // 오프라인 액션 저장소
        if (!db.objectStoreNames.contains('offlineActions')) {
          const offlineActionsStore = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
          offlineActionsStore.createIndex('type', 'type', { unique: false });
          offlineActionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 캐시된 페이지 저장소
        if (!db.objectStoreNames.contains('cachedPages')) {
          const cachedPagesStore = db.createObjectStore('cachedPages', { keyPath: 'url' });
          cachedPagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // 강습법 데이터 저장
  async saveTeachingMethods(methods: any[]): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    // 데이터 검증: 배열인지 확인
    if (!Array.isArray(methods)) {
      console.warn('⚠️ 강습법 데이터가 배열이 아닙니다:', typeof methods, methods);
      return;
    }

    const transaction = this.db.transaction(['teachingMethods'], 'readwrite');
    const store = transaction.objectStore('teachingMethods');

    // 기존 데이터 삭제
    await store.clear();

    // 새 데이터 저장 (ObjectId를 문자열로 변환)
    for (const method of methods) {
      try {
        // MongoDB ObjectId를 문자열로 변환
        const processedMethod = {
          ...method,
          id: method.id?.toString() || method._id?.toString() || `method-${Date.now()}-${Math.random()}`
        };
        
        await store.add(processedMethod);
      } catch (error) {
        console.warn('⚠️ 강습법 저장 실패:', method, error);
      }
    }

    console.log(`📚 ${methods.length}개의 강습법을 오프라인에 저장했습니다`);
  }

  // 강습법 데이터 조회
  async getTeachingMethods(): Promise<any[]> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['teachingMethods'], 'readonly');
      const store = transaction.objectStore('teachingMethods');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 레벨별 강습법 조회
  async getTeachingMethodsByLevel(level: string): Promise<any[]> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['teachingMethods'], 'readonly');
      const store = transaction.objectStore('teachingMethods');
      const index = store.index('level');
      const request = index.getAll(level);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 학생 정보 저장
  async saveStudents(students: any[]): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    // 데이터 검증: 배열인지 확인
    if (!Array.isArray(students)) {
      console.warn('⚠️ 학생 데이터가 배열이 아닙니다:', typeof students, students);
      return;
    }

    const transaction = this.db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');

    // 기존 데이터 삭제
    await store.clear();

    // 새 데이터 저장 (ObjectId를 문자열로 변환)
    for (const student of students) {
      try {
        const processedStudent = {
          ...student,
          id: student.id?.toString() || student._id?.toString() || `student-${Date.now()}-${Math.random()}`
        };
        
        await store.add(processedStudent);
      } catch (error) {
        console.warn('⚠️ 학생 정보 저장 실패:', student, error);
      }
    }

    console.log(`👨‍🎓 ${students.length}명의 학생 정보를 오프라인에 저장했습니다`);
  }

  // 학생 정보 조회
  async getStudents(): Promise<any[]> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readonly');
      const store = transaction.objectStore('students');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 센터별 학생 조회
  async getStudentsByCenter(centerId: string): Promise<any[]> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readonly');
      const store = transaction.objectStore('students');
      const index = store.index('centerId');
      const request = index.getAll(centerId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 사용자 프로필 저장
  async saveUserProfile(profile: any): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    // 데이터 검증: 객체인지 확인
    if (!profile || typeof profile !== 'object') {
      console.warn('⚠️ 사용자 프로필 데이터가 유효하지 않습니다:', typeof profile, profile);
      return;
    }

    const transaction = this.db.transaction(['userProfiles'], 'readwrite');
    const store = transaction.objectStore('userProfiles');
    
    try {
      // ObjectId를 문자열로 변환
      const processedProfile = {
        ...profile,
        id: profile.id?.toString() || profile._id?.toString() || `user-${Date.now()}-${Math.random()}`
      };
      
      await store.put(processedProfile);
      console.log('👤 사용자 프로필을 오프라인에 저장했습니다');
    } catch (error) {
      console.warn('⚠️ 사용자 프로필 저장 실패:', profile, error);
    }
  }

  // 사용자 프로필 조회
  async getUserProfile(userId: string): Promise<any | null> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userProfiles'], 'readonly');
      const store = transaction.objectStore('userProfiles');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // 오프라인 액션 저장
  async saveOfflineAction(action: {
    type: string;
    data: any;
    timestamp: number;
  }): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.add(action);

    console.log('📱 오프라인 액션을 저장했습니다:', action.type);
  }

  // 오프라인 액션 조회
  async getOfflineActions(): Promise<any[]> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 오프라인 액션 삭제
  async deleteOfflineAction(id: number): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.delete(id);
  }

  // 페이지 캐시 저장
  async cachePage(url: string, content: string): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    const transaction = this.db.transaction(['cachedPages'], 'readwrite');
    const store = transaction.objectStore('cachedPages');
    await store.put({
      url,
      content,
      timestamp: Date.now()
    });
  }

  // 캐시된 페이지 조회
  async getCachedPage(url: string): Promise<string | null> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedPages'], 'readonly');
      const store = transaction.objectStore('cachedPages');
      const request = store.get(url);

      request.onsuccess = () => resolve(request.result?.content || null);
      request.onerror = () => reject(request.error);
    });
  }

  // 데이터베이스 정리
  async clear(): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    const transaction = this.db.transaction(
      ['teachingMethods', 'students', 'userProfiles', 'offlineActions', 'cachedPages'],
      'readwrite'
    );

    await Promise.all([
      transaction.objectStore('teachingMethods').clear(),
      transaction.objectStore('students').clear(),
      transaction.objectStore('userProfiles').clear(),
      transaction.objectStore('offlineActions').clear(),
      transaction.objectStore('cachedPages').clear()
    ]);

    console.log('🗑️ 오프라인 데이터베이스를 정리했습니다');
  }

  // 데이터베이스 상태 확인
  async getStats(): Promise<{
    teachingMethods: number;
    students: number;
    userProfiles: number;
    offlineActions: number;
    cachedPages: number;
  }> {
    if (!this.db) throw new Error('데이터베이스가 초기화되지 않았습니다');

    const transaction = this.db.transaction(
      ['teachingMethods', 'students', 'userProfiles', 'offlineActions', 'cachedPages'],
      'readonly'
    );

    const [teachingMethods, students, userProfiles, offlineActions, cachedPages] = await Promise.all([
      this.getCount(transaction.objectStore('teachingMethods')),
      this.getCount(transaction.objectStore('students')),
      this.getCount(transaction.objectStore('userProfiles')),
      this.getCount(transaction.objectStore('offlineActions')),
      this.getCount(transaction.objectStore('cachedPages'))
    ]);

    return {
      teachingMethods,
      students,
      userProfiles,
      offlineActions,
      cachedPages
    };
  }

  private getCount(store: IDBObjectStore): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 싱글톤 인스턴스
export const offlineDB = new OfflineDB();
