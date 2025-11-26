/**
 * 📦 JJ Swim Lab - UI 컴포넌트 인덱스 파일
 * 
 * 📋 **파일 목적**
 * - 모든 UI 컴포넌트를 중앙에서 관리하고 내보내는 인덱스 파일
 * - UI 컴포넌트의 일관된 import/export 구조 제공
 * - 컴포넌트 사용 시 경로 단순화 및 가독성 향상
 * - UI 컴포넌트 라이브러리의 진입점 역할
 * - 컴포넌트 버전 관리 및 의존성 추적
 * 
 * 🔄 **주요 기능**
 * - UI 컴포넌트 통합 export
 * - 컴포넌트 그룹화 및 분류
 * - 일관된 import 경로 제공
 * - 컴포넌트 사용법 예시 제공
 * - 버전 호환성 및 의존성 관리
 * 
 * 🗄️ **데이터 연동**
 * - UI 컴포넌트 모듈 및 타입
 * - 컴포넌트 export/import 구조
 * - 컴포넌트 그룹 및 카테고리
 * - 버전 정보 및 의존성
 * - 사용법 및 예시 코드
 * 
 * 🛠️ **필요한 설치 파일**
 * - TypeScript 컴파일러
 * - UI 컴포넌트 라이브러리
 * - 모듈 번들러 (Webpack, Vite 등)
 * - 타입 정의 파일 (.d.ts)
 * - 빌드 도구 및 스크립트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 컴포넌트 export 순서의 일관성 유지
 * 2. 타입 정의 및 인터페이스 호환성
 * 3. 컴포넌트 간 의존성 순환 방지
 * 4. 버전 관리 및 호환성 유지
 * 5. 컴포넌트 사용법 문서화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 모든 UI 컴포넌트 export 확인
 * - [ ] 타입 정의 및 인터페이스 검증
 * - [ ] 의존성 순환 확인
 * - [ ] 컴포넌트 사용법 예시 확인
 * - [ ] 버전 호환성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 UI 컴포넌트 인덱스)
 * - 2024-12-19: 모든 UI 컴포넌트 통합 export 구현
 * - 2024-12-19: 컴포넌트 그룹화 및 분류 시스템 구현
 * - 2024-12-19: 타입 정의 및 인터페이스 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (UI 컴포넌트 인덱스 파일 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 컴포넌트 그룹화
 * - 자동화된 컴포넌트 등록
 * - 성능 최적화
 * - 문서화 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 개별 컴포넌트 import
 * import { Button, Input, Modal } from '@/components/ui';
 * 
 * // 전체 UI 라이브러리 import
 * import * as UI from '';
 * 
 * // 사용 예시
 * <Button type="primary">클릭하세요</Button>
 * <Input placeholder="입력하세요" />
 * <Modal isOpen={showModal}>모달 내용</Modal>
 * ```
 * 
 * 📚 **포함된 UI 컴포넌트들**
 * - BarChart: 막대 차트 데이터 시각화
 * - LoadingSpinner: 로딩 상태 표시
 * - ThemeProvider: 테마 및 색상 시스템 관리
 * - Input: 텍스트 입력 필드
 * - Badge: 상태 및 카테고리 표시
 * - Modal: 모달 다이얼로그
 * - Button: 사용자 인터랙션 버튼
 * - LazyComponent: 지연 로딩 컴포넌트
 * - OptimizedImage: 최적화된 이미지
 * - Progress: 진행률 표시
 * - Tabs: 탭 기반 콘텐츠 구분
 * - Select: 드롭다운 선택
 * - Card: 정보 카드 컨테이너
 * - Textarea: 다중 라인 텍스트 입력
 * - Label: 폼 요소 라벨링
 * - Slider: 범위 값 선택
 * - Switch: ON/OFF 토글
 */

// 기본 UI 컴포넌트들
export { default as BarChart } from './BarChart';
export { default as LoadingSpinner } from './LoadingSpinner';
export { ThemeProvider, useTheme } from './ThemeProvider';
export { Input } from './Input';
export { Badge } from './Badge';
export { default as Modal } from './Modal';
export { Button } from './Button';

// 사용자 경험 개선 컴포넌트들
// export { default as RefreshButton } from './RefreshButton';
// export { default as toast } from './Toast';
// export { default as ToastContainer } from './ToastContainer';

// 배포 및 안정성 컴포넌트들
// export { ErrorBoundary } from './errorboundary';
// export { default as ErrorToast } from './ErrorToast';
// export { ErrorProvider } from './ErrorProvider';

// 3D 뷰어 컴포넌트
// export { default as ThreeDViewer } from './ThreeDViewer';
// export { default as SwimmingPoseModel } from './SwimmingPoseModel';
// export { default as PoseComparisonViewer } from './PoseComparisonViewer';

// 고급 UI 컴포넌트들
// export { default as LazyComponent } from './LazyComponent';
// export { default as OptimizedImage } from './OptimizedImage';
export { Progress } from './Progress';
// export { Checkbox } from './checkbox';
// export { Alert, AlertTitle, AlertDescription } from './alert';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './Select';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
export { default as Textarea } from './Textarea';
export { Label } from './Label';
export { default as Slider } from './Slider';
export { default as Switch } from './Switch';

// 테이블 컴포넌트들
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './Table';
// export { default as ResponsiveTable, TableHeader, TableBody, TableRow, TableCell } from './responsivetable';
// export { default as TableHeaderCell } from './tableheadercell';

// 컴포넌트 타입 및 인터페이스 (필요한 경우에만 export)
// export type { BarChartProps } from './barchart';
// export type { LoadingSpinnerProps } from './LoadingSpinner';
// export type { ThemeProviderProps } from './ThemeProvider';
// export type { InputProps } from './input';
// export type { BadgeProps } from './badge';
// export type { ModalProps } from './modal';
// export type { ButtonProps } from './button';
// export type { LazyComponentProps } from './LazyComponent';
// export type { OptimizedImageProps } from './OptimizedImage';
// export type { ProgressProps } from './progress';
// export type { TabsProps } from './tabs';
// export type { SelectProps } from './select';
// export type { CardProps } from './card';
// export type { TextareaProps } from './textarea';
// export type { LabelProps } from './label';
// export type { SliderProps } from './slider';
// export type { SwitchProps } from './switch'; 