/**
 * 🏊‍♂️ JJ Swim Lab - 수영 프로그램 생성기 페이지
 * 
 * 건강·질환·기술 기반 수영 프로그램 생성기의 메인 페이지
 * 사용자 입력을 받고 랩 단위 세트, 페이스/레스트/드릴/코칭큐까지 포함된 주간 계획 생성
 */

import PlannerForm from '../../../../components/PlannerForm';

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PlannerForm />
    </div>
  );
}